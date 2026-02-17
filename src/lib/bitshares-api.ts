// BitShares WebSocket JSON-RPC API client

import { z } from "zod";
import { EsSearchResponseSchema } from "@/lib/validation";

const WS_URL = "wss://api.bitshares.dev";

const WsMessageSchema = z.object({
  id: z.number(),
  result: z.any().optional(),
  error: z.any().optional(),
});

let ws: WebSocket | null = null;
let requestId = 0;
const pendingRequests = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>();
let connectPromise: Promise<void> | null = null;
let dbApiId: number | null = null;
let historyApiId: number | null = null;

function connect(): Promise<void> {
  if (connectPromise) return connectPromise;

  connectPromise = new Promise((resolve, reject) => {
    ws = new WebSocket(WS_URL);

    ws.onopen = async () => {
      try {
        // Login (required before accessing other APIs)
        await rawCall(1, "login", ["", ""]);
        // Get database API
        dbApiId = await rawCall(1, "database", []);
        // Get history API
        historyApiId = await rawCall(1, "history", []);
        resolve();
      } catch (e) {
        reject(e);
      }
    };

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const data = WsMessageSchema.parse(raw);
        const pending = pendingRequests.get(data.id);
        if (pending) {
          pendingRequests.delete(data.id);
          if (data.error) {
            pending.reject(data.error);
          } else {
            pending.resolve(data.result);
          }
        }
      } catch {
        // ignore parse/validation errors
      }
    };

    ws.onerror = () => {
      connectPromise = null;
      reject(new Error("WebSocket connection failed"));
    };

    ws.onclose = () => {
      connectPromise = null;
      ws = null;
      dbApiId = null;
      historyApiId = null;
    };
  });

  return connectPromise;
}

function rawCall(apiId: number, method: string, params: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      reject(new Error("WebSocket not connected"));
      return;
    }
    const id = ++requestId;
    pendingRequests.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method: "call", params: [apiId, method, params] }));

    // Timeout after 15s
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error(`Request ${method} timed out`));
      }
    }, 15000);
  });
}

async function dbCall(method: string, params: any[]): Promise<any> {
  await connect();
  return rawCall(dbApiId!, method, params);
}

async function historyCall(method: string, params: any[]): Promise<any> {
  await connect();
  return rawCall(historyApiId!, method, params);
}

// ---- Public API methods ----

export async function getDynamicGlobalProperties() {
  return dbCall("get_dynamic_global_properties", []);
}

export async function getBlock(blockNum: number) {
  return dbCall("get_block", [blockNum]);
}

export async function getBlockHeader(blockNum: number) {
  return dbCall("get_block_header", [blockNum]);
}

export async function getAccounts(ids: string[]) {
  return dbCall("get_accounts", [ids]);
}

export async function lookupAccounts(lowerBound: string, limit: number = 10) {
  return dbCall("lookup_accounts", [lowerBound, limit]);
}

export async function getAccountByName(name: string) {
  return dbCall("get_account_by_name", [name]);
}

export async function getAccountBalances(accountId: string, assetIds: string[] = []) {
  return dbCall("get_account_balances", [accountId, assetIds]);
}

export async function getAssets(ids: string[]) {
  return dbCall("get_assets", [ids]);
}

export async function lookupAssetSymbols(symbols: string[]) {
  return dbCall("lookup_asset_symbols", [symbols]);
}

export async function getObjects(ids: string[]) {
  return dbCall("get_objects", [ids]);
}

export async function getTransaction(blockNum: number, trxInBlock: number) {
  return dbCall("get_transaction", [blockNum, trxInBlock]);
}

export async function getTransactionHex(tx: any): Promise<string> {
  return dbCall("get_transaction_hex", [tx]);
}

// ---- TXID computation ----

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compute the TXID from a transaction object by:
 * 1. Getting the signed_transaction hex via API
 * 2. Stripping the signatures suffix (varint + 65-byte sigs)
 * 3. SHA-256 hashing the transaction-only bytes
 * 4. Taking the first 20 bytes (40 hex chars) as the TXID
 */
export async function computeTransactionId(tx: any): Promise<string> {
  const hex = await getTransactionHex(tx);

  // signed_transaction = transaction_bytes + varint(num_sigs) + signatures
  // Each signature is 65 bytes = 130 hex chars
  const numSigs = tx.signatures?.length ?? 0;
  // varint: for values < 128 it's 1 byte
  const varintLen = numSigs < 128 ? 1 : 2;
  const suffixHexLen = varintLen * 2 + numSigs * 130;
  const txHex = hex.substring(0, hex.length - suffixHexLen);

  const txBytes = hexToBytes(txHex);
  const hashBuffer = await crypto.subtle.digest("SHA-256", txBytes.buffer as ArrayBuffer);
  return bytesToHex(new Uint8Array(hashBuffer)).substring(0, 40);
}

export async function getAccountHistory(
  accountId: string,
  stop: string = "1.11.0",
  limit: number = 20,
  start: string = "1.11.0"
) {
  return historyCall("get_account_history", [accountId, stop, limit, start]);
}

export async function getRelativeAccountHistory(
  accountId: string,
  stop: number = 0,
  limit: number = 20,
  start: number = 0
) {
  return historyCall("get_relative_account_history", [accountId, stop, limit, start]);
}

// ---- ElasticSearch API ----

const ES_URL = "https://es.bitshares.dev/bitshares-*";
const ES_URL_BALANCES = "https://es.bitshares.dev/objects-balance";

export async function searchTransactionById(txid: string): Promise<{ block_num: number; trx_in_block: number; txid: string; operations: { op: [number, any]; is_virtual: boolean }[] } | null> {
  const resp = await fetch(`${ES_URL}/_search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: { bool: { must: [{ match: { "block_data.trx_id.keyword": { query: txid } } }] } },
      track_total_hits: false,
      collapse: { field: "operation_id_num" },
      sort: ["operation_id_num"],
      size: 100,
    }),
  });
  if (!resp.ok) return null;
  const raw = await resp.json();
  const hits = raw?.hits?.hits;
  if (!Array.isArray(hits) || hits.length === 0) return null;
  const firstHit = hits[0]?._source;
  const block_num = firstHit?.block_data?.block_num;
  const trx_in_block = firstHit?.operation_history?.trx_in_block ?? 0;
  if (block_num == null) return null;
  const operations = hits.map((h: any) => {
    const opStr = h._source?.operation_history?.op;
    let op: [number, any] = [0, {}];
    if (typeof opStr === "string") {
      try { op = JSON.parse(opStr); } catch {}
    } else if (Array.isArray(opStr)) {
      op = opStr as [number, any];
    }
    return { op, is_virtual: !!h._source?.operation_history?.is_virtual };
  });
  return { block_num, trx_in_block, txid, operations };
}

// ---- Transaction operations via ES ----

export async function getTransactionOperationsES(blockNum: number, trxInBlock: number): Promise<{ txid: string; operations: { op: [number, any]; is_virtual: boolean }[] }> {
  const resp = await fetch(`${ES_URL}/_search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: { bool: { must: [
        { match: { "block_data.block_num": { query: blockNum } } },
        { match: { "operation_history.trx_in_block": { query: trxInBlock } } },
      ] } },
      track_total_hits: false,
      collapse: { field: "operation_id_num" },
      sort: ["operation_id_num"],
      size: 100,
    }),
  });
  if (!resp.ok) return { txid: "", operations: [] };
  const raw = await resp.json();
  const hits = raw?.hits?.hits;
  if (!Array.isArray(hits) || hits.length === 0) return { txid: "", operations: [] };
  const txid = hits[0]?._source?.block_data?.trx_id ?? "";
  const operations = hits.map((h: any) => {
    const opStr = h._source?.operation_history?.op;
    let op: [number, any] = [0, {}];
    if (typeof opStr === "string") {
      try { op = JSON.parse(opStr); } catch {}
    } else if (Array.isArray(opStr)) {
      op = opStr as [number, any];
    }
    return { op, is_virtual: !!h._source?.operation_history?.is_virtual };
  });
  return { txid, operations };
}

// ---- Asset holders via ES ----

export async function getAssetHolders(assetId: string, limit: number = 20): Promise<{ account_id: string; balance: number }[]> {
  const resp = await fetch(`${ES_URL_BALANCES}/_search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: { bool: { must: [{ match: { "asset_type": { query: assetId } } }] } },
      track_total_hits: false,
      size: limit,
      sort: [{ balance: { order: "desc" } }],
    }),
  });
  if (!resp.ok) return [];
  const raw = await resp.json();
  const hits = raw?.hits?.hits;
  if (!Array.isArray(hits)) return [];
  return hits.map((h: any) => ({
    account_id: h._source?.owner_ ?? "",
    balance: Number(h._source?.balance ?? 0),
  }));
}

// ---- Search helpers ----

export function detectSearchType(query: string): "block" | "account" | "asset" | "object" | "txid" {
  const trimmed = query.trim();
  if (/^\d+$/.test(trimmed)) return "block";
  if (/^\d+\.\d+\.\d+$/.test(trimmed)) return "object";
  if (/^[0-9a-f]{40}$/i.test(trimmed)) return "txid";
  // Uppercase likely asset, lowercase likely account
  if (trimmed === trimmed.toUpperCase() && /^[A-Z]/.test(trimmed)) return "asset";
  return "account";
}

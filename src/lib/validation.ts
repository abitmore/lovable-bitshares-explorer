import { z } from "zod";

export const BlockNumSchema = z.coerce.number().int().positive().max(1_000_000_000);
export const TxIndexSchema = z.coerce.number().int().min(0).max(10_000);
export const AccountNameSchema = z.string().min(1).max(63).regex(/^[a-z0-9.-]+$/);
export const AccountIdSchema = z.string().regex(/^1\.2\.\d+$/);
export const AssetSymbolSchema = z.string().min(1).max(16);
export const AssetIdSchema = z.string().regex(/^1\.3\.\d+$/);
export const TxIdSchema = z.string().regex(/^[0-9a-f]{40}$/i);

// ES search response validation
export const EsHitSchema = z.object({
  block_data: z.object({ block_num: z.number() }).passthrough(),
  operation_history: z.object({ trx_in_block: z.number() }).passthrough().optional(),
}).passthrough();

export const EsSearchResponseSchema = z.object({
  hits: z.object({
    hits: z.array(z.object({ _source: EsHitSchema }).passthrough()),
  }).passthrough(),
}).passthrough();

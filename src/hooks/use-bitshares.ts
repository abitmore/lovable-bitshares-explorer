import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/bitshares-api";

export function useDynamicGlobalProperties() {
  return useQuery({
    queryKey: ["dgp"],
    queryFn: api.getDynamicGlobalProperties,
    refetchInterval: 5000,
  });
}

export function useBlock(blockNum: number | undefined) {
  return useQuery({
    queryKey: ["block", blockNum],
    queryFn: () => api.getBlock(blockNum!),
    enabled: !!blockNum,
  });
}

export function useAccountByName(name: string | undefined) {
  return useQuery({
    queryKey: ["account", name],
    queryFn: () => api.getAccountByName(name!),
    enabled: !!name,
  });
}

export function useAccountBalances(accountId: string | undefined) {
  return useQuery({
    queryKey: ["balances", accountId],
    queryFn: () => api.getAccountBalances(accountId!),
    enabled: !!accountId,
  });
}

export function useAssets(ids: string[]) {
  return useQuery({
    queryKey: ["assets", ids],
    queryFn: () => api.getAssets(ids),
    enabled: ids.length > 0,
  });
}

export function useAssetBySymbol(symbol: string | undefined) {
  return useQuery({
    queryKey: ["assetSymbol", symbol],
    queryFn: () => api.lookupAssetSymbols([symbol!]).then((r: any[]) => r[0]),
    enabled: !!symbol,
  });
}

export function useAccountHistory(accountId: string | undefined) {
  return useQuery({
    queryKey: ["accountHistory", accountId],
    queryFn: () => api.getAccountHistory(accountId!),
    enabled: !!accountId,
  });
}

export function useBlockHeaders(blockNums: number[]) {
  return useQuery({
    queryKey: ["blockHeaders", blockNums],
    queryFn: async () => {
      const results: Record<number, string> = {};
      await Promise.all(
        blockNums.map(async (num) => {
          const header = await api.getBlockHeader(num);
          if (header?.timestamp) results[num] = header.timestamp;
        })
      );
      return results;
    },
    enabled: blockNums.length > 0,
  });
}


export function useObjects(ids: string[]) {
  return useQuery({
    queryKey: ["objects", ids],
    queryFn: () => api.getObjects(ids),
    enabled: ids.length > 0,
  });
}

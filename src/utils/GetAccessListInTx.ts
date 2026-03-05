interface EthCreateAccessListTransaction {
  from?: string;
  to?: string;
  data?: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
}

interface EthCreateAccessListResult {
  accessList?: Array<{ address: string; storageKeys: string[] }>;
  gasUsed?: string;
}

export const getAccessList = async (
  provider: {
    send: (
      method: string,
      params: unknown[]
    ) => Promise<EthCreateAccessListResult>;
  },
  transaction: EthCreateAccessListTransaction
): Promise<EthCreateAccessListResult | null> => {
  try {
    const result = await provider.send("eth_createAccessList", [transaction]);
    return result;
  } catch {
    return null;
  }
};

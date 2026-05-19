/**
 * Browser-side LayerZero helpers without @layerzerolabs/* so CRA does not bundle
 * Node-only deps (e.g. io-devtools → prompts/winston/readline).
 *
 * EID / metadata keys align with @layerzerolabs/lz-definitions `endpointIdToNetwork`;
 * extend the maps when adding chains (see https://metadata.layerzero-api.com).
 */

export const deploymentMetadataUrl =
  "https://metadata.layerzero-api.com/v1/metadata/deployments";

/** Common EVM chainId → LayerZero V2 source endpoint id */
const EVM_CHAIN_ID_TO_LZ_V2_SRC_EID: Record<number, number> = {
  1: 30101,
  56: 30102,
  97: 40102,
  8453: 30184,
  11155111: 40161,
  560048: 40449,
  84532: 40245,
  421614: 40231
};

export function evmChainIdToLzV2SrcEndpointId(
  evmChainId: number
): number | undefined {
  return EVM_CHAIN_ID_TO_LZ_V2_SRC_EID[evmChainId];
}

/** V2 endpoint id → top-level key in metadata.deployments */
const LZ_ENDPOINT_ID_TO_METADATA_NETWORK: Record<number, string> = {
  30101: "ethereum-mainnet",
  30102: "bsc-mainnet",
  30184: "base-mainnet",
  40102: "bsc-testnet",
  40161: "sepolia-testnet",
  40449: "hoodi-testnet",
  40245: "basesep-testnet",
  40231: "arbsep-testnet"
};

/**
 * Resolve a block explorer tx URL from LayerZero deployment metadata for a source
 * endpoint id. Only eids in the map are supported; others return undefined.
 */
export async function getBlockExplorerLink(
  srcEid: number,
  txHash: string
): Promise<string | undefined> {
  const network = LZ_ENDPOINT_ID_TO_METADATA_NETWORK[srcEid];
  if (!network) return undefined;
  const res = await fetch(deploymentMetadataUrl);
  if (!res.ok) return undefined;
  const all = (await res.json()) as Record<
    string,
    { blockExplorers?: { url: string }[] }
  >;
  const meta = all[network];
  const explorer = meta?.blockExplorers?.[0]?.url;
  if (explorer) {
    return `${explorer.replace(/\/+$/, "")}/tx/${txHash}`;
  }
  return undefined;
}

export function getLayerZeroScanLink(
  txHash: string,
  isTestnet = false
): string {
  const baseUrl = isTestnet
    ? "https://testnet.layerzeroscan.com"
    : "https://layerzeroscan.com";
  return `${baseUrl}/tx/${txHash}`;
}

/** One item in `data[]` from LayerZero Scan API `/v1/messages/tx/:hash` (fields may grow). */
export interface LayerZeroScanMessagePathway {
  srcEid: number;
  dstEid: number;
  sender: { address: string; chain: string };
  receiver: { address: string; chain: string };
  id: string;
  nonce: number;
}

export interface LayerZeroScanSourceTx {
  txHash: string;
  blockHash?: string;
  blockNumber?: string | number;
  blockTimestamp?: number;
  from?: string;
  payload?: string;
  readinessTimestamp?: number;
  options?: {
    lzReceive?: { gas: string; value: string };
    ordered?: boolean;
  };
}

export interface LayerZeroScanMessageSource {
  status: string;
  tx?: LayerZeroScanSourceTx;
}

export interface LayerZeroScanDestinationTx {
  txHash: string;
  blockHash?: string;
  blockNumber?: string | number;
  blockTimestamp?: number;
}

export interface LayerZeroScanMessageDestination {
  nativeDrop?: { status: string };
  lzCompose?: { status: string };
  tx?: LayerZeroScanDestinationTx;
  status: string;
}

export interface LayerZeroDvnProof {
  packetHeader: string;
  payloadHash: string;
}

export interface LayerZeroDvnEntry {
  status: string;
  txHash?: string;
  blockHash?: string;
  blockNumber?: number;
  blockTimestamp?: number;
  proof?: LayerZeroDvnProof;
  optional?: boolean;
}

export interface LayerZeroScanMessageVerification {
  dvn?: {
    dvns?: Record<string, LayerZeroDvnEntry>;
    status?: string;
  };
  sealer?: {
    status?: string;
    tx?: LayerZeroScanDestinationTx;
  };
}

export interface LayerZeroScanMessageConfig {
  error?: boolean;
  receiveLibrary?: string;
  sendLibrary?: string;
  ulnSendVersion?: string;
  ulnReceiveVersion?: string;
  inboundConfig?: Record<string, unknown>;
  outboundConfig?: Record<string, unknown>;
}

export interface LayerZeroScanMessage {
  pathway: LayerZeroScanMessagePathway;
  source: LayerZeroScanMessageSource;
  destination: LayerZeroScanMessageDestination;
  verification: LayerZeroScanMessageVerification;
  guid: string;
  config: LayerZeroScanMessageConfig;
  status: { name: string; message: string };
  created: string;
  updated: string;
}

export interface LayerZeroMessagesResponse {
  data: LayerZeroScanMessage[];
  /**
   * Set when the Scan API returns a business error or HTTP failure.
   * Example: `{ message: "Message not found for tx 0x…!", code: 4040 }`
   */
  apiError?: { message: string; code: number };
}

function parseLayerZeroMessagesBody(raw: unknown): LayerZeroMessagesResponse {
  if (raw == null || typeof raw !== "object") {
    return { data: [] };
  }
  const o = raw as Record<string, unknown>;
  const data = Array.isArray(o.data) ? (o.data as LayerZeroScanMessage[]) : [];

  if (
    typeof o.message === "string" &&
    o.code !== undefined &&
    o.code !== null
  ) {
    const codeNum =
      typeof o.code === "number" ? o.code : Number(String(o.code));
    const code = Number.isFinite(codeNum) ? codeNum : 0;
    return { data, apiError: { message: o.message, code } };
  }

  return { data };
}

/**
 * Fetch LayerZero Scan API messages for a source or destination tx hash.
 * @param txHash Related transaction hash (0x…)
 * @param isTestnet Use `scan-testnet.layerzero-api.com` when true
 * @returns `data` holds messages; `apiError` if the API returns `message`/`code`
 * (e.g. tx not indexed yet) or HTTP is not 2xx without that body.
 * @see https://scan-testnet.layerzero-api.com/v1/messages/tx/{txHash}
 */
export async function getLayerZeroMessages(
  txHash: string,
  isTestnet = false
): Promise<LayerZeroMessagesResponse> {
  const baseUrl = isTestnet
    ? "https://scan-testnet.layerzero-api.com/v1/messages"
    : "https://scan.layerzero-api.com/v1/messages";

  const url = `${baseUrl}/tx/${encodeURIComponent(txHash)}`;
  const res = await fetch(url);

  let raw: unknown;
  try {
    raw = await res.json();
  } catch {
    return {
      data: [],
      apiError: {
        message: `Response is not valid JSON (HTTP ${res.status})`,
        code: res.status
      }
    };
  }

  const parsed = parseLayerZeroMessagesBody(raw);

  if (!res.ok && parsed.apiError == null) {
    return {
      data: parsed.data,
      apiError: {
        message: `Request failed (HTTP ${res.status})`,
        code: res.status
      }
    };
  }

  return parsed;
}

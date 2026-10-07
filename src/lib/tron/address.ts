import base58 from "bs58";
import { computeAddress, getBytes, hexlify, sha256 } from "ethers";

/**
 * TRON address helpers — pure local computation, no network and no SDK.
 *
 * A TRON mainnet address is Base58Check over `0x41 ‖ 20-byte body`, where the
 * body is the same keccak256-of-public-key value an Ethereum address uses:
 *
 *   base58check(0x41 ‖ keccak256(uncompressedPubKey[1..])[-20:])
 *
 * So every mainnet address decodes to 25 bytes (1 prefix + 20 body + 4
 * checksum) and renders as 34 characters starting with `T`.
 */

/** TRON mainnet address prefix byte. */
export const TRON_ADDRESS_PREFIX = 0x41;

/** 1 prefix + 20 body + 4 checksum. */
const ADDRESS_BYTES = 25;

/** 1 prefix + 20 body — the part that gets checksummed and encoded. */
const PAYLOAD_BYTES = 21;

/** Thrown by the conversion helpers when input is not a valid TRON address. */
export class TronAddressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TronAddressError";
  }
}

/** Base58Check encode: `payload ‖ sha256d(payload)[0..4]`. */
function encodeChecked(payload: Uint8Array): string {
  const checksum = sha256(sha256(payload)).slice(2, 10);
  return base58.encode(getBytes(hexlify(payload) + checksum));
}

/** Decode a Base58Check address and verify its length, checksum and prefix. */
function decodeChecked(address: string): Uint8Array {
  let decoded: Uint8Array;
  try {
    decoded = base58.decode(address);
  } catch {
    throw new TronAddressError("invalid-base58");
  }

  if (decoded.length !== ADDRESS_BYTES) {
    throw new TronAddressError("bad-length");
  }

  const payload = decoded.slice(0, PAYLOAD_BYTES);
  const checksum = decoded.slice(PAYLOAD_BYTES);

  // Both sides lowercase hex: "0x" + 4 bytes.
  if (hexlify(checksum) !== sha256(sha256(payload)).slice(0, 10)) {
    throw new TronAddressError("bad-checksum");
  }
  if (payload[0] !== TRON_ADDRESS_PREFIX) {
    throw new TronAddressError("bad-prefix");
  }

  return payload;
}

/** Parse a 21-byte hex payload (`41…` or `0x41…`), validating prefix and size. */
function toPayload(hex: string): Uint8Array {
  const trimmed = hex.trim();
  const normalized = /^0x/i.test(trimmed)
    ? `0x${trimmed.slice(2)}`
    : `0x${trimmed}`;

  let bytes: Uint8Array;
  try {
    bytes = getBytes(normalized);
  } catch {
    throw new TronAddressError("invalid-hex");
  }

  if (bytes.length !== PAYLOAD_BYTES) {
    throw new TronAddressError("bad-length");
  }
  if (bytes[0] !== TRON_ADDRESS_PREFIX) {
    throw new TronAddressError("bad-prefix");
  }

  return bytes;
}

/**
 * True when `value` is a well-formed TRON mainnet address: decodes to 25
 * bytes, carries a matching Base58Check checksum and starts with `0x41`.
 *
 * Catch-all validation — safe to call on arbitrary user input.
 */
export function isValidTronAddress(value: string): boolean {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }
  try {
    decodeChecked(value.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Base58 `T…` address → hex `0x41…`. Drop the leading `0x` to get the same
 * value TronWeb's `address.toHex()` returns.
 */
export function tronAddressToHex(address: string): string {
  return hexlify(decodeChecked(address.trim()));
}

/**
 * Hex `41…` (or `0x41…`) → Base58 `T…` address.
 *
 * Throws `TronAddressError` if the input is not 21 bytes starting with `0x41`.
 */
export function hexToTronAddress(hex: string): string {
  return encodeChecked(toPayload(hex));
}

/**
 * Derive the TRON address of a secp256k1 private key.
 *
 * Accepts bytes or a `0x`-prefixed hex string. The body is identical to the
 * Ethereum address of the same key, so TRON and ETH share one key pair.
 */
export function privateKeyToTronAddress(
  privateKey: Uint8Array | string
): string {
  let body: string;
  try {
    // computeAddress() == keccak256(uncompressedPubKey[1..]).slice(-20), EIP-55 checksummed
    body = computeAddress(hexlify(privateKey)).slice(2).toLowerCase();
  } catch {
    throw new TronAddressError("invalid-private-key");
  }

  return encodeChecked(getBytes(`0x41${body}`));
}

/**
 * Where a donation can land, one entry per chain. The donate modal shows one
 * tab per entry, in this order.
 */
export const DONATION_TARGETS = [
  {
    key: "btc",
    label: "BTC",
    address: "bc1p8rv56jee8mkmr8s65y0xa3c5jjl6t82g60j2z57pczqpyp0ge6qs70ehk0"
  },
  {
    key: "eth",
    label: "ETH",
    address: "0x0148ff91E06977093992EDdEf76F381E1EE5de2f"
  },
  {
    key: "tron",
    label: "TRON",
    address: "TC71trfhBYqzcVXAcHm1Sy9k6byz3KGW1h"
  }
] as const;

export type DonationChain = (typeof DONATION_TARGETS)[number]["key"];

/**
 * These are the addresses donations actually land on, so edit them with care.
 * Each was checked against its own checksum before being written here —
 * bech32m for BTC, Base58Check for TRON, EIP-55 casing kept on ETH — because
 * one mistyped character is a donation nobody can get back.
 */

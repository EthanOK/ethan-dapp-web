declare module "eth-url-parser" {
  export type EthUrlParameters = Record<string, string>;

  export type EthUrlObject = {
    scheme?: string; // default: 'ethereum'
    prefix?: string; // e.g. 'pay'
    target_address: string; // address or ENS
    chain_id?: string; // numeric string, e.g. '1'
    function_name?: string;
    parameters?: EthUrlParameters;
  };

  export function parse(url: string): {
    scheme: string;
    prefix?: string;
    target_address: string;
    chain_id?: string;
    function_name?: string;
    parameters: EthUrlParameters;
  };

  export function build(obj: EthUrlObject): string;
}

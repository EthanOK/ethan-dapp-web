declare global {
  interface Window {
    Buffer?: typeof import("buffer").Buffer;
    ethereum?: {
      request<T = unknown>(args: {
        method: string;
        params?: unknown[];
      }): Promise<T>;
    };
  }
  namespace JSX {
    interface IntrinsicElements {
      "appkit-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string;
          balance?: "show" | "hide";
          onClick?: () => void;
        },
        HTMLElement
      >;
    }
  }
}

declare module "*.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

export {};

interface AppKitModal {
  subscribeProviders: (cb: (state: Record<string, unknown>) => void) => void;
  subscribeAccount: (cb: (state: unknown) => void) => void;
  subscribeNetwork: (cb: (state: unknown) => void) => void;
  subscribeState: (cb: (state: unknown) => void) => void;
  getIsConnectedState: () => void;
}

export const store: {
  accountState: Record<string, unknown>;
  networkState: Record<string, unknown>;
  appKitState: unknown;
  themeState: { themeMode: string; themeVariables: Record<string, unknown> };
  events: unknown[];
  walletInfo: Record<string, unknown>;
  eip155Provider: unknown;
} = {
  accountState: {},
  networkState: {},
  appKitState: {},
  themeState: { themeMode: "light", themeVariables: {} },
  events: [],
  walletInfo: {},
  eip155Provider: null
};

export const updateStore = (key: keyof typeof store, value: unknown): void => {
  (store as Record<string, unknown>)[key] = value;
};

export const initializeSubscribers = (modal: AppKitModal): void => {
  modal.subscribeProviders((state: Record<string, unknown>) => {
    updateStore("eip155Provider", state["eip155"]);
  });

  modal.subscribeAccount((state) => {
    updateStore("accountState", state);
  });

  modal.subscribeNetwork((state) => {
    updateStore("networkState", state);
  });

  modal.subscribeState((state) => {
    store.appKitState = state;
    modal.getIsConnectedState();
  });
};

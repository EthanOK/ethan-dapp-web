export const store = {
  accountState: {},
  networkState: {},
  appKitState: {},
  themeState: { themeMode: "light", themeVariables: {} },
  events: [],
  walletInfo: {},
  eip155Provider: null
};

export const updateStore = (key, value) => {
  store[key] = value;
};

export const initializeSubscribers = (modal) => {
  modal.subscribeProviders((state) => {
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

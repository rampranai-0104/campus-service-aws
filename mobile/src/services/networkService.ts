import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export type NetworkListener = (isOnline: boolean) => void;

class NetworkService {
  private isConnected: boolean = true;
  private listeners: Set<NetworkListener> = new Set();
  private subscription: NetInfoSubscription | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Initial fetch
    NetInfo.fetch().then((state) => {
      this.updateState(state);
    });

    // Event listener
    this.subscription = NetInfo.addEventListener((state) => {
      this.updateState(state);
    });
  }

  private updateState(state: NetInfoState) {
    const online = Boolean(state.isConnected && (state.isInternetReachable === null || state.isInternetReachable));
    if (this.isConnected !== online) {
      this.isConnected = online;
      this.notifyListeners(online);
    }
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach((listener) => {
      try {
        listener(isOnline);
      } catch (err) {
        console.warn('[NetworkService] Listener error:', err);
      }
    });
  }

  public getIsOnline(): boolean {
    return this.isConnected;
  }

  public async checkOnlineAsync(): Promise<boolean> {
    const state = await NetInfo.fetch();
    const online = Boolean(state.isConnected && (state.isInternetReachable === null || state.isInternetReachable));
    this.isConnected = online;
    return online;
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    // Notify immediately with current state
    listener(this.isConnected);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public destroy() {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
    this.listeners.clear();
  }
}

export const networkService = new NetworkService();

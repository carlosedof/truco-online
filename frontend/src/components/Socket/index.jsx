import ioSocket from 'socket.io-client';
import { useAuthStore } from '../../store';

class Socket {
  // private io: SocketType | null = null;
  // private io = null;
  io = null;

  connect(currentPlayer) {
    if (this.io) {
      this.io.removeAllListeners();
      this.io.disconnect();
    }

    const token = useAuthStore.getState().token;
    const defaultUrl = 'http://localhost:3001';
    const url = import.meta.env.VITE_WEBSOCKET_URL || defaultUrl;
    this.io = ioSocket(`${url}`, {
      query: `user=${currentPlayer}`,
      transports: ['websocket'],
      autoConnect: true,
      auth: {
        token,
      },
    });

    this.io.on('ping', this.onPing);
  }

  addListener(eventName, eventHandler) {
  // addListener(eventName: string, eventHandler: (event: any) => void) {
    if (this.io) {
      this.io.removeListener(eventName);
      // this.io.on(eventName, (event: any) => eventHandler(event));
      this.io.on(eventName, (event) => eventHandler(event));
    }
  }

  // removeAllListeners(eventName?: string) {
  removeAllListeners(eventName) {
    if (!this.io) return;
    if (eventName) {
      this.io.removeListener(eventName);
    } else {
      this.io.removeAllListeners();
    }
  }

  onPing() {
    this.emit('message', {
      type: 'pong',
    });
  }

  disconnect() {
    if (this.io) {
      this.io.removeAllListeners();
      this.io.disconnect();
      // store.dispatch(setWebsocket({ wsConnected: false }));
    }
  }

  // emit(event: string, params: unknown, callback?: (data: unknown) => void) {
  emit(event, params, callback) {
    if (this.io) {
      this.io.emit(event, params);
      // this.io.emit(event, params, callback);
    }
  }

  sendMessage(chat) {
  // sendMessage(chat: ITicketChat) {
    console.log(chat);
    // this.emit(EVENT_TYPES.SEND_MESSAGE, chat);
  }
}

export default new Socket();

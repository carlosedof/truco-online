import { Socket } from 'socket.io';

export interface UserInfo {
  client: Socket;
  user?: any;
}

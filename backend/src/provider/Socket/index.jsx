import React, {useLayoutEffect} from 'react';
import {useGameStore} from '../../store';

export function SocketProvider({children}) {
  const {connectWebsocket, disconnectWebsocket} = useGameStore();

  useLayoutEffect(() => {
    connectWebsocket();
    return () => {
      disconnectWebsocket();
    };
  }, [connectWebsocket, disconnectWebsocket]);

  return children;
}

export default SocketProvider;

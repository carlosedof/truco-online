import React, {useLayoutEffect} from 'react'
import Socket from '../../components/Socket'
import { useAuthStore, useGameStore } from '../../store';
import { EVENT_TYPES } from "../../store/Game";

function SocketProvider({ children }) {
  const { currentPlayer } = useAuthStore();
  const {
    onConnectedPlayers,
    onPlayed,
    onManilha,
    onHands,
    onTurn,
    onReady,
    onScoreBoard,
    onPoints,
    onWinnerRound,
    onConnections,
    onRestart,
  } = useGameStore();
  useLayoutEffect(() => {
    if (currentPlayer) {
      Socket.connect(currentPlayer);
    } else {
      Socket.disconnect();
    }
    Socket.addListener(EVENT_TYPES.CONNECTED_PLAYERS, onConnectedPlayers);
    Socket.addListener(EVENT_TYPES.PLAYED, onPlayed);
    Socket.addListener(EVENT_TYPES.MANILHA, onManilha);
    Socket.addListener(EVENT_TYPES.HANDS, onHands);
    Socket.addListener(EVENT_TYPES.TURN, onTurn);
    Socket.addListener(EVENT_TYPES.READY, onReady);
    Socket.addListener(EVENT_TYPES.SCORE_BOARD, onScoreBoard);
    Socket.addListener(EVENT_TYPES.WHOS_CONNECTED, onScoreBoard);
    Socket.addListener(EVENT_TYPES.CONNECTED, onScoreBoard);
    Socket.addListener(EVENT_TYPES.POINTS, onPoints);
    Socket.addListener(EVENT_TYPES.WINNER_ROUND, onWinnerRound);
    Socket.addListener(EVENT_TYPES.CONNECTIONS, onConnections);
    Socket.addListener(EVENT_TYPES.RESTART, onRestart);

    return () => Socket.disconnect()
  }, [currentPlayer])

  return children;
}

export default SocketProvider

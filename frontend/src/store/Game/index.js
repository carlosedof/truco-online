import {create} from 'zustand';
import {w3cwebsocket as W3CWebSocket} from 'websocket';
import Socket from "../../components/Socket";

export const EVENT_TYPES = {
  PING: 'ping',
  CONNECTED_PLAYERS: 'connectedPlayers',
  GET_HANDS: 'gethands',
  WHOS_CONNECTED: 'whosconnected',
  CONNECTED: 'connected',
  PLAYED: 'played',
  MANILHA: 'manilha',
  HANDS: 'hands',
  READY: 'ready',
  TURN: 'turn',
  SCORE_BOARD: 'scoreboard',
  POINTS: 'points',
  WINNER_ROUND: 'winnerround',
  CONNECTIONS: 'connections',
  RESTART: 'restart',
  TAKE_SIT: 'takeseat',
};

const connectWebsocket = async get => {
  const newSocket = new W3CWebSocket(import.meta.env.VITE_WEBSOCKET_URL);

  newSocket.onopen = () => {
    console.log('WebSocket connection established');
    get().onConnectedSocket();
  };

  newSocket.onmessage = event => {
    const eventParsed = JSON.parse(event.data);
    const listeners = [
      {type: EVENT_TYPES.CONNECTED_PLAYERS, handler: get().onConnectedPlayers},
      {type: EVENT_TYPES.PLAYED, handler: get().onPlayed},
      {type: EVENT_TYPES.MANILHA, handler: get().onManilha},
      {type: EVENT_TYPES.HANDS, handler: get().onHands},
      {type: EVENT_TYPES.TURN, handler: get().onTurn},
      {type: EVENT_TYPES.READY, handler: get().onReady},
      {type: EVENT_TYPES.SCORE_BOARD, handler: get().onScoreBoard},
      {type: EVENT_TYPES.WHOS_CONNECTED, handler: get().onScoreBoard},
      {type: EVENT_TYPES.CONNECTED, handler: get().onScoreBoard},
      {type: EVENT_TYPES.POINTS, handler: get().onPoints},
      {type: EVENT_TYPES.WINNER_ROUND, handler: get().onWinnerRound},
      {type: EVENT_TYPES.CONNECTIONS, handler: get().onConnections},
      {type: EVENT_TYPES.RESTART, handler: get().onRestart},
    ];
    listeners
      .find(({type}) => type === eventParsed?.type)
      ?.handler?.(eventParsed);
  };

  newSocket.onerror = event => {
    console.error(`WebSocket error: ${event}`);
  };

  newSocket.onclose = event => {
    console.log(`WebSocket connection closed: ${event.code} - ${event.reason}`);
  };

  return newSocket;
};

const useGameStore = create((set, get) => ({
  connected: false,
  ready: false,
  restart: false,
  isSitting: false,
  manilha: null,
  turn: null,
  onTable: [],
  connectedPlayers: [],
  scoreboard: {
    team1: {
      score: 0,
      players: [],
    },
    team2: {
      score: 0,
      players: [],
    },
  },
  points: [],
  connections: [],
  hands: [],
  connectWebsocket: async () => {
    const socket = await connectWebsocket(get);
    set(() => ({socket}));
  },
  disconnectWebsocket: () => {
    get().socket?.close();
    set(() => ({socket: null}));
  },
  onConnectedSocket: () => set(() => ({connected: true})),
  onConnectedPlayers: ({connectedPlayers}) => set(() => ({connectedPlayers})),
  onPlayed: ({handling}) => set(() => ({onTable: handling})),
  onManilha: ({manilha}) => set(() => ({manilha})),
  onHands: ({hands}) => set(() => ({hands})),
  onTurn: ({turn}) => set(() => ({turn})),
  onScoreBoard: ({scoreboard}) => set(() => ({scoreboard})),
  onReady: ({ready}) => set(() => ({ready})),
  onPoints: ({points}) => set(() => ({points})),
  onWinnerRound: isVisible => set(() => ({isDrawerVisible: isVisible})),
  onConnections: isVisible => set(() => ({isDrawerVisible: isVisible})),
  onRestart: () => {
    set(() => ({restart: true}));
  },
  onResetRestart: () => set(() => ({restart: false})),
  playCard: playedCard => {
    Socket.emit(EVENT_TYPES.PLAYED, playedCard);
  },
  takeSeat: (seat, playername) => {
    Socket.emit(EVENT_TYPES.TAKE_SIT, {seat, playername});
    // get().socket.send(
    //   JSON.stringify({
    //     method: EVENT_TYPES.TAKE_SIT,
    //     data: {
    //       name: playername,
    //       seat,
    //     },
    //   }),
    // );
    // set(() => ({isSitting: true}));
  },
  getHands: () => Socket.emit(EVENT_TYPES.GET_HANDS),
  getWhosConnected: () => {
    get().socket.send(
      JSON.stringify({
        method: EVENT_TYPES.WHOS_CONNECTED,
      }),
    );
  },
  restartGame: () => Socket.emit(EVENT_TYPES.RESTART),
}));

export default useGameStore;

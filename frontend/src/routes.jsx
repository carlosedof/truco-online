import React, {useEffect} from 'react';
import packagejson from '../package.json';
import {
  BrowserRouter as Router,
  useNavigate,
  useRoutes,
} from 'react-router-dom';
import Lobby from './Lobby';
import Table from './Table';
import Admin from './Admin';
import Login from './Login';
import {SocketProvider} from './provider';
import {useGameStore} from './store';
import Modal from "./components/Modal";

export const WsContext = React.createContext({});

const App = () => {
  const navigate = useNavigate();
  const {restart, restartGame, onResetRestart} = useGameStore();
  let routes = useRoutes([
    {path: '/', element: <Login />},
    {path: '/lobby', element: <Lobby />},
    {path: '/table', element: <Table />},
    {path: '/admin', element: <Admin />},
  ]);

  useEffect(() => {
    if (restart) {
      onResetRestart();
      console.log('restarting...');
      navigate('/');
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    }
  }, [restart]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Modal />
      {routes}
      <button
        className="absolute bottom-2 right-2 text-xs text-neutral-300"
        type="button"
        onClick={restartGame}>{`versão: ${packagejson.version}`}</button>
    </div>
  );
};

export default function RoutesApp() {
  return (
    <div className="relative flex h-full max-h-[900px] w-full max-w-[800px] items-center justify-center rounded bg-backgroundColor shadow-xl">
      <SocketProvider>
        <Router>
          <App />
        </Router>
      </SocketProvider>
    </div>
  );
}

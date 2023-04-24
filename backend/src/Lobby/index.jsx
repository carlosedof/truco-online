import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import TableWithCards from '../components/TableWithCards';
import LobbyHeader from './components/Header';
import {useGameStore} from '../store';

const Lobby = () => {
  // const toast = useToast();
  const {ready} = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready) {
      // toast({
      //     title: 'Mesa completa',
      //     description: "Iniciando jogo...",
      //     status: 'success',
      //     duration: 3000,
      // })
      setTimeout(() => navigate('/table'), 2000);
    }
  }, [ready]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <LobbyHeader />
      <div className="flex flex-col py-6">
        <TableWithCards />
      </div>
    </div>
  );
};

export default Lobby;

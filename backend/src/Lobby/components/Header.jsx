import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuthStore} from '../../store';

const LobbyHeader = () => {
  const {currentPlayer, setCurrentPlayer} = useAuthStore();
  const navigate = useNavigate();

  const handleLeave = () => {
    setCurrentPlayer('');
    navigate('/');
  };
  return (
    <>
      <div className="mb-6 flex flex-col">
        <span className="text-xl font-bold text-primary">
          {`Bem vindo, ${currentPlayer}!`}
        </span>
        <button className="text-sm text-neutral-300">
          (não é você? clique
          <b onClick={handleLeave}>{` aqui `}</b>
          para sair do lobby)
        </button>
      </div>
      <ol className="flex flex-col gap-2 text-sm text-neutral-200">
        <ul>1 - Selecione um assento</ul>
        <ul>2 - Aguarde o restante dos jogadores</ul>
        <ul>(a partida começará automaticamente)</ul>
      </ol>
    </>
  );
};

export default LobbyHeader;

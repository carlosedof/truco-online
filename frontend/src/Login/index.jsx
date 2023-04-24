import React, {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import cardBack from '../assets/cardLow.png';
import cardBackBlack from '../assets/cardBLow.png';
import Jump from 'react-reveal/Jump';
import Fade from 'react-reveal/Fade';
import {useAuthStore} from '../store';

const Login = () => {
  const {currentPlayer, setCurrentPlayer} = useAuthStore();
  const [name, setName] = useState(currentPlayer);
  const navigate = useNavigate();

  const join = useCallback(() => {
    setCurrentPlayer(name);
    navigate('/lobby');
  }, [navigate, setCurrentPlayer, name]);

  return (
    <div className="flex h-full w-full flex-col justify-between py-12">
      <Fade>
        <h1 className="text-center text-5xl font-bold text-primary">
          Truco online
        </h1>
      </Fade>
      <div className="flex flex-col gap-10 self-center">
        <div className="my-12 flex flex-col self-center">
          <span className="text-neutral-200">Informe seu nome</span>
          <input
            className="mt-2 bg-gray-800 px-4 py-1 text-neutral-200"
            maxLength={12}
            placeholder={'Informe seu nome'}
            onChange={e => setName(e.target.value)}
            value={name}
          />
        </div>
        <Jump>
          <div className="mb-12 flex justify-center">
            <img
              src={cardBack}
              alt={'card'}
              className={'h-[110px] w-[70px] -rotate-[20deg] rounded'}
            />
            <img
              src={cardBackBlack}
              alt={'card'}
              className={
                '-ml-6 -mt-4 h-[110px] w-[70px] -rotate-[5deg] rounded'
              }
            />
            <img
              src={cardBack}
              alt={'card'}
              className={'-ml-6 h-[110px] w-[70px] rotate-[15deg] rounded'}
            />
          </div>
        </Jump>
        <button
          className="w-32 self-center rounded bg-primary py-1 font-semibold"
          disabled={!name}
          onClick={() => join()}>
          Entrar
        </button>
        {/*<button*/}
        {/*  className="mt-4 w-32 self-center rounded border border-neutral-300 py-1 font-semibold text-neutral-300"*/}
        {/*  onClick={() => navigate('/admin')}>*/}
        {/*  Opções mesa*/}
        {/*</button>*/}
      </div>
      <div />
    </div>
  );
};

export default Login;

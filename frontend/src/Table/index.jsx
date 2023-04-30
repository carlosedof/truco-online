import React, {useContext, useEffect, useState} from 'react';
import {
  BsFillDiamondFill,
  BsFillSuitClubFill,
  BsFillSuitSpadeFill,
  BsSuitHeartFill,
} from 'react-icons/bs';
import {WsContext} from '../routes';
import useBreakpoint from '../hooks/useBreakpoint';
import Hand from '../components/Hand';
import OnTable from '../components/OnTable';
import Manilha from '../components/Manilha';
import Scoreboard from '../components/Scoreboard';
import {useNavigate} from 'react-router-dom';
import {useAuthStore, useGameStore} from '../store';

const Table = () => {
  // const toast = useToast();
  const navigate = useNavigate();
  const {
    connected,
    scoreboard,
    getHands,
    hands,
    connectedPlayers,
    manilha,
    onTable,
    turn,
    points,
  } = useGameStore();
  const {currentPlayer} = useAuthStore();
  const {isMobile} = useBreakpoint();
  const client = useContext(WsContext);

  const [playersStatus, setPlayersStatus] = useState({});
  // const [hand, setHand] = useState([]);

  const handleIcon = ic => {
    switch (ic) {
      case 'h':
        return BsSuitHeartFill;
      case 'd':
        return BsFillDiamondFill;
      case 'c':
        return BsFillSuitClubFill;
      default:
        return BsFillSuitSpadeFill;
    }
  };

  useEffect(() => {
    // client.onmessage = ({data}) => {
    // if (response.type === 'played' && response.handling) {
    //   setOnTable(response.handling);
    // }
    // if (response.type === 'winnerround' && response.winner) {
    //   // alert(response.winner);
    // }
    // if (response.type === 'connections' && response.playersConnections) {
    //   setPlayersStatus({
    //     [connectedPlayers[0]]: response.playersConnections.p0,
    //     [connectedPlayers[1]]: response.playersConnections.p1,
    //     [connectedPlayers[2]]: response.playersConnections.p2,
    //     [connectedPlayers[3]]: response.playersConnections.p3,
    //   });
    // }
    // if (response.type === 'restart') {
    // toast({
    //     title: 'A mesa foi resetada!',
    //     description: "Voltando para a tela inicial",
    //     status: 'success',
    //     duration: 5000,
    // })
    // setTimeout(() => {
    //   navigate('/');
    //   document.location.reload();
    // }, 1000);
    // }
  }, []);

  useEffect(() => {
      getHands();
  }, []);

  // todo use disconnect to check for online players, this is not neeeded
  // useEffect(() => {
  //     setPinger(setInterval(() => {
  //         client.send(JSON.stringify({method: 'ping', data: {ping: localStorage.getItem('player')}}));
  //     }, 3000));
  //     return pinger ? clearInterval(pinger) : () => {};
  //     }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center sm:justify-center">
      <div className="flex flex-col">
        {scoreboard && points && <Scoreboard currentPlayer={currentPlayer} />}
      </div>
      <div className="absolute right-6 top-2 md:right-10">
        <Manilha manilha={manilha} handleIcon={handleIcon} />
      </div>
      <div className="flex min-h-[105px] gap-2">
        {scoreboard &&
          onTable?.map((ot, i) => (
            <OnTable
              key={i}
              ot={ot}
              handleIcon={handleIcon}
              scoreBoard={scoreboard}
              player={ot.player}
              isCurrentPlayer={ot.player === currentPlayer}
              currentPlayer={currentPlayer}
            />
          ))}
      </div>
      {scoreboard &&
        hands.map((h, i) => (
          <Hand
            h={h}
            handleIcon={handleIcon}
            key={i}
            currentPlayer={currentPlayer}
          />
        ))}
    </div>
  );
};

export default Table;

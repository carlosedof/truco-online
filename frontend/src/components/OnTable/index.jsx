import React, {useCallback, useMemo} from 'react';
import cardBack from '../../assets/card.png';
import cardBackH from '../../assets/cardHoriz.png';
import Flip from 'react-reveal/Flip';
import useBreakpoint from '../../hooks/useBreakpoint';
import Bounce from 'react-reveal/Bounce';

const styles = {
  padding: 1,
  border: '1px solid black',
  background: 'white',
  borderRadius: 6,
  marginRight: -5,
  marginBottom: -5,
};

const OnTable = ({
  ot,
  handleIcon,
  scoreBoard,
  player,
  isCurrentPlayer,
  currentPlayer,
}) => {
  const getMyTeam = useMemo(() => {
    let myTeam;
    Object.keys(scoreBoard).forEach(k => {
      let found = scoreBoard[k].players.find(p => p === currentPlayer);
      myTeam = found ? k : myTeam;
    });
    return myTeam;
  }, [scoreBoard, currentPlayer]);

  const getOpponentTeam = useMemo(() => {
    let opponentTeam;
    Object.keys(scoreBoard).forEach(k => {
      let found = !scoreBoard[k].players.includes(currentPlayer);
      opponentTeam = found ? k : opponentTeam;
    });
    return opponentTeam;
  }, [scoreBoard, currentPlayer]);

  const isPartnerOfCurrentPlayer = useMemo(() => {
    return scoreBoard[getMyTeam].players.includes(player) && !isCurrentPlayer;
  }, [scoreBoard, player, isCurrentPlayer, getMyTeam]);

  const isNextToCurrentPlayer = useMemo(() => {
    if (!isCurrentPlayer && !isPartnerOfCurrentPlayer) {
      if (player !== currentPlayer && !isPartnerOfCurrentPlayer) {
        if (
          scoreBoard[getMyTeam].players.indexOf(currentPlayer) ===
          scoreBoard[getOpponentTeam].players.indexOf(player)
        ) {
          return true;
        }
        if (
          scoreBoard[getMyTeam].players.indexOf(currentPlayer) !==
          scoreBoard[getOpponentTeam].players.indexOf(player)
        ) {
          return false;
        }
      }
    }
    return false;
  }, [scoreBoard, getMyTeam, getOpponentTeam]);

  return (
    <Bounce
      left={!isNextToCurrentPlayer && !isPartnerOfCurrentPlayer}
      right={isNextToCurrentPlayer}
      top={isPartnerOfCurrentPlayer}
      bottom={isCurrentPlayer}>
      <div
        className={`
          flex h-[105px] w-[75px] flex-col justify-between rounded bg-white p-2
          ${
            ot.card.naipe === 's' || ot.card.naipe === 'c'
              ? 'text-black'
              : 'text-red-500'
          }
        `}>
        <div className="flex w-full flex-col items-start">
          <b>{ot.card.nr}</b>
        </div>
        <div className="flex justify-center">
          {React.createElement(handleIcon(ot.card.naipe), {size: 30}, null)}
        </div>
        <div />
      </div>
    </Bounce>
  );
};

export default OnTable;

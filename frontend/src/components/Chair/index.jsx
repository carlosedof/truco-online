import React, {useCallback, useMemo} from 'react';
import chairImg from '../../assets/chair.png';
import {useAuthStore, useGameStore} from '../../store';

const Chair = ({position}) => {
  const {scoreboard, takeSeat, isSitting} = useGameStore();
  const {currentPlayer} = useAuthStore();

  const isTeamOne = useMemo(() => {
    return position === 0 || position === 3;
  }, [position]);

  const playerName = useMemo(() => {
    if (isTeamOne) {
      return scoreboard.team1.players[position === 0 ? 0 : 1];
    } else {
      return scoreboard.team2.players[position === 1 ? 0 : 1];
    }
  }, [scoreboard, position, isTeamOne]);

  const handleSeat = useCallback(
    p => {
      let positionByTeam;
      if (isTeamOne) {
        positionByTeam = p === 0 ? 0 : 1;
      } else {
        positionByTeam = p === 1 ? 0 : 1;
      }
      takeSeat(
        {
          chair: positionByTeam,
          team: isTeamOne ? 'team1' : 'team2',
        },
        currentPlayer,
      );
    },
    [playerName, currentPlayer, isSitting, isTeamOne],
  );

  const getPositions = () => {
    let className = 'absolute';
    if (position > 1) {
      className = className.concat(` -bottom-10`);
      if (position % 2 === 0) {
        className = className.concat(` -left-10`);
      } else {
        className = className.concat(` -right-10`);
      }
    } else {
      className = className.concat(` -top-10`);
      if (position % 2 === 0) {
        className = className.concat(` -left-10`);
      } else {
        className = className.concat(` -right-10`);
      }
    }
    return className;
  };

  const chairPositionAtTable = useMemo(() => {
    let className = getPositions();
    if (position > 1) {
      if (position % 2 === 0) {
        className = className.concat(` rotate-45`);
      } else {
        className = className.concat(` -rotate-45`);
      }
    } else {
      if (position % 2 === 0) {
        className = className.concat(` rotate-[135deg]`);
      } else {
        className = className.concat(` -rotate-[135deg]`);
      }
    }
    return className;
  }, [position]);

  const labelPositionAtTable = useMemo(() => {
    let className = getPositions();
    className = className.concat(
      ' z-20 bg-accent text-neutral-400 text-xs font-bold rounded-full px-4 py-1',
    );
    return className;
  }, [position]);

  return (
    <>
      {playerName && <span className={labelPositionAtTable}>{playerName}</span>}
      <button
        className={chairPositionAtTable}
        onClick={() => handleSeat(position)}>
        <img className="h-[90px] w-[90px]" src={chairImg} alt={'chair'} />
      </button>
    </>
  );
};

export default Chair;

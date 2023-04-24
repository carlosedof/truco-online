import React, {useMemo} from 'react';
import Flip from 'react-reveal/Flip';
import Card from '../Card';
import {useGameStore} from '../../store';

const Hand = ({h, handleIcon, currentPlayer}) => {
  const {scoreboard, turn, playCard} = useGameStore();

  const isRevealed = useMemo(
    () => h.player === currentPlayer,
    [h.player, currentPlayer],
  );

  const seat = useMemo(() => {
    let _seat;
    Object.keys(scoreboard).forEach(team => {
      const _seatIndex = scoreboard[team].players.indexOf(h.player);
      if (_seatIndex !== -1) {
        _seat = {
          team,
          seat: _seatIndex,
        };
      }
    });
    return _seat;
  }, [h, scoreboard]);

  const currentPlayerSeat = useMemo(() => {
    let _seat;
    Object.keys(scoreboard).forEach(team => {
      const _seatIndex = scoreboard[team].players.indexOf(currentPlayer);
      if (_seatIndex !== -1) {
        _seat = {
          team,
          seat: _seatIndex,
        };
      }
    });
    return _seat;
  }, [currentPlayer, scoreboard]);

  const isOnRight = useMemo(() => {
    if (currentPlayerSeat.team === 'team1' && currentPlayerSeat.seat === 0) {
      return seat.team === 'team2' && seat.seat === 1;
    }
    if (currentPlayerSeat.team === 'team1' && currentPlayerSeat.seat === 1) {
      return seat.team === 'team2' && seat.seat === 0;
    }
    if (currentPlayerSeat.team === 'team2' && currentPlayerSeat.seat === 0) {
      return seat.team === 'team1' && seat.seat === 0;
    }
    if (currentPlayerSeat.team === 'team2' && currentPlayerSeat.seat === 1) {
      return seat.team === 'team1' && seat.seat === 1;
    }
  }, [currentPlayerSeat, seat]);

  const isOnLeft = useMemo(() => {
    if (currentPlayerSeat.team === 'team1' && currentPlayerSeat.seat === 0) {
      return seat.team === 'team2' && seat.seat === 0;
    }
    if (currentPlayerSeat.team === 'team1' && currentPlayerSeat.seat === 1) {
      return seat.team === 'team2' && seat.seat === 1;
    }
    if (currentPlayerSeat.team === 'team2' && currentPlayerSeat.seat === 0) {
      return seat.team === 'team1' && seat.seat === 1;
    }
    if (currentPlayerSeat.team === 'team2' && currentPlayerSeat.seat === 1) {
      return seat.team === 'team1' && seat.seat === 0;
    }
  }, [currentPlayerSeat, seat]);

  const position = useMemo(() => {
    let cardsClassName = `absolute flex flex-wrap gap-2`;
    let labelClassName = `flex items-center text-neutral-200 font-semibold text-sm`;
    if (isRevealed) {
      return {
        container: cardsClassName.concat(` bottom-4`),
        labelClassName,
      };
    }
    if (isOnRight) {
      return {
        container: cardsClassName.concat(` top-1/3 right-2 flex-col`),
        labelClassName: labelClassName.concat(` top-1/2 right-0`),
      };
    }
    if (isOnLeft) {
      return {
        container: cardsClassName.concat(` top-1/3 left-2 flex-col`),
        labelClassName: labelClassName.concat(` top-1/2 left-0`),
      };
    }
    return {
      container: cardsClassName.concat(
        ` top-4 left-0 sm:left-auto flex-row-reverse`,
      ),
      labelClassName,
    };
  }, [isRevealed, isOnRight, isOnLeft]);

  return (
    <div className={position.container}>
      {h?.cards?.map((card, y) => (
        <button
          className="transition-all hover:scale-105"
          onClick={() => {
            if ((isRevealed && turn === currentPlayer) || true) {
              playCard({
                method: 'played',
                data: {card, player: h?.player},
              });
            }
          }}>
          <Flip left cascade key={y}>
            <Card
              card={card}
              handleIcon={handleIcon}
              vertical={!isOnLeft && !isOnRight}
              isRevealed={isRevealed}
            />
          </Flip>
        </button>
      ))}
      <span className={position.labelClassName}>
        {h?.player}
        <div className="ml-1 h-[10px] w-[10px] rounded-full bg-accent font-bold" />
      </span>
    </div>
  );
};

export default Hand;

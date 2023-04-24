import React, {useMemo} from 'react';
import useBreakpoint from '../../hooks/useBreakpoint';
import {useGameStore} from '../../store';

const Circle = ({status}) => {
  return (
    <div
      className={`h-[10px] w-[10px] rounded-full ${
        status === 'win' ? 'bg-green-600' : ''
      } ${status === 'loss' ? 'bg-red-500' : ''} ${
        status === 'draw' ? 'bg-yellow-500' : ''
      } ${status === '' ? 'bg-gray-400' : ''}`}
    />
  );
};

const Scoreboard = ({currentPlayer}) => {
  const {turn, points, scoreboard} = useGameStore();
  const getMyTeam = useMemo(() => {
    if (scoreboard?.team1?.players.includes(currentPlayer)) {
      return 1;
    } else {
      return 2;
    }
  }, [scoreboard, currentPlayer]);

  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-300">vez:</span>
      <span className="text-md font-bold text-green-500">{turn}</span>
      <div className="mb-6 mt-2 flex gap-2 rounded border border-neutral-300 p-2">
        <div className="flex flex-col">
          <span className="text-gray-300">
            {getMyTeam === 1 ? 'nós' : 'eles'}
          </span>
          <span className="text-gray-300">
            {getMyTeam === 1 ? 'eles' : 'nós'}
          </span>
        </div>
        <div className="flex flex-col justify-center gap-4">
          <div className="flex gap-1">
            {points.map((p, i) => (
              <Circle
                key={i}
                status={
                  p.winner || p.draw
                    ? scoreboard?.team1?.players.includes(p.winner)
                      ? 'win'
                      : p.draw
                      ? 'draw'
                      : 'loss'
                    : ''
                }
              />
            ))}
          </div>
          <div className="flex gap-1">
            {points.map((p, i) => (
              <Circle
                key={i}
                status={
                  p.winner || p.draw
                    ? scoreboard?.team2?.players.includes(p.winner)
                      ? 'win'
                      : p.draw
                      ? 'draw'
                      : 'loss'
                    : ''
                }
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-300">
            {scoreboard?.team1.score}
          </span>
          <span className="font-bold text-gray-300">
            {scoreboard?.team2.score}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;

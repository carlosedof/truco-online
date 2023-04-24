import React from 'react';
import cardBack from '../../assets/card.png';
import table from '../../assets/table.png';
import Zoom from 'react-reveal/Zoom';
import cardBackBlack from '../../assets/cardB.png';
import Chair from '../Chair';

const TableWithCards = () => {
  return (
    <div className="relative my-12">
      <div
        className="z-20 h-[220px] w-[220px] items-center justify-center rounded-full bg-cover drop-shadow-2xl"
        style={{
          backgroundImage: `url(${table})`,
        }}>
        <Zoom>
          <div className="relative h-full">
            {[...Array(13)]
              .map((_, i) => i)
              .map(i => (
                <img
                  className="absolute h-[20px] w-[12px] bg-white p-[0.4px] transition-all duration-1000 ease-out"
                  key={i}
                  src={
                    Math.round(Math.random()) === 0 ? cardBack : cardBackBlack
                  }
                  alt={'card'}
                  style={{
                    transform: `rotate(${
                      Math.floor(Math.random() * 360) + 30
                    }deg)`,
                    top: `${Math.floor(Math.random() * 75) + 10}%`,
                    left: `${Math.floor(Math.random() * 75) + 10}%`,
                    right: `${Math.floor(Math.random() * 75) + 10}%`,
                    bottom: `${Math.floor(Math.random() * 55) + 10}%`,
                  }}
                />
              ))}
          </div>
        </Zoom>
      </div>
      {[...Array(4)].map((_, i) => (
        <Chair key={i} position={i} />
      ))}
    </div>
  );
};

export default TableWithCards;

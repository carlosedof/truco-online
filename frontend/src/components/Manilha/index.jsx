import React from 'react';
import Deck from '../Deck';

const Manilha = ({manilha, handleIcon}) => {
  return (
    <div className="right-10 top-0 flex flex-col">
      <Deck>
        {manilha && (
          <div
            className="absolute left-2 top-2 flex flex h-full w-full flex-col items-center justify-between rounded bg-white shadow-[5px_5px_8px_rgb(0,0,0)] p-1"
            style={{
              color:
                manilha.suit === 's' || manilha.suit === 'c' ? '#000' : 'red',
            }}>
            <div className="flex w-full flex-col items-start">
              <b className="text-2xl">{manilha.nr}</b>
            </div>
            <div className="flex">
              {React.createElement(handleIcon(manilha.suit), {size: 30}, null)}
            </div>
            <div />
          </div>
        )}
      </Deck>
    </div>
  );
};

export default Manilha;

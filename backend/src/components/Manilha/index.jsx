import React from 'react';
import Deck from '../Deck';

const Manilha = ({manilha, handleIcon}) => {
  return (
    <div className="right-10 top-0 flex flex-col">
      <Deck>
        {manilha && (
          <div
            className="absolute left-2 top-2 flex flex h-full w-full flex-col items-center justify-between rounded bg-white p-1"
            style={{
              color:
                manilha.naipe === 's' || manilha.naipe === 'c' ? '#000' : 'red',
            }}>
            <div className="flex w-full flex-col items-start">
              <b className="text-2xl">{manilha.nr}</b>
            </div>
            <div className="flex">
              {React.createElement(handleIcon(manilha.naipe), {size: 30}, null)}
            </div>
            <div />
          </div>
        )}
      </Deck>
    </div>
  );
};

export default Manilha;

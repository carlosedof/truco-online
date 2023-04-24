import React from 'react';
import cardBack from '../../assets/card.png';

const Deck = ({children}) => {
  const className =
    'p-0.5 border bg-white rounded-md mr-[-5px] mb-[-5px] relative';
  return (
    <div className={className}>
      <div className={className}>
        <div className={className}>
          <div className={className}>
            <div className={className}>
              <div className={className}>
                <img
                  className="h-[85px] w-[50px] md:h-[105px] md:w-[70px]"
                  src={cardBack}
                  alt={'card'}
                />
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deck;

import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

const useGlobalStore = create()(
  persist(
    (set, get) => ({
      currentPlayer: 'cadi',
      isSitting: false,
      setCurrentPlayer: currentPlayer =>
        set(() => ({currentPlayer, isSitting: false})),
    }),
    {
      name: 'truco-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useGlobalStore;

import {create} from 'zustand';

const useModalStore = create((set, get) => ({
  visible: null,
  onModalVisible: () => set(() => ({visible: true})),
}));

export default useModalStore;

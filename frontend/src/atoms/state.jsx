import { atom } from 'recoil';

export const imagesUpdatedState = atom({
  key: 'imagesUpdatedState',  // Unique key
  default: false,             // Initial value
});

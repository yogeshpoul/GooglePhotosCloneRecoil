import { atom } from 'recoil';

export const selectedMediaState = atom({
  key: 'selectedMediaState',  // Unique key
  default: null,             // Initial value
});

import { map } from "lodash-es";

export enum LETTER_STATUS {
  IN_POSITION,
  OUT_OF_POSITION,
  NOT_IN_WORD,
  NOT_GUESSED,
  GUESSED
}

const initKeyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export const keyboardLayout = map(initKeyboardLayout, (row) => {
  return map(row, (key) => ({
    value: key,
    status: null,
  }));
});

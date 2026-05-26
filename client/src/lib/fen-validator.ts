import { Chess } from 'chess.js';

interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}

export const validateFEN = (fen: string): ValidationResult => {
  try {
    const chess = new Chess();
    chess.load(fen);
    return { isValid: true, errorMessage: null };
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : 'Неправильна структура або синтаксис FEN-коду.';
    return {
      isValid: false,
      errorMessage: errorMessage,
    };
  }
};

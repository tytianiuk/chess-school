export function formatMovesToText(moves: string[], startFen?: string): string {
  if (!moves || moves.length === 0) return 'Ходів немає';

  const isBlackFirst = startFen ? startFen.split(' ')[1] === 'b' : false;
  const parts: string[] = [];

  if (isBlackFirst) {
    parts.push(`1... ${moves[0]}`);

    for (let i = 1; i < moves.length; i += 2) {
      const moveNumber = Math.floor((i - 1) / 2) + 2;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];

      let moveGroup = `${moveNumber}. ${whiteMove}`;
      if (blackMove) moveGroup += ` ${blackMove}`;

      parts.push(moveGroup);
    }
  } else {
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];

      let moveGroup = `${moveNumber}. ${whiteMove}`;
      if (blackMove) moveGroup += ` ${blackMove}`;

      parts.push(moveGroup);
    }
  }

  return parts.join(' ');
}

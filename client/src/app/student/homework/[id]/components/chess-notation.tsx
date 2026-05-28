interface ChessNotationProps {
  moves: string[];
  startFen?: string;
}

export function ChessNotation({ moves, startFen }: ChessNotationProps) {
  if (!moves || moves.length === 0)
    return (
      <span className="text-muted-foreground italic text-xs">Ходів немає</span>
    );

  const isBlackFirst = startFen ? startFen.split(' ')[1] === 'b' : false;
  const elements: React.ReactNode[] = [];

  if (isBlackFirst) {
    elements.push(
      <span key="first-black" className="font-medium text-foreground">
        1. ... <span className="font-semibold text-primary">{moves[0]}</span>
      </span>,
    );

    for (let i = 1; i < moves.length; i += 2) {
      const moveNumber = Math.floor((i - 1) / 2) + 2;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];

      elements.push(
        <span key={`group-${i}`} className="font-medium text-foreground ml-2">
          {moveNumber}.{' '}
          <span className="font-semibold text-primary">{whiteMove}</span>
          {blackMove && (
            <span className="font-semibold text-primary ml-1">{blackMove}</span>
          )}
        </span>,
      );
    }
  } else {
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];

      elements.push(
        <span key={`group-${i}`} className="font-medium text-foreground mr-2">
          {moveNumber}.{' '}
          <span className="font-semibold text-primary">{whiteMove}</span>
          {blackMove && (
            <span className="font-semibold text-primary ml-1">{blackMove}</span>
          )}
        </span>,
      );
    }
  }

  return (
    <div className="flex flex-wrap text-sm font-mono bg-muted/40 p-2.5 rounded-md border w-full leading-relaxed">
      {elements}
    </div>
  );
}

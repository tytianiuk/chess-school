import { MessageSquare, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { ManualVariation } from './manual-variations-panel';
import { ChessNotation } from '../../../../../components/chess-notation';
import { Button } from '@/components/ui/button';
interface SavedVariationsListProps {
  variations: ManualVariation[];
  activeVariationId: string | null;
  onLoad: (variation: ManualVariation) => void;
  onDelete: (variationId: string) => void;
}

function getMoveCountText(count: number): string {
  if (count === 1) return 'хід';
  if (count >= 2 && count <= 4) return 'ходи';
  return 'ходів';
}

export function SavedVariationsList({
  variations,
  activeVariationId,
  onLoad,
  onDelete,
}: SavedVariationsListProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Збережені варіанти ({variations.length}):
      </div>
      <Accordion className="w-full space-y-1.5">
        {variations.map((variation, idx) => (
          <AccordionItem
            key={variation.id}
            value={variation.id}
            className="border rounded-md px-3 bg-background/50"
          >
            <AccordionTrigger className="hover:no-underline py-2.5">
              <div className="flex items-center gap-2 text-sm text-left">
                <span className="font-semibold">Варіант {idx + 1}</span>
                <span className="text-muted-foreground font-medium text-xs bg-muted px-2 py-0.5 rounded-full">
                  {variation.moves.length}{' '}
                  {getMoveCountText(variation.moves.length)}
                </span>
                {activeVariationId === variation.id && (
                  <Badge
                    variant="default"
                    className="text-[10px] h-4 px-1.5 bg-blue-600"
                  >
                    Редагується
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 pt-1 space-y-3 border-t border-dashed mt-1">
              <ChessNotation
                moves={variation.moves}
                startFen={variation.startFen}
              />

              {variation.comment && (
                <div className="text-sm text-muted-foreground bg-muted/40 p-2.5 rounded-md border-l-2 border-primary/40 italic">
                  {variation.comment}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLoad(variation)}
                  className="flex-1 h-8 text-xs"
                >
                  Редагувати
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(variation.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

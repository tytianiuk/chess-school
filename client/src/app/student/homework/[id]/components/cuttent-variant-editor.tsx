import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Undo2 } from 'lucide-react';
import { ChessNotation } from './chess-notation';

interface CurrentVariationEditorProps {
  moves: string[];
  comment: string;
  onCommentChange: (comment: string) => void;
  onUndo: () => void;
  onSave: () => void;
  isEditing: boolean;
  startFen?: string;
}

export function CurrentVariationEditor({
  moves,
  comment,
  onCommentChange,
  onUndo,
  onSave,
  isEditing,
  startFen,
}: CurrentVariationEditorProps) {
  return (
    <div className="p-3 rounded-lg bg-background border space-y-3">
      <div className="text-sm font-medium flex items-center justify-between">
        <span>{isEditing ? 'Редагування варіанту:' : 'Поточний варіант:'}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          className="h-6 px-2 text-xs"
        >
          <Undo2 className="h-3 w-3 mr-1" />
          Назад
        </Button>
      </div>

      <ChessNotation moves={moves} startFen={startFen} />

      <div className="space-y-2">
        <Label htmlFor="variation-comment" className="text-sm">
          Коментар:
        </Label>
        <Textarea
          id="variation-comment"
          placeholder="Поясніть ідею цього варіанту..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="min-h-[60px] resize-none"
        />
      </div>
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={onSave}
      >
        <Plus className="h-4 w-4 mr-2" />
        {isEditing ? 'Оновити варіант' : 'Зберегти варіант'}
      </Button>
    </div>
  );
}

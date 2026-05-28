'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Undo2, Plus, GitBranch, Send } from 'lucide-react';
import { CurrentVariationEditor } from './cuttent-variant-editor';
import { SavedVariationsList } from './saved-variations-list';

export interface ManualVariation {
  id: string;
  moves: string[];
  comment: string;
  startFen: string;
}

export interface VariationState {
  variations: ManualVariation[];
  activeVariationId: string | null;
  currentMoves: string[];
}

interface ManualVariationsPanelProps {
  variationState: VariationState;
  newVariationComment: string;
  onCommentChange: (comment: string) => void;
  onUndo: () => void;
  onSaveVariation: () => void;
  onDeleteVariation: (variationId: string) => void;
  onLoadVariation: (variation: ManualVariation) => void;
  onStartNewVariation: () => void;
  onSubmitAllVariations: () => void;
  isSolved: boolean;
}

export function ManualVariationsPanel({
  variationState,
  newVariationComment,
  onCommentChange,
  onUndo,
  onSaveVariation,
  onDeleteVariation,
  onLoadVariation,
  onStartNewVariation,
  onSubmitAllVariations,
  isSolved,
}: ManualVariationsPanelProps) {
  const { variations, activeVariationId, currentMoves } = variationState;
  const hasCurrentMoves = currentMoves.length > 0;
  const hasVariations = variations.length > 0;
  const isEditing = activeVariationId !== null;

  const activeVariation = variations.find((v) => v.id === activeVariationId);
  const currentStartFen = activeVariation?.startFen;

  const boardControls = [
    {
      id: 'undo',
      title: 'Повернути хід',
      icon: Undo2,
      onClick: onUndo,
      disabled: !hasCurrentMoves,
      label: 'Назад',
    },
    {
      id: 'new-branch',
      title: 'Почати новий варіант',
      icon: Plus,
      onClick: onStartNewVariation,
      disabled: !hasCurrentMoves,
      label: 'Новий варіант',
    },
  ];

  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Ваші варіанти
          </CardTitle>
          <div className="flex items-center gap-1">
            {boardControls.map((ctrl, idx) => {
              const Icon = ctrl.icon;
              return (
                <Button
                  key={ctrl.id}
                  variant="ghost"
                  size="sm"
                  onClick={ctrl.onClick}
                  disabled={ctrl.disabled}
                  title={ctrl.title}
                  className={`h-8 px-2.5 text-xs gap-1.5 ${
                    idx === 0 ? 'rounded-l-md' : 'rounded-r-md'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{ctrl.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
        <CardDescription>
          Введіть ходи на дошці, додайте коментар і збережіть як варіант.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasCurrentMoves && (
          <CurrentVariationEditor
            moves={currentMoves}
            comment={newVariationComment}
            onCommentChange={onCommentChange}
            onUndo={onUndo}
            onSave={onSaveVariation}
            isEditing={isEditing}
            startFen={currentStartFen}
          />
        )}

        {!hasCurrentMoves && !hasVariations && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Зробіть хід на дошці, щоб почати новий варіант
          </div>
        )}

        {hasVariations && (
          <SavedVariationsList
            variations={variations}
            activeVariationId={activeVariationId}
            onLoad={onLoadVariation}
            onDelete={onDeleteVariation}
          />
        )}

        {hasVariations && !isSolved && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={onSubmitAllVariations}
          >
            <Send className="h-4 w-4 mr-2" />
            Надіслати на перевірку
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

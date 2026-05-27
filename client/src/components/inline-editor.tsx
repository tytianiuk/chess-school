'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, Pencil } from 'lucide-react';

interface InlineEditorProps {
  initialValue: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export function InlineEditor({
  initialValue,
  onSave,
  placeholder = 'Введіть значення...',
  className = '',
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    if (!value.trim()) return;
    if (value.trim() === initialValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(value.trim());
      setIsEditing(false);
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 max-w-md w-full">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`font-bold tracking-tight h-8 ${className}`}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
          disabled={isSaving}
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 border-green-500 text-green-600 hover:bg-green-50 shrink-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 text-muted-foreground hover:bg-muted shrink-0"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className={`font-bold tracking-tight truncate ${className}`}>
        {initialValue}
      </h1>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}

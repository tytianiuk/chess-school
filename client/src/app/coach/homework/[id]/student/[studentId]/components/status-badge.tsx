import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from '@/lib/constants';
import { ProgressStatus } from '@/lib/types';

import { HelpCircle } from 'lucide-react';

export function StatusBadge({ status }: { status: ProgressStatus }) {
  const current = STATUS_CONFIG[status] || {
    label: status,
    color: 'bg-gray-500 text-white',
    icon: HelpCircle,
  };
  const Icon = current.icon;

  return (
    <Badge
      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md ${current.color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {current.label}
    </Badge>
  );
}

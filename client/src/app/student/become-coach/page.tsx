'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Check, Copy, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function BecomeCoachPage() {
  const [copied, setCopied] = useState(false);
  const adminEmail = 'admin@chessacademy.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopied(true);
    toast.success('Електронну пошту скопійовано в буфер обміну!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8 max-w-2xl mx-auto animate-in fade-in duration-200">
      <Card className="border shadow-md w-full overflow-hidden">
        <CardHeader className="bg-amber-50/50 border-b border-amber-100/60 pb-5 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-foreground">
              Запит на отримання статусу Тренера
            </CardTitle>
            <CardDescription className="text-sm">
              Ваш поточний обліковий запис має базові права учня системи.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Для запобігання несанкціонованому доступу до панелі управління
            учнями та створення фіктивних груп, активація профілю викладача
            здійснюється адміністратором платформи у ручному режимі.
          </p>

          <div className="bg-muted/30 border p-4 rounded-xl space-y-2.5 text-sm">
            <h4 className="font-semibold text-foreground">
              Що потрібно вказати у листі:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Ваше повне ім'я, вказане при реєстрації;</li>
              <li>Електронну пошту вашого аккаунта;</li>
              <li>
                Коротку інформацію про вашу кваліфікацію або назву шахового
                клубу.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-background border p-3 rounded-xl justify-between shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
              <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-sm font-mono text-foreground font-medium truncate">
                {adminEmail}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyEmail}
              className="w-full sm:w-auto h-9 gap-1.5 font-medium rounded-lg shrink-0 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  Скопійовано
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  Скопіювати email
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Link href="/student/coaches">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" /> Назад
              </Button>
            </Link>
            <span className="text-[11px] text-muted-foreground italic">
              Термін обробки заявки: до 24 годин
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

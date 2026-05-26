'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    lichessUsername: '',
    role: 'STUDENT' as Role,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    router.push(user.role === 'COACH' ? '/coach' : '/student');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль має бути не менше 6 символів');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        lichessUsername: formData.lichessUsername || undefined,
      });
    } catch {
      setError('Помилка реєстрації. Можливо, цей email вже зареєстрований.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/images/register-image.jpg"
          alt="Chess pieces on a board"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img
              className="mx-auto my-4 items-center justify-center h-16 w-16"
              src="/favicon.ico"
              alt="logo"
            />
            <CardTitle className="text-2xl">Chess School</CardTitle>
            <CardDescription>Зареєструватися зараз </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Повне ім&apos;я</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Іван Петренко"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lichessUsername">
                  Lichess Username (необов&apos;язково)
                </Label>
                <Input
                  id="lichessUsername"
                  type="text"
                  placeholder="your_lichess_username"
                  value={formData.lichessUsername}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lichessUsername: e.target.value,
                    })
                  }
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Підтвердіть</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="********"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-4">
              <Button
                type="submit"
                className="w-full py-6 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Реєстрація...
                  </>
                ) : (
                  'Зареєструватися'
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Вже маєте акаунт?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Увійти
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

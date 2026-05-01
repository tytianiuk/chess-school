'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    lichessUsername: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Створити акаунт
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4 rounded-md shadow-sm">
            <input
              name="fullName"
              type="text"
              required
              className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="Пилипенко Остап"
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              required
              className="relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="chess@example.com"
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              required
              className="relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="••••••••"
              onChange={handleChange}
            />
            <input
              name="lichessUsername"
              type="text"
              className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
              placeholder="Lichess Username (опціонально)"
              onChange={handleChange}
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">Вже маєте акаунт? </span>
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Увійти
          </Link>
        </div>
      </div>
    </div>
  );
}

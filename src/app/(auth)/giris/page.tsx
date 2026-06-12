'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta gir'),
  password: z.string().min(6, 'En az 6 karakter'),
});

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: any) => {
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.accessToken);
      toast.success('Hoş geldin!');
      router.push('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Giriş yapılamadı');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-orange-500">Motorya</Link>
          <p className="text-gray-500 mt-2 text-sm">Hesabına giriş yap</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="E-posta" type="email" error={errors.email?.message as string} {...register('email')} />
            <Input label="Şifre" type="password" error={errors.password?.message as string} {...register('password')} />
            <Button type="submit" className="w-full" loading={isSubmitting}>Giriş Yap</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Hesabın yok mu? <Link href="/kayit" className="text-orange-500 font-medium hover:underline">Kayıt Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

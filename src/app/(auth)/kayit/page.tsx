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
  displayName: z.string().min(2, 'En az 2 karakter'),
  email: z.string().email('Geçerli bir e-posta gir'),
  password: z.string().min(8, 'En az 8 karakter'),
});

export default function RegisterPage() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: any) => {
    try {
      const res = await api.post('/auth/register', data);
      setAuth(res.data.user, res.data.accessToken);
      toast.success('Hoş geldin! Hesabın oluşturuldu.');
      router.push('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Kayıt yapılamadı');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-orange-500">Motorya</Link>
          <p className="text-gray-500 mt-2 text-sm">Hesap oluştur, alışverişe başla</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Ad Soyad" error={errors.displayName?.message as string} {...register('displayName')} />
            <Input label="E-posta" type="email" error={errors.email?.message as string} {...register('email')} />
            <Input label="Şifre" type="password" error={errors.password?.message as string} {...register('password')} />
            <Button type="submit" className="w-full" loading={isSubmitting}>Kayıt Ol</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Zaten hesabın var mı? <Link href="/giris" className="text-orange-500 font-medium hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

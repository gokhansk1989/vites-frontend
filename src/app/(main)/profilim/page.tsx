'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { User, Lock, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  displayName: z.string().min(2, 'En az 2 karakter'),
  bio: z.string().max(200).optional(),
  city: z.string().optional(),
  avatarUrl: z.string().url('Geçerli URL girin').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifrenizi girin'),
  newPassword: z.string().min(8, 'En az 8 karakter'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Şifreler eşleşmiyor', path: ['confirmPassword'] });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/users/profile').then(r => r.data),
  });

  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        displayName: profile.displayName ?? '',
        bio: profile.bio ?? '',
        city: profile.city ?? '',
        avatarUrl: profile.avatarUrl ?? '',
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data: ProfileData) => api.patch('/users/profile', data).then(r => r.data),
    onSuccess: (updated) => {
      setAuth(updated, token!);
      toast.success('Profil güncellendi');
    },
    onError: () => toast.error('Güncellenemedi'),
  });

  const changePassword = useMutation({
    mutationFn: (data: PasswordData) => api.post('/users/change-password', data),
    onSuccess: () => { toast.success('Şifre değiştirildi'); passwordForm.reset(); },
    onError: () => toast.error('Şifre değiştirilemedi'),
  });

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profilim</h1>

      {/* Avatar + stats */}
      {profile && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500 overflow-hidden shrink-0">
            {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" alt=""/> : profile.displayName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile.displayName}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400"/>{profile.ratingAvg?.toFixed(1) ?? '—'} ({profile.ratingCount} değerlendirme)</span>
              <span>{profile.salesCount} satış</span>
            </div>
          </div>
        </div>
      )}

      {/* Profil güncelle */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><User className="w-4 h-4"/> Profil Bilgileri</h2>
        <form onSubmit={profileForm.handleSubmit(d => updateProfile.mutate(d))} className="space-y-3">
          <Input label="Ad Soyad" {...profileForm.register('displayName')} error={profileForm.formState.errors.displayName?.message}/>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hakkımda</label>
            <textarea {...profileForm.register('bio')} rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 resize-none"
              placeholder="Kendinizden bahsedin…"/>
          </div>
          <Input label="Şehir" {...profileForm.register('city')} placeholder="İstanbul"/>
          <Input label="Profil Fotoğrafı URL" {...profileForm.register('avatarUrl')} error={profileForm.formState.errors.avatarUrl?.message} placeholder="https://…"/>
          <Button type="submit" loading={updateProfile.isPending} className="w-full">Kaydet</Button>
        </form>
      </div>

      {/* Şifre değiştir */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Lock className="w-4 h-4"/> Şifre Değiştir</h2>
        <form onSubmit={passwordForm.handleSubmit(d => changePassword.mutate(d))} className="space-y-3">
          <Input label="Mevcut Şifre" type="password" {...passwordForm.register('currentPassword')} error={passwordForm.formState.errors.currentPassword?.message}/>
          <Input label="Yeni Şifre" type="password" {...passwordForm.register('newPassword')} error={passwordForm.formState.errors.newPassword?.message}/>
          <Input label="Şifre Tekrar" type="password" {...passwordForm.register('confirmPassword')} error={passwordForm.formState.errors.confirmPassword?.message}/>
          <Button type="submit" loading={changePassword.isPending} variant="secondary" className="w-full">Şifreyi Değiştir</Button>
        </form>
      </div>
    </div>
  );
}

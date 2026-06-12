'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCreateListing } from '@/hooks/useListings';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Upload, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(5, 'En az 5 karakter'),
  description: z.string().min(20, 'En az 20 karakter'),
  categoryId: z.string().min(1, 'Kategori seçin'),
  brandId: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  price: z.string().min(1, 'Fiyat giriniz').transform(Number),
  originalPrice: z.string().optional().transform(v => v ? Number(v) : undefined),
  city: z.string().optional(),
  sizeLabel: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CONDITIONS = [
  { value: 'NEW', label: 'Sıfır' },
  { value: 'LIKE_NEW', label: 'Sıfır Gibi' },
  { value: 'GOOD', label: 'İyi' },
  { value: 'FAIR', label: 'Orta' },
  { value: 'POOR', label: 'Kötü' },
];

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Kayseri'];

export default function CreateListingPage() {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imgInput, setImgInput] = useState('');
  const createListing = useCreateListing();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings').then(r => {
      const cats = new Map();
      r.data.items.forEach((l: any) => { if (l.category) cats.set(l.category.id, l.category); });
      return Array.from(cats.values());
    }),
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get('/listings').then(r => {
      const b = new Map();
      r.data.items.forEach((l: any) => { if (l.brand) b.set(l.brand.id, l.brand); });
      return Array.from(b.values());
    }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: { condition: 'GOOD' },
  });

  const addImage = () => {
    if (imgInput.trim() && !imageUrls.includes(imgInput.trim())) {
      setImageUrls(prev => [...prev, imgInput.trim()]);
      setImgInput('');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (imageUrls.length === 0) {
      toast.error('En az bir fotoğraf ekleyin');
      return;
    }
    try {
      const listing = await createListing.mutateAsync({ ...data, imageUrls });
      toast.success('İlanınız oluşturuldu, onay bekleniyor');
      router.push(`/ilan/${listing.id}`);
    } catch {
      toast.error('İlan oluşturulamadı');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">İlan Ver</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Fotoğraflar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Fotoğraflar</h2>
          <div className="flex gap-2 mb-3">
            <input value={imgInput} onChange={e => setImgInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400"
              placeholder="Fotoğraf URL'si yapıştır"/>
            <button type="button" onClick={addImage}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium">
              Ekle
            </button>
          </div>
          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 group">
                  <img src={url} className="w-full h-full object-cover" alt="" onError={e => (e.currentTarget.src = '')}/>
                  <button type="button" onClick={() => setImageUrls(p => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3 text-white"/>
                  </button>
                </div>
              ))}
            </div>
          )}
          {imageUrls.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
              <Upload className="w-8 h-8 mx-auto mb-2 opacity-40"/>
              URL ile fotoğraf ekleyin
            </div>
          )}
        </div>

        {/* Temel bilgiler */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">İlan Bilgileri</h2>
          <Input label="Başlık" {...register('title')} error={errors.title?.message as string} placeholder="Örn: Shoei GT-Air II M beden kask"/>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama</label>
            <textarea {...register('description')} rows={4}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 resize-none"
              placeholder="Ürün hakkında detaylı bilgi verin…"/>
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message as string}</p>}
          </div>
        </div>

        {/* Kategori ve marka */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori *</label>
            <div className="relative">
              <select {...register('categoryId')} className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 bg-white pr-8">
                <option value="">Seçin…</option>
                {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
            </div>
            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message as string}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Marka</label>
            <div className="relative">
              <select {...register('brandId')} className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 bg-white pr-8">
                <option value="">Seçin…</option>
                {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
            </div>
          </div>
        </div>

        {/* Durum, beden, şehir */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Durum *</label>
            <div className="relative">
              <select {...register('condition')} className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 bg-white pr-8">
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
            </div>
          </div>
          <Input label="Beden" {...register('sizeLabel')} placeholder="S, M, 42, XL…"/>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Şehir</label>
            <div className="relative">
              <select {...register('city')} className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 bg-white pr-8">
                <option value="">Seçin…</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
            </div>
          </div>
        </div>

        {/* Fiyat */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-2 gap-4">
          <Input label="Fiyat (₺) *" type="number" {...register('price')} error={errors.price?.message as string} placeholder="0"/>
          <Input label="Orijinal Fiyat (₺)" type="number" {...register('originalPrice')} placeholder="0"/>
        </div>

        <Button type="submit" loading={createListing.isPending} className="w-full">
          İlanı Yayınla
        </Button>
      </form>
    </div>
  );
}

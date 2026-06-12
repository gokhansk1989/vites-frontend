import Link from 'next/link';
import { Logo } from './Header';
import { Shield, Lock } from 'lucide-react';

export function Footer() {
  const cols = [
    ['Motorya', ['Hakkımızda', 'Nasıl çalışır', 'Güvenli alışveriş', 'Kariyer']],
    ['Kategoriler', ['Kask', 'Mont & Koruma', 'Egzoz', 'Yedek Parça']],
    ['Destek', ['Yardım merkezi', 'Kargo & iade', 'İletişim', 'KVKK']],
  ];

  return (
    <footer style={{ borderTop: '1px solid var(--line-soft)', marginTop: 64, background: 'var(--bg-1)' }}>
      <div className="m-wrap" style={{
        padding: '48px 28px 36px',
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        gap: 40,
      }}>
        <div>
          <Logo />
          <p style={{ maxWidth: 280, marginTop: 16, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-3)' }}>
            Motosiklet tayfası için ikinci el ekipman ve parça pazarı. Güvenli öde, kargoyla al ya da yüz yüze buluş.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <span className="m-badge verify" style={{ display: 'inline-flex', gap: 5 }}>
              <Shield size={12} />SSL GÜVENLİ
            </span>
            <span className="m-badge good" style={{ display: 'inline-flex', gap: 5 }}>
              <Lock size={12} />KORUMALI ÖDEME
            </span>
          </div>
        </div>
        {cols.map(([h, items]) => (
          <div key={h as string}>
            <div className="m-kicker" style={{ marginBottom: 14 }}>{h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(items as string[]).map(i => (
                <a key={i} href="#" style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{i}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="m-wrap" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 28px', borderTop: '1px solid var(--line-soft)', fontSize: 12.5,
      }}>
        <span className="m-mono" style={{ color: 'var(--ink-3)' }}>© 2026 MOTORYA.COM.TR</span>
        <span style={{ color: 'var(--ink-3)' }}>İstanbul · Türkiye</span>
      </div>
    </footer>
  );
}

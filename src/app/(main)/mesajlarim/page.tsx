'use client';
import { MessageCircle, Lock } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="m-wrap" style={{ maxWidth: 680, paddingTop: 36, paddingBottom: 60 }}>
      <h1 className="m-display" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 28 }}>Mesajlarım</h1>

      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--line)',
        borderRadius: 'var(--radius-m)', padding: '60px 32px', textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
          background: 'color-mix(in oklch, var(--accent) 12%, transparent)',
          display: 'grid', placeItems: 'center',
        }}>
          <MessageCircle size={28} style={{ color: 'var(--accent)' }} />
        </div>
        <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
          Mesajlaşma yakında geliyor
        </p>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
          Alıcı ve satıcılar arasında gerçek zamanlı mesajlaşma özelliği üzerinde çalışıyoruz. Teklifler üzerinden iletişim kurabilirsiniz.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20,
          fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)',
          background: 'var(--bg-2)', padding: '6px 14px', borderRadius: 20,
        }}>
          <Lock size={12} /> Şimdilik teklifler üzerinden iletişim kurabilirsiniz
        </div>
      </div>
    </div>
  );
}

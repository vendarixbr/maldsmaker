import { ImageResponse } from 'next/og'

export const alt = 'Malds Maker — Produção Audiovisual em Sorocaba, SP'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Imagem de pré-visualização (WhatsApp, Instagram, Google Discover, X, LinkedIn). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0A0A0A 0%, #17130A 100%)',
          color: '#F5F5F0',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 14, height: 14, borderRadius: 14, background: '#C9A84C' }} />
          <div style={{ fontSize: 26, letterSpacing: 6, color: '#C9A84C' }}>SOROCABA, SP</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, letterSpacing: 2 }}>MALDS MAKER</div>
          <div style={{ fontSize: 44, marginTop: 24, color: '#E5C158' }}>Produção audiovisual e fotografia</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 28, color: '#A8A89A' }}>
          <div>Clipes · Institucionais · Ensaios · Eventos</div>
          <div style={{ color: '#C9A84C' }}>Nauta Estúdio 480 m²</div>
        </div>
      </div>
    ),
    size,
  )
}

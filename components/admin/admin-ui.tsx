import { AlertTriangle } from 'lucide-react'

export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-mono-mm text-xs tracking-[0.14em] font-semibold text-[#E5C158]">
        {title}
      </h2>
      <div
        className="p-4 sm:p-5 flex flex-col gap-5 bg-[#111111] border border-[rgba(255,255,255,0.14)] rounded-xl"
      >
        {children}
      </div>
    </section>
  )
}

export function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onCancel} />
      <div
        className="fixed top-1/2 left-1/2 z-50 flex flex-col gap-5 p-6"
        style={{
          width: 'min(400px, 95vw)',
          transform: 'translate(-50%, -50%)',
          background: '#0F0F0F',
          border: '1px solid rgba(248,113,113,0.5)',
          borderRadius: '12px',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(248,113,113,0.2)' }}>
            <AlertTriangle size={18} style={{ color: '#F87171' }} />
          </div>
          <p className="font-display font-medium text-sm" style={{ color: '#FFFFFF', lineHeight: 1.5 }}>{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-10 font-mono-mm text-xs tracking-[0.08em] font-semibold"
            style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#CBD5E1', borderRadius: '6px' }}
          >
            CANCELAR
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 font-mono-mm text-xs tracking-[0.08em] font-semibold"
            style={{ background: '#DC2626', color: '#fff', borderRadius: '6px' }}
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </>
  )
}

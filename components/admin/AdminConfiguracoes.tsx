'use client'

import { useState } from 'react'
import { Save, Check, AlertTriangle, Download } from 'lucide-react'
import Image from 'next/image'
import { useAdmin } from '@/lib/admin-context'

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                     */
/* ------------------------------------------------------------------ */

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-mono-mm text-xs tracking-[0.14em] font-semibold text-[#C9A84C]">
        {title}
      </h2>
      <div
        className="p-4 sm:p-5 flex flex-col gap-5 bg-[#111111] border border-white/10 rounded-xl"
      >
        {children}
      </div>
    </section>
  )
}

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex-1">
        <p className="font-display font-medium text-sm text-[#F2F2F2]">{label}</p>
        {description && <p className="font-display text-xs mt-0.5 text-[#A0A0A0]">{description}</p>}
      </div>
      <div className="shrink-0 w-full sm:w-auto">{children}</div>
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 px-3.5 w-full sm:w-64 font-display text-sm outline-none bg-[#161616] border border-white/10 rounded-lg text-[#F2F2F2] focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
    />
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      className="relative w-12 h-6 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
      style={{ background: value ? '#C9A84C' : 'rgba(255,255,255,0.15)' }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full transition-transform duration-200"
        style={{
          left: '4px',
          background: value ? '#080808' : '#888',
          transform: value ? 'translateX(24px)' : 'translateX(0)',
        }}
      />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Confirm dialog                                                      */
/* ------------------------------------------------------------------ */

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onCancel} />
      <div
        className="fixed top-1/2 left-1/2 z-50 flex flex-col gap-5 p-6"
        style={{
          width: 'min(400px, 95vw)',
          transform: 'translate(-50%, -50%)',
          background: '#0F0F0F',
          border: '1px solid rgba(192,57,43,0.4)',
          borderRadius: '12px',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(192,57,43,0.15)' }}>
            <AlertTriangle size={18} style={{ color: '#F1948A' }} />
          </div>
          <p className="font-display text-sm" style={{ color: '#F2F2F2', lineHeight: 1.5 }}>{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-9 font-mono-mm text-[10px] tracking-[0.08em]"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#777', borderRadius: '6px' }}
          >
            CANCELAR
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-9 font-mono-mm text-[10px] tracking-[0.08em]"
            style={{ background: 'rgba(192,57,43,0.8)', color: '#fff', borderRadius: '6px' }}
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Main                                                                */
/* ------------------------------------------------------------------ */

export function AdminConfiguracoes() {
  const { state, dispatch } = useAdmin()
  const [saved, setSaved] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)

  // Editable profile fields
  const [nome, setNome] = useState('Leonardo Maldonado')
  const [email, setEmail] = useState('leo@maldsmaker.com')
  const [whatsapp, setWhatsapp] = useState('+55 (15) 99999-0000')
  const [empresa, setEmpresa] = useState('Malds Maker')
  const [cnpj, setCnpj] = useState('XX.XXX.XXX/0001-XX')
  const [cidade, setCidade] = useState('Sorocaba, SP')
  const [instagram, setInstagram] = useState('@maldsmaker')

  // Nauta
  const [capacidade, setCapacidade] = useState('20')
  const [valorDiaria, setValorDiaria] = useState('R$ 2.800')
  const [valorMeio, setValorMeio] = useState('R$ 1.600')
  const [locacaoAvulsa, setLocacaoAvulsa] = useState(true)

  // Notificações
  const [notifLead, setNotifLead] = useState(true)
  const [notifShoot, setNotifShoot] = useState(true)
  const [notifPagamento, setNotifPagamento] = useState(false)
  const [notifResumo, setNotifResumo] = useState(true)

  // Da Rua pra Rua
  const [drprExibir, setDrprExibir] = useState(true)
  const [drprInscrições, setDrprInscrições] = useState(true)
  const [drprVagas, setDrprVagas] = useState('3')

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      clients: state.clients,
      projects: state.projects,
      events: state.events,
      notes: state.notes,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `maldsmaker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setShowClearConfirm(false)
    dispatch({ type: 'RESET_ALL' })
    setCleared(true)
    setTimeout(() => setCleared(false), 3000)
  }

  return (
    <div className="flex flex-col gap-7 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: '#F2F2F2' }}>Configurações</h1>
          <p className="font-mono-mm text-[11px] tracking-[0.08em] mt-1" style={{ color: '#555' }}>MALDS MAKER ADMIN</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 h-9 px-5 font-mono-mm text-[11px] tracking-[0.1em] transition-all"
          style={{ background: saved ? '#1E8449' : '#C9A84C', color: '#080808', borderRadius: '6px' }}
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'SALVO' : 'SALVAR'}
        </button>
      </div>

      {cleared && (
        <div className="p-4 flex items-center gap-3" style={{ background: 'rgba(30,132,73,0.1)', border: '1px solid rgba(30,132,73,0.3)', borderRadius: '8px' }}>
          <Check size={14} style={{ color: '#52BE80' }} />
          <p className="font-mono-mm text-[11px]" style={{ color: '#52BE80' }}>Dados limpos com sucesso.</p>
        </div>
      )}

      {/* Profile */}
      <SettingsSection title="PERFIL">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-xl shrink-0" style={{ background: '#C9A84C', color: '#080808' }}>
            LM
          </div>
          <div>
            <p className="font-display font-semibold text-base" style={{ color: '#F2F2F2' }}>{nome}</p>
            <p className="font-mono-mm text-[11px] mt-0.5" style={{ color: '#555' }}>Fundador & Diretor Criativo</p>
          </div>
        </div>
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <Field label="Nome" description="Exibido no painel admin">
          <TextInput value={nome} onChange={setNome} />
        </Field>
        <Field label="E-mail" description="Para notificações e alertas">
          <TextInput value={email} onChange={setEmail} />
        </Field>
        <Field label="WhatsApp" description="Usado nos formulários do site">
          <TextInput value={whatsapp} onChange={setWhatsapp} />
        </Field>
      </SettingsSection>

      {/* Empresa */}
      <SettingsSection title="EMPRESA">
        <Field label="Nome da empresa">
          <TextInput value={empresa} onChange={setEmpresa} />
        </Field>
        <Field label="CNPJ">
          <TextInput value={cnpj} onChange={setCnpj} />
        </Field>
        <Field label="Cidade / Estado">
          <TextInput value={cidade} onChange={setCidade} />
        </Field>
        <Field label="Instagram">
          <TextInput value={instagram} onChange={setInstagram} />
        </Field>
      </SettingsSection>

      {/* Nauta Studio */}
      <SettingsSection title="NAUTA ESTÚDIO">
        <Field label="Capacidade máxima" description="Pessoas por sessão">
          <TextInput value={capacidade} onChange={setCapacidade} />
        </Field>
        <Field label="Valor diária completa">
          <TextInput value={valorDiaria} onChange={setValorDiaria} />
        </Field>
        <Field label="Valor meio período">
          <TextInput value={valorMeio} onChange={setValorMeio} />
        </Field>
        <Field label="Aceita locação avulsa" description="Sem produção Malds">
          <Toggle value={locacaoAvulsa} onChange={setLocacaoAvulsa} />
        </Field>
      </SettingsSection>

      {/* Notificações */}
      <SettingsSection title="NOTIFICAÇÕES">
        <Field label="Notificação de novo lead" description="Ao receber contato pelo site">
          <Toggle value={notifLead} onChange={setNotifLead} />
        </Field>
        <Field label="Lembrete de shoot" description="24h antes do agendamento">
          <Toggle value={notifShoot} onChange={setNotifShoot} />
        </Field>
        <Field label="Alerta de pagamento pendente" description="7 dias após vencimento">
          <Toggle value={notifPagamento} onChange={setNotifPagamento} />
        </Field>
        <Field label="Resumo semanal" description="Relatório de projetos e finanças">
          <Toggle value={notifResumo} onChange={setNotifResumo} />
        </Field>
      </SettingsSection>

      {/* Da Rua pra Rua */}
      <SettingsSection title="DA RUA PRA RUA">
        <Field label="Exibir seção no site" description="Mostra a iniciativa na página pública">
          <Toggle value={drprExibir} onChange={setDrprExibir} />
        </Field>
        <Field label="Receber inscrições via site" description="Formulário de candidatura aberto">
          <Toggle value={drprInscrições} onChange={setDrprInscrições} />
        </Field>
        <Field label="Vagas disponíveis">
          <TextInput value={drprVagas} onChange={setDrprVagas} />
        </Field>
      </SettingsSection>

      {/* Branding */}
      <SettingsSection title="BRANDING">
        <div className="flex flex-col gap-3">
          <p className="font-display text-sm" style={{ color: '#777' }}>Logo atual</p>
          <div
            className="flex items-center justify-center p-6"
            style={{ background: '#080808', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}
          >
            <Image src="/images/logo.png" alt="Malds Maker Logo" width={180} height={50} className="h-10 w-auto object-contain opacity-80" />
          </div>
          <button
            className="self-start h-8 px-4 font-mono-mm text-[10px] tracking-[0.08em] transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#777' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
          >
            TROCAR LOGO
          </button>
        </div>
      </SettingsSection>

      {/* Dados */}
      <SettingsSection title="DADOS">
        <Field label="Resumo" description="Estado atual do sistema">
          <div className="flex flex-col items-end gap-1">
            <span className="font-mono-mm text-[10px]" style={{ color: '#C9A84C' }}>{state.clients.length} clientes</span>
            <span className="font-mono-mm text-[10px]" style={{ color: '#C9A84C' }}>{state.projects.length} projetos</span>
            <span className="font-mono-mm text-[10px]" style={{ color: '#C9A84C' }}>{state.events.length} eventos</span>
          </div>
        </Field>
        <Field label="Exportar dados" description="Baixar backup completo em JSON">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 h-9 px-4 font-mono-mm text-[10px] tracking-[0.08em] transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#777', borderRadius: '6px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.color = '#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#777' }}
          >
            <Download size={12} />
            EXPORTAR JSON
          </button>
        </Field>
      </SettingsSection>

      {/* Danger zone */}
      <SettingsSection title="ZONA DE PERIGO">
        <Field label="Limpar todos os dados" description="Remove clientes, projetos e eventos (irreversível)">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="h-9 px-4 font-mono-mm text-[10px] tracking-[0.08em] transition-colors"
            style={{ border: '1px solid rgba(192,57,43,0.4)', color: '#F1948A', borderRadius: '6px' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(192,57,43,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            LIMPAR DADOS
          </button>
        </Field>
      </SettingsSection>

      {showClearConfirm && (
        <ConfirmDialog
          message="Tem certeza que deseja limpar todos os dados? Esta ação é irreversível e removerá todos os clientes, projetos, eventos e notas."
          onConfirm={handleClear}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  )
}

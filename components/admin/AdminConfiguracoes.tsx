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

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex-1">
        <p className="font-display font-semibold text-sm text-[#FFFFFF]">{label}</p>
        {description && <p className="font-display text-xs mt-0.5 text-[#CBD5E1]">{description}</p>}
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
      className="h-11 px-3.5 w-full sm:w-64 font-display text-sm outline-none bg-[#161616] border border-[rgba(255,255,255,0.16)] rounded-lg text-[#F9FAFB] focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
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
      style={{ background: value ? '#C9A84C' : 'rgba(255,255,255,0.2)' }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full transition-transform duration-200"
        style={{
          left: '4px',
          background: value ? '#080808' : '#CBD5E1',
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

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
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
          <h1 className="font-display font-semibold text-2xl text-[#FFFFFF]">Configurações</h1>
          <p className="font-mono-mm text-xs tracking-[0.08em] mt-1 font-semibold text-[#E5C158]">MALDS MAKER ADMIN</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 h-11 px-5 font-mono-mm text-xs tracking-[0.1em] font-semibold transition-all rounded-lg"
          style={{ background: saved ? '#4ADE80' : '#C9A84C', color: '#080808' }}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'SALVO' : 'SALVAR'}
        </button>
      </div>

      {cleared && (
        <div className="p-4 flex items-center gap-3 bg-[rgba(74,222,128,0.15)] border border-[rgba(74,222,128,0.4)] rounded-lg text-[#4ADE80]">
          <Check size={18} />
          <span className="font-mono-mm text-xs font-semibold">Dados resetados com sucesso!</span>
        </div>
      )}

      {/* Perfil */}
      <SettingsSection title="PERFIL DO PRODUTOR">
        <Field label="Nome Completo">
          <TextInput value={nome} onChange={setNome} />
        </Field>
        <Field label="E-mail de Contato">
          <TextInput value={email} onChange={setEmail} />
        </Field>
        <Field label="WhatsApp Profissional">
          <TextInput value={whatsapp} onChange={setWhatsapp} />
        </Field>
        <Field label="Nome Comercial / Produtora">
          <TextInput value={empresa} onChange={setEmpresa} />
        </Field>
        <Field label="CNPJ">
          <TextInput value={cnpj} onChange={setCnpj} />
        </Field>
        <Field label="Cidade / Base">
          <TextInput value={cidade} onChange={setCidade} />
        </Field>
        <Field label="Instagram Profissional">
          <TextInput value={instagram} onChange={setInstagram} />
        </Field>
      </SettingsSection>

      {/* Nauta Estúdio */}
      <SettingsSection title="PARÂMETROS NAUTA ESTÚDIO">
        <Field label="Capacidade Máxima de Pessoas" description="Recomendado para segurança do espaço">
          <TextInput value={capacidade} onChange={setCapacidade} />
        </Field>
        <Field label="Valor Diária Completa (10h)" description="Preço base para locações avulsas">
          <TextInput value={valorDiaria} onChange={setValorDiaria} />
        </Field>
        <Field label="Valor Meio Período (5h)">
          <TextInput value={valorMeio} onChange={setValorMeio} />
        </Field>
        <Field label="Aceitar Locação Avulsa" description="Permite reservas externas no calendário">
          <Toggle value={locacaoAvulsa} onChange={setLocacaoAvulsa} />
        </Field>
      </SettingsSection>

      {/* Da Rua pra Rua */}
      <SettingsSection title="PROJETO DA RUA PRA RUA">
        <Field label="Exibir Seção no Site Público" description="Mostra a área de iniciativa periférica">
          <Toggle value={drprExibir} onChange={setDrprExibir} />
        </Field>
        <Field label="Inscrições Abertas" description="Permite envio de novos briefs por artistas">
          <Toggle value={drprInscrições} onChange={setDrprInscrições} />
        </Field>
        <Field label="Vagas Disponíveis este Mês">
          <TextInput value={drprVagas} onChange={setDrprVagas} />
        </Field>
      </SettingsSection>

      {/* Notificações */}
      <SettingsSection title="PREFERÊNCIAS DE NOTIFICAÇÃO">
        <Field label="Novo Lead / Formulário Contato">
          <Toggle value={notifLead} onChange={setNotifLead} />
        </Field>
        <Field label="Lembrete de Shoot (24h antes)">
          <Toggle value={notifShoot} onChange={setNotifShoot} />
        </Field>
        <Field label="Confirmação de Pagamento">
          <Toggle value={notifPagamento} onChange={setNotifPagamento} />
        </Field>
        <Field label="Resumo Semanal no E-mail">
          <Toggle value={notifResumo} onChange={setNotifResumo} />
        </Field>
      </SettingsSection>

      {/* Backup & Dados */}
      <SettingsSection title="BACKUP E DADOS DA PLATAFORMA">
        <Field label="Exportar Backup JSON" description="Baixa todos os clientes, projetos, eventos e notas">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 h-10 px-4 font-mono-mm text-xs tracking-[0.08em] font-semibold bg-[#161616] border border-[rgba(255,255,255,0.16)] hover:border-[#C9A84C] text-[#F3F4F6] hover:text-[#E5C158] transition-all rounded-lg"
          >
            <Download size={15} />
            EXPORTAR
          </button>
        </Field>
        <Field label="Resetar Todos os Dados" description="Apaga todos os registros atuais do sistema">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="h-10 px-4 font-mono-mm text-xs tracking-[0.08em] font-semibold bg-[rgba(248,113,113,0.15)] border border-[rgba(248,113,113,0.4)] text-[#F87171] hover:bg-[#DC2626] hover:text-white transition-all rounded-lg"
          >
            RESETAR TUDO
          </button>
        </Field>
      </SettingsSection>

      {showClearConfirm && (
        <ConfirmDialog
          message="Tem certeza que deseja apagar TODOS os clientes, projetos, eventos e notas? Esta ação não pode ser desfeita."
          onConfirm={handleClear}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Save, Check, Download } from 'lucide-react'
import { useAdmin } from '@/lib/admin-context'
import type { SiteSettings } from '@/lib/data'
import { SettingsSection, ConfirmDialog } from '@/components/admin/admin-ui'

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
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export function AdminConfiguracoes() {
  const { state, dispatch, isLoading } = useAdmin()
  const [saved, setSaved] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)

  const [draft, setDraft] = useState<SiteSettings>(state.settings)
  const syncedRef = useRef(false)

  // Assim que o carregamento inicial termina, sincroniza o rascunho com os dados reais do banco.
  useEffect(() => {
    if (!isLoading && !syncedRef.current) {
      setDraft(state.settings)
      syncedRef.current = true
    }
  }, [isLoading, state.settings])

  const patch = (p: Partial<SiteSettings>) => setDraft(d => ({ ...d, ...p }))

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: draft })
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
      expenses: state.expenses ?? [],
      portfolio: state.portfolio ?? [],
      testimonials: state.testimonials ?? [],
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
          <TextInput value={draft.nome} onChange={v => patch({ nome: v })} />
        </Field>
        <Field label="E-mail de Contato">
          <TextInput value={draft.email} onChange={v => patch({ email: v })} />
        </Field>
        <Field label="WhatsApp Profissional">
          <TextInput value={draft.whatsapp} onChange={v => patch({ whatsapp: v })} />
        </Field>
        <Field label="Nome Comercial / Produtora">
          <TextInput value={draft.empresa} onChange={v => patch({ empresa: v })} />
        </Field>
        <Field label="Cidade / Base">
          <TextInput value={draft.cidade} onChange={v => patch({ cidade: v })} />
        </Field>
        <Field label="Instagram Profissional">
          <TextInput value={draft.instagram} onChange={v => patch({ instagram: v })} />
        </Field>
      </SettingsSection>

      {/* Nauta Estúdio */}
      <SettingsSection title="PARÂMETROS NAUTA ESTÚDIO">
        <Field label="Capacidade Máxima de Pessoas" description="Recomendado para segurança do espaço">
          <TextInput value={draft.nautaCapacidade} onChange={v => patch({ nautaCapacidade: v })} />
        </Field>
        <Field label="Valor Diária Completa (10h)" description="Preço base para locações avulsas">
          <TextInput value={draft.nautaValorDiaria} onChange={v => patch({ nautaValorDiaria: v })} />
        </Field>
        <Field label="Valor Meio Período (5h)">
          <TextInput value={draft.nautaValorMeio} onChange={v => patch({ nautaValorMeio: v })} />
        </Field>
        <Field label="Aceitar Locação Avulsa" description="Permite reservas externas no calendário">
          <Toggle value={draft.nautaLocacaoAvulsa} onChange={v => patch({ nautaLocacaoAvulsa: v })} />
        </Field>
      </SettingsSection>

      {/* Da Rua pra Rua */}
      <SettingsSection title="PROJETO DA RUA PRA RUA">
        <Field label="Exibir Seção no Site Público" description="Mostra a área de iniciativa periférica">
          <Toggle value={draft.drprExibir} onChange={v => patch({ drprExibir: v })} />
        </Field>
        <Field label="Inscrições Abertas" description="Permite envio de novos briefs por artistas">
          <Toggle value={draft.drprInscricoes} onChange={v => patch({ drprInscricoes: v })} />
        </Field>
        <Field label="Vagas Disponíveis este Mês">
          <TextInput value={draft.drprVagas} onChange={v => patch({ drprVagas: v })} />
        </Field>
      </SettingsSection>

      {/* Notificações */}
      <SettingsSection title="PREFERÊNCIAS DE NOTIFICAÇÃO">
        <Field label="Novo Lead / Formulário Contato">
          <Toggle value={draft.notifLead} onChange={v => patch({ notifLead: v })} />
        </Field>
        <Field label="Lembrete de Shoot (24h antes)">
          <Toggle value={draft.notifShoot} onChange={v => patch({ notifShoot: v })} />
        </Field>
        <Field label="Confirmação de Pagamento">
          <Toggle value={draft.notifPagamento} onChange={v => patch({ notifPagamento: v })} />
        </Field>
        <Field label="Resumo Semanal no E-mail">
          <Toggle value={draft.notifResumo} onChange={v => patch({ notifResumo: v })} />
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

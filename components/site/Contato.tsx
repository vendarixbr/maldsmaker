'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Phone, AtSign, Mail, MapPin } from 'lucide-react'

const serviceOptions = [
  'Produção Audiovisual',
  'Fotografia',
  'Nauta Estúdio',
  'Tráfego Pago',
  'Rebranding',
  'Estratégia Digital',
  'Outro',
]

function FloatingField({
  name, label, type = 'text', value, onChange, required = false,
}: {
  name: string; label: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean;
}) {
  const [focused, setFocused] = useState(false)
  const raised = focused || value.length > 0

  return (
    <div className="relative">
      <label
        htmlFor={name}
        className="absolute left-0 font-mono-mm transition-all duration-200 pointer-events-none"
        style={{
          top: raised ? '0' : '50%',
          transform: raised ? 'none' : 'translateY(-50%)',
          fontSize: raised ? '10px' : '14px',
          color: focused ? '#C9A84C' : raised ? '#5A5A52' : '#5A5A52',
          letterSpacing: raised ? '0.14em' : '0',
        }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent outline-none font-body"
        style={{
          borderBottom: `1px solid ${focused ? '#C9A84C' : 'rgba(201,168,76,0.2)'}`,
          color: '#F5F5F0',
          fontSize: '15px',
          padding: '22px 0 10px',
          transition: 'border-color 0.2s',
          borderRadius: 0,
        }}
      />
    </div>
  )
}

function FloatingTextarea({
  name, label, value, onChange,
}: {
  name: string; label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const [focused, setFocused] = useState(false)
  const raised = focused || value.length > 0

  return (
    <div className="relative">
      <label
        htmlFor={name}
        className="absolute left-0 font-mono-mm transition-all duration-200 pointer-events-none"
        style={{
          top: raised ? '0' : '22px',
          fontSize: raised ? '10px' : '14px',
          color: focused ? '#C9A84C' : '#5A5A52',
          letterSpacing: raised ? '0.14em' : '0',
        }}
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent outline-none font-body resize-none"
        style={{
          borderBottom: `1px solid ${focused ? '#C9A84C' : 'rgba(201,168,76,0.2)'}`,
          color: '#F5F5F0',
          fontSize: '15px',
          paddingTop: '26px',
          paddingBottom: '10px',
          transition: 'border-color 0.2s',
          borderRadius: 0,
        }}
      />
    </div>
  )
}

function FloatingSelect({
  name, label, value, onChange,
}: {
  name: string; label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  const [focused, setFocused] = useState(false)
  const raised = focused || value.length > 0

  return (
    <div className="relative">
      <label
        htmlFor={name}
        className="absolute left-0 font-mono-mm transition-all duration-200 pointer-events-none z-10"
        style={{
          top: raised ? '0' : '50%',
          transform: raised ? 'none' : 'translateY(-50%)',
          fontSize: raised ? '10px' : '14px',
          color: focused ? '#C9A84C' : raised ? '#5A5A52' : '#5A5A52',
          letterSpacing: raised ? '0.14em' : '0',
        }}
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent outline-none font-body appearance-none"
        style={{
          borderBottom: `1px solid ${focused ? '#C9A84C' : 'rgba(201,168,76,0.2)'}`,
          color: value ? '#F5F5F0' : 'transparent',
          fontSize: '15px',
          padding: '22px 0 10px',
          transition: 'border-color 0.2s',
          borderRadius: 0,
          cursor: 'none',
        }}
      >
        <option value="" style={{ background: '#161616', color: '#5A5A52' }} />
        {serviceOptions.map(s => (
          <option key={s} value={s} style={{ background: '#161616', color: '#F5F5F0' }}>
            {s}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Contato() {
  const [form, setForm] = useState({ nome: '', contato: '', empresa: '', mensagem: '', servico: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) throw new Error('Falha ao enviar')
      setSent(true)
    } catch (err) {
      console.error(err)
      setError('Não foi possível enviar agora. Tente novamente em instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="contato"
      ref={ref}
      className="section-spacing"
      style={{ background: '#0A0A0A' }}
    >
      <div className="site-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="font-mono-mm text-[11px] tracking-[0.14em] mb-4" style={{ color: '#C9A84C' }}>CONTATO</p>
          <h2 className="font-display uppercase" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)', color: '#F5F5F0', letterSpacing: '0.02em' }}>
            Reserve seu horário.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_52%] gap-14 lg:gap-20">

          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="flex flex-col gap-8"
          >
            <p className="font-body leading-relaxed" style={{ color: '#A8A89A', fontSize: '17px', fontWeight: 300, lineHeight: 1.8 }}>
              Seja para um clipe, ensaio, evento ou estratégia de conteúdo — fale com a gente.
              Atendemos com atenção total a cada projeto, independente do tamanho.
            </p>

            {/* Contact links */}
            <div className="flex flex-col gap-4">
              {[
                { icon: Phone,  href: 'https://wa.me/5515997307171',         text: '(15) 99730-7171' },
                { icon: Mail,   href: 'mailto:malldsmaker@gmail.com',         text: 'malldsmaker@gmail.com' },
                { icon: AtSign, href: 'https://instagram.com/maldsmaker',     text: '@maldsmaker' },
                { icon: MapPin, href: '#',                                    text: 'Sorocaba, SP — Brasil' },
              ].map(({ icon: Icon, href, text }) => (
                <a
                  key={text}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 group"
                >
                  <span
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{ border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C' }}
                  >
                    <Icon size={15} />
                  </span>
                  <span
                    className="font-body text-sm transition-colors duration-200"
                    style={{ color: '#A8A89A' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F0')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#A8A89A')}
                  >
                    {text}
                  </span>
                </a>
              ))}
            </div>

            {/* WhatsApp highlight CTA */}
            <a
              href="https://wa.me/5515997307171?text=Olá,%20quero%20chamar%20no%20WhatsApp!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 font-display uppercase tracking-widest transition-all duration-200"
              style={{ background: '#C9A84C', color: '#0A0A0A', height: '56px', fontSize: '14px', letterSpacing: '0.12em' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#E8C96D' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C9A84C' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              CHAMAR NO WHATSAPP
            </a>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.22 }}
          >
            {sent ? (
              <div
                className="flex flex-col items-center justify-center gap-5 py-20 text-center"
                style={{ border: '1px solid rgba(201,168,76,0.25)' }}
              >
                <span className="font-display uppercase text-3xl" style={{ color: '#C9A84C', letterSpacing: '0.04em' }}>
                  Mensagem enviada!
                </span>
                <p className="font-body text-sm" style={{ color: '#A8A89A' }}>Em breve entraremos em contato.</p>
                <button
                  onClick={() => { setSent(false); setForm({ nome: '', contato: '', empresa: '', mensagem: '', servico: '' }) }}
                  className="font-mono-mm text-[10px] tracking-[0.14em] uppercase mt-2 transition-colors duration-200"
                  style={{ color: '#5A5A52', borderBottom: '1px solid rgba(90,90,82,0.3)', paddingBottom: '1px' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#5A5A52')}
                >
                  ENVIAR OUTRA
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                <FloatingField name="nome"    label="Nome completo"        value={form.nome}    onChange={handleChange} required />
                <FloatingField name="contato" label="WhatsApp ou e-mail"   value={form.contato} onChange={handleChange} required />
                <FloatingField name="empresa" label="Empresa ou projeto"   value={form.empresa} onChange={handleChange} />
                <FloatingSelect name="servico" label="Tipo de serviço"     value={form.servico} onChange={handleChange} />
                <FloatingTextarea name="mensagem" label="Conte sobre o que você precisa" value={form.mensagem} onChange={handleChange} />

                {error && (
                  <p className="font-mono-mm text-[10px] tracking-[0.08em]" style={{ color: '#F1948A' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 font-display uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-3"
                  style={{
                    background: loading ? 'rgba(201,168,76,0.6)' : '#C9A84C',
                    color: '#0A0A0A',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#E8C96D' }}
                  onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C' }}
                >
                  {loading ? (
                    <>
                      <span
                        className="w-4 h-4 border-2 rounded-full animate-spin"
                        style={{ borderColor: 'rgba(10,10,10,0.3)', borderTopColor: '#0A0A0A' }}
                      />
                      ENVIANDO...
                    </>
                  ) : 'ENVIAR MENSAGEM'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export type ClientStatus = 'ATIVO' | 'EM PAUSA' | 'CONCLUÍDO' | 'PROSPECT'
export type ProjectStatus = 'BRIEFING' | 'PRÉ-PRODUÇÃO' | 'PRODUÇÃO' | 'ENTREGA'
export type Priority = 'urgent' | 'normal' | 'low'
export type EventType = 'Shoot' | 'Reunião' | 'Entrega' | 'Aula' | 'Workshop' | 'Bloqueado'

export interface Client {
  id: string
  name: string
  initials: string
  niche: string
  whatsapp: string
  email?: string
  instagram?: string
  empresa?: string
  status: ClientStatus
  totalValue: number
  lastProject: string
  origem: string
  notes: Note[]
  services: ServiceHistory[]
  history: HistoryItem[]
  invoices: Invoice[]
  monthlyRevenue: { month: string; value: number }[]
}

export interface ServiceHistory {
  id: string
  name: string
  date: string
  status: 'ENTREGUE' | 'EM ANDAMENTO' | 'AGUARDANDO APROVAÇÃO'
  value: number
}

export interface HistoryItem {
  id: string
  date: string
  type: 'camera' | 'video' | 'phone' | 'file'
  title: string
  notes: string
}

export interface Note {
  id: string
  category: string
  content: string
  title?: string
  color: 'default' | 'warm' | 'green' | 'blue' | 'red'
  pinned: boolean
  createdAt: string
  checklist?: { text: string; done: boolean }[]
}

export interface Invoice {
  id: string
  date: string
  value: number
  status: 'RECEBIDO' | 'PENDENTE' | 'CANCELADO'
}

export interface Project {
  id: string
  clientId: string
  clientName: string
  title: string
  serviceType: string
  dueDate: string
  priority: Priority
  value: number
  status: ProjectStatus
  checklist: { text: string; done: boolean }[]
  comments: string[]
}

export interface CalendarEvent {
  id: string
  title: string
  type: EventType
  clientName?: string
  date: string
  startTime: string
  endTime: string
  location: string
  value?: number
  notes?: string
}

export interface GlobalNote {
  id: string
  title?: string
  category: string
  content: string
  color: 'default' | 'warm' | 'green' | 'blue' | 'red'
  pinned: boolean
  createdAt: string
  checklist?: { text: string; done: boolean }[]
}

export const CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Rafael Moreno',
    initials: 'RM',
    niche: 'ARTISTA MUSICAL',
    whatsapp: '(15) 99123-4567',
    email: 'rafael@moreno.com',
    instagram: '@rafaelmoreno',
    empresa: 'Rafael Moreno Oficial',
    status: 'ATIVO',
    totalValue: 14800,
    lastProject: 'Clipe "Madrugada" — Jan 2025',
    origem: 'Instagram',
    monthlyRevenue: [
      { month: 'Jul', value: 2400 },
      { month: 'Ago', value: 0 },
      { month: 'Set', value: 3200 },
      { month: 'Out', value: 0 },
      { month: 'Nov', value: 4800 },
      { month: 'Dez', value: 4400 },
    ],
    invoices: [
      { id: 'INV-001', date: '15/01/2025', value: 4400, status: 'RECEBIDO' },
      { id: 'INV-002', date: '10/11/2024', value: 4800, status: 'RECEBIDO' },
      { id: 'INV-003', date: '05/09/2024', value: 3200, status: 'RECEBIDO' },
    ],
    services: [
      { id: 's1', name: 'Clipe "Madrugada"', date: '15/01/2025', status: 'ENTREGUE', value: 4400 },
      { id: 's2', name: 'Ensaio Fotográfico', date: '10/11/2024', status: 'ENTREGUE', value: 4800 },
      { id: 's3', name: 'Clipe "Saudade Vira"', date: '05/09/2024', status: 'ENTREGUE', value: 3200 },
    ],
    history: [
      { id: 'h1', date: '15/01/2025', type: 'camera', title: 'Clipe "Madrugada" entregue', notes: 'Cliente aprovou todas as cenas. Excelente parceria.' },
      { id: 'h2', date: '08/01/2025', type: 'video', title: 'Gravação do clipe no Nauta', notes: 'Captação finalizada em 8 horas.' },
      { id: 'h3', date: '02/01/2025', type: 'phone', title: 'Briefing inicial por WhatsApp', notes: 'Discussão do conceito visual e referências.' },
    ],
    notes: [
      { id: 'n1', category: 'CLIENTE', content: 'Prefere captações pela manhã. Muito pontual.', color: 'default', pinned: true, createdAt: '10/01/2025' },
    ],
  },
  {
    id: '2',
    name: 'Adega São Roque',
    initials: 'AS',
    niche: 'ADEGA',
    whatsapp: '(15) 3800-1122',
    email: 'contato@adegas-roque.com.br',
    instagram: '@adegas.roque',
    empresa: 'Adega São Roque Ltda',
    status: 'ATIVO',
    totalValue: 9600,
    lastProject: 'Vídeo Institucional — Dez 2024',
    origem: 'Indicação',
    monthlyRevenue: [
      { month: 'Jul', value: 0 },
      { month: 'Ago', value: 3200 },
      { month: 'Set', value: 0 },
      { month: 'Out', value: 1600 },
      { month: 'Nov', value: 0 },
      { month: 'Dez', value: 4800 },
    ],
    invoices: [
      { id: 'INV-004', date: '20/12/2024', value: 4800, status: 'RECEBIDO' },
      { id: 'INV-005', date: '15/10/2024', value: 1600, status: 'RECEBIDO' },
    ],
    services: [
      { id: 's4', name: 'Vídeo Institucional', date: '20/12/2024', status: 'ENTREGUE', value: 4800 },
      { id: 's5', name: 'Fotos de Produto', date: '15/10/2024', status: 'ENTREGUE', value: 1600 },
    ],
    history: [
      { id: 'h4', date: '20/12/2024', type: 'video', title: 'Vídeo institucional aprovado', notes: 'Cliente muito satisfeito com o resultado final.' },
    ],
    notes: [
      { id: 'n2', category: 'CLIENTE', content: 'Parceria recorrente. Interessados em conteúdo mensal para redes.', color: 'warm', pinned: false, createdAt: '21/12/2024' },
    ],
  },
  {
    id: '3',
    name: 'Dr. Thiago Alves',
    initials: 'TA',
    niche: 'ADVOGADO',
    whatsapp: '(15) 99876-5432',
    email: 'thiago@alves-adv.com.br',
    instagram: '@dr.thiagoalves',
    empresa: 'Alves & Associados',
    status: 'EM PAUSA',
    totalValue: 5200,
    lastProject: 'Rebranding visual — Nov 2024',
    origem: 'Google',
    monthlyRevenue: [
      { month: 'Jul', value: 2600 },
      { month: 'Ago', value: 0 },
      { month: 'Set', value: 0 },
      { month: 'Out', value: 0 },
      { month: 'Nov', value: 2600 },
      { month: 'Dez', value: 0 },
    ],
    invoices: [
      { id: 'INV-006', date: '10/11/2024', value: 2600, status: 'RECEBIDO' },
      { id: 'INV-007', date: '05/07/2024', value: 2600, status: 'RECEBIDO' },
    ],
    services: [
      { id: 's6', name: 'Rebranding Visual', date: '10/11/2024', status: 'ENTREGUE', value: 2600 },
      { id: 's7', name: 'Fotos Profissionais', date: '05/07/2024', status: 'ENTREGUE', value: 2600 },
    ],
    history: [
      { id: 'h5', date: '10/11/2024', type: 'file', title: 'Entrega do pacote de rebranding', notes: 'Novo logo, paleta e materiais entregues.' },
    ],
    notes: [],
  },
  {
    id: '4',
    name: 'Bianca Ferreira',
    initials: 'BF',
    niche: 'INFLUENCER',
    whatsapp: '(11) 99345-6789',
    email: 'bianca@bfcontent.com',
    instagram: '@biancaferreiraa',
    empresa: 'BF Content',
    status: 'ATIVO',
    totalValue: 7200,
    lastProject: 'Pack Mensal Dezembro — Dez 2024',
    origem: 'Instagram',
    monthlyRevenue: [
      { month: 'Jul', value: 1200 },
      { month: 'Ago', value: 1200 },
      { month: 'Set', value: 1200 },
      { month: 'Out', value: 1200 },
      { month: 'Nov', value: 1200 },
      { month: 'Dez', value: 1200 },
    ],
    invoices: [
      { id: 'INV-008', date: '01/12/2024', value: 1200, status: 'RECEBIDO' },
      { id: 'INV-009', date: '01/11/2024', value: 1200, status: 'PENDENTE' },
    ],
    services: [
      { id: 's8', name: 'Pack Mensal Dezembro', date: '01/12/2024', status: 'EM ANDAMENTO', value: 1200 },
      { id: 's9', name: 'Pack Mensal Novembro', date: '01/11/2024', status: 'ENTREGUE', value: 1200 },
    ],
    history: [
      { id: 'h6', date: '01/12/2024', type: 'camera', title: 'Sessão mensal de conteúdo', notes: '12 reels + 30 fotos. Entrega em 5 dias.' },
    ],
    notes: [],
  },
  {
    id: '5',
    name: 'Restaurante Kaizen',
    initials: 'RK',
    niche: 'RESTAURANTE',
    whatsapp: '(15) 3322-8899',
    email: 'marketing@kaizen.com.br',
    instagram: '@restaurantekaizen',
    empresa: 'Kaizen Gastronomia',
    status: 'ATIVO',
    totalValue: 6400,
    lastProject: 'Campanha Verão — Jan 2025',
    origem: 'Indicação',
    monthlyRevenue: [
      { month: 'Jul', value: 0 },
      { month: 'Ago', value: 1600 },
      { month: 'Set', value: 0 },
      { month: 'Out', value: 1600 },
      { month: 'Nov', value: 1600 },
      { month: 'Dez', value: 1600 },
    ],
    invoices: [
      { id: 'INV-010', date: '10/01/2025', value: 2400, status: 'PENDENTE' },
    ],
    services: [
      { id: 's10', name: 'Campanha Verão', date: '10/01/2025', status: 'EM ANDAMENTO', value: 2400 },
    ],
    history: [
      { id: 'h7', date: '10/01/2025', type: 'camera', title: 'Captação campanha verão', notes: 'Fotos de pratos e ambiente.' },
    ],
    notes: [],
  },
  {
    id: '6',
    name: 'MC Vitão',
    initials: 'MV',
    niche: 'ARTISTA MUSICAL',
    whatsapp: '(11) 99654-3210',
    email: 'vitao@mgmt.com',
    instagram: '@mcvitao_oficial',
    empresa: 'Vitão Music',
    status: 'ATIVO',
    totalValue: 11200,
    lastProject: 'Clipe "Território" — Jan 2025',
    origem: 'Da Rua pra Rua',
    monthlyRevenue: [
      { month: 'Jul', value: 2800 },
      { month: 'Ago', value: 0 },
      { month: 'Set', value: 2800 },
      { month: 'Out', value: 0 },
      { month: 'Nov', value: 2800 },
      { month: 'Dez', value: 2800 },
    ],
    invoices: [
      { id: 'INV-011', date: '12/01/2025', value: 5600, status: 'PENDENTE' },
    ],
    services: [
      { id: 's11', name: 'Clipe "Território"', date: '12/01/2025', status: 'EM ANDAMENTO', value: 5600 },
    ],
    history: [
      { id: 'h8', date: '05/01/2025', type: 'phone', title: 'Briefing inicial — clipe Território', notes: 'Conceito urbano, locação externa + estúdio.' },
    ],
    notes: [
      { id: 'n3', category: 'PRODUÇÃO', content: 'Quer cenas externas na periferia + cenas no estúdio. Referência: Travis Scott Astronomical.', color: 'blue', pinned: true, createdAt: '05/01/2025' },
    ],
  },
  {
    id: '7',
    name: 'Construtora Horizonte',
    initials: 'CH',
    niche: 'EMPRESA',
    whatsapp: '(15) 3500-2233',
    email: 'mkt@horizonte.eng.br',
    instagram: '@construtora.horizonte',
    empresa: 'Horizonte Construções',
    status: 'CONCLUÍDO',
    totalValue: 15000,
    lastProject: 'Vídeo de Lançamento — Out 2024',
    origem: 'Google',
    monthlyRevenue: [
      { month: 'Jul', value: 7500 },
      { month: 'Ago', value: 0 },
      { month: 'Set', value: 0 },
      { month: 'Out', value: 7500 },
      { month: 'Nov', value: 0 },
      { month: 'Dez', value: 0 },
    ],
    invoices: [
      { id: 'INV-012', date: '30/10/2024', value: 15000, status: 'RECEBIDO' },
    ],
    services: [
      { id: 's12', name: 'Vídeo de Lançamento Empreendimento', date: '30/10/2024', status: 'ENTREGUE', value: 15000 },
    ],
    history: [
      { id: 'h9', date: '30/10/2024', type: 'video', title: 'Vídeo de lançamento aprovado e entregue', notes: 'Projeto mais robusto do mês. Drone + equipe de 4.' },
    ],
    notes: [],
  },
  {
    id: '8',
    name: 'Lorena Costa',
    initials: 'LC',
    niche: 'INFLUENCER',
    whatsapp: '(15) 99234-5678',
    email: 'lorena@lcontent.com',
    instagram: '@lorenacostaa',
    empresa: 'LC Content Studio',
    status: 'PROSPECT',
    totalValue: 0,
    lastProject: 'Aguardando proposta',
    origem: 'Instagram',
    monthlyRevenue: [
      { month: 'Jul', value: 0 },
      { month: 'Ago', value: 0 },
      { month: 'Set', value: 0 },
      { month: 'Out', value: 0 },
      { month: 'Nov', value: 0 },
      { month: 'Dez', value: 0 },
    ],
    invoices: [],
    services: [],
    history: [
      { id: 'h10', date: '14/01/2025', type: 'phone', title: 'Primeiro contato via DM', notes: 'Interessada em pack mensal de conteúdo.' },
    ],
    notes: [],
  },
  {
    id: '9',
    name: 'Ana Beatriz Lima',
    initials: 'AL',
    niche: 'ARTISTA MUSICAL',
    whatsapp: '(11) 98765-4321',
    email: 'ana@ablima.art',
    instagram: '@anabeatrizlima',
    empresa: 'AB Lima Música',
    status: 'ATIVO',
    totalValue: 8400,
    lastProject: 'EP Visual — Dez 2024',
    origem: 'Da Rua pra Rua',
    monthlyRevenue: [
      { month: 'Jul', value: 0 },
      { month: 'Ago', value: 2800 },
      { month: 'Set', value: 0 },
      { month: 'Out', value: 2800 },
      { month: 'Nov', value: 0 },
      { month: 'Dez', value: 2800 },
    ],
    invoices: [
      { id: 'INV-013', date: '20/12/2024', value: 2800, status: 'RECEBIDO' },
    ],
    services: [
      { id: 's13', name: 'EP Visual "Flores Pretas"', date: '20/12/2024', status: 'ENTREGUE', value: 2800 },
    ],
    history: [
      { id: 'h11', date: '20/12/2024', type: 'camera', title: 'EP Visual entregue', notes: '4 videoclipes curtos + fotos do EP.' },
    ],
    notes: [],
  },
  {
    id: '10',
    name: 'Clínica Espaço Vida',
    initials: 'EV',
    niche: 'EMPRESA',
    whatsapp: '(15) 3600-4455',
    email: 'social@espacovida.com.br',
    instagram: '@clinica.espacovida',
    empresa: 'Espaço Vida Saúde',
    status: 'ATIVO',
    totalValue: 4800,
    lastProject: 'Institucional Clínica — Jan 2025',
    origem: 'WhatsApp',
    monthlyRevenue: [
      { month: 'Jul', value: 0 },
      { month: 'Ago', value: 0 },
      { month: 'Set', value: 1600 },
      { month: 'Out', value: 0 },
      { month: 'Nov', value: 1600 },
      { month: 'Dez', value: 0 },
    ],
    invoices: [
      { id: 'INV-014', date: '08/01/2025', value: 1600, status: 'PENDENTE' },
    ],
    services: [
      { id: 's14', name: 'Vídeo Institucional', date: '08/01/2025', status: 'EM ANDAMENTO', value: 1600 },
    ],
    history: [
      { id: 'h12', date: '08/01/2025', type: 'file', title: 'Briefing assinado', notes: 'Vídeo de apresentação da clínica para site e redes.' },
    ],
    notes: [],
  },
  {
    id: '11',
    name: 'Giovane Dias',
    initials: 'GD',
    niche: 'ARTISTA MUSICAL',
    whatsapp: '(15) 99888-7766',
    email: 'giovane@gd.art',
    instagram: '@giovanedias',
    empresa: 'GD Music',
    status: 'ATIVO',
    totalValue: 3600,
    lastProject: 'Clipe "Amanhã" — Jan 2025',
    origem: 'Indicação',
    monthlyRevenue: [
      { month: 'Jul', value: 0 },
      { month: 'Ago', value: 0 },
      { month: 'Set', value: 0 },
      { month: 'Out', value: 0 },
      { month: 'Nov', value: 3600 },
      { month: 'Dez', value: 0 },
    ],
    invoices: [
      { id: 'INV-015', date: '10/01/2025', value: 3600, status: 'PENDENTE' },
    ],
    services: [
      { id: 's15', name: 'Clipe "Amanhã"', date: '10/01/2025', status: 'EM ANDAMENTO', value: 3600 },
    ],
    history: [
      { id: 'h13', date: '03/01/2025', type: 'phone', title: 'Briefing clipe Amanhã', notes: 'Conceito intimista, luz natural.' },
    ],
    notes: [],
  },
  {
    id: '12',
    name: 'Advocacia Pereira',
    initials: 'AP',
    niche: 'ADVOGADO',
    whatsapp: '(15) 3234-6677',
    email: 'contato@pereiradv.com.br',
    instagram: '@pereira.advocacia',
    empresa: 'Pereira Advocacia',
    status: 'PROSPECT',
    totalValue: 0,
    lastProject: 'Aguardando proposta',
    origem: 'Google',
    monthlyRevenue: [
      { month: 'Jul', value: 0 },
      { month: 'Ago', value: 0 },
      { month: 'Set', value: 0 },
      { month: 'Out', value: 0 },
      { month: 'Nov', value: 0 },
      { month: 'Dez', value: 0 },
    ],
    invoices: [],
    services: [],
    history: [
      { id: 'h14', date: '11/01/2025', type: 'phone', title: 'Solicitação de proposta por e-mail', notes: 'Interessado em vídeo de apresentação do escritório.' },
    ],
    notes: [],
  },
]

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    clientId: '6',
    clientName: 'MC Vitão',
    title: 'Clipe "Território"',
    serviceType: 'CLIPE MUSICAL',
    dueDate: '25/01/2025',
    priority: 'urgent',
    value: 5600,
    status: 'PRODUÇÃO',
    checklist: [
      { text: 'Briefing aprovado', done: true },
      { text: 'Roteiro finalizado', done: true },
      { text: 'Locação externa confirmada', done: true },
      { text: 'Captação externa', done: false },
      { text: 'Captação no estúdio', done: false },
      { text: 'Edição', done: false },
      { text: 'Entrega', done: false },
    ],
    comments: ['Locação confirmada no Centro Histórico de Sorocaba.'],
  },
  {
    id: 'p2',
    clientId: '10',
    clientName: 'Clínica Espaço Vida',
    title: 'Vídeo Institucional',
    serviceType: 'INSTITUCIONAL',
    dueDate: '28/01/2025',
    priority: 'normal',
    value: 1600,
    status: 'PRÉ-PRODUÇÃO',
    checklist: [
      { text: 'Briefing assinado', done: true },
      { text: 'Roteiro rascunho', done: true },
      { text: 'Roteiro aprovado', done: false },
      { text: 'Agendamento de captação', done: false },
      { text: 'Captação', done: false },
      { text: 'Edição', done: false },
    ],
    comments: [],
  },
  {
    id: 'p3',
    clientId: '11',
    clientName: 'Giovane Dias',
    title: 'Clipe "Amanhã"',
    serviceType: 'CLIPE MUSICAL',
    dueDate: '20/01/2025',
    priority: 'normal',
    value: 3600,
    status: 'BRIEFING',
    checklist: [
      { text: 'Primeiro contato', done: true },
      { text: 'Briefing preenchido', done: false },
      { text: 'Referências coletadas', done: false },
    ],
    comments: [],
  },
  {
    id: 'p4',
    clientId: '5',
    clientName: 'Restaurante Kaizen',
    title: 'Campanha Verão',
    serviceType: 'FOTO/VÍDEO',
    dueDate: '22/01/2025',
    priority: 'normal',
    value: 2400,
    status: 'PRODUÇÃO',
    checklist: [
      { text: 'Briefing', done: true },
      { text: 'Lista de pratos para foto', done: true },
      { text: 'Captação parte 1', done: true },
      { text: 'Captação parte 2', done: false },
      { text: 'Edição', done: false },
    ],
    comments: ['Captação parte 1 realizada em 14/01.'],
  },
  {
    id: 'p5',
    clientId: '4',
    clientName: 'Bianca Ferreira',
    title: 'Pack Mensal Jan/25',
    serviceType: 'CONTEÚDO',
    dueDate: '31/01/2025',
    priority: 'low',
    value: 1200,
    status: 'BRIEFING',
    checklist: [
      { text: 'Reunião de pauta', done: false },
      { text: 'Aprovação de roteiros', done: false },
    ],
    comments: [],
  },
  {
    id: 'p6',
    clientId: '1',
    clientName: 'Rafael Moreno',
    title: 'Ensaio Verão',
    serviceType: 'ENSAIO FOTOGRÁFICO',
    dueDate: '18/01/2025',
    priority: 'normal',
    value: 1800,
    status: 'ENTREGA',
    checklist: [
      { text: 'Captação realizada', done: true },
      { text: 'Seleção de fotos', done: true },
      { text: 'Edição finalizada', done: true },
      { text: 'Envio para aprovação', done: true },
      { text: 'Entrega final', done: false },
    ],
    comments: ['Cliente aprovou a seleção. Entrega amanhã.'],
  },
  {
    id: 'p7',
    clientId: '12',
    clientName: 'Advocacia Pereira',
    title: 'Vídeo de Apresentação',
    serviceType: 'INSTITUCIONAL',
    dueDate: '01/02/2025',
    priority: 'low',
    value: 2200,
    status: 'BRIEFING',
    checklist: [
      { text: 'Proposta enviada', done: true },
      { text: 'Aprovação da proposta', done: false },
    ],
    comments: [],
  },
]

const _now = new Date()
const _curY = _now.getFullYear()
const _curM = String(_now.getMonth() + 1).padStart(2, '0')

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Shoot Clipe MC Vitão', type: 'Shoot', clientName: 'MC Vitão', date: `${_curY}-${_curM}-16`, startTime: '09:00', endTime: '18:00', location: 'Nauta Estúdio', value: 5600, notes: 'Equipe completa: câmera, luz, direção.' },
  { id: 'e2', title: 'Captação Restaurante Kaizen', type: 'Shoot', clientName: 'Restaurante Kaizen', date: `${_curY}-${_curM}-17`, startTime: '10:00', endTime: '14:00', location: 'Externo', value: 1200, notes: 'Levar flash portátil.' },
  { id: 'e3', title: 'Reunião Giovane Dias — Briefing', type: 'Reunião', clientName: 'Giovane Dias', date: `${_curY}-${_curM}-17`, startTime: '16:00', endTime: '17:00', location: 'Remoto', notes: 'Google Meet.' },
  { id: 'e4', title: 'Entrega Ensaio Rafael Moreno', type: 'Entrega', clientName: 'Rafael Moreno', date: `${_curY}-${_curM}-18`, startTime: '10:00', endTime: '10:30', location: 'Remoto', value: 1800 },
  { id: 'e5', title: 'Shoot Clipe Giovane Dias', type: 'Shoot', clientName: 'Giovane Dias', date: `${_curY}-${_curM}-20`, startTime: '08:00', endTime: '16:00', location: 'Externo', value: 3600 },
  { id: 'e6', title: 'Pack Bianca Ferreira', type: 'Shoot', clientName: 'Bianca Ferreira', date: `${_curY}-${_curM}-21`, startTime: '13:00', endTime: '17:00', location: 'Nauta Estúdio', value: 1200 },
  { id: 'e7', title: 'Captação Clínica Espaço Vida', type: 'Shoot', clientName: 'Clínica Espaço Vida', date: `${_curY}-${_curM}-22`, startTime: '09:00', endTime: '13:00', location: 'Externo', value: 1600 },
  { id: 'e8', title: 'Reserva Studio — Locação Particular', type: 'Bloqueado', date: `${_curY}-${_curM}-19`, startTime: '10:00', endTime: '20:00', location: 'Nauta Estúdio', notes: 'Locação avulsa.' },
  { id: 'e9', title: 'Workshop de Fotografia', type: 'Workshop', date: `${_curY}-${_curM}-25`, startTime: '09:00', endTime: '18:00', location: 'Nauta Estúdio', value: 800 },
  { id: 'e10', title: 'Reunião Advocacia Pereira', type: 'Reunião', clientName: 'Advocacia Pereira', date: `${_curY}-${_curM}-23`, startTime: '15:00', endTime: '16:00', location: 'Externo' },
]


export const GLOBAL_NOTES: GlobalNote[] = [
  {
    id: 'gn1',
    title: 'Lista Equipamentos Shoot',
    category: 'TAREFAS',
    content: 'Sony FX3\nSony A7IV\nVarizoom ZMC-JAM\nBlackMagic Pocket 6K',
    color: 'default',
    pinned: true,
    createdAt: '10/01/2025',
    checklist: [
      { text: 'Sony FX3', done: true },
      { text: 'Sony A7IV', done: true },
      { text: 'Tripé Manfrotto', done: false },
      { text: 'Bateria reserva', done: false },
    ],
  },
  {
    id: 'gn2',
    title: 'Ideia — Mini Doc Da Rua pra Rua',
    category: 'IDEIAS',
    content: 'Documentário curto sobre a trajetória de artistas da periferia de Sorocaba. 3 episódios, cada um com um artista diferente. Possível parceria com plataformas digitais.',
    color: 'warm',
    pinned: true,
    createdAt: '08/01/2025',
  },
  {
    id: 'gn3',
    title: 'Referências Visuais — MC Vitão',
    category: 'REFERÊNCIAS',
    content: 'Travis Scott: Astronomical (2020)\nKendrick Lamar: HUMBLE.\nDrake: God\'s Plan\n\nPaleta: azul escuro + laranja neon + preto',
    color: 'blue',
    pinned: false,
    createdAt: '05/01/2025',
  },
  {
    id: 'gn4',
    title: 'Checklist Pré-Shoot',
    category: 'TAREFAS',
    content: 'Rotina de verificação antes de qualquer captação',
    color: 'green',
    pinned: false,
    createdAt: '01/01/2025',
    checklist: [
      { text: 'Verificar baterias carregadas', done: true },
      { text: 'Formatar cartões SD', done: true },
      { text: 'Testar luzes', done: false },
      { text: 'Confirmar horário com cliente', done: true },
      { text: 'Listar equipamentos necessários', done: false },
    ],
  },
  {
    id: 'gn5',
    title: 'Meta Janeiro 2025',
    category: 'PESSOAL',
    content: 'Fechar R$ 20.000 em projetos\nExpandir Da Rua pra Rua para 3 novos artistas\nPublicar 2 cases no Instagram\nGravar depoimento de 3 clientes',
    color: 'warm',
    pinned: false,
    createdAt: '02/01/2025',
  },
  {
    id: 'gn6',
    title: 'Script Pitch Nauta Estúdio',
    category: 'CLIENTES',
    content: '"480m² com teto de 6 metros, chroma key de 14 metros, 2 camarins completos. Único espaço desse porte em Sorocaba. Reserve um dia inteiro ou meio período."',
    color: 'default',
    pinned: false,
    createdAt: '28/12/2024',
  },
  {
    id: 'gn7',
    title: 'Leads a contatar esta semana',
    category: 'CLIENTES',
    content: 'Lorena Costa — aguardando proposta pack mensal\nAdvocacia Pereira — enviar proposta vídeo institucional\nRestaurante Modo — indicação da Adega São Roque',
    color: 'red',
    pinned: false,
    createdAt: '13/01/2025',
  },
  {
    id: 'gn8',
    title: 'Inspiração Workshop Foto',
    category: 'IDEIAS',
    content: 'Workshop de Fotografia para artistas — ensinar a tirar fotos de divulgação com celular. Renda extra + posicionamento. Nauta como cenário. Até 10 alunos.',
    color: 'blue',
    pinned: false,
    createdAt: '11/01/2025',
  },
]


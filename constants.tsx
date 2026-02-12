
import { 
  UserRole, Campaign, User, AIBot, UserProfile, SIPTrunk, DID, CallCode, 
  UserGroup, PauseCode, IVRFlow, CRMIntegration, AudioAsset, CDRRecord,
  StorageNode, RecordingAsset, BackupJob, DBNode, HANode, HAConfig
} from './types';

export const APP_NAME = "CUBERBOX Pro";

export const MOCK_TRUNKS: SIPTrunk[] = [
  { id: 't1', name: 'Twilio USA East', host: 'twilio-us.sip.com', username: 'cuberbox_sip', secret: '********', protocol: 'TLS', port: 5061, context: 'from-twilio', isActive: true, status: 'registered', codecs: ['G711', 'Opus'], latency: 25 },
  { id: 't2', name: 'Voxbone Global', host: 'vox-global.sip.com', username: 'cuber_vxb', secret: '********', protocol: 'UDP', port: 5060, context: 'from-voxbone', isActive: true, status: 'registered', codecs: ['G711', 'G729'], latency: 45 },
];

// --- INFRASTRUCTURE MOCKS ---

export const MOCK_DB_NODES: DBNode[] = [
  { id: 'db-1', name: 'Primary DB Master', ip: '10.0.0.101', port: 5432, role: 'MASTER', status: 'SYNCHRONIZED', replicationLag: '0ms', uptime: '14d 08h' },
  { id: 'db-2', name: 'Slave Standby A', ip: '10.0.0.102', port: 5432, role: 'SLAVE', status: 'SYNCHRONIZED', replicationLag: '12ms', uptime: '14d 08h' },
  { id: 'db-3', name: 'Slave Standby B', ip: '10.0.0.103', port: 5432, role: 'SLAVE', status: 'REPLICATING', replicationLag: '85ms', uptime: '2d 11h' },
];

export const MOCK_HA_NODES: HANode[] = [
  { id: 'app-1', name: 'App Node 01', ip: '10.0.0.10', weight: 100, isPrimary: true, status: 'ACTIVE' },
  { id: 'app-2', name: 'App Node 02', ip: '10.0.0.11', weight: 100, isPrimary: false, status: 'BACKUP' },
];

export const MOCK_HA_CONFIG: HAConfig = {
  virtualIP: '10.0.0.200',
  interface: 'eth0',
  keepalivedPriority: 101,
  loadBalancerMode: 'LEAST_CONN',
  healthCheckInterval: 5000
};

export const MOCK_DIDS: DID[] = [
  { id: 'did1', number: '13055550100', description: 'Ventas Principal Miami', trunkId: 't1', routingType: 'CAMPAIGN', routingDestination: '1', isActive: true, allowedUsage: 'BOTH' },
];

export const MOCK_CALL_CODES: CallCode[] = [
  { id: 'SALE', name: 'VENTA CONFIRMADA', description: 'Cierre de negocio exitoso.', isSale: true, isDNC: false, isCallback: false, selectable: true, color: 'emerald', category: 'HUMAN' },
  { id: 'NI', name: 'NO INTERESADO', description: 'El cliente declina la oferta.', isSale: false, isDNC: false, isCallback: false, selectable: true, color: 'rose', category: 'HUMAN' },
  { id: 'DNC', name: 'DNC (BLOCK)', description: 'Solicitud de exclusión legal.', isSale: false, isDNC: true, isCallback: false, selectable: true, color: 'red', category: 'HUMAN' },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { 
    id: '1', 
    name: 'Real Estate Florida', 
    status: 'ACTIVE',
    campaignType: 'OUTBOUND',
    dialMethod: 'PREDICTIVE', 
    autoDialLevel: 4.5, 
    hopperLevel: 200,
    amdEnabled: true,
    recordingMode: 'ALL_CALLS',
    callCodeIds: ['SALE', 'NI', 'DNC'],
    pauseCodeIds: ['1', '2'],
    listIds: ['1001'],
    groupIds: ['g1'],
    syncStatus: 'SYNCHRONIZED',
    liveStats: {
      callsActive: 12, callsRinging: 3, agentsOnline: 15, agentsOnCall: 10, agentsPaused: 2, agentsReady: 3, salesToday: 42, dropRate: 1.8, pacingLevel: 4.5, hopperAvailable: 1450
    }
  },
];

export const MOCK_USER: User = {
  id: 'usr_1',
  username: 'admin',
  role: UserRole.ADMIN,
  fullName: 'Administrador Maestro',
  email: 'admin@cuberbox.com',
  extension: '1000',
  status: 'online',
  userLevel: 9,
  mfaEnabled: true,
  authMethod: 'LOCAL'
};

export const MOCK_USERS_LIST: User[] = [
  MOCK_USER,
  { id: 'usr_2', username: 'maria.g', role: UserRole.AGENT, fullName: 'Maria Gonzalez', email: 'maria.g@cuberbox.com', extension: '1001', status: 'oncall', userLevel: 3, mfaEnabled: false, authMethod: 'LOCAL', groupId: 'g1' },
  { id: 'usr_gtr', username: 'sergio.gtr', role: UserRole.MANAGER, fullName: 'Sergio Téllez (GTR)', email: 'sergio.gtr@cuberbox.com', extension: '3001', status: 'online', userLevel: 6, mfaEnabled: true, authMethod: 'LOCAL' },
  { id: 'usr_qa', username: 'lorena.qa', role: UserRole.MANAGER, fullName: 'Lorena Poveda (QA)', email: 'lorena.qa@cuberbox.com', extension: '4001', status: 'online', userLevel: 5, mfaEnabled: true, authMethod: 'LOCAL' },
];

export const MOCK_BOTS: AIBot[] = [
  { id: 'bot_1', name: 'IVR Calificador', type: 'AUDIO', prompt: 'Saluda al cliente y califica urgencia de compra.', voiceName: 'Helena', speechSpeed: 1.0, campaignId: '1', isActive: true },
];

export const PAUSE_CODES: PauseCode[] = [
  { id: '1', name: 'Almuerzo', billable: false, color: '#3b82f6', isActive: true },
  { id: '2', name: 'Break / Café', billable: true, color: '#f59e0b', isActive: true },
];

export const MOCK_USER_GROUPS: UserGroup[] = [
  { 
    id: 'g1', 
    name: 'Sales Florida', 
    description: 'Equipo de ventas Florida', 
    accessLevel: 3,
    permissions: {
      canRecord: true, canManualDial: true, canExportReports: false, canDeleteLeads: false, canChangeCampaign: false, canViewAgentStats: true, canBargeCalls: false, canManageDNC: false, canUseAICopilot: true, canModifyWorkflows: false
    }
  },
];

export const MOCK_LISTS = [
  { id: '1001', name: 'Leads Florida Nov', count: 5000, active: true, campaign: 'Real Estate Florida', lastCall: '2024-11-21 14:00' },
];

export const MOCK_IVR_FLOWS: IVRFlow[] = [
  { id: 'ivr_1', name: 'Welcome Menu Primary' },
];

export const MOCK_CDR_DATA: CDRRecord[] = [
  { id: 'cdr_001', timestamp: '2024-11-21 14:05:22', source: '1001', destination: '+13055551234', duration: 320, disposition: 'ANSWERED', cost: 0.45 },
];

export const MOCK_PAUSE_RECORDS = [
  { id: 'r1', agentId: 'usr_2', codeId: '1', timestamp: '2024-11-21 12:00:00', duration: 1800 },
];

export const MOCK_CRM_INTEGRATIONS: CRMIntegration[] = [
  { 
    id: 'crm_1', name: 'Odoo Enterprise', provider: 'ODOO', apiUrl: 'https://odoo.cuberbox.com', apiKey: '********', isActive: true, 
    syncEvents: ['CALL_START', 'CALL_END', 'DISPOSITION'], 
    fieldMapping: { 'phone': 'mobile', 'first_name': 'name' } 
  },
];

export const MOCK_AUDIO_ASSETS: AudioAsset[] = [
  { id: 'aud_1', name: 'welcome.wav', campaignId: '1', url: '/audio/welcome.wav', duration: '0:15', size: '1.2 MB', format: 'WAV', createdAt: '2024-11-20', minAccessLevel: 1, category: 'IVR_PROMPT' },
];

export const MOCK_USER_PROFILES: UserProfile[] = [
  { 
    id: 'prof_1', name: 'Sales Agent', description: 'Perfil base para agentes de ventas', accessLevel: 2, userCount: 12, color: 'blue', 
    permissions: { canBarge: false, canWhisper: false, canDeleteLeads: false, canExportReports: false, canModifyCampaigns: false, canUseAI: true, canManageDNC: false, canRecord: true } 
  },
];

export const MOCK_SMTP_SERVERS = [
  { id: 'smtp_1', name: 'AWS SES Main', host: 'email-smtp.us-east-1.amazonaws.com', port: 587, encryption: 'TLS', authMethod: 'LOGIN', username: 'AKIA...', password: '...', fromEmail: 'no-reply@cuberbox.com', fromName: 'Cuberbox System', isActive: true, status: 'CONNECTED' },
];

export const MOCK_AGENT_STATS = [
  { agentId: 'usr_2', agentName: 'Maria Gonzalez', campaignId: '1', calls: 145, sales: 12, talkTime: 28800, pauseTime: 3600, wrapUpTime: 1800, waitTime: 3600, occupancy: 88, callsPerHour: 18, aht: 320, dispositions: { 'SALE': 12, 'CBK': 5 } },
];

export const MOCK_STORAGE_NODES: StorageNode[] = [
  { id: 'st_1', name: 'Primary Media Node', ip: '10.0.0.50', path: '/var/spool/freeswitch/recordings', status: 'ONLINE', usedSpace: 450, totalSpace: 2000, iops: 1200 },
];

export const MOCK_RECORDINGS: RecordingAsset[] = [
  { id: 'rec_1', callId: 'cid_9482', timestamp: '2024-11-21 14:05', agentName: 'Maria Gonzalez', campaignName: 'Real Estate Florida', customerPhone: '+13055551234', fileSize: '2.4 MB', sentiment: 'POSITIVE' },
];

export const MOCK_BACKUP_JOBS: BackupJob[] = [
  { id: 'job_1', timestamp: '2024-11-21 02:00', destination: 'AWS S3 Glacier', size: '14.2 GB', type: 'FULL_MEDIA', status: 'COMPLETED' },
];

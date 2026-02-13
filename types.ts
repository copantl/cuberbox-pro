/**
 * @file types.ts
 * @description Esquema maestro de tipos para CUBERBOX PRO.
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  MANAGER = 'MANAGER'
}

export type ThemeType = 'midnight' | 'light' | 'ocean' | 'obsidian' | 'forest' | 'sunset' | 'cyber' | 'minimal';
export type ChannelType = 'WHATSAPP' | 'FACEBOOK' | 'TIKTOK' | 'INSTAGRAM' | 'EMAIL' | 'SMS';
export type CampaignType = 'OUTBOUND' | 'INBOUND' | 'BLENDED' | 'SURVEY';
export type AuthMethod = 'LOCAL' | 'SSO' | 'MFA_REQUIRED';
export type NodeRole = 'MASTER' | 'MEDIA' | 'DATABASE' | 'WEB' | 'AI_BRIDGE';
export type SyncStatus = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';

// --- CLUSTER & INFRASTRUCTURE TYPES ---

export interface ClusterNode {
  id: string;
  name: string;
  ip: string;
  role: NodeRole;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'PROVISIONING';
  cpu: number;
  mem: number;
  channels: number;
  threads: number;
  dbLatency: number;
  lastSync?: string;
  sshPort?: number;
}

export interface DBNode {
  id: string;
  name: string;
  ip: string;
  port: number;
  role: 'MASTER' | 'SLAVE' | 'WITNESS';
  status: 'SYNCHRONIZED' | 'REPLICATING' | 'FAILED';
  replicationLag: string;
  uptime: string;
}

export interface HANode {
  id: string;
  name: string;
  ip: string;
  weight: number;
  isPrimary: boolean;
  status: 'ACTIVE' | 'BACKUP' | 'DOWN';
}

export interface HAConfig {
  virtualIP: string;
  interface: string;
  keepalivedPriority: number;
  loadBalancerMode: 'ROUND_ROBIN' | 'LEAST_CONN' | 'IP_HASH';
  healthCheckInterval: number;
}

export interface GTRAgentMetric {
  agentId: string;
  agentName: string;
  status: 'READY' | 'INCALL' | 'PAUSED' | 'WRAPUP' | 'OFFLINE';
  statusDuration: number;
  campaignName: string;
  callsToday: number;
  salesToday: number;
  occupancyRate: number;
  currentCallDuration?: number;
  warningLevel: 'NONE' | 'LOW' | 'CRITICAL';
}

export interface GTRQueueMetric {
  queueName: string;
  callsWaiting: number;
  longestWait: number;
  agentsLogged: number;
  agentsReady: number;
  slaPercent: number;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
  email: string;
  extension: string;
  status: 'online' | 'offline' | 'oncall' | 'paused' | 'wrapup';
  userLevel: number;
  groupId?: string;
  profileId?: string;
  mfaEnabled: boolean;
  authMethod: AuthMethod;
  campaignId?: string;
  mfaSecret?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  campaignType: CampaignType;
  dialMethod: 'RATIO' | 'MANUAL' | 'PREDICTIVE';
  autoDialLevel: number;
  hopperLevel: number;
  amdEnabled: boolean;
  recordingMode: 'ALL_CALLS' | 'MANUAL' | 'NEVER';
  callCodeIds: string[];
  listIds?: string[];
  userIds?: string[];
  groupIds?: string[];
  pauseCodeIds?: string[];
  ivrId?: string;
  aiBotId?: string;
  description?: string;
  musicOnHold?: string;
  wrapUpSeconds?: number;
  adaptiveMaxDropRate?: number;
  syncStatus: 'SYNCHRONIZED' | 'PENDING' | 'ERROR';
  liveStats?: any;
  inboundDIDId?: string;
  outboundDID?: string;
  lastSync?: string;
}

export interface SIPTrunk {
  id: string;
  name: string;
  host: string;
  username: string;
  secret: string;
  protocol: string;
  port: number;
  context: string;
  isActive: boolean;
  status: string;
  codecs: string[];
  latency: number;
}

export interface DID {
  id: string;
  number: string;
  description: string;
  trunkId: string;
  routingType: string;
  routingDestination: string;
  isActive: boolean;
  allowedUsage: 'INBOUND' | 'OUTBOUND' | 'BOTH';
}

export interface CallCode {
  id: string;
  name: string;
  description: string;
  isSale: boolean;
  isDNC: boolean;
  isCallback: boolean;
  selectable: boolean;
  color: string;
  category: 'HUMAN' | 'MACHINE' | 'SYSTEM';
  hotkey?: string;
}

export interface AudioAsset {
  id: string;
  name: string;
  campaignId: string;
  url: string;
  duration: string;
  size: string;
  format: string;
  createdAt: string;
  minAccessLevel: number;
  category: string;
}

export interface AIBot {
  id: string;
  name: string;
  type: 'AUDIO' | 'TEXT';
  prompt: string;
  voiceName: string;
  speechSpeed: number;
  campaignId: string;
  isActive: boolean;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  accessLevel: number;
  memberIds?: string[]; 
  permissions: {
    canRecord: boolean;
    canManualDial: boolean;
    canExportReports: boolean;
    canDeleteLeads: boolean;
    canChangeCampaign: boolean;
    canViewAgentStats: boolean;
    canBargeCalls: boolean;
    canManageDNC: boolean;
    canUseAICopilot: boolean;
    canModifyWorkflows: boolean;
  };
}

export interface PauseCode {
  id: string;
  name: string;
  billable: boolean;
  color: string;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  description: string;
  accessLevel: number;
  userCount: number;
  color: string;
  permissions: {
    canBarge: boolean;
    canWhisper: boolean;
    canDeleteLeads: boolean;
    canExportReports: boolean;
    canModifyCampaigns: boolean;
    canUseAI: boolean;
    canManageDNC: boolean;
    canRecord: boolean;
  };
}

export interface IVRFlow {
  id: string;
  name: string;
}

export interface WhatsAppMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isMe: boolean;
}

export interface WhatsAppConversation {
  id: string;
  leadId: string;
  leadName: string;
  channel: ChannelType;
  unreadCount: number;
  assignedAgentId: string;
  lastMessage: string;
  lastTimestamp: string;
  messages: WhatsAppMessage[];
}

export interface ConferenceMember {
  id: string;
  uuid: string;
  callerName: string;
  callerNumber: string;
  isMuted: boolean;
  isSpeaking: boolean;
  energyScore: number;
  joinTime: string;
}

export interface ConferenceRoom {
  id: string;
  agentId: string;
  agentName: string;
  extension: string;
  status: 'TALKING' | 'IDLE_IN_CONF';
  memberCount: number;
  members: ConferenceMember[];
}

export interface CRMIntegration {
  id: string;
  name: string;
  provider: string;
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
  syncEvents: ('CALL_START' | 'CALL_END' | 'DISPOSITION' | 'RECORDING')[];
  fieldMapping: Record<string, string>;
}

export interface CDRRecord {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  duration: number;
  disposition: 'ANSWERED' | 'NO ANSWER' | 'BUSY' | 'FAILED';
  cost: number;
}

export interface QAEvaluation {
  id: string;
  cdrId: string;
  agentId: string;
  evaluatorId: string;
  timestamp: string;
  scores: {
    script: number;
    empathy: number;
    product: number;
    professionalism: number;
  };
  comment: string;
  finalScore: number;
  status: 'PASSED' | 'FAILED' | 'RECALIBRATION';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  ip: string;
  level: 'INFO' | 'WARN' | 'SECURITY' | 'CRITICAL';
  status: 'SUCCESS' | 'FAILURE';
  integrityHash: string;
  details: string;
}

export interface IVRNode {
  id: string;
  type: 'START' | 'PLAY_AUDIO' | 'MENU' | 'AI_BOT' | 'QUEUE' | 'HANGUP';
  title: string;
  position: { x: number; y: number };
  config: {
    nextNode?: string;
    file?: string;
    options?: Record<string, string>;
    botId?: string;
    queueId?: string;
  };
}

export interface DNCRecord {
  id: string;
  phoneNumber: string;
  reason: string;
  addedBy: string;
  timestamp: string;
}

export interface SMTPServer {
  id: string;
  name: string;
  host: string;
  port: number;
  encryption: 'NONE' | 'SSL' | 'TLS' | 'STARTTLS';
  authMethod: 'LOGIN' | 'PLAIN' | 'CRAM-MD5';
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
}

export interface CampaignRealTime {
  callsActive: number;
  callsRinging: number;
  agentsOnline: number;
  agentsOnCall: number;
  agentsPaused: number;
  agentsReady: number;
  salesToday: number;
  dropRate: number;
  pacingLevel: number;
  hopperAvailable: number;
}

export interface StorageNode {
  id: string;
  name: string;
  ip: string;
  path: string;
  status: 'ONLINE' | 'OFFLINE';
  usedSpace: number;
  totalSpace: number;
  iops: number;
}

export interface RecordingAsset {
  id: string;
  callId: string;
  timestamp: string;
  agentName: string;
  campaignName: string;
  customerPhone: string;
  fileSize: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export interface BackupJob {
  id: string;
  timestamp: string;
  destination: string;
  size: string;
  type: string;
  status: 'COMPLETED' | 'FAILED' | 'RUNNING';
}

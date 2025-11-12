import { Schema, model, Document, Types } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent/Critical',
}

export enum TicketStatus {
  NEW = 'New',
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  AWAITING_CLIENT = 'Awaiting Client Reply',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

interface IMessage {
  senderType: 'client' | 'admin';
  senderId?: Types.ObjectId | undefined;
  body: string;
  createdAt?: Date;
}

interface ICybersecurityFields {
  issueType?: string;
  system?: string;
  startedAt?: Date;
  systemDown?: boolean;
  dataCompromise?: boolean;
  impact?: string;
  logs?: string;
}

interface IWebDevFields {
  component?: string;
  browser?: string;
  os?: string;
  url?: string;
  steps?: string;
  expected?: string;
  actual?: string;
}

export interface ITicket extends Document {
  client: Schema.Types.ObjectId; // ref Client
  project: Schema.Types.ObjectId; // ref Project
  subject: string;
  description: string;
  priority: TicketPriority;
  attachments: string[];
  status: TicketStatus;
  assignedAgent?: Schema.Types.ObjectId; // ref User
  category: 'Cybersecurity' | 'Web Development';
  cybersecurity?: ICybersecurityFields;
  webdev?: IWebDevFields;
  messages: IMessage[];
}

const MessageSchema = new Schema<IMessage>({
  senderType: { type: String, enum: ['client', 'admin'], required: true },
  senderId: { type: Schema.Types.ObjectId, refPath: 'messages.senderType' },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TicketSchema = new Schema<ITicket>({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: Object.values(TicketPriority), default: TicketPriority.MEDIUM },
  attachments: [{ type: String }],
  status: { type: String, enum: Object.values(TicketStatus), default: TicketStatus.NEW },
  assignedAgent: { type: Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, enum: ['Cybersecurity', 'Web Development'], required: true },
  cybersecurity: {
    issueType: String,
    system: String,
    startedAt: Date,
    systemDown: Boolean,
    dataCompromise: Boolean,
    impact: String,
    logs: String,
  },
  webdev: {
    component: String,
    browser: String,
    os: String,
    url: String,
    steps: String,
    expected: String,
    actual: String,
  },
  messages: [MessageSchema],
}, { timestamps: true });

export const Ticket = getMainDb().model<ITicket>('Ticket', TicketSchema);

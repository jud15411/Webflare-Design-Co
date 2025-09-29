import { Schema, Document, Types } from 'mongoose';
import { getMainDb } from '../../../config/db.js';

export interface IMessage extends Document { project: Types.ObjectId; sender: { user?: Types.ObjectId; clientUser?: Types.ObjectId; }; text: string; timestamp: Date; }
const messageSchema = new Schema<IMessage>({ project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true }, sender: { user: { type: Schema.Types.ObjectId, ref: 'User' }, clientUser: { type: Schema.Types.ObjectId, ref: 'ClientUser' } }, text: { type: String, required: true }, timestamp: { type: Date, default: Date.now } });
export const Message = getMainDb().model<IMessage>('Message', messageSchema);
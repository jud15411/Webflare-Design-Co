import { Schema, model, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  project: Types.ObjectId;
  sender: {
    user?: Types.ObjectId; // For staff
    clientUser?: Types.ObjectId; // For clients
  };
  text: string;
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  sender: {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    clientUser: { type: Schema.Types.ObjectId, ref: 'ClientUser' },
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Message = model<IMessage>('Message', messageSchema);

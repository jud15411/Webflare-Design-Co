import { Schema, Document, Types } from 'mongoose';
import { getMainDb } from '../../../config/db.js';
// 1. CRITICAL: These imports must be present
import { encrypt, decrypt } from '../../../utils/encryption.utils.js'; 

interface IContact extends Types.Subdocument { name: string; role: string; email: string; phone?: string; }
interface IBillingDetails extends Types.Subdocument { paymentMethod?: string; subscriptionPlan?: string; outstandingBalance?: number; }

export interface IClient extends Document { 
  clientName: string; 
  primaryContact: IContact; 
  additionalContacts: IContact[]; 
  status: 'Active' | 'Inactive' | 'Prospect' | 'Lead' | 'Suspended'; 
  address?: string; 
  website?: string; 
  industry?: string; 
  servicesPurchased: string[]; 
  assignedProjects: Types.ObjectId[]; 
  assignedTeamMembers: Types.ObjectId[]; 
  contractStartDate?: Date; 
  contractEndDate?: Date; 
  billingDetails: IBillingDetails; 
  securitySlaLevel?: 'Basic' | 'Advanced' | 'Enterprise'; 
  incidentHistory: string[]; 
  preferredCommunicationMethod?: string; 
}

// Helper function to encrypt a single contact object
function encryptContact(contact: IContact): IContact {
    // We only encrypt fields that are strings and potentially sensitive
    if (typeof contact.name === 'string' && contact.name.length > 0) {
        contact.name = encrypt(contact.name)!;
    }
    if (typeof contact.email === 'string' && contact.email.length > 0) {
        contact.email = encrypt(contact.email)!;
    }
    if (typeof contact.role === 'string' && contact.role.length > 0) {
        contact.role = encrypt(contact.role)!;
    }
    if (typeof contact.phone === 'string' && contact.phone.length > 0) {
        contact.phone = encrypt(contact.phone)!;
    }
    return contact;
}

// Helper function to decrypt a single contact object
function decryptContact(contact: IContact) {
    if (contact.name) contact.name = decrypt(contact.name)!;
    if (contact.email) contact.email = decrypt(contact.email)!;
    if (contact.role) contact.role = decrypt(contact.role)!;
    if (contact.phone) contact.phone = decrypt(contact.phone)!;
}


// Mongoose Schema Definition
const clientSchema = new Schema<IClient>(
  {
    clientName: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Prospect', 'Lead', 'Suspended'],
      default: 'Prospect',
    },
    // Sensitive/Encrypted fields
    address: { type: String }, 
    website: { type: String },
    industry: { type: String },
    
    // Primary Contact (Subdocument)
    primaryContact: {
      name: { type: String, required: true },
      role: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    // Additional Contacts (Array of Subdocuments)
    additionalContacts: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
      },
    ],
    
    // Other fields
    servicesPurchased: [{ type: String }],
    assignedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    assignedTeamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    contractStartDate: { type: Date },
    contractEndDate: { type: Date },
    billingDetails: {
      paymentMethod: { type: String },
      subscriptionPlan: { type: String },
      outstandingBalance: { type: Number, default: 0 },
    },
    securitySlaLevel: {
      type: String,
      enum: ['Basic', 'Advanced', 'Enterprise'],
      default: 'Basic',
    },
    incidentHistory: [{ type: String }],
    preferredCommunicationMethod: { type: String },
  },
  { timestamps: true }
);

// =========================================================================
// 2. CRITICAL: PRE-SAVE HOOKS FOR ENCRYPTION (Data goes IN encrypted)
// =========================================================================

clientSchema.pre('save', function (next) {
    const doc = this as IClient;

    // Encrypt top-level sensitive fields if modified
    if (doc.isModified('clientName')) doc.clientName = encrypt(doc.clientName)!;
    if (doc.isModified('address') && doc.address) doc.address = encrypt(doc.address)!;
    if (doc.isModified('website') && doc.website) doc.website = encrypt(doc.website)!;

    // Encrypt Primary Contact if modified
    if (doc.isModified('primaryContact')) {
        encryptContact(doc.primaryContact as IContact);
    }
    
    // Encrypt Additional Contacts if modified or if the array itself is modified
    if (doc.isModified('additionalContacts')) {
        // We re-encrypt all array elements if the array is modified
        doc.additionalContacts = doc.additionalContacts.map(contact => encryptContact(contact as IContact));
    }
    
    next();
});


// =========================================================================
// 3. CRITICAL: POST-FIND HOOKS FOR DECRYPTION (Data comes OUT decrypted)
// =========================================================================

// Decrypts the fields for a single document
function decryptFields(doc: IClient) {
    // Decrypt top-level fields
    if (doc.clientName) doc.clientName = decrypt(doc.clientName)!;
    if (doc.address) doc.address = decrypt(doc.address)!;
    if (doc.website) doc.website = decrypt(doc.website)!;

    // Decrypt Primary Contact
    if (doc.primaryContact) {
        decryptContact(doc.primaryContact as IContact);
    }
    
    // Decrypt Additional Contacts
    if (doc.additionalContacts) {
        doc.additionalContacts.forEach(decryptContact);
    }
}

// Post-hook for single document finds (e.g., findById)
clientSchema.post('findOne', function (doc) {
    if (doc) {
        // doc is guaranteed to be a Document type here
        decryptFields(doc as IClient);
    }
});

// Post-hook for multiple document finds (e.g., find)
clientSchema.post('find', function (docs) {
    docs.forEach((doc: IClient) => decryptFields(doc as IClient));
});

const Client = getMainDb().model<IClient>('Client', clientSchema);

export { Client };
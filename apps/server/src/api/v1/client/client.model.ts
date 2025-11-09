// client.model.ts

import { Schema, Document, Types } from 'mongoose';
import { getMainDb } from '../../../config/db.js';
// 1. CRITICAL: These imports must be present
import { encrypt, decrypt } from '../../../utils/encryption.utils.js'; 

interface IContact extends Types.Subdocument { name: string; role: string; email: string; phone?: string; }
interface IBillingDetails extends Types.Subdocument { paymentMethod?: string; subscriptionPlan?: string; outstandingBalance?: number; }
export interface IClient extends Document { clientName: string; primaryContact: IContact; additionalContacts: IContact[]; status: 'Active' | 'Inactive' | 'Prospect' | 'Lead' | 'Suspended'; address?: string; website?: string; industry?: string; servicesPurchased: string[]; assignedProjects: Types.ObjectId[]; assignedTeamMembers: Types.ObjectId[]; contractStartDate?: Date; contractEndDate?: Date; billingDetails: IBillingDetails; securitySlaLevel?: 'Basic' | 'Advanced' | 'Enterprise'; incidentHistory: string[]; preferredCommunicationMethod?: string; }

// Helper function to encrypt a single contact object
function encryptContact(contact: IContact): IContact {
    // Check if the whole object or any field within it was modified
    if (contact.isModified('name')) {
        contact.name = encrypt(contact.name)!;
    }
    if (contact.isModified('email')) {
        contact.email = encrypt(contact.email)!;
    }
    if (contact.isModified('role')) {
        contact.role = encrypt(contact.role)!;
    }
    if (contact.isModified('phone') && contact.phone) {
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


const contactSchema = new Schema<IContact>({ 
    name: { type: String, required: true }, 
    role: { type: String, required: true }, 
    email: { type: String, required: true }, 
    phone: String 
});

const billingDetailsSchema = new Schema<IBillingDetails>({ 
    paymentMethod: String, 
    subscriptionPlan: String, 
    outstandingBalance: { type: Number, default: 0 } 
});

const clientSchema = new Schema<IClient>(
    { 
        // ALL SENSITIVE FIELDS DEFINED
        clientName: { type: String, required: true, trim: true }, 
        primaryContact: { type: contactSchema, required: true }, 
        additionalContacts: [contactSchema], 
        status: { type: String, enum: ['Active', 'Inactive', 'Prospect', 'Lead', 'Suspended'], default: 'Active' }, 
        address: String, 
        website: String, 
        industry: String, 
        servicesPurchased: [String], 
        assignedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }], 
        assignedTeamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
        contractStartDate: Date, 
        contractEndDate: Date, 
        billingDetails: { type: billingDetailsSchema, default: {} }, 
        securitySlaLevel: { type: String, enum: ['Basic', 'Advanced', 'Enterprise'] }, 
        incidentHistory: [String], 
        preferredCommunicationMethod: String 
    }, 
    { timestamps: true }
);

// =========================================================================
// 2. CRITICAL: PRE-SAVE HOOK FOR ENCRYPTION (Data goes IN encrypted)
// =========================================================================

clientSchema.pre('save', function (next) {
    const doc = this as IClient;

    // 1. Encrypt main fields (clientName, address, website)
    if (doc.isModified('clientName')) {
        doc.clientName = encrypt(doc.clientName)!;
    }
    if (doc.isModified('address') && doc.address) {
        doc.address = encrypt(doc.address)!;
    }
    if (doc.isModified('website') && doc.website) {
        doc.website = encrypt(doc.website)!;
    }

    // 2. Encrypt Primary Contact
    // Check if the whole object or any subfield is modified to trigger encryption
    if (doc.isModified('primaryContact') || doc.primaryContact.isModified()) {
        encryptContact(doc.primaryContact as IContact);
    }
    
    // 3. Encrypt Additional Contacts (Iterate over all in the array)
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
    if (docs) {
        docs.forEach(decryptFields);
    }
});

export const Client = getMainDb().model<IClient>('Client', clientSchema);
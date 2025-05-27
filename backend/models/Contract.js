const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'active', 'completed', 'cancelled'],
        default: 'draft'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    description: String,
    terms: String,
    paymentSchedule: [{
        amount: Number,
        dueDate: Date,
        status: {
            type: String,
            enum: ['pending', 'paid', 'overdue'],
            default: 'pending'
        }
    }],
    attachments: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
contractSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Contract', contractSchema); 
const mongoose = require('mongoose');

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

// SLA targets in minutes
const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320,
};

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [3, 'Subject must be at least 3 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: `Priority must be one of: ${PRIORITIES.join(', ')}` },
      required: [true, 'Priority is required'],
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: `Status must be one of: ${STATUSES.join(', ')}` },
      default: 'open',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Derived: ageMinutes
ticketSchema.virtual('ageMinutes').get(function () {
  const end = this.resolvedAt ? this.resolvedAt : new Date();
  return Math.floor((end - this.createdAt) / 60000);
});

// Derived: slaBreached
ticketSchema.virtual('slaBreached').get(function () {
  const targetMinutes = SLA_TARGETS[this.priority];
  const age = this.ageMinutes;
  if (this.status === 'resolved' || this.status === 'closed') {
    return age > targetMinutes;
  }
  return age > targetMinutes;
});

// Status transition validation
const ALLOWED_FORWARD = {
  open: 'in_progress',
  in_progress: 'resolved',
  resolved: 'closed',
};
const ALLOWED_BACKWARD = {
  in_progress: 'open',
  resolved: 'in_progress',
  closed: 'resolved',
};

function isValidTransition(from, to) {
  return ALLOWED_FORWARD[from] === to || ALLOWED_BACKWARD[from] === to;
}

module.exports = { Ticket: mongoose.model('Ticket', ticketSchema), isValidTransition, SLA_TARGETS };

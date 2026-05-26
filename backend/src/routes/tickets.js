const express = require('express');
const router = express.Router();
const { Ticket, isValidTransition, SLA_TARGETS } = require('../models/Ticket');

// Helper: serialize ticket with virtual fields
function serializeTicket(ticket) {
  const obj = ticket.toObject({ virtuals: true });
  // Remove mongoose internals
  delete obj.__v;
  delete obj.id;
  return obj;
}

// POST /tickets — Create a ticket
router.post('/', async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    const ticket = new Ticket({ subject, description, customerEmail, priority });
    await ticket.save();
    return res.status(201).json(serializeTicket(ticket));
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join('; ') });
    }
    return res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// GET /tickets — List tickets with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    const filter = {};

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      filter.status = status;
    }
    if (priority) {
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
      }
      filter.priority = priority;
    }

    let tickets = await Ticket.find(filter).sort({ createdAt: -1 });

    // Filter breached tickets in memory (since slaBreached is a virtual/derived field)
    if (breached === 'true') {
      tickets = tickets.filter((t) => t.slaBreached);
    }

    return res.json(tickets.map(serializeTicket));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /tickets/stats — Aggregate stats
router.get('/stats', async (req, res) => {
  try {
    const all = await Ticket.find();

    const byStatus = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    let breachedOpen = 0;

    for (const t of all) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      if (t.slaBreached && t.status !== 'resolved' && t.status !== 'closed') {
        breachedOpen++;
      }
    }

    return res.json({ byStatus, byPriority, breachedOpen });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// PATCH /tickets/:id — Update ticket status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === status) {
      return res.json(serializeTicket(ticket));
    }

    if (!isValidTransition(ticket.status, status)) {
      return res.status(400).json({
        error: `Invalid transition: cannot move from '${ticket.status}' to '${status}'. Only adjacent transitions are allowed.`,
      });
    }

    const previousStatus = ticket.status;
    ticket.status = status;

    // Set resolvedAt when moving TO resolved
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    }

    // Clear resolvedAt when moving BACK from resolved (or forward past it without going through resolved)
    if (previousStatus === 'resolved' && status !== 'resolved') {
      ticket.resolvedAt = null;
    }

    await ticket.save();
    return res.json(serializeTicket(ticket));
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// DELETE /tickets/:id — Delete a ticket
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

module.exports = router;

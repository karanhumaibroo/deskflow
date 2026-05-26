import React, { useState } from 'react';

const INITIAL = { subject: '', description: '', customerEmail: '', priority: 'medium' };

export function CreateTicketModal({ onClose, onCreate }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.customerEmail.trim()) e.customerEmail = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) e.customerEmail = 'Enter a valid email';
    if (!form.priority) e.priority = 'Priority is required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setServerError('');
    try {
      await onCreate(form);
      onClose();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>New Support Ticket</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Brief summary of the issue"
              className={errors.subject ? 'error' : ''}
            />
            {errors.subject && <span className="field-error">{errors.subject}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
              rows={4}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Customer Email</label>
            <input
              name="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={handleChange}
              placeholder="customer@example.com"
              className={errors.customerEmail ? 'error' : ''}
            />
            {errors.customerEmail && <span className="field-error">{errors.customerEmail}</span>}
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={errors.priority ? 'error' : ''}
            >
              <option value="low">Low — 72h SLA</option>
              <option value="medium">Medium — 24h SLA</option>
              <option value="high">High — 4h SLA</option>
              <option value="urgent">Urgent — 1h SLA</option>
            </select>
            {errors.priority && <span className="field-error">{errors.priority}</span>}
          </div>

          {serverError && <div className="server-error">{serverError}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

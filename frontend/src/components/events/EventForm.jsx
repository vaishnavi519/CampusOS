import { useState } from 'react';

import { Button } from '../ui/Button.jsx';
import { Field, Input, Select, Textarea } from '../ui/Field.jsx';
import { Alert } from '../ui/States.jsx';

/**
 * Create-event form. Field names match the POST /api/events body exactly
 * (club_id, title, description, event_date, event_time, venue, capacity,
 * eligibility) so nothing has to be renamed on the way out.
 *
 * Validation here mirrors the backend's required set rather than adding rules
 * of its own — it exists to save a round trip, not to become a second contract.
 */

const REQUIRED = ['club_id', 'title', 'event_date', 'event_time', 'venue', 'capacity'];

const LABELS = {
  club_id: 'Club',
  title: 'Title',
  event_date: 'Date',
  event_time: 'Time',
  venue: 'Venue',
  capacity: 'Capacity',
};

const EMPTY = {
  club_id: '',
  title: '',
  description: '',
  event_date: '',
  event_time: '',
  venue: '',
  capacity: '',
  eligibility: '',
};

export function EventForm({ clubs, onSubmit, onCancel, submitting = false }) {
  const [values, setValues] = useState({
    ...EMPTY,
    club_id: clubs.length === 1 ? String(clubs[0].id) : '',
  });
  const [errors, setErrors] = useState({});

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) =>
      current[name] ? { ...current, [name]: undefined } : current,
    );
  };

  const validate = () => {
    const next = {};
    for (const name of REQUIRED) {
      if (!String(values[name] ?? '').trim()) {
        next[name] = `${LABELS[name]} is required.`;
      }
    }
    if (values.capacity && Number(values.capacity) < 1) {
      next.capacity = 'Capacity must be at least one seat.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      club_id: Number(values.club_id),
      title: values.title.trim(),
      description: values.description.trim() || null,
      event_date: values.event_date,
      event_time: values.event_time,
      venue: values.venue.trim(),
      capacity: Number(values.capacity),
      eligibility: values.eligibility.trim() || null,
    });
  };

  if (clubs.length === 0) {
    return (
      <Alert tone="info" title="No club to organise under">
        An event belongs to a club you administer. Create a club first.
      </Alert>
    );
  }

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <Field label="Club" required error={errors.club_id}>
          {(a11y) => (
            <Select {...a11y} name="club_id" value={values.club_id} onChange={update}>
              <option value="">Select a club</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Title" required error={errors.title}>
          {(a11y) => (
            <Input
              {...a11y}
              name="title"
              value={values.title}
              onChange={update}
              placeholder="e.g. Introduction to Machine Learning"
            />
          )}
        </Field>

        <Field label="Date" required error={errors.event_date}>
          {(a11y) => (
            <Input
              {...a11y}
              type="date"
              name="event_date"
              value={values.event_date}
              onChange={update}
            />
          )}
        </Field>

        <Field label="Time" required error={errors.event_time}>
          {(a11y) => (
            <Input
              {...a11y}
              type="time"
              name="event_time"
              value={values.event_time}
              onChange={update}
            />
          )}
        </Field>

        <Field label="Venue" required error={errors.venue}>
          {(a11y) => (
            <Input
              {...a11y}
              name="venue"
              value={values.venue}
              onChange={update}
              placeholder="e.g. Seminar Hall"
            />
          )}
        </Field>

        <Field label="Capacity" required error={errors.capacity}>
          {(a11y) => (
            <Input
              {...a11y}
              type="number"
              min="1"
              name="capacity"
              value={values.capacity}
              onChange={update}
              placeholder="Seats available"
            />
          )}
        </Field>
      </div>

      <Field label="Description">
        {(a11y) => (
          <Textarea
            {...a11y}
            name="description"
            rows={3}
            value={values.description}
            onChange={update}
            placeholder="What will happen at this event?"
          />
        )}
      </Field>

      <Field label="Eligibility" hint="Leave blank if the event is open to everyone.">
        {(a11y) => (
          <Input
            {...a11y}
            name="eligibility"
            value={values.eligibility}
            onChange={update}
            placeholder="e.g. Second year and above"
          />
        )}
      </Field>

      <div className="row-wrap">
        <Button type="submit" variant="primary" loading={submitting}>
          Create draft
        </Button>
        {onCancel ? (
          <Button onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : null}
      </div>

      <p className="text-muted" style={{ fontSize: 'var(--fs-13)' }}>
        New events are created as a draft. Submit one for faculty approval when
        its details are final.
      </p>
    </form>
  );
}

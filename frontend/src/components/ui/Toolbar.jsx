import { useId } from 'react';
import { Icon } from './Icon.jsx';

/** Labelled search box. The label is visually hidden but present for AT. */
export function SearchInput({
  value,
  onChange,
  onClear,
  label = 'Search',
  placeholder,
  className,
}) {
  const id = useId();

  return (
    <div className={['input-group', className].filter(Boolean).join(' ')}>
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <span className="input-group__icon">
        <Icon name="search" size={15} />
      </span>
      <input
        id={id}
        type="search"
        className="input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="input-group__action"
          onClick={() => (onClear ? onClear() : onChange(''))}
          aria-label="Clear search"
        >
          <Icon name="x" size={14} />
        </button>
      ) : null}
    </div>
  );
}

/** Labelled <select> used for filters in a toolbar. */
export function FilterSelect({ label, value, onChange, options, className }) {
  const id = useId();

  return (
    <>
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={['select', className].filter(Boolean).join(' ')}
        style={{ width: 'auto', minWidth: 150 }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
}

/**
 * Tab strip driven by a controlled value.
 * @param {{value: string, label: string, count?: number}[]} items
 */
export function Tabs({ items, value, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          className="tab"
          aria-selected={item.value === value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          {typeof item.count === 'number' ? (
            <span className="tab__count">{item.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/** Segmented pill list used for quick categorical filters. */
export function PillFilter({ label, value, onChange, options, className }) {
  return (
    <div
      className={['toolbar__pills', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={['pill', option.value === value ? 'is-active' : '']
            .filter(Boolean)
            .join(' ')}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

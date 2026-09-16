import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon.jsx';
import { Spinner } from './Spinner.jsx';

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger', 'link'];

function classNames({ variant, size, block, iconOnly, className }) {
  return [
    'btn',
    VARIANTS.includes(variant) ? `btn--${variant}` : 'btn--secondary',
    size === 'sm' ? 'btn--sm' : size === 'lg' ? 'btn--lg' : '',
    block ? 'btn--block' : '',
    iconOnly ? 'btn--icon' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * One button for the whole app.
 *
 * `to` renders a router Link, `href` an anchor, otherwise a <button>. While
 * `loading` is true the control is disabled, so a double submit is impossible.
 */
export const Button = forwardRef(function Button(
  {
    variant = 'secondary',
    size,
    block,
    loading = false,
    disabled = false,
    icon,
    iconAfter,
    children,
    className,
    to,
    href,
    type = 'button',
    ...rest
  },
  ref,
) {
  const iconOnly = !children && Boolean(icon);
  const classes = classNames({ variant, size, block, iconOnly, className });
  const isDisabled = disabled || loading;

  const content = (
    <>
      {loading ? (
        <Spinner size={size === 'sm' ? 12 : 14} />
      ) : icon ? (
        <Icon name={icon} size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
      {iconAfter && !loading ? (
        <Icon name={iconAfter} size={size === 'sm' ? 14 : 16} />
      ) : null}
    </>
  );

  if (to && !isDisabled) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href && !isDisabled) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
});

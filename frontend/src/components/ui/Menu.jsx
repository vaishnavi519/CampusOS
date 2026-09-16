import { cloneElement, useRef, useState } from 'react';
import { useDismissable } from '../../hooks/index.js';

/**
 * Small dropdown used for the account menu.
 *
 * `trigger` is a render function receiving the props the button needs; the menu
 * closes on outside press, on Escape, and after any item is chosen.
 */
export function Menu({ trigger, children, align = 'start', className }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useDismissable(containerRef, () => setOpen(false), open);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative' }}
    >
      {trigger({
        onClick: () => setOpen((value) => !value),
        'aria-expanded': open,
        'aria-haspopup': 'menu',
      })}

      {open ? (
        <div
          className="menu"
          role="menu"
          style={
            align === 'end'
              ? { right: 0, bottom: 'calc(100% + 6px)' }
              : { left: 0, top: 'calc(100% + 6px)' }
          }
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function MenuItem({ children, ...rest }) {
  return (
    <button type="button" className="menu__item" role="menuitem" {...rest}>
      {children}
    </button>
  );
}

/** Wraps a router Link (or any element) in menu item styling. */
export function MenuLink({ children }) {
  return cloneElement(children, {
    className: 'menu__item',
    role: 'menuitem',
  });
}

export function MenuLabel({ children }) {
  return <p className="menu__label">{children}</p>;
}

export function MenuSeparator() {
  return <div className="menu__separator" role="separator" />;
}

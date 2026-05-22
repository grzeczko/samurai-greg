export default function ScrollButton({
  href,
  icon: Icon,
  children,
  variant = 'primary',
  className = '',
  onClick,
  autoFocus = false,
  ...props
}) {
  const buttonClassName = `scroll-button scroll-button--${variant} ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={buttonClassName}
        onClick={onClick}
        {...props}
      >
        {Icon && <Icon size={18} aria-hidden="true" />}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      className={buttonClassName}
      {...props}
    >
      {Icon && <Icon size={18} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

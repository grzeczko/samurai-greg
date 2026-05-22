export default function ScrollPanel({
  as: Component = 'div',
  children,
  className = '',
  panel = 'main',
  style,
  ...props
}) {
  return (
    <Component
      className={`scroll-panel ${className}`.trim()}
      data-panel={panel}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}

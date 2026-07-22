export function PhotoSlot(params: PhotoSlotParams): React.JSX.Element {
  const { src, alt, gradient, className, style } = params;

  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : "true"}
      className={className}
      style={{
        backgroundImage: src ? `url('${src}'), ${gradient}` : gradient,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
    />
  );
}

interface PhotoSlotParams {
  src?: string;
  alt?: string;
  gradient: string;
  className?: string;
  style?: React.CSSProperties;
}

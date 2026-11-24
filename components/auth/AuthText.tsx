export function AuthText({ children, accentPeriod = false }: {
  children: string;
  accentPeriod?: boolean;
}) {
  if (!accentPeriod || !children.endsWith(".")) return children;

  return (
    <>
      {children.slice(0, -1)}
      <span className="auth-period">.</span>
    </>
  );
}

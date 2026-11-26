import { Icon, type IconName } from "@/components/workspace/Icon";

const account = [
  { label: "Create account", icon: "user" },
  { label: "Verify email", icon: "inbox" },
  { label: "Set up profile", icon: "check" },
] satisfies { label: string; icon: IconName }[];

const recovery = [
  { label: "Request a link", icon: "link" },
  { label: "Check inbox", icon: "inbox" },
  { label: "Set a password", icon: "lock" },
] satisfies { label: string; icon: IconName }[];

export function AuthPath({ kind, current }: { kind: "account" | "recovery"; current: number }) {
  return (
    <ol className="auth-path" aria-label={kind === "account" ? "Account setup" : "Password recovery"}>
      {(kind === "account" ? account : recovery).map(({ label, icon }, index) => (
        <li key={label} aria-current={index === current ? "step" : undefined} data-complete={index < current}>
          {index > 0 && <Icon name="chevronRight" size={11} className="auth-path-arrow" />}
          <Icon name={index < current ? "check" : icon} size={15} />
          <span>{label}{index < current && <span className="sr-only"> complete</span>}</span>
        </li>
      ))}
    </ol>
  );
}

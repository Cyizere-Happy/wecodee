"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import type { ArtName } from "@/lib/workspace/mascot";
import { Dialog } from "./forms";
import { Icon, type IconName } from "./Icon";
import { Mascot } from "./ui";

type GuideAction = { label: string } & ({ href: string } | { focusId: string });

export function GuideDialog({ label, title, art, children, action, icon = "help", showMascot = false }: {
  label: string;
  title: string;
  art: ArtName;
  children: ReactNode;
  action?: GuideAction;
  icon?: IconName;
  showMascot?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const focusOnClose = useRef<string | null>(null);

  function close() {
    setOpen(false);
    if (focusOnClose.current) {
      document.getElementById(focusOnClose.current)?.focus();
      focusOnClose.current = null;
    }
  }

  return (
    <>
      <button type="button" className={`ws-btn ws-btn-secondary ws-btn-sm ws-guide-trigger${showMascot ? " ws-guide-trigger-mascot" : ""}`} aria-haspopup="dialog" aria-label={label} onClick={() => setOpen(true)}>
        {showMascot ? <Mascot art="lessons/presentation" /> : <Icon name={icon} size={15} />}
        {showMascot ? "Show me" : label}
      </button>
      <Dialog open={open} onClose={close} label={title} className="ws-guide-dialog">
        <div className="ws-dialog-body">
          <div className="ws-guide-dialog-heading">
            <Mascot art={art} />
            <h2>{title}</h2>
          </div>
          {children}
        </div>
        <div className="ws-dialog-foot">
          {action && <button type="button" className="ws-btn ws-btn-secondary" onClick={close}>Close</button>}
          {action && "href" in action ? (
            <Link href={action.href} className="ws-btn ws-btn-primary" onClick={close}>{action.label}<Icon name="arrowRight" size={15} /></Link>
          ) : (
            <button type="button" className="ws-btn ws-btn-primary" onClick={() => {
              if (action) focusOnClose.current = action.focusId;
              setOpen(false);
            }}>
              {action?.label ?? "Got it"}{action && <Icon name="arrowRight" size={15} />}
            </button>
          )}
        </div>
      </Dialog>
    </>
  );
}

import type { ReactNode } from "react";

type VisualCardProps = {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function VisualCard({
  children,
  className,
  eyebrow,
  title,
  body,
}: VisualCardProps) {
  return (
    <div className={cx("mib-visualCard", className)}>
      {(eyebrow || title || body) && (
        <div className="mib-visualCard__meta">
          {eyebrow && <p className="mib-visualCard__eyebrow">{eyebrow}</p>}
          {title && <h3 className="mib-h3">{title}</h3>}
          {body && <p className="mib-p2">{body}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

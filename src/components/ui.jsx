"use client";

export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const BUTTON_VARIANTS = {
  line: "bg-line text-line-fg hover:brightness-110",
  paper: "bg-paper text-paper-fg hover:brightness-95",
  outline: "border border-border bg-transparent text-fg hover:bg-raised",
  ghost: "bg-transparent text-muted hover:text-fg hover:bg-raised",
  mute: "bg-raised text-muted hover:text-fg",
};

const BUTTON_SIZES = {
  md: "h-10 px-4 text-sm",
  sm: "h-8 px-3 text-xs",
  icon: "h-9 w-9 p-0",
};

export function Button({ variant = "outline", size = "md", className, type = "button", ...props }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

const BADGE_TONES = {
  ok: "bg-ok/15 text-ok",
  line: "bg-line/15 text-line",
  warn: "bg-warn/15 text-warn",
  mute: "bg-raised text-muted",
  accent: "bg-accent/15 text-accent",
};

export function Badge({ tone = "mute", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em]",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg placeholder:text-subtle focus:border-line focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-subtle focus:border-line focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Eyebrow({ className, children }) {
  return (
    <p className={cn("text-[11px] uppercase tracking-[0.18em] text-subtle", className)}>{children}</p>
  );
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="max-w-2xl">
      <Eyebrow className="text-line">{eyebrow}</Eyebrow>
      <h1 className="font-display mt-2 text-4xl leading-none md:text-5xl">{title}</h1>
      {children ? <div className="mt-4 text-sm leading-relaxed text-muted">{children}</div> : null}
    </header>
  );
}

export function Card({ className, children }) {
  return <div className={cn("rounded-xl border border-border bg-surface p-5", className)}>{children}</div>;
}

export function Stat({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-4">
      <Eyebrow>{label}</Eyebrow>
      <p className="font-display mt-2 text-4xl leading-none tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

import { motion } from 'framer-motion';

const toneStyles = {
  accent: 'accent-bg text-[var(--accent)] border border-base',
  success: 'bg-[var(--bg-success)] text-[var(--success)] border border-[var(--bg-success)]',
  warning: 'bg-[var(--bg-warning)] text-[var(--warning)] border border-[var(--bg-warning)]',
  danger: 'bg-[var(--bg-danger)] text-[var(--danger)] border border-[var(--bg-danger)]',
  info: 'bg-[var(--bg-success)] text-[var(--info)] border border-[var(--bg-success)]',
  neutral: 'surface-inset text-base-muted border-base',
};

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-base-soft">{eyebrow}</p> : null}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-semibold leading-none">{title}</h2>
          {description ? <p className="text-base-muted max-w-2xl text-[15px] leading-7">{description}</p> : null}
        </div>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function GlassCard({ className = '', children, title, eyebrow, action, footer }) {
  return (
    <section className={`surface rounded-[var(--radius-xl)] p-5 md:p-6 transition-theme ${className}`}>
      {(title || eyebrow || action) && (
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            {eyebrow ? <p className="text-[11px] uppercase tracking-[0.3em] text-base-soft">{eyebrow}</p> : null}
            {title ? <h3 className="text-xl md:text-2xl font-semibold leading-tight">{title}</h3> : null}
          </div>
          {action ? <div className="md:shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
      {footer ? <div className="mt-5 border-t border-base pt-4">{footer}</div> : null}
    </section>
  );
}

export function MetricCard({ label, value, detail, icon: Icon, tone = 'accent', change }) {
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface rounded-[22px] p-5 transition-theme hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-base-soft">{label}</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl md:text-4xl font-semibold leading-none">{value}</p>
            {change ? <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneStyles[tone]}`}>{change}</span> : null}
          </div>
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl accent-bg-strong text-[var(--accent)]">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-4 text-sm leading-6 text-base-muted">{detail}</p> : null}
    </motion.article>
  );
}

export function StatusBadge({ tone = 'neutral', children }) {
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${toneStyles[tone] || toneStyles.neutral}`}>{children}</span>;
}

export function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="surface rounded-[var(--radius-xl)] p-8 md:p-12 text-center">
      {Icon ? (
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl accent-bg-strong text-[var(--accent)]">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h3 className="text-2xl font-semibold">{title}</h3>
      {description ? <p className="mx-auto mt-3 max-w-xl text-sm md:text-base leading-7 text-base-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ProgressBar({ value = 0, tone = 'accent', label }) {
  const fills = {
    accent: 'bg-[var(--accent)]',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    danger: 'bg-[var(--danger)]',
    info: 'bg-[var(--info)]',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-base-soft">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--border-strong)]">
        <div className={`h-full rounded-full transition-all duration-500 ${fills[tone] || fills.accent}`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
      </div>
    </div>
  );
}

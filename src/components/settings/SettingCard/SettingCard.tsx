import type { PropsWithChildren } from 'react';

interface SettingCardProps extends PropsWithChildren {
  title?: string;
}

export function SettingCard({ title, children }: SettingCardProps) {
  return (
    <section className="setting-card">
      {title ? <div className="group-title">{title}</div> : null}
      {children}
    </section>
  );
}

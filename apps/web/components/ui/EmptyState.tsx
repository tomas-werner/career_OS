/**
 * Empty state (UX cahier des charges §53).
 * Every page must have a useful empty state — never bare "No data".
 */
interface Props {
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p className="muted">{description}</p>
      {action && (
        <a className="button" href={action.href}>
          {action.label}
        </a>
      )}
    </div>
  );
}

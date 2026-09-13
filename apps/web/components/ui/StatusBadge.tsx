/**
 * Status system component (UX cahier des charges §25, §51).
 * Icon + text + color — never color alone.
 */
export type StatusKind =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'REJECTED'
  | 'MISSING_EVIDENCE'
  | 'APPROVED'
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'INFO';

const KIND_TO_CLASS: Record<StatusKind, string> = {
  VERIFIED: 'status-verified',
  SUCCESS: 'status-verified',
  APPROVED: 'status-verified',
  UNVERIFIED: 'status-unverified',
  PENDING: 'status-unverified',
  RUNNING: 'status-unverified',
  MISSING_EVIDENCE: 'status-unverified',
  WARNING: 'status-unverified',
  REJECTED: 'status-rejected',
  ERROR: 'status-rejected',
  INFO: 'status-info',
};

const KIND_TO_ICON: Record<StatusKind, string> = {
  VERIFIED: '✓',
  SUCCESS: '✓',
  APPROVED: '✓',
  UNVERIFIED: '○',
  PENDING: '○',
  RUNNING: '◐',
  MISSING_EVIDENCE: '!',
  WARNING: '!',
  REJECTED: '×',
  ERROR: '×',
  INFO: 'i',
};

export default function StatusBadge({ kind, label }: { kind: StatusKind; label?: string }) {
  return (
    <span className={`status ${KIND_TO_CLASS[kind]}`} title={kind}>
      <span aria-hidden>{KIND_TO_ICON[kind]}</span>
      {label ?? kind.replace(/_/g, ' ')}
    </span>
  );
}

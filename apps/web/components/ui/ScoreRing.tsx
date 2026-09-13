/**
 * Match score ring (UX cahier des charges §18).
 * Categories: 90-100 Excellent, 80-89 Strong, 70-79 Good,
 * 60-69 Moderate, <60 Weak. Thresholds stay configurable in the
 * business engine — this component only renders.
 */
export function scoreCategory(score: number): { label: string; className: string } {
  const pct = score * 100;
  if (pct >= 90) return { label: 'Excellent', className: 'score-excellent' };
  if (pct >= 80) return { label: 'Strong', className: 'score-excellent' };
  if (pct >= 70) return { label: 'Good', className: 'score-good' };
  if (pct >= 60) return { label: 'Moderate', className: 'score-moderate' };
  return { label: 'Weak', className: 'score-weak' };
}

export default function ScoreRing({ score, size = 92 }: { score: number; size?: number }) {
  const pct = Math.round(score * 100);
  const category = scoreCategory(score);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, score)));

  return (
    <div className={`score-ring ${category.className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`Match score ${pct}% — ${category.label}`}>
        <circle
          className="score-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={6}
          fill="none"
        />
        <circle
          className="score-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={6}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="score-ring-label">
        <strong>{pct}%</strong>
        <span>{category.label.toUpperCase()}</span>
      </div>
    </div>
  );
}

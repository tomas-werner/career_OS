/**
 * Score breakdown (UX cahier des charges §21).
 * Dimensions with their weights and per-dimension marks.
 */
interface Dimension {
  key: string;
  label: string;
  weight: number;
  score: number;
}

export default function MatchBreakdown({ dimensions }: { dimensions: Dimension[] }) {
  return (
    <table className="table score-breakdown">
      <thead>
        <tr>
          <th>Dimension</th>
          <th>Weight</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {dimensions.map((dimension) => {
          const mark = dimension.score * dimension.weight * 100;
          const full = dimension.weight * 100;
          return (
            <tr key={dimension.key}>
              <td>{dimension.label}</td>
              <td className="muted">{Math.round(full)}/100</td>
              <td>
                <span className={dimension.score >= 0.99 ? 'ok' : dimension.score >= 0.6 ? 'warn' : 'err'}>
                  {mark.toFixed(0)}/{Math.round(full)}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

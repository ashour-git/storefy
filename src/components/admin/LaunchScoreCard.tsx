import type { LaunchCheck } from '../../lib/admin/launch-score';

interface LaunchScoreCardProps {
  score: number;
  passed: number;
  total: number;
  checks: LaunchCheck[];
}

export function LaunchScoreCard({ score, passed, total, checks }: LaunchScoreCardProps) {
  return (
    <div className="admin-section">
      <div className="launch-score-card">
        <div className="launch-score-ring" style={{ background: `conic-gradient(var(--accent-primary) ${score}%, rgba(148,163,184,.16) 0)` }}>
          <div>
            <strong>{score}</strong>
            <span>/100</span>
          </div>
        </div>
        <div className="launch-score-content">
          <div className="admin-section-title" style={{ marginBottom: 6 }}>Store Launch Score</div>
          <p className="admin-muted-text">{passed} of {total} launch checks complete. Finish these to look closer to Shopify/Salla-level from day one.</p>
          <div className="launch-check-grid">
            {checks.map((check) => (
              <a key={check.key} href={check.href} className={`launch-check-item ${check.passed ? 'passed' : ''}`}>
                <span>{check.passed ? 'OK' : '!'}</span>
                <div>
                  <strong>{check.label}</strong>
                  <p>{check.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

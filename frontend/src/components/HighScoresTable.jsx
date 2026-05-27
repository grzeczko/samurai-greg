function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDevice(value) {
  if (!value) {
    return '—';
  }

  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

export default function HighScoresTable({ scores = [], compact = false }) {
  return (
    <div className={`high-scores-table ${compact ? 'high-scores-table--compact' : ''}`}>
      <div className="high-scores-table__head" aria-hidden="true">
        <span>Rank</span>
        <span>Name</span>
        <span>Location</span>
        <span>Time</span>
        <span>Date</span>
        <span>Device</span>
      </div>

      <ol className="high-scores-table__body" aria-label="Samurai Greg Hall of Fame top times">
        {scores.map((score) => (
          <li
            key={`${score.rank}-${score.player_name}-${score.completion_time_display}`}
            className={`high-scores-table__row ${score.is_placeholder ? 'high-scores-table__row--placeholder' : ''}`}
          >
            <span className="high-scores-table__rank">#{score.rank}</span>
            <span className="high-scores-table__name">{score.player_name}</span>
            <span className="high-scores-table__location" data-label="Location">
              {score.location || '—'}
            </span>
            <span className="high-scores-table__time" data-label="Time">
              {score.completion_time_display || '--:--.--'}
            </span>
            <span className="high-scores-table__date" data-label="Date">
              {formatDate(score.completed_at)}
            </span>
            <span className="high-scores-table__device" data-label="Device">
              {formatDevice(score.device_type)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

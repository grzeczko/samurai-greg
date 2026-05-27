import { RefreshCw, Trophy, X } from 'lucide-react';
import HighScoresTable from './HighScoresTable.jsx';

export default function HallOfFameModal({
  open,
  scores = [],
  loading = false,
  error = '',
  onClose,
  onRefresh,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="hall-of-fame-modal" role="dialog" aria-modal="true" aria-labelledby="hall-of-fame-title">
      <div className="hall-of-fame-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="hall-of-fame-modal__panel">
        <header className="hall-of-fame-modal__header">
          <div>
            <p className="hall-of-fame-modal__eyebrow">Samurai Greg</p>
            <h2 id="hall-of-fame-title" className="hall-of-fame-modal__title">
              <Trophy size={24} aria-hidden="true" />
              Hall of Fame
            </h2>
          </div>

          <div className="hall-of-fame-modal__actions">
            <button type="button" className="hall-of-fame-modal__icon-button" onClick={onRefresh} aria-label="Refresh Hall of Fame">
              <RefreshCw size={18} aria-hidden="true" />
            </button>
            <button type="button" className="hall-of-fame-modal__icon-button" onClick={onClose} aria-label="Close Hall of Fame">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </header>

        {loading && <p className="hall-of-fame-modal__status">Summoning the fastest warriors...</p>}
        {error && <p className="hall-of-fame-modal__error">{error}</p>}
        {!loading && <HighScoresTable scores={scores} />}
      </div>
    </div>
  );
}

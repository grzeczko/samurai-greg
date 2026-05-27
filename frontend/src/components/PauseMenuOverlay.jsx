import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

export default function PauseMenuOverlay({ open, isMobile, onResume, onRestartCheckpoint }) {
  const [showControls, setShowControls] = useState(false);

  if (!open) {
    return null;
  }

  return (
    <div className="pause-menu-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-menu-title">
      <div className="pause-menu-overlay__panel">
        <p className="pause-menu-overlay__eyebrow">Quest Paused</p>
        <h2 id="pause-menu-title" className="pause-menu-overlay__title">Hold the blade steady.</h2>

        <div className="pause-menu-overlay__actions">
          <button type="button" className="pause-menu-overlay__button pause-menu-overlay__button--primary" onClick={onResume}>
            <X size={18} aria-hidden="true" />
            Resume
          </button>
          <button type="button" className="pause-menu-overlay__button" onClick={onRestartCheckpoint}>
            <RotateCcw size={18} aria-hidden="true" />
            Restart from Checkpoint
          </button>
          <button type="button" className="pause-menu-overlay__button" onClick={() => setShowControls(value => !value)}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            View Controls
          </button>
        </div>

        {showControls && (
          <div className="pause-menu-overlay__controls">
            {isMobile ? (
              <p>Use the left buttons to move. Use the right buttons to jump, strike, dash, throw, and guard.</p>
            ) : (
              <p>Move with WASD or arrows. Space jumps, Shift/K dashes, X/J attacks, C/L throws, and S/Down defends.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

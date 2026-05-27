import { useCallback, useEffect } from 'react';
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pause,
  Shield,
  Swords,
  Zap,
} from 'lucide-react';
import { gameControls } from '../game/input/controlsState.js';
import { eventBridge } from '../game/events.js';

function TouchButton({ action, ariaLabel, className = '', children }) {
  const setPressed = useCallback((event, isDown) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDown) {
      eventBridge.emit('ui:press-start');
    }

    gameControls.setTouchAction(action, isDown);
  }, [action]);

  return (
    <button
      type="button"
      className={`mobile-touch-controls__button ${className}`}
      aria-label={ariaLabel}
      onPointerDown={(event) => setPressed(event, true)}
      onPointerUp={(event) => setPressed(event, false)}
      onPointerLeave={(event) => setPressed(event, false)}
      onPointerCancel={(event) => setPressed(event, false)}
      onLostPointerCapture={() => gameControls.setTouchAction(action, false)}
    >
      {children}
    </button>
  );
}

export default function MobileTouchControls({ visible, onPause }) {
  useEffect(() => {
    const resetTouchControls = () => gameControls.resetTouch();

    if (!visible) {
      resetTouchControls();
    }

    window.addEventListener('pointerup', resetTouchControls);
    window.addEventListener('pointercancel', resetTouchControls);
    window.addEventListener('blur', resetTouchControls);
    document.addEventListener('visibilitychange', resetTouchControls);

    return () => {
      window.removeEventListener('pointerup', resetTouchControls);
      window.removeEventListener('pointercancel', resetTouchControls);
      window.removeEventListener('blur', resetTouchControls);
      document.removeEventListener('visibilitychange', resetTouchControls);
      resetTouchControls();
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="mobile-touch-controls"
      aria-label="Mobile game controls"
      onContextMenu={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="mobile-touch-controls__pause"
        aria-label="Pause quest"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onPause?.();
        }}
      >
        <Pause size={18} strokeWidth={2.7} aria-hidden="true" />
      </button>

      <div className="mobile-touch-controls__movement" aria-label="Move">
        <TouchButton
          action="left"
          ariaLabel="Move left"
          className="mobile-touch-controls__button--move"
        >
          <ChevronLeft size={34} strokeWidth={2.7} aria-hidden="true" />
        </TouchButton>
        <TouchButton
          action="right"
          ariaLabel="Move right"
          className="mobile-touch-controls__button--move"
        >
          <ChevronRight size={34} strokeWidth={2.7} aria-hidden="true" />
        </TouchButton>
      </div>

      <div className="mobile-touch-controls__actions" aria-label="Actions">
        <TouchButton
          action="jump"
          ariaLabel="Jump"
          className="mobile-touch-controls__button--jump"
        >
          <ArrowUp size={32} strokeWidth={2.8} aria-hidden="true" />
        </TouchButton>
        <TouchButton
          action="attack"
          ariaLabel="Attack"
          className="mobile-touch-controls__button--attack"
        >
          <Swords size={28} strokeWidth={2.4} aria-hidden="true" />
        </TouchButton>
        <TouchButton
          action="dash"
          ariaLabel="Dash"
          className="mobile-touch-controls__button--dash"
        >
          <Zap size={23} strokeWidth={2.5} aria-hidden="true" />
        </TouchButton>
        <TouchButton
          action="throw"
          ariaLabel="Throw"
          className="mobile-touch-controls__button--throw"
        >
          <Flame size={22} strokeWidth={2.4} aria-hidden="true" />
        </TouchButton>
        <TouchButton
          action="defend"
          ariaLabel="Defend"
          className="mobile-touch-controls__button--defend"
        >
          <Shield size={21} strokeWidth={2.4} aria-hidden="true" />
        </TouchButton>
      </div>
    </div>
  );
}

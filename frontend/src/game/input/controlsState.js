export const CONTROL_ACTIONS = [
  'left',
  'right',
  'jump',
  'attack',
  'dash',
  'throw',
  'defend',
];

function createEmptyState() {
  return CONTROL_ACTIONS.reduce((state, action) => {
    state[action] = false;
    return state;
  }, {});
}

class ControlsState {
  constructor() {
    this.sources = {
      keyboard: createEmptyState(),
      touch: createEmptyState(),
    };
    this.previous = createEmptyState();
    this.pendingJustPressed = createEmptyState();
  }

  getMergedState() {
    return CONTROL_ACTIONS.reduce((state, action) => {
      state[action] = Boolean(
        this.sources.keyboard[action] || this.sources.touch[action]
      );
      return state;
    }, {});
  }

  setSourceState(source, partialState) {
    if (!this.sources[source] || !partialState) {
      return;
    }

    const before = this.getMergedState();

    CONTROL_ACTIONS.forEach((action) => {
      if (Object.prototype.hasOwnProperty.call(partialState, action)) {
        this.sources[source][action] = Boolean(partialState[action]);
      }
    });

    const after = this.getMergedState();

    CONTROL_ACTIONS.forEach((action) => {
      if (after[action] && !before[action]) {
        this.pendingJustPressed[action] = true;
      }
    });
  }

  setKeyboardState(partialState) {
    this.setSourceState('keyboard', partialState);
  }

  setTouchAction(action, isDown) {
    if (!CONTROL_ACTIONS.includes(action)) {
      return;
    }

    this.setSourceState('touch', { [action]: isDown });
  }

  resetSource(source) {
    if (!this.sources[source]) {
      return;
    }

    this.sources[source] = createEmptyState();
  }

  resetTouch() {
    this.resetSource('touch');
  }

  resetKeyboard() {
    this.resetSource('keyboard');
  }

  resetAll() {
    this.sources.keyboard = createEmptyState();
    this.sources.touch = createEmptyState();
    this.previous = createEmptyState();
    this.pendingJustPressed = createEmptyState();
  }

  snapshot() {
    const current = this.getMergedState();
    const justPressed = createEmptyState();

    CONTROL_ACTIONS.forEach((action) => {
      justPressed[action] = Boolean(
        this.pendingJustPressed[action] || (current[action] && !this.previous[action])
      );
      this.pendingJustPressed[action] = false;
    });

    this.previous = { ...current };

    return {
      ...current,
      justPressed,
    };
  }
}

export const gameControls = new ControlsState();

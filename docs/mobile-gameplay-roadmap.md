# Samurai Greg Mobile Gameplay Roadmap

## Goal

Add mobile gameplay support as a responsive layer while preserving the current desktop keyboard experience.

Mobile flow:

1. Title screen
2. Begin the quest
3. If portrait, show: "Rotate your device to landscape to begin the quest."
4. Objective screen
5. Gameplay with touch controls

Desktop flow remains:

1. Title screen
2. Begin the quest
3. Objective screen
4. Gameplay with keyboard controls

## Inspection Findings

- Keyboard input was handled directly inside `frontend/src/game/entities/Player.js`.
- The desktop control legend was rendered by `frontend/src/components/GameContainer.jsx`.
- The title-to-objective flow was controlled by `eventBridge` events between React and Phaser.
- Phaser already used `Scale.FIT` with a fixed 1024 by 600 game size in `frontend/src/game/config.js`.
- The objective, codex, completion, and HUD surfaces were React/CSS overlays around the Phaser canvas.

## Input Architecture

Keyboard and touch now share one control state:

```js
controls.left
controls.right
controls.jump
controls.attack
controls.dash
controls.throw
controls.defend
```

`Player` keeps the existing gameplay logic, but reads this shared state instead of branching into separate keyboard and touch behavior.

## Implementation Phases

### Phase 1: Mobile Detection and Mobile Guide

- Detect touch/mobile gameplay devices using pointer capability, touch points, and viewport bounds.
- Avoid switching narrow desktop browser windows into mobile controls unless touch capability is present.
- Replace desktop key instructions with mobile touch instructions on phones/tablets.

### Phase 2: Landscape Gate

- When a mobile visitor begins the quest in portrait, show a rotate prompt.
- Keep gameplay blocked until landscape is detected.
- Continue into the objective screen once landscape is available.

### Phase 3: Touch Controls

- Add translucent mobile-only controls.
- Bottom-left movement uses left/right buttons.
- Bottom-right actions include jump, attack, dash, throw, and defend.
- Buttons feed the same shared control state as keyboard input.

### Phase 4: Mobile Scaling

- Keep Phaser `Scale.FIT`.
- Use responsive shell sizing for mobile landscape.
- Hide the lower instruction strip during active mobile gameplay so the canvas fits the landscape viewport better.

### Phase 5: Overlay Polish

- Tune objective, codex, and completion overlays for short landscape screens.
- Keep mobile controls hidden when codex/completion overlays are active.
- Keep desktop overlay sizing and keyboard legend unchanged.

## Verification Matrix

- Desktop: keyboard codex remains visible; mobile controls do not render.
- Phone portrait: rotate prompt appears; WASD/keyboard instructions do not render.
- Phone landscape: touch controls render; keyboard instructions do not render; gameplay starts after objective.
- Short landscape viewport: game frame fits better with compact mobile chrome.
- Build checks: `npm run lint`, `npm run build`.

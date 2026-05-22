import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import gameConfig from '../game/config.js';
import { LEVEL_POWERUP_IDS, Level1 } from '../game/scenes/Level1.js';
import { TitleScene } from '../game/scenes/TitleScene.js';
import { eventBridge } from '../game/events.js';
import { resumePowerups } from '../data/resumePowerups.js';
import GameHeader from './GameHeader.jsx';
import ObjectiveScreen from './ObjectiveScreen.jsx';
import ResumeCard from './ResumeCard.jsx';
import { CompletionScreen } from './ResumeQuestOverlays.jsx';

const CONTROL_GROUPS = [
  {
    id: 'movement',
    label: 'Move',
    keys: [
      { label: 'WASD', wide: true },
      { label: 'Arrows', wide: true },
    ],
  },
  {
    id: 'jump',
    label: 'Jump',
    keys: [{ label: 'Space', wide: true }],
  },
  {
    id: 'dash',
    label: 'Dash',
    keys: [
      { label: 'Shift', wide: true },
      { label: 'K' },
    ],
  },
  {
    id: 'attack',
    label: 'Attack',
    keys: [
      { label: 'X' },
      { label: 'J' },
    ],
  },
  {
    id: 'throw',
    label: 'Throw',
    note: '5 / life',
    keys: [
      { label: 'C' },
      { label: 'L' },
    ],
  },
  {
    id: 'defend',
    label: 'Defend',
    keys: [
      { label: 'S' },
      { label: '↓' },
    ],
  },
];

const PHASE_HELPER_COPY = {
  title: 'Begin your journey from the title screen within the game world.',
  objective: 'Read the quest briefing, then begin the journey.',
  portal: 'The final portal stirs within the realm. Step through it to complete the quest.',
  playing: 'Collect powerups to uncover the path of your resume.',
};

export default function GameContainer() {
  const gameInstanceRef = useRef(null);
  const gameAreaRef = useRef(null);
  const lastHeroHoverAtRef = useRef(0);
  const pendingStartRef = useRef(false);
  const [gamePhase, setGamePhase] = useState('title');
  const [currentPowerup, setCurrentPowerup] = useState(null);
  const [collectedPowerups, setCollectedPowerups] = useState([]);
  const [completionPowerups, setCompletionPowerups] = useState([]);

  const getLevelScene = useCallback(() => {
    const levelScene = gameInstanceRef.current?.scene.getScene('Level1');

    if (!levelScene?.scene.isActive()) {
      return null;
    }

    return levelScene;
  }, []);

  const resumePhaserScene = useCallback(() => {
    const levelScene = getLevelScene();

    if (!levelScene) {
      return false;
    }

    levelScene.resumeGameplay();
    return true;
  }, [getLevelScene]);

  useEffect(() => {
    // Only initialize if not already done
    if (gameInstanceRef.current) {
      return;
    }

    const handleCollectibleCollected = (powerup) => {
      setCurrentPowerup(powerup);
      setCollectedPowerups(prev => (prev.includes(powerup.id) ? prev : [...prev, powerup.id]));
    };

    const handlePortalOpen = () => {
      setGamePhase('portal');
    };

    const handleQuestComplete = ({ powerups = [] } = {}) => {
      const completedIds = powerups.map(powerup => powerup.id);
      setCurrentPowerup(null);
      setCollectedPowerups(prev => (completedIds.length > 0 ? completedIds : prev));
      setCompletionPowerups(powerups);
      setGamePhase('complete');
    };

    const handleTitleBegin = () => {
      setGamePhase('objective');
    };

    const handleGameReady = () => {
      if (!pendingStartRef.current) {
        return;
      }

      pendingStartRef.current = false;
      eventBridge.emit('game:start');
    };

    eventBridge.on('collectible:collected', handleCollectibleCollected);
    eventBridge.on('title:begin', handleTitleBegin);
    eventBridge.on('game:ready', handleGameReady);
    eventBridge.on('quest:portal-open', handlePortalOpen);
    eventBridge.on('quest:complete', handleQuestComplete);

    // Create Phaser game instance
    const game = new Phaser.Game({
      ...gameConfig,
      scene: [TitleScene, Level1],
    });

    gameInstanceRef.current = game;

    // Cleanup on unmount
    return () => {
      eventBridge.off('collectible:collected', handleCollectibleCollected);
      eventBridge.off('title:begin', handleTitleBegin);
      eventBridge.off('game:ready', handleGameReady);
      eventBridge.off('quest:portal-open', handlePortalOpen);
      eventBridge.off('quest:complete', handleQuestComplete);

      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  const continueAfterPowerup = () => {
    setCurrentPowerup(null);

    if (!resumePhaserScene()) {
      eventBridge.emit('powerup:continue');
    }
  };

  const focusGameArea = useCallback(() => {
    gameAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    window.requestAnimationFrame(() => {
      gameAreaRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const handleHeroActionHover = useCallback(() => {
    const now = performance.now();

    if (now - lastHeroHoverAtRef.current < 160) {
      return;
    }

    lastHeroHoverAtRef.current = now;
    eventBridge.emit('ui:menu-hover');
  }, []);

  const handleHeroActionPress = useCallback(() => {
    eventBridge.emit('ui:menu-confirm');
  }, []);

  const handleHeroPressStart = useCallback(() => {
    eventBridge.emit('ui:press-start');
    focusGameArea();
  }, [focusGameArea]);

  const handleBeginJourney = useCallback(() => {
    setGamePhase('playing');
    pendingStartRef.current = true;
    eventBridge.emit('objective:begin-journey');
    focusGameArea();
  }, [focusGameArea]);

  const controlsHelperText = gamePhase === 'title'
    ? PHASE_HELPER_COPY.title
    : gamePhase === 'objective'
    ? PHASE_HELPER_COPY.objective
    : gamePhase === 'portal'
    ? PHASE_HELPER_COPY.portal
    : PHASE_HELPER_COPY.playing;

  const collectedPowerupObjects = resumePowerups.filter(powerup => collectedPowerups.includes(powerup.id));
  const completionList = completionPowerups.length > 0 ? completionPowerups : collectedPowerupObjects;

  return (
    <div className="min-h-screen overflow-hidden bg-[#07080c] text-white">
      <GameHeader
        onActionHover={handleHeroActionHover}
        onActionPress={handleHeroActionPress}
        onPressStart={handleHeroPressStart}
      />

      <main className="px-4 pb-10 sm:px-6 lg:pb-14">
        <section
          ref={gameAreaRef}
          tabIndex={-1}
          aria-label="Samurai Greg Phaser game"
          className="mx-auto w-full max-w-5xl scroll-mt-6 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-orange-300"
        >
          <div className="mb-3 text-center text-sm text-gray-400">
            Skills collected: {collectedPowerups.length} / {LEVEL_POWERUP_IDS.length}
          </div>
          <div className="game-stage-shell relative overflow-hidden rounded-[1.65rem] border border-orange-200/12 bg-[#050607] shadow-[0_28px_95px_rgba(0,0,0,0.62),0_0_65px_rgba(251,146,60,0.08)]">
            <div className="game-stage-shell__frame relative aspect-[1024/600] w-full overflow-hidden bg-black">
              <div id="phaser-container" className="h-full w-full bg-black" />
              {gamePhase === 'objective' && (
                <ObjectiveScreen onBeginJourney={handleBeginJourney} />
              )}
              {gamePhase === 'complete' && (
                <CompletionScreen collectedPowerups={completionList} />
              )}
              {currentPowerup && (
                <ResumeCard
                  powerup={currentPowerup}
                  onContinue={continueAfterPowerup}
                />
              )}
            </div>

            <aside
              aria-labelledby="quest-controls-heading"
              className="game-hud-strip relative border-t border-white/6 px-3 py-3 sm:px-4 sm:py-3.5 lg:px-5"
            >
              <div className="game-hud-strip__inner relative z-10 mx-auto max-w-[70rem]">
                <div className="game-hud-strip__topline flex flex-col items-center gap-1.5 text-center sm:gap-2 lg:flex-row lg:items-center lg:justify-between lg:text-left">
                  <p
                    id="quest-controls-heading"
                    className="game-hud-strip__eyebrow text-[0.56rem] font-semibold uppercase tracking-[0.3em] text-amber-100/55 sm:text-[0.6rem]"
                  >
                    Control Codex
                  </p>
                  <p className="game-hud-strip__helper text-[0.7rem] leading-4 text-white/42 sm:text-[0.74rem]">
                    {controlsHelperText}
                  </p>
                </div>

                <ul className="game-hud-strip__list mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:mt-3 sm:gap-x-4 sm:gap-y-2 lg:flex-nowrap lg:justify-between lg:gap-x-3">
                  {CONTROL_GROUPS.map((group, index) => (
                    <li
                      key={group.id}
                      className="game-hud-strip__item"
                      style={{ '--hud-item-delay': `${120 + (index * 35)}ms` }}
                    >
                      <div className="game-hud-strip__keys" aria-label={`${group.label} keys`}>
                        <kbd className="game-hud-keycap game-hud-keycap--combo">
                          {group.keys.map(key => key.label).join(' / ')}
                        </kbd>
                      </div>

                      <div className="game-hud-strip__meta">
                        <span className="game-hud-strip__label">{group.label}</span>
                        {group.note && <span className="game-hud-strip__note">{group.note}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-sm text-gray-400">
        Built with <a href="https://phaser.io" target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200 font-semibold">Phaser 4</a>
      </footer>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import gameConfig, { GAMEPLAY_CAPTURE_KEYS } from '../game/config.js';
import { LEVEL_POWERUP_IDS, Level1 } from '../game/scenes/Level1.js';
import { TitleScene } from '../game/scenes/TitleScene.js';
import { eventBridge } from '../game/events.js';
import { resumePowerups } from '../data/resumePowerups.js';
import { useMobileGameDevice } from '../hooks/useMobileGameDevice.js';
import GameHeader from './GameHeader.jsx';
import MobileRotatePrompt from './MobileRotatePrompt.jsx';
import MobileTouchControls from './MobileTouchControls.jsx';
import ObjectiveScreen from './ObjectiveScreen.jsx';
import HallOfFameModal from './HallOfFameModal.jsx';
import PauseMenuOverlay from './PauseMenuOverlay.jsx';
import ResumeCard from './ResumeCard.jsx';
import { CompletionScreen } from './ResumeQuestOverlays.jsx';
import {
  createHighScoreSession,
  fetchHighScores,
  formatCompletionTime,
  getDeviceType,
  getProvisionalRank,
  reportHighScoreSessionProgress,
  qualifiesForLeaderboard,
  submitHighScore,
} from '../services/highScoreService.js';

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

const MOBILE_CONTROL_GROUPS = [
  {
    id: 'movement',
    label: 'Move',
    keys: [
      { label: '←' },
      { label: '→' },
    ],
  },
  {
    id: 'jump',
    label: 'Jump',
    keys: [{ label: 'Tap' }],
  },
  {
    id: 'attack',
    label: 'Attack',
    keys: [{ label: 'Strike' }],
  },
  {
    id: 'dash',
    label: 'Dash',
    keys: [{ label: 'Burst' }],
  },
  {
    id: 'throw',
    label: 'Throw',
    note: '5 / life',
    keys: [{ label: 'Cast' }],
  },
  {
    id: 'defend',
    label: 'Defend',
    keys: [{ label: 'Guard' }],
  },
];

const PHASE_HELPER_COPY = {
  title: 'Begin your journey from the title screen within the game world.',
  objective: 'Read the quest briefing, then begin the journey.',
  portal: 'The final portal stirs within the realm. Step through it to complete the quest.',
  playing: 'Collect powerups to uncover the path of your resume.',
};

const MOBILE_PHASE_HELPER_COPY = {
  title: 'Begin from the title screen, then rotate when prompted.',
  rotate: 'Landscape unlocks the quest briefing.',
  objective: 'Read the quest briefing, then begin the journey.',
  portal: 'The final portal stirs within the realm. Step through it to complete the quest.',
  playing: 'Use the on-screen controls to move, jump, strike, dash, throw, and guard.',
};

function normalizeCompletionRun(payload = {}) {
  const completionTimeMs = Number(payload.completion_time_ms ?? payload.completionTimeMs ?? 0);

  if (!completionTimeMs) {
    return null;
  }

  return {
    completionTimeMs,
    completionTimeDisplay: payload.completion_time_display
      || payload.completionTimeDisplay
      || formatCompletionTime(completionTimeMs),
    deathCount: Number(payload.death_count ?? payload.deathCount ?? 0),
    codexesCollected: Number(payload.codexes_collected ?? payload.codexesCollected ?? 0),
    totalCodexes: Number(payload.total_codexes ?? payload.totalCodexes ?? LEVEL_POWERUP_IDS.length),
  };
}

const EMPTY_COMPLETION_LEADERBOARD = {
  checked: false,
  loading: false,
  error: '',
  scores: [],
  qualified: null,
  provisionalRank: null,
};

const EMPTY_RECORD_STATE = {
  submitting: false,
  accepted: false,
  rank: null,
  message: '',
  error: '',
};

export default function GameContainer() {
  const gameInstanceRef = useRef(null);
  const gameAreaRef = useRef(null);
  const gameFrameRef = useRef(null);
  const lastHeroHoverAtRef = useRef(0);
  const pendingStartRef = useRef(false);
  const runSessionRef = useRef(null);
  const mobileDeviceRef = useRef(false);
  const landscapeRef = useRef(true);
  const [gamePhase, setGamePhase] = useState('title');
  const [gameBootError, setGameBootError] = useState(null);
  const [isGameAudioPanelOpen, setIsGameAudioPanelOpen] = useState(false);
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false);
  const [isHallOfFameOpen, setIsHallOfFameOpen] = useState(false);
  const [hallOfFameScores, setHallOfFameScores] = useState([]);
  const [hallOfFameLoading, setHallOfFameLoading] = useState(false);
  const [hallOfFameError, setHallOfFameError] = useState('');
  const [currentPowerup, setCurrentPowerup] = useState(null);
  const [collectedPowerups, setCollectedPowerups] = useState([]);
  const [completionPowerups, setCompletionPowerups] = useState([]);
  const [completionRun, setCompletionRun] = useState(null);
  const [completionLeaderboard, setCompletionLeaderboard] = useState(EMPTY_COMPLETION_LEADERBOARD);
  const [recordState, setRecordState] = useState(EMPTY_RECORD_STATE);
  const { isMobileGameDevice, isLandscape } = useMobileGameDevice();

  const loadHallOfFameScores = useCallback(async () => {
    setHallOfFameLoading(true);
    setHallOfFameError('');

    try {
      const payload = await fetchHighScores();
      setHallOfFameScores(payload.scores || []);
    } catch (error) {
      setHallOfFameError(error.message || 'The Hall of Fame could not be loaded.');
    } finally {
      setHallOfFameLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isHallOfFameOpen) {
      return;
    }

    const loadTimer = window.setTimeout(() => {
      loadHallOfFameScores();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [isHallOfFameOpen, loadHallOfFameScores]);

  useEffect(() => {
    if (!completionRun?.completionTimeMs) {
      return;
    }

    let isActive = true;

    const loadTimer = window.setTimeout(() => {
      setCompletionLeaderboard(prev => ({
        ...prev,
        loading: true,
        error: '',
      }));

      fetchHighScores()
        .then((payload) => {
          if (!isActive) {
            return;
          }

          const scores = payload.scores || [];
          const qualified = qualifiesForLeaderboard(scores, completionRun.completionTimeMs);
          const provisionalRank = qualified
            ? getProvisionalRank(scores, completionRun.completionTimeMs)
            : null;

          setCompletionLeaderboard({
            checked: true,
            loading: false,
            error: '',
            scores,
            qualified,
            provisionalRank,
          });
        })
        .catch((error) => {
          if (!isActive) {
            return;
          }

          setCompletionLeaderboard({
            checked: true,
            loading: false,
            error: error.message || 'The Hall of Fame could not be loaded.',
            scores: [],
            qualified: null,
            provisionalRank: null,
          });
        });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(loadTimer);
    };
  }, [completionRun?.completionTimeMs]);

  useEffect(() => {
    mobileDeviceRef.current = isMobileGameDevice;
    landscapeRef.current = isLandscape;
  }, [isMobileGameDevice, isLandscape]);

  useEffect(() => {
    const lockViewport = isMobileGameDevice && gamePhase !== 'title';
    document.documentElement.classList.toggle('game-mobile-viewport-lock', lockViewport);
    document.body.classList.toggle('game-mobile-viewport-lock', lockViewport);

    if (lockViewport) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    return () => {
      document.documentElement.classList.remove('game-mobile-viewport-lock');
      document.body.classList.remove('game-mobile-viewport-lock');
    };
  }, [gamePhase, isMobileGameDevice]);

  useEffect(() => {
    const keyboard = gameInstanceRef.current?.input?.keyboard;

    if (!keyboard) {
      return;
    }

    if (gamePhase === 'complete') {
      keyboard.removeCapture?.(GAMEPLAY_CAPTURE_KEYS);
      keyboard.enabled = false;
      return () => {
        keyboard.enabled = true;
        keyboard.addCapture?.(GAMEPLAY_CAPTURE_KEYS);
      };
    }

    keyboard.enabled = true;
    keyboard.addCapture?.(GAMEPLAY_CAPTURE_KEYS);

    return undefined;
  }, [gamePhase]);

  const focusGameArea = useCallback(() => {
    if (mobileDeviceRef.current) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else {
      gameAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    window.requestAnimationFrame(() => {
      gameAreaRef.current?.focus({ preventScroll: true });
    });
  }, []);

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

  const reportRunProgress = useCallback(async (eventType, payload = {}) => {
    const runSession = runSessionRef.current;

    if (!runSession?.sessionId || !runSession?.submissionToken) {
      return;
    }

    try {
      await reportHighScoreSessionProgress({
        sessionId: runSession.sessionId,
        submissionToken: runSession.submissionToken,
        eventType,
        codexesCollected: payload.codexesCollected,
        totalCodexes: payload.totalCodexes,
        deathCount: payload.deathCount,
      });
    } catch {
      // Leave the run playable even if verification progress cannot be reported.
    }
  }, []);

  const requestMobileFullscreen = useCallback(() => {
    if (!mobileDeviceRef.current) {
      return;
    }

    const target = gameFrameRef.current || gameAreaRef.current;
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

    if (!target || fullscreenElement) {
      return;
    }

    const fullscreenRequest = target.requestFullscreen || target.webkitRequestFullscreen;

    if (typeof fullscreenRequest !== 'function') {
      return;
    }

    fullscreenRequest.call(target)
      .catch?.(() => {});
  }, []);

  useEffect(() => {
    // Only initialize if not already done
    if (gameInstanceRef.current) {
      return;
    }

    const handleCollectibleCollected = (powerup) => {
      setCurrentPowerup(powerup);
      setCollectedPowerups((prev) => {
        const next = prev.includes(powerup.id) ? prev : [...prev, powerup.id];
        void reportRunProgress('codex_collected', {
          codexesCollected: next.length,
          totalCodexes: LEVEL_POWERUP_IDS.length,
        });
        return next;
      });
    };

    const handlePortalOpen = () => {
      setGamePhase('portal');
    };

    const handleBossDefeated = (payload = {}) => {
      const run = normalizeCompletionRun(payload);

      void reportRunProgress('boss_defeated', {
        codexesCollected: Number(payload.codexes_collected ?? payload.codexesCollected ?? LEVEL_POWERUP_IDS.length),
        totalCodexes: Number(payload.total_codexes ?? payload.totalCodexes ?? LEVEL_POWERUP_IDS.length),
      });

      if (run) {
        setCompletionRun(run);
        setRecordState(EMPTY_RECORD_STATE);
      }
    };

    const handlePlayerDied = ({ death_count: deathCount, deathCount: fallbackDeathCount } = {}) => {
      void reportRunProgress('player_died', {
        deathCount: Number(deathCount ?? fallbackDeathCount ?? 0),
      });
    };

    const handleQuestComplete = ({ powerups = [], ...payload } = {}) => {
      const completedIds = powerups.map(powerup => powerup.id);
      const run = normalizeCompletionRun(payload);
      setCurrentPowerup(null);
      setIsGameAudioPanelOpen(false);
      setCollectedPowerups(prev => (completedIds.length > 0 ? completedIds : prev));
      setCompletionPowerups(powerups);
      if (run) {
        setCompletionRun(prev => prev ?? run);
      }
      setGamePhase('complete');
    };

    const handleGameAudioPanel = ({ visible = false } = {}) => {
      setIsGameAudioPanelOpen(Boolean(visible));
    };

    const handlePauseChange = ({ paused = false } = {}) => {
      setIsPauseMenuOpen(Boolean(paused));
    };

    const handleHallOfFameOpen = () => {
      setIsHallOfFameOpen(true);
    };

    const handleTitleBegin = () => {
      setGamePhase(
        mobileDeviceRef.current && !landscapeRef.current
          ? 'rotate'
          : 'objective'
      );
    };

    const handleGameReady = async () => {
      if (!pendingStartRef.current) {
        return;
      }

      pendingStartRef.current = false;

      try {
        const payload = await createHighScoreSession();
        runSessionRef.current = {
          sessionId: payload.session_id,
          submissionToken: payload.submission_token,
          expiresAt: payload.expires_at,
        };
      } catch {
        runSessionRef.current = null;
      }

      eventBridge.emit('game:start');
    };

    eventBridge.on('collectible:collected', handleCollectibleCollected);
    eventBridge.on('title:begin', handleTitleBegin);
    eventBridge.on('game:ready', handleGameReady);
    eventBridge.on('player:died', handlePlayerDied);
    eventBridge.on('quest:boss-defeated', handleBossDefeated);
    eventBridge.on('quest:portal-open', handlePortalOpen);
    eventBridge.on('quest:complete', handleQuestComplete);
    eventBridge.on('game:audio-panel', handleGameAudioPanel);
    eventBridge.on('game:pause-change', handlePauseChange);
    eventBridge.on('hall-of-fame:open', handleHallOfFameOpen);

    let bootErrorFrame = null;

    try {
      const game = new Phaser.Game({
        ...gameConfig,
        scene: [TitleScene, Level1],
      });

      gameInstanceRef.current = game;
    } catch (error) {
      console.error('Failed to initialize Phaser game:', error);
      const bootError = error instanceof Error ? error : new Error('Unable to initialize the game.');
      bootErrorFrame = window.requestAnimationFrame(() => {
        setGameBootError(bootError);
      });
    }

    // Cleanup on unmount
    return () => {
      if (bootErrorFrame !== null) {
        window.cancelAnimationFrame(bootErrorFrame);
      }

      eventBridge.off('collectible:collected', handleCollectibleCollected);
      eventBridge.off('title:begin', handleTitleBegin);
      eventBridge.off('game:ready', handleGameReady);
      eventBridge.off('player:died', handlePlayerDied);
      eventBridge.off('quest:boss-defeated', handleBossDefeated);
      eventBridge.off('quest:portal-open', handlePortalOpen);
      eventBridge.off('quest:complete', handleQuestComplete);
      eventBridge.off('game:audio-panel', handleGameAudioPanel);
      eventBridge.off('game:pause-change', handlePauseChange);
      eventBridge.off('hall-of-fame:open', handleHallOfFameOpen);

      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gamePhase !== 'rotate' || !isMobileGameDevice || !isLandscape) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setGamePhase('objective');
      focusGameArea();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusGameArea, gamePhase, isLandscape, isMobileGameDevice]);

  const continueAfterPowerup = () => {
    setCurrentPowerup(null);
    setIsGameAudioPanelOpen(false);

    window.requestAnimationFrame(() => {
      focusGameArea();

      if (!resumePhaserScene()) {
        eventBridge.emit('powerup:continue');
      }
    });
  };

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

  const unlockGameFromGesture = useCallback(() => {
    requestMobileFullscreen();
    eventBridge.emit('ui:press-start');
    focusGameArea();
  }, [focusGameArea, requestMobileFullscreen]);

  const handleHeroPressStart = useCallback(() => {
    unlockGameFromGesture();
  }, [unlockGameFromGesture]);

  const handleBeginJourney = useCallback(() => {
    requestMobileFullscreen();

    if (isMobileGameDevice && !isLandscape) {
      setGamePhase('rotate');
      focusGameArea();
      return;
    }

    setGamePhase('playing');
    pendingStartRef.current = true;
    eventBridge.emit('objective:begin-journey');
    focusGameArea();
  }, [focusGameArea, isLandscape, isMobileGameDevice, requestMobileFullscreen]);

  const handlePauseRequest = useCallback(() => {
    eventBridge.emit('game:pause-request');
  }, []);

  const handlePauseResume = useCallback(() => {
    eventBridge.emit('game:pause-resume');
  }, []);

  const handlePauseRestartCheckpoint = useCallback(() => {
    eventBridge.emit('game:pause-restart-checkpoint');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGamePhase('title');
    setCurrentPowerup(null);
    setIsPauseMenuOpen(false);
    setIsGameAudioPanelOpen(false);
    setCollectedPowerups([]);
    setCompletionPowerups([]);
    setCompletionRun(null);
    setCompletionLeaderboard(EMPTY_COMPLETION_LEADERBOARD);
    setRecordState(EMPTY_RECORD_STATE);
    runSessionRef.current = null;
    pendingStartRef.current = false;
    gameInstanceRef.current?.scene.stop('Level1');
    gameInstanceRef.current?.scene.start('TitleScene');
  }, []);

  const handleRecordRun = useCallback(async ({ playerName, location }) => {
    if (!completionRun?.completionTimeMs) {
      return;
    }

    const runSession = runSessionRef.current;

    if (!runSession?.sessionId || !runSession?.submissionToken) {
      setRecordState({
        ...EMPTY_RECORD_STATE,
        error: 'Run verification is unavailable for this attempt. Please play again to submit a verified Hall of Fame run.',
      });
      return;
    }

    setRecordState({
      ...EMPTY_RECORD_STATE,
      submitting: true,
    });

    try {
      const payload = await submitHighScore({
        sessionId: runSession.sessionId,
        submissionToken: runSession.submissionToken,
        playerName,
        location,
        completionTimeMs: completionRun.completionTimeMs,
        deviceType: getDeviceType(isMobileGameDevice),
        deathCount: completionRun.deathCount,
        codexesCollected: completionRun.codexesCollected,
        totalCodexes: completionRun.totalCodexes,
      });

      if (!payload.accepted) {
        runSessionRef.current = null;
        setRecordState({
          ...EMPTY_RECORD_STATE,
          error: payload.message || 'That run no longer qualifies for the Hall of Fame.',
        });
        setCompletionLeaderboard(prev => ({
          ...prev,
          qualified: false,
        }));
        return;
      }

      setRecordState({
        submitting: false,
        accepted: true,
        rank: payload.rank,
        message: payload.message || 'Your legend has been recorded.',
        error: '',
      });
      runSessionRef.current = null;

      fetchHighScores()
        .then((refreshed) => {
          setCompletionLeaderboard(prev => ({
            ...prev,
            scores: refreshed.scores || prev.scores,
            provisionalRank: payload.rank,
          }));
          setHallOfFameScores(refreshed.scores || []);
        })
        .catch(() => {});
    } catch (error) {
      setRecordState({
        ...EMPTY_RECORD_STATE,
        error: error.message || 'Your run could not be recorded. Please try again.',
      });
    }
  }, [completionRun, isMobileGameDevice]);

  const helperCopy = isMobileGameDevice ? MOBILE_PHASE_HELPER_COPY : PHASE_HELPER_COPY;
  const controlsHelperText = gamePhase === 'title'
    ? helperCopy.title
    : gamePhase === 'rotate'
    ? helperCopy.rotate
    : gamePhase === 'objective'
    ? helperCopy.objective
    : gamePhase === 'portal'
    ? helperCopy.portal
    : helperCopy.playing;

  const collectedPowerupObjects = resumePowerups.filter(powerup => collectedPowerups.includes(powerup.id));
  const completionList = completionPowerups.length > 0 ? completionPowerups : collectedPowerupObjects;
  const activeControlGroups = isMobileGameDevice ? MOBILE_CONTROL_GROUPS : CONTROL_GROUPS;
  const controlHeading = isMobileGameDevice ? 'Touch Codex' : 'Control Codex';
  const mobileTouchControlsVisible = isMobileGameDevice
    && isLandscape
    && (gamePhase === 'playing' || gamePhase === 'portal')
    && !currentPowerup
    && !isGameAudioPanelOpen
    && !isPauseMenuOpen;
  const shellClasses = [
    'min-h-screen overflow-hidden bg-[#07080c] text-white',
    isMobileGameDevice ? 'game-shell--mobile' : 'game-shell--desktop',
    isLandscape ? 'game-shell--landscape' : 'game-shell--portrait',
    `game-phase-${gamePhase}`,
  ].join(' ');

  return (
    <div className={shellClasses}>
      <GameHeader
        onActionHover={handleHeroActionHover}
        onActionPress={handleHeroActionPress}
        onPressStart={handleHeroPressStart}
      />

      <main className="game-shell__main px-4 pb-10 sm:px-6 lg:pb-14">
        <section
          ref={gameAreaRef}
          tabIndex={-1}
          aria-label="Samurai Greg Phaser game"
          className="game-stage-section mx-auto w-full max-w-5xl scroll-mt-6 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-orange-300"
        >
          <div className="game-stage-progress mb-3 text-center text-sm text-gray-400">
            Skills collected: {collectedPowerups.length} / {LEVEL_POWERUP_IDS.length}
          </div>
          <div className="game-stage-shell relative overflow-hidden rounded-[1.65rem] border border-orange-200/12 bg-[#050607] shadow-[0_28px_95px_rgba(0,0,0,0.62),0_0_65px_rgba(251,146,60,0.08)]">
            <div ref={gameFrameRef} className="game-stage-shell__frame relative aspect-[1024/600] w-full overflow-hidden bg-black">
              {!gameBootError && <div id="phaser-container" className="h-full w-full bg-black" />}
              {gameBootError && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[#050607] px-6 text-center text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">Game Unavailable</p>
                  <h2 className="max-w-xl text-2xl font-bold text-amber-50 sm:text-3xl">The interactive game failed to load on this device.</h2>
                  <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                    Open the resume or contact page using the header actions while the game boot issue is investigated.
                  </p>
                </div>
              )}
              {!gameBootError && gamePhase === 'objective' && (
                <ObjectiveScreen onBeginJourney={handleBeginJourney} onBeginJourneyGesture={unlockGameFromGesture} />
              )}
              {!gameBootError && gamePhase === 'rotate' && (
                <MobileRotatePrompt />
              )}
              {!gameBootError && gamePhase === 'complete' && (
                <CompletionScreen
                  collectedPowerups={completionList}
                  completionRun={completionRun}
                  leaderboardState={completionLeaderboard}
                  recordState={recordState}
                  onRecordRun={handleRecordRun}
                  onPlayAgain={handlePlayAgain}
                />
              )}
              {!gameBootError && currentPowerup && (
                <ResumeCard
                  powerup={currentPowerup}
                  onContinue={continueAfterPowerup}
                />
              )}
              {!gameBootError && (
                <MobileTouchControls
                  visible={mobileTouchControlsVisible}
                  onPause={handlePauseRequest}
                />
              )}
              {!gameBootError && (
                <PauseMenuOverlay
                  open={isPauseMenuOpen}
                  isMobile={isMobileGameDevice}
                  onResume={handlePauseResume}
                  onRestartCheckpoint={handlePauseRestartCheckpoint}
                />
              )}
              {!gameBootError && (
                <HallOfFameModal
                  open={isHallOfFameOpen}
                  scores={hallOfFameScores}
                  loading={hallOfFameLoading}
                  error={hallOfFameError}
                  onClose={() => setIsHallOfFameOpen(false)}
                  onRefresh={loadHallOfFameScores}
                />
              )}
            </div>

            <aside
              aria-labelledby="quest-controls-heading"
              className={`game-hud-strip relative border-t border-white/6 px-3 py-3 sm:px-4 sm:py-3.5 lg:px-5 ${isMobileGameDevice ? 'game-hud-strip--mobile' : 'game-hud-strip--desktop'}`}
            >
              <div className="game-hud-strip__inner relative z-10 mx-auto max-w-[70rem]">
                <div className="game-hud-strip__topline flex flex-col items-center gap-1.5 text-center sm:gap-2 lg:flex-row lg:items-center lg:justify-between lg:text-left">
                  <p
                    id="quest-controls-heading"
                    className="game-hud-strip__eyebrow text-[0.56rem] font-semibold uppercase tracking-[0.3em] text-amber-100/55 sm:text-[0.6rem]"
                  >
                    {controlHeading}
                  </p>
                  <p className="game-hud-strip__helper text-[0.7rem] leading-4 text-white/42 sm:text-[0.74rem]">
                    {controlsHelperText}
                  </p>
                </div>

                <ul className="game-hud-strip__list mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:mt-3 sm:gap-x-4 sm:gap-y-2 lg:flex-nowrap lg:justify-between lg:gap-x-3">
                  {activeControlGroups.map((group, index) => (
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
        <span className="mx-2 text-gray-500">|</span>
        <a href="https://github.com/grzeczko/samurai-greg" target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200 font-semibold">GitHub Repo</a>
      </footer>
    </div>
  );
}

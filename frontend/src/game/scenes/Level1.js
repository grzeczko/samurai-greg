import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Collectible } from '../entities/Collectible.js';
import { Enemy } from '../entities/Enemy.js';
import { DemonSamuraiBoss } from '../entities/DemonSamuraiBoss.js';
import { COLORS, PLAYER, WORLD } from '../utils/constants.js';
import { eventBridge } from '../events.js';
import { resumePowerups } from '../../data/resumePowerups.js';
import {
  SFX_KEYS,
  TEXTURE_KEYS,
  createGameAnimations,
  playSfx,
  preloadGameAssets,
} from '../assets.js';
import { createSectionSign } from '../ui/worldVisuals.js';
import { audioManager } from '../audio/AudioManager.js';

const TILE_SIZE = 32;
const WALL_FACE_VISUAL_EXTENSION = 4;
const WALL_JUMP_MARGIN = 2;
const WALL_JUMP_FACE_TOLERANCE = 4;
export const LEVEL_POWERUP_IDS = [
  // ZONE 1: EDUCATION (2 powerups)
  'ccsu',
  'general-assembly',
  // ZONE 2: CORE SKILLS (5 powerups)
  'skills-cloud',
  'skills-frontend',
  'skills-backend',
  'skills-mobile-apps',
  'skills-security',
  // ZONE 3: PROFESSIONAL EXPERIENCE (3 powerups)
  'deloitte',
  'music-battle-x',
  'msg',
  // ZONE 4: EARLIER EXPERIENCE (7 powerups)
  'west-elm',
  'ddb-health',
  'high-5-games',
  'gucci',
  'nickelodeon',
  'conde-nast',
  'earlier-consulting',
  // ZONE 5: ACHIEVEMENTS (1 powerup)
  'selected-achievements',
];

const LEVEL_ZONES = [
  {
    id: 'education',
    label: 'Education Foundation',
    startX: 0,
    endX: 720,
    color: 0x8b5cf6,
    signX: 280,
    signY: WORLD.HEIGHT - 116,
  },
  {
    id: 'skills',
    label: 'Core Technologies',
    startX: 720,
    endX: 1440,
    color: 0x06b6d4,
    signX: 1368,
    signY: WORLD.HEIGHT - 372,
  },
  {
    id: 'experience',
    label: 'Professional Experience',
    startX: 1440,
    endX: 2240,
    color: 0xec4899,
    signX: 1840,
    signY: WORLD.HEIGHT - 168,
  },
  {
    id: 'earlier',
    label: 'Earlier Experience',
    startX: 2240,
    endX: 2880,
    color: 0x10b981,
    signX: 2600,
    signY: WORLD.HEIGHT - 296,
  },
  {
    id: 'achievements',
    label: 'Achievements / Portal',
    startX: 2880,
    endX: WORLD.WIDTH,
    color: 0xf59e0b,
    signX: 2864,
    signY: WORLD.HEIGHT - 168,
  },
];

const PLATFORM_LAYOUT = [
  { x: WORLD.WIDTH / 2, y: WORLD.HEIGHT - 16, width: WORLD.WIDTH, height: 32 },
  { x: 240, y: WORLD.HEIGHT - 100, width: 224, height: 32 },
  { x: 512, y: WORLD.HEIGHT - 176, width: 192, height: 32 },
  { x: 768, y: WORLD.HEIGHT - 88, width: 192, height: 32 },
  { x: 1000, y: WORLD.HEIGHT - 136, width: 64, height: 240, wallJump: true },
  { x: 1184, y: WORLD.HEIGHT - 176, width: 64, height: 304, wallJump: true },
  { x: 1000, y: WORLD.HEIGHT - 368, width: 64, height: 176, wallJump: true },
  { x: 1184, y: WORLD.HEIGHT - 404, width: 64, height: 192, wallJump: true },
  { x: 1368, y: WORLD.HEIGHT - 356, width: 224, height: 32 },
  { x: 1616, y: WORLD.HEIGHT - 260, width: 192, height: 32 },
  { x: 1840, y: WORLD.HEIGHT - 152, width: 224, height: 32 },
  { x: 2080, y: WORLD.HEIGHT - 88, width: 192, height: 32 },
  { x: 2296, y: WORLD.HEIGHT - 168, width: 64, height: 192, wallJump: true },
  { x: 2448, y: WORLD.HEIGHT - 216, width: 64, height: 256, wallJump: true },
  { x: 2600, y: WORLD.HEIGHT - 280, width: 224, height: 32 },
  { x: 2864, y: WORLD.HEIGHT - 152, width: 224, height: 32 },
  { x: 3072, y: WORLD.HEIGHT - 88, width: 192, height: 32 },
  { x: 3432, y: WORLD.HEIGHT - 172, width: 176, height: 32 },
  { x: 3656, y: WORLD.HEIGHT - 236, width: 192, height: 32 },
];

const POWERUP_LAYOUT = {
  // ZONE 1: EDUCATION (2 powerups)
  ccsu: { x: 240, y: WORLD.HEIGHT - 134 },
  'general-assembly': { x: 512, y: WORLD.HEIGHT - 204 },

  // ZONE 2: SKILLS (5 powerups)
  'skills-cloud': { x: 768, y: WORLD.HEIGHT - 104 },
  'skills-frontend': { x: 1368, y: WORLD.HEIGHT - 384 },
  'skills-backend': { x: 1092, y: WORLD.HEIGHT - 236 },
  'skills-mobile-apps': { x: 1354, y: WORLD.HEIGHT - 104 },
  'skills-security': { x: 1840, y: WORLD.HEIGHT - 184 },

  // ZONE 3: PROFESSIONAL EXPERIENCE (3 powerups)
  deloitte: { x: 2080, y: WORLD.HEIGHT - 104 },
  'music-battle-x': { x: 2600, y: WORLD.HEIGHT - 268 },
  msg: { x: 2864, y: WORLD.HEIGHT - 184 },

  // ZONE 4: EARLIER EXPERIENCE (7 powerups)
  'west-elm': { x: 2220, y: WORLD.HEIGHT - 44 },
  'ddb-health': { x: 2360, y: WORLD.HEIGHT - 44 },
  'high-5-games': { x: 2520, y: WORLD.HEIGHT - 308 },
  gucci: { x: 2680, y: WORLD.HEIGHT - 308 },
  nickelodeon: { x: 2820, y: WORLD.HEIGHT - 184 },
  'conde-nast': { x: 3008, y: WORLD.HEIGHT - 104 },
  'earlier-consulting': { x: 3136, y: WORLD.HEIGHT - 104 },

  // ZONE 5: ACHIEVEMENTS (1 powerup)
  'selected-achievements': { x: 2800, y: WORLD.HEIGHT - 184 },
};

const DECOR_LAYOUT = [
  { key: TEXTURE_KEYS.AUTUMN_TREES, frame: 2, x: 1310, y: WORLD.HEIGHT - 32, scale: 1.1, depth: 29 },
  { key: TEXTURE_KEYS.AUTUMN_TREES, frame: 2, x: 1490, y: WORLD.HEIGHT - 32, scale: 1.0, depth: 29, flipX: true },
];

const ENEMY_LAYOUT = [
  { x: 820, y: WORLD.HEIGHT - 190, leftBound: 700, rightBound: 930, speed: 78, phase: 0 },
  { x: 2140, y: WORLD.HEIGHT - 260, leftBound: 1980, rightBound: 2220, speed: 90, phase: 680 },
];

const BOSS_ARENA = {
  triggerX: 3272,
  gateX: 3260,
  checkpointX: 3312,
  checkpointY: WORLD.HEIGHT - 96,
  bossX: 3628,
  bossY: WORLD.HEIGHT - 91,
  leftBound: 3328,
  rightBound: 3772,
  signX: 3444,
  signY: WORLD.HEIGHT - 33,
  portalX: WORLD.WIDTH - 122,
  portalY: WORLD.HEIGHT - 74,
};

export class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1' });
    this.player = null;
    this.enemies = [];
    this.boss = null;
    this.bossTrigger = null;
    this.bossGate = null;
    this.bossGateLabel = null;
    this.bossDarkness = null;
    this.bossIntroTitle = null;
    this.bossIntroSubtitle = null;
    this.bossHealthContainer = null;
    this.bossHealthFill = null;
    this.bossHealthText = null;
    this.portal = null;
    this.portalCore = null;
    this.portalLabel = null;
    this.platforms = null;
    this.wallJumpSurfaces = [];
    this.collectibles = [];
    this.levelPowerups = [];
    this.score = 0;
    this.lives = 3;
    this.isGameActive = false;
    this.isPortalOpen = false;
    this.isQuestComplete = false;
    this.isPlayerInvulnerable = false;
    this.isPlayerDying = false;
    this.isBossArenaReady = false;
    this.isBossEncounterStarted = false;
    this.isBossIntroPlaying = false;
    this.isBossDefeated = false;
    this.isBossResetting = false;
    this.currentCheckpoint = {
      id: 'start',
      x: PLAYER.START_X,
      y: WORLD.HEIGHT - PLAYER.START_Y_OFFSET,
    };
    this.scoreText = null;
    this.livesText = null;
    this.throwsText = null;
    this.statusText = null;
    this.gameMusic = null;
    this.gameSoundButton = null;
    this.gameSoundButtonLabel = null;
    this.gameAudioPanel = null;
    this.gameMusicSlider = null;
    this.gameSfxSlider = null;
    this.gameSoundInlineLabel = null;
    this.gameAudioPanelBounds = null;
    this.handleGamePanelOutsideClick = null;
    this.lastExternalHoverSoundAt = 0;
    this.pendingGameMusicRetry = false;
    this.handleGameUnlockRetry = null;
    this.handleGameUnlockRetryKey = null;
    this.shouldAutoStart = false;
  }

  init(data = {}) {
    this.shouldAutoStart = data.autoStart === true;
  }

  preload() {
    preloadGameAssets(this);
  }

  create() {
    createGameAnimations(this);
    this.score = 0;
    this.lives = 3;
    this.isGameActive = false;
    this.isPortalOpen = false;
    this.isQuestComplete = false;
    this.isPlayerInvulnerable = false;
    this.isPlayerDying = false;
    this.isBossArenaReady = false;
    this.isBossEncounterStarted = false;
    this.isBossIntroPlaying = false;
    this.isBossDefeated = false;
    this.isBossResetting = false;
    this.currentCheckpoint = {
      id: 'start',
      x: PLAYER.START_X,
      y: WORLD.HEIGHT - PLAYER.START_Y_OFFSET,
    };
    this.collectibles = [];
    this.enemies = [];
    this.boss = null;
    this.wallJumpSurfaces = [];
    this.levelPowerups = LEVEL_POWERUP_IDS
      .map(id => resumePowerups.find(powerup => powerup.id === id))
      .filter(Boolean);

    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);

    this.createBackground();
    this.platforms = this.physics.add.staticGroup();
    this.createZoneBackdrops();
    this.createZoneSigns();
    PLATFORM_LAYOUT.forEach(platform => this.createPlatform(platform));
    this.platforms.refresh();
    this.createDecor();

    this.collectibles = this.levelPowerups.map((powerup) => {
      const position = POWERUP_LAYOUT[powerup.id];

      return new Collectible(this, position.x, position.y, powerup.id);
    });

    this.player = new Player(this, PLAYER.START_X, WORLD.HEIGHT - PLAYER.START_Y_OFFSET);
    this.enemies = ENEMY_LAYOUT.map(enemy => new Enemy(this, enemy.x, enemy.y, enemy));
    this.createBossArena();

    this.createHud();
    this.setupEvents();
    this.setupCollisions();
    this.physics.pause();

    this.cameras.main.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
    this.cameras.main.startFollow(this.player.getSprite());
    this.cameras.main.setLerp(0.1, 0);

    if (this.shouldAutoStart) {
      this.startGame();
    }

    eventBridge.emit('game:ready');
  }

  update() {
    if (!this.isGameActive || this.isQuestComplete) {
      return;
    }

    this.player?.update();
    this.enemies.forEach(enemy => enemy.update(this.player.getSprite()));
    this.boss?.update(this.player.getSprite());

    if (this.player.getSprite().y > WORLD.HEIGHT + 100) {
      if (this.currentCheckpoint.id === 'bossArena' && this.isBossEncounterStarted && !this.isBossDefeated) {
        this.handleBossPlayerDefeat();
        return;
      }

      this.resetPlayer('Careful down there.');
    }
  }

  setupEvents() {
    eventBridge.on('game:start', this.startGame, this);
    eventBridge.on('powerup:continue', this.resumeGameplay, this);
    eventBridge.on('codex:open', this.handleCodexOpen, this);
    eventBridge.on('codex:hover', this.handleCodexHover, this);
    eventBridge.on('codex:confirm', this.handleCodexConfirm, this);
    eventBridge.on('ui:menu-hover', this.handleExternalMenuHover, this);
    eventBridge.on('ui:menu-confirm', this.handleExternalMenuConfirm, this);
    eventBridge.on('ui:press-start', this.handleExternalPressStart, this);
    this.installGameUnlockRetryHandlers();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventBridge.off('game:start', this.startGame, this);
      eventBridge.off('powerup:continue', this.resumeGameplay, this);
      eventBridge.off('codex:open', this.handleCodexOpen, this);
      eventBridge.off('codex:hover', this.handleCodexHover, this);
      eventBridge.off('codex:confirm', this.handleCodexConfirm, this);
      eventBridge.off('ui:menu-hover', this.handleExternalMenuHover, this);
      eventBridge.off('ui:menu-confirm', this.handleExternalMenuConfirm, this);
      eventBridge.off('ui:press-start', this.handleExternalPressStart, this);
      this.cleanupLevelAudio();
    });
  }

  setupCollisions() {
    this.physics.add.collider(this.player.getSprite(), this.platforms);
    this.physics.add.collider(this.player.getSprite(), this.bossGate);
    this.physics.add.collider(this.player.getThrowProjectiles(), this.platforms, (projectile) => {
      this.player.destroyThrowProjectile(projectile);
    });

    this.enemies.forEach((enemy) => {
      this.physics.add.collider(enemy.getDaggers(), this.platforms, (projectile) => {
        enemy.destroyProjectile(projectile);
      });
      this.physics.add.overlap(
        this.player.getSprite(),
        enemy.getSprite(),
        () => this.onPlayerHitEnemy(enemy),
        null,
        this
      );
      this.physics.add.overlap(
        this.player.getSwordHitbox(),
        enemy.getSprite(),
        () => this.onSwordHitEnemy(enemy),
        null,
        this
      );
      this.physics.add.overlap(
        this.player.getThrowProjectiles(),
        enemy.getSprite(),
        // Phaser passes the standalone sprite first, then the group child.
        (_enemySprite, projectile) => this.onThrowHitEnemy(enemy, projectile),
        null,
        this
      );
      this.physics.add.overlap(
        this.player.getSprite(),
        enemy.getDaggers(),
        (_playerSprite, projectile) => this.onPlayerHitProjectile(enemy, projectile),
        null,
        this
      );
    });

    this.collectibles.forEach(collectible => {
      this.physics.add.overlap(
        this.player.getSprite(),
        collectible.getSprite(),
        () => this.onCollectibleCollected(collectible),
        null,
        this
      );
    });

    if (this.boss) {
      this.physics.add.collider(this.boss.getSprite(), this.platforms);
      this.physics.add.overlap(
        this.player.getSprite(),
        this.bossTrigger,
        this.onBossArenaEntered,
        null,
        this
      );
      this.physics.add.overlap(
        this.player.getSwordHitbox(),
        this.boss.getSprite(),
        this.onSwordHitBoss,
        null,
        this
      );
      this.physics.add.overlap(
        this.player.getThrowProjectiles(),
        this.boss.getSprite(),
        (_bossSprite, projectile) => this.onThrowHitBoss(projectile),
        null,
        this
      );
      this.physics.add.overlap(
        this.player.getSprite(),
        this.boss.getAttackHitbox(),
        this.onPlayerHitBossAttack,
        null,
        this
      );
    }
  }

  createBackground() {
    this.add.rectangle(WORLD.WIDTH / 2, WORLD.HEIGHT / 2, WORLD.WIDTH, WORLD.HEIGHT, COLORS.BACKGROUND).setDepth(0);

    this.add.tileSprite(WORLD.WIDTH / 2, WORLD.HEIGHT / 2, WORLD.WIDTH, WORLD.HEIGHT, TEXTURE_KEYS.AUTUMN_BG_FAR)
      .setTileScale(3.35, 3.35)
      .setAlpha(0.58)
      .setDepth(1);
    this.add.tileSprite(WORLD.WIDTH / 2, WORLD.HEIGHT / 2, WORLD.WIDTH, WORLD.HEIGHT, TEXTURE_KEYS.AUTUMN_BG_MID)
      .setTileScale(3.35, 3.35)
      .setAlpha(0.34)
      .setDepth(2);
    this.add.tileSprite(WORLD.WIDTH / 2, WORLD.HEIGHT / 2, WORLD.WIDTH, WORLD.HEIGHT, TEXTURE_KEYS.AUTUMN_BG_NEAR)
      .setTileScale(3.35, 3.35)
      .setAlpha(0.38)
      .setDepth(3);
  }

  onCollectibleCollected(collectible) {
    if (!collectible.collect()) {
      return;
    }

    this.score += 100;
    playSfx(this, SFX_KEYS.PICKUP, { volume: 0.34 });
    eventBridge.emit('collectible:collected', collectible.powerup);
    this.collectibles = this.collectibles.filter(c => c !== collectible);
    this.updateHud('Powerup collected!');

    if (this.collectibles.length === 0) {
      this.unlockBossArena();
    }

    this.pauseForPowerupCard();
  }

  createPlatform({ x, y, width, height, wallJump = false }) {
    const platform = this.add.rectangle(x, y, width, height, 0x000000, 0).setVisible(false);

    this.platforms.add(platform);
    platform.body.updateFromGameObject();
    this.paintTerrain(x, y, width, height, wallJump);

    if (wallJump) {
      this.wallJumpSurfaces.push({ x, y, width, height });
    }

    return platform;
  }

  paintTerrain(x, y, width, height, extendFaces = false) {
    const cols = Math.max(1, Math.round(width / TILE_SIZE));
    const rows = Math.max(1, Math.round(height / TILE_SIZE));
    const left = x - (cols * TILE_SIZE) / 2;
    const top = y - (rows * TILE_SIZE) / 2;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        this.add.image(
          left + (col * TILE_SIZE) + (TILE_SIZE / 2),
          top + (row * TILE_SIZE) + (TILE_SIZE / 2),
          TEXTURE_KEYS.AUTUMN_TILES,
          this.getTerrainFrame(row, col, rows, cols)
        ).setDepth(9);
      }
    }

    if (extendFaces) {
      this.paintWallFaceExtensions(left, top, rows, cols);
    }
  }

  paintWallFaceExtensions(left, top, rows, cols) {
    for (let row = 0; row < rows; row += 1) {
      const centerY = top + (row * TILE_SIZE) + (TILE_SIZE / 2);

      this.add.image(
        left + (TILE_SIZE / 2) - WALL_FACE_VISUAL_EXTENSION,
        centerY,
        TEXTURE_KEYS.AUTUMN_TILES,
        this.getTerrainFrame(row, 0, rows, cols)
      ).setDepth(10);

      this.add.image(
        left + ((cols - 1) * TILE_SIZE) + (TILE_SIZE / 2) + WALL_FACE_VISUAL_EXTENSION,
        centerY,
        TEXTURE_KEYS.AUTUMN_TILES,
        this.getTerrainFrame(row, cols - 1, rows, cols)
      ).setDepth(10);
    }
  }

  getTerrainFrame(row, col, rows, cols) {
    const isLeft = col === 0;
    const isRight = col === cols - 1;

    // The Autumn tileset is a 32px grid. Frame 0 is transparent, so left
    // edges start at frame 1 to keep terrain art aligned with collision.
    if (row === 0 || rows === 1) {
      if (cols === 1) return 2;
      if (isLeft) return 1;
      if (isRight) return 3;

      return 2;
    }

    if (row === rows - 1) {
      if (cols === 1) return 28;
      if (isLeft) return 27;
      if (isRight) return 29;

      return 28;
    }

    if (cols === 1) return 15;
    if (isLeft) return 14;
    if (isRight) return 16;

    return 15;
  }

  createZoneBackdrops() {
    LEVEL_ZONES.forEach((zone) => {
      this.add.rectangle(
        zone.startX + ((zone.endX - zone.startX) / 2),
        WORLD.HEIGHT / 2,
        zone.endX - zone.startX,
        WORLD.HEIGHT,
        zone.color,
        0.07
      ).setDepth(4);

      if (zone.startX > 0) {
        this.add.rectangle(zone.startX, WORLD.HEIGHT / 2, 2, WORLD.HEIGHT - 80, 0xffffff, 0.12).setDepth(5);
      }
    });
  }

  getWallJumpSideForPlayer(playerSprite) {
    const body = playerSprite?.body;

    if (!body) {
      return 0;
    }

    const playerLeft = body.x;
    const playerRight = body.x + body.width;
    const playerTop = body.y;
    const playerBottom = body.y + body.height;

    for (const wall of this.wallJumpSurfaces) {
      const wallLeft = wall.x - (wall.width / 2);
      const wallRight = wall.x + (wall.width / 2);
      const wallTop = wall.y - (wall.height / 2);
      const wallBottom = wall.y + (wall.height / 2);
      const overlapsVertically = playerBottom > wallTop - 24 && playerTop < wallBottom + 24;

      if (!overlapsVertically) {
        continue;
      }

      const nearLeftFace = playerRight >= wallLeft - WALL_JUMP_MARGIN
        && playerRight <= wallLeft + WALL_JUMP_FACE_TOLERANCE;
      const nearRightFace = playerLeft <= wallRight + WALL_JUMP_MARGIN
        && playerLeft >= wallRight - WALL_JUMP_FACE_TOLERANCE;

      if (nearLeftFace) {
        return 1;
      }

      if (nearRightFace) {
        return -1;
      }
    }

    return 0;
  }

  createZoneSigns() {
    LEVEL_ZONES.forEach((zone) => {
      this.createZoneSign(zone.signX, zone.signY ?? WORLD.HEIGHT - 220, zone.label, zone.color);
    });
  }

  createDecor() {
    DECOR_LAYOUT.forEach(({ key, frame, x, y, scale = 1, depth = 8, flipX = false }) => {
      this.add.image(x, y, key, frame)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setFlipX(flipX)
        .setDepth(depth)
        .setAlpha(0.96);
    });
  }

  createBossArena() {
    const arenaStart = BOSS_ARENA.gateX;
    const arenaWidth = WORLD.WIDTH - arenaStart;

    this.add.rectangle(
      arenaStart + (arenaWidth / 2),
      WORLD.HEIGHT / 2,
      arenaWidth,
      WORLD.HEIGHT,
      0x09040a,
      0.18
    ).setDepth(4.5);

    this.createZoneSign(BOSS_ARENA.signX, BOSS_ARENA.signY, 'Gatekeeper of the Golden Resume', 0xef4444);

    this.bossTrigger = this.add.zone(BOSS_ARENA.triggerX, WORLD.HEIGHT / 2, 42, WORLD.HEIGHT);
    this.physics.add.existing(this.bossTrigger, true);

    this.bossGate = this.add.rectangle(
      BOSS_ARENA.gateX,
      WORLD.HEIGHT - 168,
      28,
      304,
      0x12070a,
      0
    )
      .setStrokeStyle(2, 0xf97316, 0)
      .setDepth(28);
    this.physics.add.existing(this.bossGate, true);
    this.bossGate.body.enable = false;

    this.bossGateLabel = this.add.text(BOSS_ARENA.gateX, WORLD.HEIGHT - 338, 'SEALED', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fecaca',
      stroke: '#1f0508',
      strokeThickness: 4,
    })
      .setOrigin(0.5)
      .setDepth(29)
      .setAlpha(0);

    this.portal = this.add.circle(BOSS_ARENA.portalX, BOSS_ARENA.portalY, 42, 0xfacc15, 0.08).setDepth(13);
    this.portalCore = this.add.circle(BOSS_ARENA.portalX, BOSS_ARENA.portalY, 18, 0xfef3c7, 0.12).setDepth(14);
    this.portalLabel = this.add.text(BOSS_ARENA.portalX, BOSS_ARENA.portalY - 62, 'GOLDEN RESUME', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fff7ad',
      stroke: '#3f2602',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(32).setAlpha(0);

    this.boss = new DemonSamuraiBoss(this, BOSS_ARENA.bossX, BOSS_ARENA.bossY, {
      leftBound: BOSS_ARENA.leftBound,
      rightBound: BOSS_ARENA.rightBound,
    });
  }

  createZoneSign(x, y, label, color) {
    try {
      return createSectionSign(this, x, y, label, color);
    } catch (error) {
      console.error('Failed to create custom zone sign:', error);

      const signWidth = Phaser.Math.Clamp((label.length * 9) + 44, 190, 280);
      const fontSize = label.length > 22 ? '15px' : '17px';
      const rodHeight = 44;
      const signHeight = 44;
      const rodBottomY = y - 2;
      const rodCenterY = rodBottomY - (rodHeight / 2);
      const signCenterY = rodCenterY - (rodHeight / 2) - 8 - (signHeight / 2);

      this.add.rectangle(x, rodCenterY, 8, rodHeight, 0x111827, 0.9).setDepth(14);
      this.add.rectangle(x, signCenterY, signWidth, signHeight, 0x111827, 0.92)
        .setStrokeStyle(2, color, 0.85)
        .setDepth(15);

      return this.add.text(x, signCenterY, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize,
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(16);
    }
  }

  startGame() {
    if (this.isQuestComplete) {
      return;
    }

    this.isGameActive = true;
    this.physics.resume();
    this.updateHud('Collect the career powerups.');
  }

  pauseForPowerupCard() {
    if (this.isQuestComplete) {
      return;
    }

    this.isGameActive = false;
    this.player.getSprite().body.setVelocity(0, 0);
    this.player.getSwordHitbox().body.enable = false;
    this.enemies.forEach(enemy => enemy.clearDaggers());
    this.physics.pause();
  }

  resumeGameplay() {
    if (this.isQuestComplete) {
      return;
    }

    this.isGameActive = true;
    this.enemies.forEach(enemy => enemy.resumePatrol());
    this.physics.resume();
    this.updateHud(
      this.isPortalOpen
        ? 'Find the final portal.'
        : this.isBossArenaReady
          ? 'Reach the final gate.'
          : 'Keep collecting powerups.'
    );
  }

  handleCodexOpen({ rarity = 'default' } = {}) {
    audioManager.playSfx(this, SFX_KEYS.PICKUP, {
      volume: 0.045,
      rate: 0.82,
      detune: -220,
    }, {
      category: 'ui',
      minInterval: 140,
    });

    audioManager.playSfx(this, SFX_KEYS.MENU_CONFIRM, {
      volume: 0.055,
      rate: 0.88,
      detune: -120,
    }, {
      category: 'ui',
      minInterval: 140,
    });

    const rarityAccent = {
      uncommon: { key: SFX_KEYS.PICKUP, volume: 0.032, rate: 0.88, detune: -170 },
      rare: { key: SFX_KEYS.FIREBALL_CAST, volume: 0.035, rate: 1.02, detune: 60 },
      epic: { key: SFX_KEYS.PORTAL, volume: 0.042, rate: 0.78, detune: -210 },
      legendary: { key: SFX_KEYS.PORTAL, volume: 0.06, rate: 0.7, detune: -300 },
    }[rarity];

    if (!rarityAccent) {
      return;
    }

    audioManager.playSfx(this, rarityAccent.key, rarityAccent, {
      category: 'ui',
      minInterval: 180,
    });
  }

  handleCodexHover() {
    audioManager.playSfx(this, SFX_KEYS.MENU_HOVER, {
      volume: 0.045,
      rate: 1.05,
      detune: 20,
    }, {
      category: 'ui',
      minInterval: 90,
    });
  }

  handleCodexConfirm({ rarity = 'default', action = 'continue' } = {}) {
    audioManager.playSfx(this, SFX_KEYS.MENU_CONFIRM, {
      volume: action === 'continue' ? 0.13 : 0.11,
      rate: action === 'continue' ? 0.96 : 1,
    }, {
      category: 'ui',
      minInterval: 120,
    });

    if (rarity === 'epic' || rarity === 'legendary') {
      audioManager.playSfx(this, SFX_KEYS.PORTAL, {
        volume: rarity === 'legendary' ? 0.05 : 0.035,
        rate: rarity === 'legendary' ? 0.74 : 0.82,
        detune: rarity === 'legendary' ? -260 : -160,
      }, {
        category: 'ui',
        minInterval: 160,
      });
    }
  }

  createHud() {
    const textStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 4,
    };

    this.scoreText = this.add.text(18, 16, '', textStyle).setScrollFactor(0).setDepth(1000);
    this.livesText = this.add.text(18, 44, '', textStyle).setScrollFactor(0).setDepth(1000);
    this.throwsText = this.add.text(18, 72, '', {
      ...textStyle,
      fontSize: '18px',
      color: '#fde68a',
    }).setScrollFactor(0).setDepth(1000);
    this.statusText = this.add.text(this.scale.width / 2, 22, '', {
      ...textStyle,
      fontSize: '18px',
      color: '#facc15',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

    this.createSoundToggleHud();
    this.createBossHud();
    this.startGameMusic();

    this.updateHud('Collect the career powerups.');
  }

  createSoundToggleHud() {
    const layout = this.getGameAudioPanelLayout();
    const x = this.scale.width - 54;
    const y = 50;
    const panelX = Phaser.Math.Clamp(x - layout.width, 8, this.scale.width - layout.width - 8);
    const panelY = y + 70;
    const buttonGlow = this.add.circle(x, y, 27, 0xf59e0b, 0.08)
      .setScrollFactor(0)
      .setDepth(1001);
    const button = this.add.circle(x, y, 21, 0x090b11, 0.84)
      .setStrokeStyle(1, 0xf3d38b, 0.48)
      .setScrollFactor(0)
      .setDepth(1002)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y - 0.5, 'AUD', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#f7d6dc',
      letterSpacing: 0.8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1003);

    button.on('pointerover', () => {
      button.setFillStyle(0x151b25, 0.96);
      buttonGlow.setFillStyle(0xf59e0b, 0.14);
      playSfx(this, SFX_KEYS.MENU_HOVER, { volume: 0.06 });
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x090b11, 0.84);
      buttonGlow.setFillStyle(0xf59e0b, 0.08);
    });

    button.on('pointerup', () => this.toggleGameAudioPanel());

    this.gameSoundButtonGlow = buttonGlow;
    this.gameSoundButton = button;
    this.gameSoundButtonLabel = label;
    this.gameAudioPanel = this.createGameAudioPanel(panelX, panelY);
    this.gameAudioPanelBounds = new Phaser.Geom.Rectangle(panelX, panelY - 6, layout.width, layout.height + 6);
    this.gameAudioPanel.setVisible(false).setAlpha(0).setScale(0.94);
    this.installGamePanelOutsideClickHandler();
    this.refreshGameSoundHud();
  }

  getGameAudioPanelLayout() {
    const useLargeTouchLayout = this.sys.game.device.input.touch && this.scale.width <= 1024;

    if (useLargeTouchLayout) {
      return {
        width: 296,
        height: 182,
        innerWidth: 276,
        innerHeight: 160,
        titleFontSize: '16px',
        statusFontSize: '13px',
        toggleWidth: 244,
        toggleHeight: 40,
        toggleFontSize: '15px',
        labelFontSize: '13px',
        sliderWidth: 154,
        sliderStartX: 118,
        musicY: 104,
        sfxY: 140,
        closeX: 268,
        closeY: 18,
      };
    }

    return {
      width: 208,
      height: 126,
      innerWidth: 192,
      innerHeight: 110,
      titleFontSize: '13px',
      statusFontSize: '10px',
      toggleWidth: 168,
      toggleHeight: 28,
      toggleFontSize: '11px',
      labelFontSize: '10px',
      sliderWidth: 92,
      sliderStartX: 90,
      musicY: 74,
      sfxY: 98,
      closeX: 184,
      closeY: 16,
    };
  }

  createBossHud() {
    const centerX = this.scale.width / 2;

    this.bossDarkness = this.add.rectangle(
      centerX,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x030107,
      0
    )
      .setScrollFactor(0)
      .setDepth(890)
      .setVisible(false);

    this.bossIntroTitle = this.add.text(centerX, this.scale.height * 0.28, 'DEMON SAMURAI', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#fff7ed',
      stroke: '#31080b',
      strokeThickness: 8,
      align: 'center',
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1006)
      .setAlpha(0)
      .setVisible(false);

    this.bossIntroSubtitle = this.add.text(centerX, (this.scale.height * 0.28) + 52, 'THE GATEKEEPER', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#facc15',
      stroke: '#111827',
      strokeThickness: 5,
      letterSpacing: 2,
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1006)
      .setAlpha(0)
      .setVisible(false);

    this.bossHealthContainer = this.add.container(centerX, 82)
      .setScrollFactor(0)
      .setDepth(1004)
      .setVisible(false)
      .setAlpha(0);

    const barWidth = 420;
    const barHeight = 16;
    const bg = this.add.rectangle(0, 0, barWidth, barHeight, 0x18070a, 0.92)
      .setStrokeStyle(2, 0xf59e0b, 0.72);
    this.bossHealthFill = this.add.rectangle(-(barWidth / 2) + 2, 0, barWidth - 4, barHeight - 4, 0xdc2626, 0.95)
      .setOrigin(0, 0.5);
    this.bossHealthText = this.add.text(0, -28, 'DEMON SAMURAI', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#fee2e2',
      stroke: '#111827',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.bossHealthContainer.add([bg, this.bossHealthFill, this.bossHealthText]);
  }

  createGameAudioPanel(x, y) {
    const layout = this.getGameAudioPanelLayout();
    const panel = this.add.container(x, y).setDepth(1005).setScrollFactor(0);

    const shell = this.add.rectangle(0, 0, layout.width, layout.height, 0x0b0a0f, 0.94)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xf3d38b, 0.34)
      .setScrollFactor(0);
    const inner = this.add.rectangle(layout.width * 0.5, layout.height * 0.5, layout.innerWidth, layout.innerHeight, 0x121117, 0.72)
      .setStrokeStyle(1, 0xfff0c8, 0.06)
      .setScrollFactor(0);
    const glow = this.add.rectangle(layout.width * 0.5, 18, Math.min(184, layout.width - 76), 18, 0xf59e0b, 0.06)
      .setScrollFactor(0);
    const title = this.add.text(18, 16, 'Audio', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: layout.titleFontSize,
      fontStyle: 'bold',
      color: '#f5ddb0',
      letterSpacing: 0.8,
    }).setOrigin(0, 0.5).setScrollFactor(0);
    const statusText = this.add.text(layout.width - 48, 16, 'Muted', {
      fontFamily: 'Arial, sans-serif',
      fontSize: layout.statusFontSize,
      fontStyle: 'bold',
      color: '#d6b98f',
    }).setOrigin(1, 0.5).setScrollFactor(0);

    const closeButton = this.add.circle(layout.closeX, layout.closeY, layout.toggleHeight * 0.34, 0x17161d, 0.96)
      .setStrokeStyle(1, 0xf3d38b, 0.34)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);
    const closeLabel = this.add.text(layout.closeX, layout.closeY - 0.5, 'X', {
      fontFamily: 'Arial, sans-serif',
      fontSize: layout.labelFontSize,
      fontStyle: 'bold',
      color: '#f7e4b1',
    }).setOrigin(0.5).setScrollFactor(0);

    const soundToggle = this.add.rectangle(layout.width * 0.5, 52, layout.toggleWidth, layout.toggleHeight, 0x17161d, 0.96)
      .setStrokeStyle(1, 0xf3d38b, 0.38)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);
    const soundToggleLabel = this.add.text(layout.width * 0.5, 52, 'AUDIO OFF', {
      fontFamily: 'Arial, sans-serif',
      fontSize: layout.toggleFontSize,
      fontStyle: 'bold',
      color: '#f7d6dc',
      letterSpacing: 0.7,
    }).setOrigin(0.5).setScrollFactor(0);

    soundToggle.on('pointerover', () => {
      soundToggle.setFillStyle(0x201b19, 0.98);
      playSfx(this, SFX_KEYS.MENU_HOVER, { volume: 0.05 });
    });
    soundToggle.on('pointerout', () => soundToggle.setFillStyle(0x17161d, 0.96));
    soundToggle.on('pointerdown', () => this.toggleGameMusic());
    closeButton.on('pointerdown', () => this.hideGameAudioPanel());

    const musicLabel = this.add.text(18, layout.musicY, 'MUSIC', {
      fontFamily: 'Arial, sans-serif',
      fontSize: layout.labelFontSize,
      fontStyle: 'bold',
      color: '#d7c2a0',
      letterSpacing: 0.8,
    }).setOrigin(0, 0.5).setScrollFactor(0);
    const sfxLabel = this.add.text(18, layout.sfxY, 'SFX', {
      fontFamily: 'Arial, sans-serif',
      fontSize: layout.labelFontSize,
      fontStyle: 'bold',
      color: '#d7c2a0',
      letterSpacing: 0.8,
    }).setOrigin(0, 0.5).setScrollFactor(0);

    this.gameMusicSlider = this.createHudSlider(layout.sliderStartX, layout.musicY, 'music', layout.sliderWidth);
    this.gameSfxSlider = this.createHudSlider(layout.sliderStartX, layout.sfxY, 'sfx', layout.sliderWidth);

    panel.add([
      shell,
      inner,
      glow,
      title,
      statusText,
      closeButton,
      closeLabel,
      soundToggle,
      soundToggleLabel,
      musicLabel,
      sfxLabel,
      this.gameMusicSlider.container,
      this.gameSfxSlider.container,
    ]);

    this.gameSoundStatusText = statusText;
    this.gameSoundInlineLabel = soundToggleLabel;
    this.gameSoundInlineToggle = soundToggle;

    return panel;
  }

  installGamePanelOutsideClickHandler() {
    this.handleGamePanelOutsideClick = (pointer) => {
      if (!this.gameAudioPanel?.visible || !this.gameAudioPanelBounds) {
        return;
      }

      const overToggle = this.gameSoundButton?.getBounds()?.contains(pointer.worldX, pointer.worldY);
      const insidePanel = Phaser.Geom.Rectangle.Contains(this.gameAudioPanelBounds, pointer.worldX, pointer.worldY);

      if (!overToggle && !insidePanel) {
        this.hideGameAudioPanel();
      }
    };

    this.input.on('pointerdown', this.handleGamePanelOutsideClick, this);
  }

  hideGameAudioPanel() {
    if (!this.gameAudioPanel?.visible) {
      return;
    }

    this.tweens.killTweensOf(this.gameAudioPanel);
    this.tweens.add({
      targets: this.gameAudioPanel,
      alpha: 0,
      scaleX: 0.96,
      scaleY: 0.96,
      duration: 170,
      ease: 'Sine.out',
      onComplete: () => this.gameAudioPanel?.setVisible(false),
    });
  }

  createHudSlider(x, y, type, width = 92) {
    const settings = audioManager.getSettings();
    const value = type === 'music' ? settings.musicVolume : settings.sfxVolume;

    const container = this.add.container(x, y).setScrollFactor(0);
    const trackGlow = this.add.rectangle(width * 0.5, 0, width + 6, 10, 0xf59e0b, 0.04)
      .setScrollFactor(0);
    const track = this.add.rectangle(0, 0, width, 3, 0x332a22, 1).setOrigin(0, 0.5).setScrollFactor(0);
    const fill = this.add.rectangle(0, 0, width * value, 3, 0xe9c27a, 1).setOrigin(0, 0.5).setScrollFactor(0);
    const knobGlow = this.add.circle(width * value, 0, 7, 0xf59e0b, 0.12).setScrollFactor(0);
    const knob = this.add.circle(width * value, 0, 4.5, 0xfff2cf, 1)
      .setStrokeStyle(1, 0x6b4d1d, 0.95)
      .setInteractive({ draggable: true, useHandCursor: true })
      .setScrollFactor(0);

    const updateFromPointer = (pointer) => {
      const localX = Phaser.Math.Clamp(pointer.x - track.getWorldTransformMatrix().tx, 0, width);
      const next = localX / width;

      if (type === 'music') {
        audioManager.setMusicVolume(next);
      } else {
        audioManager.setSfxVolume(next);
      }

      fill.width = width * next;
      knob.x = width * next;
      knobGlow.x = width * next;
      this.refreshGameSoundHud();
      this.startGameMusic();
    };

    knob.on('drag', (pointer) => updateFromPointer(pointer));
    knob.on('pointerover', () => knobGlow.setFillStyle(0xf59e0b, 0.18));
    knob.on('pointerout', () => knobGlow.setFillStyle(0xf59e0b, 0.12));
    track.setInteractive({ useHandCursor: true }).on('pointerdown', (pointer) => updateFromPointer(pointer));

    container.add([trackGlow, track, fill, knobGlow, knob]);

    return { container, track, fill, knob, knobGlow, width };
  }

  toggleGameAudioPanel() {
    if (!this.gameAudioPanel) {
      return;
    }

    const show = !this.gameAudioPanel.visible;
    this.gameAudioPanel.setVisible(true);
    this.tweens.killTweensOf(this.gameAudioPanel);
    this.tweens.add({
      targets: this.gameAudioPanel,
      alpha: show ? 1 : 0,
      scaleX: show ? 1 : 0.94,
      scaleY: show ? 1 : 0.94,
      duration: 160,
      ease: show ? 'Back.out(2.4)' : 'Sine.out',
      onComplete: () => {
        if (!show) {
          this.gameAudioPanel.setVisible(false);
        }
      },
    });
  }

  refreshGameSoundHud() {
    if (!this.gameSoundButton || !this.gameSoundButtonLabel) {
      return;
    }

    const settings = audioManager.getSettings();
    const audioOn = settings.musicEnabled && !settings.muted;

    this.gameSoundButtonLabel.setText(audioOn ? 'AUD' : 'MUTE');
    this.gameSoundButtonLabel.setColor(audioOn ? '#f7e4b1' : '#f7d6dc');
    this.gameSoundButton.setStrokeStyle(1, 0xf3d38b, audioOn ? 0.7 : 0.4);
    this.gameSoundButton.setFillStyle(audioOn ? 0x131712 : 0x090b11, audioOn ? 0.92 : 0.84);

    if (this.gameSoundButtonGlow) {
      this.gameSoundButtonGlow.setFillStyle(audioOn ? 0xf59e0b : 0x6b7280, audioOn ? 0.14 : 0.06);
    }

    if (this.gameSoundInlineLabel) {
      this.gameSoundInlineLabel.setText(audioOn ? 'AUDIO ON' : 'AUDIO OFF');
      this.gameSoundInlineLabel.setColor(audioOn ? '#f3e1b3' : '#f7d6dc');
    }

    if (this.gameSoundInlineToggle) {
      this.gameSoundInlineToggle.setStrokeStyle(1, 0xf3d38b, audioOn ? 0.52 : 0.34);
    }

    if (this.gameSoundStatusText) {
      this.gameSoundStatusText.setText(audioOn ? 'Live' : 'Muted');
      this.gameSoundStatusText.setColor(audioOn ? '#c7e4b0' : '#c9ad97');
    }

    if (this.gameMusicSlider) {
      this.gameMusicSlider.fill.width = this.gameMusicSlider.width * settings.musicVolume;
      this.gameMusicSlider.knob.x = this.gameMusicSlider.width * settings.musicVolume;
      this.gameMusicSlider.knobGlow.x = this.gameMusicSlider.width * settings.musicVolume;
    }

    if (this.gameSfxSlider) {
      this.gameSfxSlider.fill.width = this.gameSfxSlider.width * settings.sfxVolume;
      this.gameSfxSlider.knob.x = this.gameSfxSlider.width * settings.sfxVolume;
      this.gameSfxSlider.knobGlow.x = this.gameSfxSlider.width * settings.sfxVolume;
    }
  }

  handleExternalMenuHover() {
    if (!this.scene.isActive()) {
      return;
    }

    if (this.time.now - this.lastExternalHoverSoundAt <= 180) {
      return;
    }

    playSfx(this, SFX_KEYS.MENU_HOVER, { volume: 0.08 });
    this.lastExternalHoverSoundAt = this.time.now;
  }

  handleExternalMenuConfirm() {
    if (!this.scene.isActive()) {
      return;
    }

    playSfx(this, SFX_KEYS.MENU_CONFIRM, { volume: 0.14 });
  }

  handleExternalPressStart() {
    if (!this.scene.isActive()) {
      return;
    }

    if (audioManager.enableMusicFromUserGesture()) {
      this.requestGameAudioUnlockAndStart();
      return;
    }

    this.refreshGameSoundHud();
  }

  startGameMusic() {
    const musicKey = this.shouldUseBossMusic() ? SFX_KEYS.BOSS_BGM : SFX_KEYS.GAME_BGM;

    if (!this.sound || !this.cache.audio.exists(musicKey)) {
      return false;
    }

    if (this.sound.locked) {
      this.pendingGameMusicRetry = true;
      this.refreshGameSoundHud();
      return false;
    }

    this.gameMusic = audioManager.syncMusicTrack(this, 'level1', musicKey, 1, 420);
    this.pendingGameMusicRetry = false;
    this.refreshGameSoundHud();

    return true;
  }

  shouldUseBossMusic() {
    return this.isBossEncounterStarted && !this.isBossDefeated && !this.isQuestComplete;
  }

  toggleGameMusic() {
    const settings = audioManager.getSettings();
    const audioOn = settings.musicEnabled && !settings.muted;

    if (audioOn && this.pendingGameMusicRetry) {
      this.requestGameAudioUnlockAndStart();
      return;
    }

    if (audioOn) {
      playSfx(this, SFX_KEYS.MENU_CONFIRM, { volume: 0.14 });
      audioManager.setMusicEnabled(false);
      audioManager.setMuted(true);
    } else {
      audioManager.setMuted(false);
      audioManager.setMusicEnabled(true);
      playSfx(this, SFX_KEYS.MENU_CONFIRM, { volume: 0.14 });
    }

    if (audioManager.getSettings().musicEnabled && !audioManager.getSettings().muted) {
      this.requestGameAudioUnlockAndStart();
    } else {
      this.pendingGameMusicRetry = false;
      this.startGameMusic();
    }

    this.refreshGameSoundHud();
  }

  installGameUnlockRetryHandlers() {
    this.handleGameUnlockRetry = () => {
      if (this.pendingGameMusicRetry) {
        this.requestGameAudioUnlockAndStart();
      }
    };

    this.handleGameUnlockRetryKey = () => {
      if (this.pendingGameMusicRetry) {
        this.requestGameAudioUnlockAndStart();
      }
    };

    this.input.on('pointerdown', this.handleGameUnlockRetry, this);
    this.input.keyboard?.on('keydown', this.handleGameUnlockRetryKey, this);
  }

  requestGameAudioUnlockAndStart() {
    if (!this.sound) {
      return;
    }

    const maybeContext = this.sound.context;

    if (this.sound.locked && typeof this.sound.unlock === 'function') {
      this.sound.unlock();
    }

    if (maybeContext?.state === 'suspended' && typeof maybeContext.resume === 'function') {
      maybeContext.resume()
        .catch(() => {
          this.pendingGameMusicRetry = true;
        })
        .finally(() => {
          this.startGameMusic();
        });
      return;
    }

    this.startGameMusic();
  }

  cleanupLevelAudio() {
    if (!this.sound) {
      return;
    }

    this.tweens.killTweensOf(this.gameMusic);

    if (this.gameMusic) {
      this.gameMusic.stop();
      this.gameMusic.destroy();
      this.gameMusic = null;
    }

    this.sound.stopByKey(SFX_KEYS.GAME_BGM);
    this.sound.stopByKey(SFX_KEYS.BOSS_BGM);
    if (this.__audioTracks?.level1) {
      this.__audioTracks.level1 = null;
    }
    this.gameSoundButton = null;
    this.gameSoundButtonLabel = null;
    this.gameAudioPanel = null;
    this.gameMusicSlider = null;
    this.gameSfxSlider = null;
    this.gameSoundInlineLabel = null;
    this.gameAudioPanelBounds = null;
    this.pendingGameMusicRetry = false;

    if (this.handleGamePanelOutsideClick) {
      this.input.off('pointerdown', this.handleGamePanelOutsideClick, this);
      this.handleGamePanelOutsideClick = null;
    }

    if (this.handleGameUnlockRetry) {
      this.input.off('pointerdown', this.handleGameUnlockRetry, this);
      this.handleGameUnlockRetry = null;
    }

    if (this.handleGameUnlockRetryKey) {
      this.input.keyboard?.off('keydown', this.handleGameUnlockRetryKey, this);
      this.handleGameUnlockRetryKey = null;
    }
  }

  unlockBossArena() {
    if (this.isBossArenaReady) {
      return;
    }

    this.isBossArenaReady = true;
    playSfx(this, SFX_KEYS.PORTAL, { volume: 0.34, rate: 0.78, detune: -180 });
    this.updateHud('The final gate has awakened.');
  }

  onBossArenaEntered() {
    if (this.isBossDefeated || this.isBossEncounterStarted || this.isBossIntroPlaying || this.isBossResetting) {
      return;
    }

    if (!this.isBossArenaReady) {
      this.updateHud('Recover every resume powerup before the final gate.');
      return;
    }

    this.currentCheckpoint = {
      id: 'bossArena',
      x: BOSS_ARENA.checkpointX,
      y: BOSS_ARENA.checkpointY,
    };
    this.isBossEncounterStarted = true;
    this.beginBossAttempt();
  }

  beginBossAttempt({ retry = false } = {}) {
    if (!this.boss) {
      return;
    }

    this.isBossIntroPlaying = true;
    this.isBossResetting = false;
    this.isGameActive = false;
    this.lives = 3;
    this.player.getSprite().body.setVelocity(0, 0);
    this.player.getSwordHitbox().body.enable = false;
    this.enemies.forEach(enemy => enemy.clearDaggers());
    this.lockBossArena();
    this.startGameMusic();
    this.showBossIntro(retry);
    this.showBossHealthBar(true);
    this.updateBossHealthBar();

    this.cameras.main.stopFollow();
    this.cameras.main.pan(BOSS_ARENA.bossX - 90, WORLD.HEIGHT / 2, 900, 'Sine.easeInOut');
    this.cameras.main.zoomTo(1.08, 900, 'Sine.easeInOut');
    this.cameras.main.shake(220, 0.004);

    this.boss.resetForRetry();
    this.boss.startIntro();

    this.time.delayedCall(1550, () => {
      if (this.isQuestComplete || this.isBossDefeated) {
        return;
      }

      this.isBossIntroPlaying = false;
      this.isGameActive = true;
      this.physics.resume();
      this.cameras.main.zoomTo(1, 520, 'Sine.easeInOut');
      this.cameras.main.startFollow(this.player.getSprite());
      this.updateHud(retry ? 'Face the Gatekeeper again.' : 'Defeat the Gatekeeper.');
    });
  }

  lockBossArena() {
    if (!this.bossGate) {
      return;
    }

    this.bossGate.body.enable = true;
    this.bossGate
      .setVisible(true)
      .setAlpha(0.18)
      .setFillStyle(0x12070a, 0.7)
      .setStrokeStyle(2, 0xf97316, 0.82);
    this.tweens.killTweensOf([this.bossGate, this.bossGateLabel]);
    this.tweens.add({
      targets: this.bossGate,
      alpha: 0.9,
      duration: 420,
      ease: 'Sine.out',
    });
    this.tweens.add({
      targets: this.bossGateLabel,
      alpha: 0.92,
      duration: 420,
      ease: 'Sine.out',
    });
  }

  unlockBossGate() {
    if (!this.bossGate) {
      return;
    }

    this.bossGate.body.enable = false;
    this.tweens.killTweensOf([this.bossGate, this.bossGateLabel]);
    this.tweens.add({
      targets: [this.bossGate, this.bossGateLabel],
      alpha: 0,
      duration: 520,
      ease: 'Sine.out',
      onComplete: () => {
        this.bossGate?.setVisible(false);
      },
    });
  }

  showBossIntro(retry = false) {
    if (!this.bossDarkness || !this.bossIntroTitle || !this.bossIntroSubtitle) {
      return;
    }

    this.bossIntroTitle.setText(retry ? 'THE GATEKEEPER' : 'DEMON SAMURAI');
    this.bossIntroSubtitle.setText(retry ? 'FACE HIM AGAIN' : 'FINAL PROTECTOR OF THE GOLDEN RESUME');
    this.bossDarkness.setVisible(true);
    this.bossIntroTitle.setVisible(true).setAlpha(0);
    this.bossIntroSubtitle.setVisible(true).setAlpha(0);

    this.tweens.killTweensOf([this.bossDarkness, this.bossIntroTitle, this.bossIntroSubtitle]);
    this.tweens.add({
      targets: this.bossDarkness,
      alpha: 0.34,
      duration: 420,
      ease: 'Sine.out',
    });
    this.tweens.add({
      targets: [this.bossIntroTitle, this.bossIntroSubtitle],
      alpha: 1,
      yoyo: true,
      hold: 760,
      duration: 340,
      ease: 'Sine.out',
      onComplete: () => {
        this.bossIntroTitle?.setVisible(false);
        this.bossIntroSubtitle?.setVisible(false);
        this.tweens.add({
          targets: this.bossDarkness,
          alpha: 0.22,
          duration: 380,
          ease: 'Sine.out',
        });
      },
    });
  }

  showBossHealthBar(show) {
    if (!this.bossHealthContainer) {
      return;
    }

    this.bossHealthContainer.setVisible(true);
    this.tweens.killTweensOf(this.bossHealthContainer);
    this.tweens.add({
      targets: this.bossHealthContainer,
      alpha: show ? 1 : 0,
      duration: 260,
      ease: 'Sine.out',
      onComplete: () => {
        if (!show) {
          this.bossHealthContainer?.setVisible(false);
        }
      },
    });
  }

  updateBossHealthBar() {
    if (!this.boss || !this.bossHealthFill) {
      return;
    }

    const fullWidth = 416;
    this.bossHealthFill.width = fullWidth * Phaser.Math.Clamp(this.boss.getHealthRatio(), 0, 1);
  }

  onSwordHitBoss() {
    if (!this.player.isSwordActive() || !this.boss?.isActive()) {
      return;
    }

    this.damageBoss(this.player.getSprite().x, 75, 'Gatekeeper wounded.');
  }

  onThrowHitBoss(projectile) {
    const fromX = projectile.x;
    this.player.destroyThrowProjectile(projectile);

    if (!this.boss?.isActive()) {
      return;
    }

    this.damageBoss(fromX, 55, 'Shuriken found its mark.');
  }

  damageBoss(fromX, scoreBonus, status) {
    if (!this.boss) {
      return;
    }

    const didHit = this.boss.takeDamage(fromX);

    if (!didHit) {
      return;
    }

    this.score += scoreBonus;
    this.updateBossHealthBar();
    this.updateHud(status);

    if (this.boss.isDefeated()) {
      this.onBossDefeated();
    }
  }

  onPlayerHitBossAttack() {
    if (!this.boss?.isActive()) {
      return;
    }

    this.damagePlayer('Defend, dodge, and strike back.');
  }

  handleBossPlayerDefeat() {
    if (this.isBossResetting) {
      return;
    }

    this.isBossResetting = true;
    this.isPlayerDying = true;
    this.isGameActive = false;
    this.isPlayerInvulnerable = true;
    this.score = Math.max(0, this.score - 100);
    playSfx(this, SFX_KEYS.PLAYER_HURT, { volume: 0.44 });
    this.player.playDeath();
    this.player.getSprite().body.setVelocity(0, 0);
    this.player.getSwordHitbox().body.enable = false;
    this.boss?.resetForRetry();
    this.updateBossHealthBar();
    this.updateHud('Face the Gatekeeper again.');

    if (this.bossDarkness) {
      this.bossDarkness.setVisible(true);
      this.tweens.add({
        targets: this.bossDarkness,
        alpha: 0.48,
        duration: 180,
        yoyo: true,
        hold: 260,
        ease: 'Sine.out',
      });
    }

    this.time.delayedCall(850, () => {
      this.lives = 3;
      this.isPlayerDying = false;
      this.player.resetToPosition(this.currentCheckpoint.x, this.currentCheckpoint.y);
      this.flashPlayer();
      this.beginBossAttempt({ retry: true });
    });
  }

  onBossDefeated() {
    if (this.isBossDefeated) {
      return;
    }

    this.isBossDefeated = true;
    this.isBossEncounterStarted = false;
    this.isBossIntroPlaying = false;
    this.isBossResetting = false;
    this.score += 1000;
    this.updateHud('THE GOLDEN RESUME RECOVERED');
    this.updateBossHealthBar();
    this.showBossHealthBar(false);
    this.unlockBossGate();
    this.cameras.main.shake(520, 0.008);

    if (this.gameMusic) {
      audioManager.fadeOutAndStop(this, this.gameMusic, 900, () => {
        this.gameMusic = null;
      });
    }

    this.time.delayedCall(1000, () => this.createGoldenResumeGlow(BOSS_ARENA.bossX, BOSS_ARENA.bossY));
    this.time.delayedCall(1600, () => {
      playSfx(this, SFX_KEYS.PORTAL, { volume: 0.55, rate: 0.7, detune: -260 });
      this.openPortal();
    });
  }

  createGoldenResumeGlow(x, y) {
    const glow = this.add.circle(x, y - 42, 20, 0xfacc15, 0.64).setDepth(34);
    const ring = this.add.circle(x, y - 42, 42, 0xfef3c7, 0.18).setDepth(33);

    this.tweens.add({
      targets: [glow, ring],
      scale: 2.2,
      alpha: 0,
      duration: 1250,
      ease: 'Sine.out',
      onComplete: () => {
        glow.destroy();
        ring.destroy();
      },
    });

    for (let index = 0; index < 18; index += 1) {
      const angle = (Math.PI * 2 * index) / 18;
      const spark = this.add.circle(x, y - 42, 3, 0xfff7ad, 0.9).setDepth(35);

      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * Phaser.Math.Between(42, 108),
        y: y - 42 + Math.sin(angle) * Phaser.Math.Between(24, 82),
        alpha: 0,
        duration: 760,
        ease: 'Cubic.out',
        onComplete: () => spark.destroy(),
      });
    }
  }

  openPortal() {
    if (this.isPortalOpen) {
      return;
    }

    this.isPortalOpen = true;

    const portalX = BOSS_ARENA.portalX;
    const portalY = BOSS_ARENA.portalY;

    this.portal
      .setPosition(portalX, portalY)
      .setDepth(30)
      .setFillStyle(0xfacc15, 0.72)
      .setStrokeStyle(5, 0xfef3c7, 0.95)
      .setScale(1);
    this.portalCore
      .setPosition(portalX, portalY)
      .setDepth(31)
      .setFillStyle(0x5f3705, 0.92)
      .setScale(1);
    this.portalLabel
      .setPosition(portalX, portalY - 62)
      .setAlpha(0);

    this.physics.add.existing(this.portal, true);
    this.portal.body.setCircle(42);

    this.tweens.add({
      targets: this.portal,
      scale: 1.12,
      alpha: 0.85,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    this.tweens.add({
      targets: this.portalCore,
      scale: 1.22,
      alpha: 0.96,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    this.tweens.add({
      targets: this.portalLabel,
      alpha: 1,
      y: portalY - 68,
      duration: 420,
      ease: 'Cubic.out',
    });

    this.physics.add.overlap(
      this.player.getSprite(),
      this.portal,
      this.onPortalEntered,
      null,
      this
    );

    playSfx(this, SFX_KEYS.PORTAL, { volume: 0.42 });
    this.updateHud('Enter the Golden Resume portal.');
    eventBridge.emit('quest:portal-open');
  }

  onPortalEntered() {
    if (!this.isPortalOpen || this.isQuestComplete) {
      return;
    }

    this.completeQuest();
  }

  completeQuest() {
    if (this.isQuestComplete) {
      return;
    }

    this.isQuestComplete = true;
    this.isGameActive = false;
    this.player.getSprite().body.setVelocity(0, 0);
    this.physics.pause();
    playSfx(this, SFX_KEYS.PORTAL, { volume: 0.5 });
    this.updateHud('Resume Quest Complete!');

    eventBridge.emit('quest:complete', {
      score: this.score,
      powerups: this.levelPowerups,
    });
  }

  updateHud(status = '') {
    this.refreshHudCounters();
    this.statusText.setText(status);

    if (status) {
      this.time.delayedCall(1400, () => {
        if (this.statusText?.text === status) {
          this.statusText.setText('');
        }
      });
    }
  }

  refreshHudCounters() {
    this.scoreText?.setText(`Score: ${this.score}`);
    this.livesText?.setText(`Lives: ${this.lives}`);
    this.throwsText?.setText(`Throws: ${this.player?.getThrowsRemaining?.() ?? 5}/5`);
  }

  onPlayerHitEnemy(enemy) {
    if (enemy.isDefeated()) {
      return;
    }

    if (this.player.isSwordActive()) {
      this.slayEnemy(enemy);
      return;
    }

    this.damagePlayer('Demon tagged you. Back to the start!');
  }

  onPlayerHitProjectile(enemy, projectile) {
    enemy.destroyProjectile(projectile);
    playSfx(this, SFX_KEYS.FIREBALL_IMPACT, { volume: 0.45 });
    this.damagePlayer('Fire tagged you. Back to the start!');
  }

  onSwordHitEnemy(enemy) {
    if (!this.player.isSwordActive()) {
      return;
    }

    this.slayEnemy(enemy);
  }

  onThrowHitEnemy(enemy, projectile) {
    this.player.destroyThrowProjectile(projectile);

    if (enemy.isDefeated()) {
      return;
    }

    this.slayEnemy(enemy);
  }

  slayEnemy(enemy) {
    if (!enemy.slayAndRespawnFromRight()) {
      return;
    }

    this.score += 150;
    playSfx(this, SFX_KEYS.ENEMY_HIT, { volume: 0.42 });
    this.updateHud('Demon banished. It will return from the right!');
  }

  damagePlayer(hitStatus) {
    if (this.isPlayerInvulnerable || this.isPlayerDying) {
      return;
    }

    if (this.tryBlockPlayerDamage()) {
      return;
    }

    if (this.currentCheckpoint.id === 'bossArena' && this.isBossEncounterStarted && !this.isBossDefeated) {
      this.lives -= 1;

      if (this.lives <= 0) {
        this.handleBossPlayerDefeat();
        return;
      }

      playSfx(this, SFX_KEYS.PLAYER_HURT, { volume: 0.44 });
      this.player.playHurt();
      this.player.getSprite().body.setVelocity(
        this.player.getSprite().x < BOSS_ARENA.bossX ? -170 : 170,
        -140
      );
      this.updateHud(hitStatus);
      this.flashPlayer();
      return;
    }

    this.lives -= 1;
    playSfx(this, SFX_KEYS.PLAYER_HURT, { volume: 0.44 });

    if (this.lives <= 0) {
      this.handlePlayerDeathRespawn();
      return;
    }

    this.player.playHurt();
    this.updateHud(hitStatus);
    this.enemies.forEach(enemy => enemy.clearDaggers());
    this.resetPlayer();
    this.flashPlayer();
  }

  tryBlockPlayerDamage() {
    if (!this.player?.isDefendingNow?.()) {
      return false;
    }

    this.isPlayerInvulnerable = true;
    this.player.playDefendBlock();
    this.player.getSprite().body.setVelocityX(-this.player.facingDirection * 80);
    playSfx(this, SFX_KEYS.BLOCK, { volume: 0.34 });
    this.updateHud('Blocked.');

    this.time.delayedCall(300, () => {
      this.isPlayerInvulnerable = false;
    });

    return true;
  }

  handlePlayerDeathRespawn() {
    if (this.isPlayerDying) {
      return;
    }

    this.isPlayerDying = true;
    this.isGameActive = false;
    this.isPlayerInvulnerable = true;
    this.enemies.forEach(enemy => enemy.clearDaggers());
    this.player.playDeath();
    this.updateHud('Fresh run. Lives restored!');

    this.time.delayedCall(850, () => {
      this.lives = 3;
      this.score = Math.max(0, this.score - 100);
      this.resetPlayer('New run. Keep going!');
      this.isPlayerDying = false;
      this.isGameActive = true;
      this.flashPlayer();
    });
  }

  resetPlayer(status) {
    if (this.currentCheckpoint.id === 'bossArena' && !this.isBossDefeated) {
      this.player.resetToPosition(this.currentCheckpoint.x, this.currentCheckpoint.y);
    } else {
      this.player.resetToStart();
    }

    if (status) {
      this.updateHud(status);
    }
  }

  flashPlayer() {
    this.isPlayerInvulnerable = true;

    this.tweens.add({
      targets: this.player.getSprite(),
      alpha: 0.35,
      duration: 90,
      repeat: 7,
      yoyo: true,
      onComplete: () => {
        this.player.getSprite().setAlpha(1);
        this.isPlayerInvulnerable = false;
      },
    });
  }
}

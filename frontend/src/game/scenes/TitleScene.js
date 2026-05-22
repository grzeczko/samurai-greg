import Phaser from 'phaser';
import { eventBridge } from '../events.js';
import {
  ANIM_KEYS,
  SFX_KEYS,
  TEXTURE_KEYS,
  createGameAnimations,
  playSfx,
  preloadGameAssets,
} from '../assets.js';
import { audioManager } from '../audio/AudioManager.js';

const TITLE_COPY = {
  title: 'SAMURAI GREG',
  subtitle: 'and the Quest for the Golden Résumé',
  identity: 'Gregory Rzeczko',
  roles: [
    'Senior Software Architect',
    'Creative Director • Game Developer',
    'Music Producer & Artist',
    'Data Scientist • AI • Blockchain • Robotics',
  ],
  progression: 'Education → Skills → Experience → Achievements',
  button: 'BEGIN THE QUEST',
};

function fitTextToWidth(textObject, maxWidth) {
  if (textObject.width <= maxWidth) {
    return;
  }

  textObject.setScale(maxWidth / textObject.width);
}

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
    this.backgroundLayers = [];
    this.menuStarted = false;
    this.lastHoverSoundAt = 0;
    this.audioHud = null;
    this.audioToggleBg = null;
    this.audioToggleLabel = null;
    this.audioPanel = null;
    this.musicSlider = null;
    this.sfxSlider = null;
    this.audioPanelBounds = null;
    this.handlePanelOutsideClick = null;
    this.titleMusic = null;
    this.pendingMusicRetry = false;
    this.handleUnlockRetry = null;
    this.handleUnlockRetryKey = null;
    this.levelStarting = false;
  }

  preload() {
    preloadGameAssets(this);
  }

  create() {
    createGameAnimations(this);

    const { width, height } = this.scale;

    this.createBackdrop(width, height);
    this.createAtmosphere(width, height);
    this.createCharacterShowcase(width, height);
    this.createTitleCard(width, height);
    this.createAudioHud(width);
    this.createInput();
    this.installUnlockRetryHandlers();
    this.tryStartTitleMusic();
    eventBridge.on('ui:menu-hover', this.handleExternalMenuHover, this);
    eventBridge.on('ui:menu-confirm', this.handleExternalMenuConfirm, this);
    eventBridge.on('ui:press-start', this.handleExternalPressStart, this);
    eventBridge.on('objective:begin-journey', this.handleBeginJourney, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      eventBridge.off('ui:menu-hover', this.handleExternalMenuHover, this);
      eventBridge.off('ui:menu-confirm', this.handleExternalMenuConfirm, this);
      eventBridge.off('ui:press-start', this.handleExternalPressStart, this);
      eventBridge.off('objective:begin-journey', this.handleBeginJourney, this);
      this.cleanupTitleAudio();
    });
  }

  update(_time, delta) {
    const drift = delta / 1000;

    this.backgroundLayers.forEach(({ sprite, speedX, speedY }) => {
      sprite.tilePositionX += speedX * drift;
      sprite.tilePositionY += speedY * drift;
    });
  }

  createBackdrop(width, height) {
    this.add.rectangle(width / 2, height / 2, width, height, 0x07080c).setDepth(0);

    const far = this.add.tileSprite(width / 2, height / 2, width, height, TEXTURE_KEYS.AUTUMN_BG_FAR)
      .setScale(3.35)
      .setAlpha(0.72)
      .setDepth(1);
    const mid = this.add.tileSprite(width / 2, height / 2, width, height, TEXTURE_KEYS.AUTUMN_BG_MID)
      .setScale(3.35)
      .setAlpha(0.55)
      .setDepth(2);
    const near = this.add.tileSprite(width / 2, height / 2, width, height, TEXTURE_KEYS.AUTUMN_BG_NEAR)
      .setScale(3.35)
      .setAlpha(0.42)
      .setDepth(3);

    this.backgroundLayers = [
      { sprite: far, speedX: 1.4, speedY: 0.08 },
      { sprite: mid, speedX: 4.2, speedY: 0.12 },
      { sprite: near, speedX: 7.6, speedY: 0.18 },
    ];

    this.add.rectangle(width / 2, height / 2, width, height, 0x05070b, 0.38).setDepth(4);
    this.add.ellipse(width * 0.72, height * 0.26, 320, 220, 0xf59e0b, 0.08).setDepth(5);
    this.add.ellipse(width * 0.26, height * 0.38, 260, 200, 0xb91c1c, 0.08).setDepth(5);
  }

  createAtmosphere(width, height) {
    const fogLeft = this.add.ellipse(width * 0.18, height * 0.48, 360, 280, 0xffffff, 0.04).setDepth(6);
    const fogRight = this.add.ellipse(width * 0.82, height * 0.32, 420, 240, 0xf8fafc, 0.035).setDepth(6);

    this.tweens.add({
      targets: fogLeft,
      x: fogLeft.x + 24,
      alpha: 0.08,
      duration: 6200,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: fogRight,
      x: fogRight.x - 30,
      alpha: 0.06,
      duration: 7800,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    const leafGraphic = this.make.graphics({ x: 0, y: 0, add: false });
    leafGraphic.fillStyle(0xf59e0b, 0.95);
    leafGraphic.fillEllipse(4, 2, 8, 4);
    leafGraphic.generateTexture('title-leaf', 8, 6);
    leafGraphic.destroy();

    const particles = this.add.particles(0, 0, 'title-leaf', {
      x: { min: -20, max: width + 20 },
      y: -10,
      lifespan: 9000,
      quantity: 1,
      frequency: 420,
      speedX: { min: -18, max: 18 },
      speedY: { min: 18, max: 34 },
      rotate: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0.2 },
      alpha: { start: 0.55, end: 0 },
      tint: [0xf59e0b, 0xfbbf24, 0xfb7185],
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(0, 0, width, 1) },
    });
    particles.setDepth(7);
  }

  createCharacterShowcase(width, height) {
    const samurai = this.add.sprite(width * 0.78, height * 0.62, TEXTURE_KEYS.SAMURAI_IDLE)
      .setDepth(8)
      .setScale(2.95)
      .setAlpha(0.98);
    samurai.play(ANIM_KEYS.SAMURAI_IDLE);

    this.tweens.add({
      targets: samurai,
      y: samurai.y - 10,
      duration: 2400,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    const rim = this.add.ellipse(samurai.x - 22, samurai.y - 22, 210, 310, 0xf59e0b, 0.06).setDepth(7);
    this.tweens.add({
      targets: rim,
      alpha: 0.12,
      scaleX: 1.06,
      scaleY: 1.04,
      duration: 2800,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  createTitleCard(width, height) {
    const panelWidth = 560;
    const panelHeight = 420;
    const panel = this.add.container(width * 0.36, height * 0.5).setDepth(20);

    const panelBg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x090b11, 0.58)
      .setStrokeStyle(1.5, 0xf3d38b, 0.22);
    const panelGlow = this.add.rectangle(0, 0, panelWidth, panelHeight, 0xf59e0b, 0.04)
      .setBlendMode(Phaser.BlendModes.SCREEN);

    const topRule = this.add.rectangle(0, -166, 196, 1, 0xf3d38b, 0.42);
    const bottomRule = this.add.rectangle(0, 166, 196, 1, 0xf3d38b, 0.22);

    const title = this.add.text(0, -116, TITLE_COPY.title, {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '66px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: '#0b0f17',
      strokeThickness: 7,
      align: 'center',
    }).setOrigin(0.5);
    fitTextToWidth(title, panelWidth - 76);

    const subtitle = this.add.text(0, -44, TITLE_COPY.subtitle, {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '21px',
      fontStyle: 'italic',
      color: '#f4c95a',
      stroke: '#0b0f17',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5);
    fitTextToWidth(subtitle, panelWidth - 108);

    const shimmer = this.add.rectangle(0, -14, 260, 1.5, 0xf6c66b, 0.42).setOrigin(0.5);

    const identity = this.add.text(0, 18, TITLE_COPY.identity, {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#f8fafc',
      align: 'center',
    }).setOrigin(0.5);

    const roles = this.add.text(0, 94, TITLE_COPY.roles.join('\n'), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#d7deea',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5, 0.5);

    const progression = this.add.text(0, 162, TITLE_COPY.progression, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#f3d38b',
      align: 'center',
    }).setOrigin(0.5);

    const buttonShadow = this.add.rectangle(0, 232, 250, 60, 0x000000, 0.28);
    const buttonBg = this.add.rectangle(0, 226, 250, 60, 0x150c08, 0.92)
      .setStrokeStyle(2, 0xf3d38b, 0.52);
    const buttonText = this.add.text(0, 226, TITLE_COPY.button, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#fff5d6',
      align: 'center',
    }).setOrigin(0.5);

    panel.add([
      panelGlow,
      panelBg,
      topRule,
      bottomRule,
      title,
      subtitle,
      shimmer,
      identity,
      roles,
      progression,
      buttonShadow,
      buttonBg,
      buttonText,
    ]);

    const buttonZone = this.add.zone(panel.x, panel.y + 226, 250, 60)
      .setOrigin(0.5)
      .setDepth(21)
      .setInteractive({ useHandCursor: true });

    buttonZone.on('pointerover', () => {
      if (this.time.now - this.lastHoverSoundAt > 180) {
        playSfx(this, SFX_KEYS.MENU_HOVER, { volume: 0.12 });
        this.lastHoverSoundAt = this.time.now;
      }
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 120,
        ease: 'Sine.out',
      });
    });

    buttonZone.on('pointerout', () => {
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scaleX: 1,
        scaleY: 1,
        duration: 140,
        ease: 'Sine.out',
      });
    });

    buttonZone.on('pointerdown', () => this.beginQuest());

    this.tweens.add({
      targets: panel,
      y: panel.y - 8,
      alpha: { from: 0, to: 1 },
      duration: 900,
      ease: 'Cubic.out',
    });

    this.tweens.add({
      targets: title,
      y: title.y - 4,
      duration: 2600,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: shimmer,
      alpha: 0.75,
      scaleX: 1.1,
      duration: 1800,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    this.tweens.add({
      targets: [buttonBg, buttonText],
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1100,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  createInput() {
    this.input.keyboard?.on('keydown-ENTER', () => this.beginQuest());
    this.input.keyboard?.on('keydown-SPACE', () => this.beginQuest());
  }

  installUnlockRetryHandlers() {
    this.handleUnlockRetry = () => {
      if (this.pendingMusicRetry) {
        this.tryStartTitleMusic();
      }
    };

    this.handleUnlockRetryKey = () => {
      if (this.pendingMusicRetry) {
        this.tryStartTitleMusic();
      }
    };

    this.input.on('pointerdown', this.handleUnlockRetry, this);
    this.input.keyboard?.on('keydown', this.handleUnlockRetryKey, this);
  }

  createAudioHud(width) {
    const layout = this.getTitleAudioPanelLayout();
    const anchorX = width - 54;
    const anchorY = 52;
    const panelX = Phaser.Math.Clamp(anchorX - layout.width, 8, this.scale.width - layout.width - 8);
    const panelY = anchorY + 70;

    const hudGlow = this.add.circle(anchorX, anchorY, 27, 0xf59e0b, 0.08)
      .setDepth(22);
    const hudBg = this.add.circle(anchorX, anchorY, 21, 0x090b11, 0.84)
      .setStrokeStyle(1, 0xf3d38b, 0.48)
      .setDepth(23)
      .setInteractive({ useHandCursor: true });
    const hudLabel = this.add.text(anchorX, anchorY - 0.5, 'AUD', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#f7d6dc',
      letterSpacing: 0.8,
    }).setOrigin(0.5).setDepth(24);

    hudBg.on('pointerover', () => {
      hudBg.setFillStyle(0x151b25, 0.96);
      hudGlow.setFillStyle(0xf59e0b, 0.14);
      playSfx(this, SFX_KEYS.MENU_HOVER, { volume: 0.06 });
    });

    hudBg.on('pointerout', () => {
      hudBg.setFillStyle(0x090b11, 0.84);
      hudGlow.setFillStyle(0xf59e0b, 0.08);
    });

    hudBg.on('pointerdown', (pointer) => {
      pointer.event?.preventDefault?.();
      this.toggleAudioPanel();
    });

    this.audioHud = this.add.container(0, 0, [hudGlow, hudBg, hudLabel]).setDepth(23);
    this.audioToggleGlow = hudGlow;
    this.audioToggleBg = hudBg;
    this.audioToggleLabel = hudLabel;

    this.audioPanel = this.createAudioPanel(panelX, panelY);
    this.audioPanelBounds = new Phaser.Geom.Rectangle(panelX, panelY - 6, layout.width, layout.height + 6);
    this.audioPanel.setVisible(false).setAlpha(0).setScale(0.94);
    this.installPanelOutsideClickHandler();

    this.tweens.add({
      targets: [hudBg, hudLabel],
      alpha: { from: 0, to: 1 },
      duration: 280,
      ease: 'Cubic.out',
    });

    this.tweens.add({
      targets: [hudBg, hudGlow],
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 1300,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    this.refreshMusicUi();
  }

  getTitleAudioPanelLayout() {
    const maxTouchPoints = navigator.maxTouchPoints ?? 0;
    const primaryCoarse = window.matchMedia('(pointer: coarse)').matches;
    const anyCoarse = window.matchMedia('(any-pointer: coarse)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    const touchCapable = maxTouchPoints > 0 || primaryCoarse || anyCoarse;
    const shortestSide = Math.min(this.scale.width, this.scale.height);
    const longestSide = Math.max(this.scale.width, this.scale.height);
    const phoneViewport = shortestSide <= 760 && longestSide <= 980;
    const tabletViewport = shortestSide <= 1024 && longestSide <= 1366;
    const likelyTablet = touchCapable && tabletViewport && (primaryCoarse || anyCoarse || noHover || maxTouchPoints > 1);
    const useLargeTouchLayout = touchCapable && (phoneViewport || likelyTablet);

    if (useLargeTouchLayout) {
      const modalWidth = Math.max(260, this.scale.width - 24);
      const modalHeight = Math.max(220, this.scale.height - 24);

      return {
        isModal: true,
        width: this.scale.width,
        height: this.scale.height,
        innerWidth: modalWidth,
        innerHeight: modalHeight,
        panelX: (this.scale.width - modalWidth) / 2,
        panelY: (this.scale.height - modalHeight) / 2,
        titleFontSize: '22px',
        statusFontSize: '15px',
        toggleWidth: modalWidth - 44,
        toggleHeight: 54,
        toggleFontSize: '18px',
        labelFontSize: '15px',
        sliderWidth: modalWidth - 128,
        sliderStartX: 96,
        musicY: 122,
        sfxY: 176,
        closeRadius: 22,
        closeY: 18,
      };
    }

    return {
      isModal: false,
      width: 208,
      height: 126,
      innerWidth: 192,
      innerHeight: 110,
      panelX: 0,
      panelY: 0,
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
      closeRadius: 10,
      closeY: 16,
    };
  }

  setTitleAudioPanelInputEnabled(enabled) {
    const interactiveTargets = [
      this.audioPanelBackdrop,
      this.audioPanelCloseButton,
      this.audioToggleInlineBg,
      this.musicSlider?.track,
      this.musicSlider?.knob,
      this.sfxSlider?.track,
      this.sfxSlider?.knob,
    ].filter(Boolean);

    interactiveTargets.forEach((target) => {
      if (target.input) {
        target.input.enabled = enabled;
      }
    });
  }

  createAudioPanel(x, y) {
    const layout = this.getTitleAudioPanelLayout();
    const panel = this.add.container(x, y).setDepth(26);
    const shellX = layout.panelX;
    const shellY = layout.panelY;
    const shellWidth = layout.isModal ? layout.innerWidth : layout.width;
    const shellHeight = layout.isModal ? layout.innerHeight : layout.height;
    const shellCenterX = shellX + (shellWidth * 0.5);
    const shellCenterY = shellY + (shellHeight * 0.5);

    if (layout.isModal) {
      const backdrop = this.add.rectangle(0, 0, layout.width, layout.height, 0x020307, 0.88)
        .setOrigin(0, 0);
      panel.add(backdrop);
      this.audioPanelBackdrop = backdrop;
    }

    const shell = this.add.rectangle(shellX, shellY, shellWidth, shellHeight, 0x0b0a0f, 0.94)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xf3d38b, 0.34);
    const inner = this.add.rectangle(
      shellCenterX,
      shellCenterY,
      layout.isModal ? layout.innerWidth - 20 : layout.innerWidth,
      layout.isModal ? layout.innerHeight - 22 : layout.innerHeight,
      0x121117,
      0.72,
    )
      .setStrokeStyle(1, 0xfff0c8, 0.06);
    const glow = this.add.rectangle(
      layout.isModal ? shellCenterX : 104,
      layout.isModal ? shellY + 18 : 18,
      layout.isModal ? Math.min(240, layout.innerWidth - 76) : 132,
      18,
      0xf59e0b,
      0.06,
    );
    const title = this.add.text(layout.isModal ? shellX + 18 : 18, layout.isModal ? shellY + 16 : 16, 'Audio', {
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: layout.titleFontSize,
      fontStyle: 'bold',
      color: '#f5ddb0',
      letterSpacing: 0.8,
    }).setOrigin(0, 0.5);
    const statusText = this.add.text(layout.isModal ? shellX + layout.innerWidth - 58 : 190, layout.isModal ? shellY + 16 : 16, 'Muted', {
      fontFamily: 'Arial, sans-serif',
      fontSize: layout.statusFontSize,
      fontStyle: 'bold',
      color: '#d6b98f',
    }).setOrigin(1, 0.5);

    let closeButton = null;
    let closeLabel = null;

    if (layout.isModal) {
      closeButton = this.add.circle(shellX + layout.innerWidth - 26, shellY + layout.closeY, layout.closeRadius, 0x17161d, 0.96)
        .setStrokeStyle(1, 0xf3d38b, 0.34)
        .setInteractive({ useHandCursor: true });
      closeLabel = this.add.text(shellX + layout.innerWidth - 26, shellY + layout.closeY - 0.5, 'X', {
        fontFamily: 'Arial, sans-serif',
        fontSize: layout.labelFontSize,
        fontStyle: 'bold',
        color: '#f7e4b1',
      }).setOrigin(0.5);
    }

    const soundToggle = this.add.rectangle(layout.isModal ? shellCenterX : 104, layout.isModal ? shellY + 66 : 43, layout.toggleWidth, layout.toggleHeight, 0x17161d, 0.96)
      .setStrokeStyle(1, 0xf3d38b, 0.38)
      .setInteractive({ useHandCursor: true });
    const soundToggleLabel = this.add.text(layout.isModal ? shellCenterX : 104, layout.isModal ? shellY + 66 : 43, 'AUDIO OFF', {
      fontFamily: 'Arial, sans-serif',
      fontSize: layout.toggleFontSize,
      fontStyle: 'bold',
      color: '#f7d6dc',
      letterSpacing: 0.7,
    }).setOrigin(0.5);

    soundToggle.on('pointerover', () => {
      soundToggle.setFillStyle(0x201b19, 0.98);
      playSfx(this, SFX_KEYS.MENU_HOVER, { volume: 0.05 });
    });
    soundToggle.on('pointerout', () => soundToggle.setFillStyle(0x17161d, 0.96));
    soundToggle.on('pointerdown', () => this.toggleTitleMusic());

    if (closeButton) {
      closeButton.on('pointerdown', () => this.hideAudioPanel());
    }

    const musicLabel = this.add.text(layout.isModal ? shellX + 18 : 18, layout.isModal ? shellY + layout.musicY : layout.musicY, 'MUSIC', {
      fontFamily: 'Arial, sans-serif',
      fontSize: layout.labelFontSize,
      fontStyle: 'bold',
      color: '#d7c2a0',
      letterSpacing: 0.8,
    }).setOrigin(0, 0.5);
    const sfxLabel = this.add.text(layout.isModal ? shellX + 18 : 18, layout.isModal ? shellY + layout.sfxY : layout.sfxY, 'SFX', {
      fontFamily: 'Arial, sans-serif',
      fontSize: layout.labelFontSize,
      fontStyle: 'bold',
      color: '#d7c2a0',
      letterSpacing: 0.8,
    }).setOrigin(0, 0.5);

    this.musicSlider = this.createVolumeSlider(layout.isModal ? shellX + layout.sliderStartX : layout.sliderStartX, layout.isModal ? shellY + layout.musicY : layout.musicY, 'music', layout.sliderWidth);
    this.sfxSlider = this.createVolumeSlider(layout.isModal ? shellX + layout.sliderStartX : layout.sliderStartX, layout.isModal ? shellY + layout.sfxY : layout.sfxY, 'sfx', layout.sliderWidth);

    panel.add([
      shell,
      inner,
      glow,
      title,
      statusText,
      soundToggle,
      soundToggleLabel,
      musicLabel,
      sfxLabel,
      this.musicSlider.container,
      this.sfxSlider.container,
    ]);

    if (closeButton && closeLabel) {
      panel.add([closeButton, closeLabel]);
    }

    this.audioToggleInlineStatus = statusText;
    this.audioToggleInlineLabel = soundToggleLabel;
    this.audioToggleInlineBg = soundToggle;
    this.audioPanelCloseButton = closeButton;
    this.setTitleAudioPanelInputEnabled(false);

    return panel;
  }

  installPanelOutsideClickHandler() {
    if (this.getTitleAudioPanelLayout().isModal) {
      return;
    }

    this.handlePanelOutsideClick = (pointer) => {
      if (!this.audioPanel?.visible || !this.audioPanelBounds) {
        return;
      }

      const overToggle = this.audioToggleBg?.getBounds()?.contains(pointer.worldX, pointer.worldY);
      const insidePanel = Phaser.Geom.Rectangle.Contains(this.audioPanelBounds, pointer.worldX, pointer.worldY);

      if (!overToggle && !insidePanel) {
        this.hideAudioPanel();
      }
    };

    this.input.on('pointerdown', this.handlePanelOutsideClick, this);
  }

  hideAudioPanel() {
    if (!this.audioPanel?.visible) {
      return;
    }

    this.setTitleAudioPanelInputEnabled(false);
    this.tweens.killTweensOf(this.audioPanel);
    this.tweens.add({
      targets: this.audioPanel,
      alpha: 0,
      scaleX: 0.96,
      scaleY: 0.96,
      duration: 170,
      ease: 'Sine.out',
      onComplete: () => {
        this.audioPanel?.setVisible(false);
        this.audioPanel?.setAlpha(0);
      },
    });
  }

  createVolumeSlider(x, y, type, width = 92) {
    const settings = audioManager.getSettings();
    const value = type === 'music' ? settings.musicVolume : settings.sfxVolume;
    const touchOptimized = width > 120;
    const trackGlowHeight = touchOptimized ? 28 : 10;
    const trackHeight = touchOptimized ? 12 : 3;
    const knobGlowRadius = touchOptimized ? 18 : 7;
    const knobRadius = touchOptimized ? 14 : 4.5;
    const hitAreaHeight = touchOptimized ? 60 : 14;
    let activePointerId = null;

    const container = this.add.container(x, y);
    const trackGlow = this.add.rectangle(width * 0.5, 0, width + 6, trackGlowHeight, 0xf59e0b, 0.04);
    const trackHit = this.add.rectangle(width * 0.5, 0, width, hitAreaHeight, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true });
    const track = this.add.rectangle(0, 0, width, trackHeight, 0x332a22, 1).setOrigin(0, 0.5);
    const fill = this.add.rectangle(0, 0, width * value, trackHeight, 0xe9c27a, 1).setOrigin(0, 0.5);
    const knobGlow = this.add.circle(width * value, 0, knobGlowRadius, 0xf59e0b, 0.12);
    const knob = this.add.circle(width * value, 0, knobRadius, 0xfff2cf, 1)
      .setStrokeStyle(1, 0x6b4d1d, 0.95)
      .setInteractive({ draggable: true, useHandCursor: true });

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
      this.applyAudioSettings();
    };

    const clearActivePointer = (pointer) => {
      if (!pointer || activePointerId === pointer.id) {
        activePointerId = null;
      }
    };

    const handlePointerMove = (pointer) => {
      if (activePointerId !== pointer.id || !pointer.isDown) {
        return;
      }

      updateFromPointer(pointer);
    };

    knob.on('drag', (pointer) => updateFromPointer(pointer));
    knob.on('pointerover', () => knobGlow.setFillStyle(0xf59e0b, 0.18));
    knob.on('pointerout', () => knobGlow.setFillStyle(0xf59e0b, 0.12));
    knob.on('pointerdown', (pointer) => {
      activePointerId = pointer.id;
      updateFromPointer(pointer);
    });
    knob.on('pointerup', clearActivePointer);
    knob.on('pointercancel', clearActivePointer);
    trackHit.on('pointerdown', (pointer) => {
      activePointerId = pointer.id;
      updateFromPointer(pointer);
    });
    trackHit.on('pointermove', handlePointerMove);
    trackHit.on('pointerup', clearActivePointer);
    trackHit.on('pointerout', clearActivePointer);
    this.input.on('pointermove', handlePointerMove);
    this.input.on('pointerup', clearActivePointer);
    this.input.on('gameout', () => {
      activePointerId = null;
    });

    container.add([trackGlow, trackHit, track, fill, knobGlow, knob]);

    return { container, track: trackHit, fill, knob, knobGlow, width, type };
  }

  toggleAudioPanel() {
    if (!this.audioPanel) {
      return;
    }

    const show = !this.audioPanel.visible;
    this.audioPanel.setVisible(true);
    this.setTitleAudioPanelInputEnabled(show);
    this.tweens.killTweensOf(this.audioPanel);
    this.tweens.add({
      targets: this.audioPanel,
      alpha: show ? 1 : 0,
      scaleX: show ? 1 : 0.94,
      scaleY: show ? 1 : 0.94,
      duration: 160,
      ease: show ? 'Back.out(2.4)' : 'Sine.out',
      onComplete: () => {
        if (!show) {
          this.audioPanel.setVisible(false);
        }
      },
    });
  }

  refreshMusicUi() {
    const settings = audioManager.getSettings();
    const audioOn = settings.musicEnabled && !settings.muted;

    if (this.audioToggleLabel) {
      this.audioToggleLabel.setText(audioOn ? 'AUD' : 'MUTE');
      this.audioToggleLabel.setColor(audioOn ? '#f7e4b1' : '#f7d6dc');
    }

    if (this.audioToggleBg) {
      this.audioToggleBg.setStrokeStyle(1, 0xf3d38b, audioOn ? 0.7 : 0.4);
      this.audioToggleBg.setFillStyle(audioOn ? 0x131712 : 0x090b11, audioOn ? 0.92 : 0.84);
    }

    if (this.audioToggleGlow) {
      this.audioToggleGlow.setFillStyle(audioOn ? 0xf59e0b : 0x6b7280, audioOn ? 0.14 : 0.06);
    }

    if (this.audioToggleInlineLabel) {
      this.audioToggleInlineLabel.setText(audioOn ? 'AUDIO ON' : 'AUDIO OFF');
      this.audioToggleInlineLabel.setColor(audioOn ? '#f3e1b3' : '#f7d6dc');
    }

    if (this.audioToggleInlineBg) {
      this.audioToggleInlineBg.setStrokeStyle(1, 0xf3d38b, audioOn ? 0.52 : 0.34);
    }

    if (this.audioToggleInlineStatus) {
      this.audioToggleInlineStatus.setText(audioOn ? 'Live' : 'Muted');
      this.audioToggleInlineStatus.setColor(audioOn ? '#c7e4b0' : '#c9ad97');
    }

    if (this.musicSlider) {
      this.musicSlider.fill.width = this.musicSlider.width * settings.musicVolume;
      this.musicSlider.knob.x = this.musicSlider.width * settings.musicVolume;
      this.musicSlider.knobGlow.x = this.musicSlider.width * settings.musicVolume;
    }

    if (this.sfxSlider) {
      this.sfxSlider.fill.width = this.sfxSlider.width * settings.sfxVolume;
      this.sfxSlider.knob.x = this.sfxSlider.width * settings.sfxVolume;
      this.sfxSlider.knobGlow.x = this.sfxSlider.width * settings.sfxVolume;
    }
  }

  handleExternalMenuHover() {
    if (!this.scene.isActive()) {
      return;
    }

    if (this.time.now - this.lastHoverSoundAt <= 180) {
      return;
    }

    playSfx(this, SFX_KEYS.MENU_HOVER, { volume: 0.08 });
    this.lastHoverSoundAt = this.time.now;
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

    this.beginQuest();
  }

  tryStartTitleMusic() {
    if (!this.sound || !this.cache.audio.exists(SFX_KEYS.TITLE_BGM)) {
      this.refreshMusicUi();
      return false;
    }

    if (this.sound.locked) {
      this.pendingMusicRetry = true;
      this.refreshMusicUi();
      return false;
    }

    this.titleMusic = audioManager.syncMusicTrack(this, 'title', SFX_KEYS.TITLE_BGM, 1, 340);

    this.pendingMusicRetry = false;
    this.applyAudioSettings();
    return true;
  }

  requestAudioUnlockAndStart() {
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
          this.pendingMusicRetry = true;
        })
        .finally(() => {
          this.tryStartTitleMusic();
        });
      return;
    }

    this.tryStartTitleMusic();
  }

  toggleTitleMusic() {
    const settings = audioManager.getSettings();
    const audioOn = settings.musicEnabled && !settings.muted;

    // If we're already ON but waiting for browser audio unlock, treat clicks as
    // retry attempts instead of toggling OFF (prevents multi-click flip-flop).
    if (audioOn && this.pendingMusicRetry) {
      this.requestAudioUnlockAndStart();
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
      this.requestAudioUnlockAndStart();
    } else {
      this.pendingMusicRetry = false;
      this.applyAudioSettings();
    }
  }

  applyAudioSettings() {
    this.refreshMusicUi();
    this.titleMusic = audioManager.syncMusicTrack(this, 'title', SFX_KEYS.TITLE_BGM, 1, 220);
  }

  fadeOutTitleMusic(onComplete) {
    audioManager.fadeOutAndStop(this, this.titleMusic, 420, onComplete);
  }

  cleanupTitleAudio() {
    if (!this.sound) {
      return;
    }

    if (this.titleMusic) {
      this.titleMusic.stop();
      this.titleMusic.destroy();
      this.titleMusic = null;
    }

    this.pendingMusicRetry = false;
    this.audioHud = null;
    this.audioToggleBg = null;
    this.audioToggleLabel = null;
    this.audioPanel = null;
    this.musicSlider = null;
    this.sfxSlider = null;
    this.audioPanelBounds = null;

    if (this.handleUnlockRetry) {
      this.input.off('pointerdown', this.handleUnlockRetry, this);
      this.handleUnlockRetry = null;
    }

    if (this.handlePanelOutsideClick) {
      this.input.off('pointerdown', this.handlePanelOutsideClick, this);
      this.handlePanelOutsideClick = null;
    }

    if (this.handleUnlockRetryKey) {
      this.input.keyboard?.off('keydown', this.handleUnlockRetryKey, this);
      this.handleUnlockRetryKey = null;
    }

    this.sound.stopByKey(SFX_KEYS.TITLE_BGM);
    this.sound.stopByKey(SFX_KEYS.TITLE_AMBIENT);
    this.sound.stopByKey(SFX_KEYS.MENU_HOVER);
    this.sound.stopByKey(SFX_KEYS.MENU_CONFIRM);
  }

  beginQuest() {
    if (this.menuStarted) {
      return;
    }

    this.menuStarted = true;

    if (audioManager.enableMusicFromUserGesture()) {
      this.requestAudioUnlockAndStart();
    } else {
      this.refreshMusicUi();
    }

    playSfx(this, SFX_KEYS.MENU_CONFIRM, { volume: 0.22 });
    eventBridge.emit('title:begin');
  }

  handleBeginJourney() {
    if (!this.scene.isActive() || this.levelStarting) {
      return;
    }

    this.levelStarting = true;
    this.fadeOutTitleMusic(() => {
      this.scene.start('Level1', { autoStart: true });
    });
  }
}

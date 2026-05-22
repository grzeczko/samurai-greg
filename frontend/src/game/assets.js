export const TEXTURE_KEYS = {
  AUTUMN_TILES: 'autumn-tiles',
  AUTUMN_TREES: 'autumn-trees',
  AUTUMN_BG_FAR: 'autumn-bg-far',
  AUTUMN_BG_MID: 'autumn-bg-mid',
  AUTUMN_BG_NEAR: 'autumn-bg-near',
  VILLAGE_PROP_TREE: 'village-prop-tree',
  DEMON_PROJECTILE: 'demon-projectile',
  SAMURAI_IDLE: 'samurai-idle-sheet',
  SAMURAI_RUN: 'samurai-run-sheet',
  SAMURAI_JUMP: 'samurai-jump-sheet',
  SAMURAI_FALL: 'samurai-fall-sheet',
  SAMURAI_ATTACK: 'samurai-attack-sheet',
  SAMURAI_THROW: 'samurai-throw-sheet',
  SAMURAI_DEFEND: 'samurai-defend-sheet',
  SAMURAI_WALL_SLIDE: 'samurai-wall-slide-sheet',
  SAMURAI_WALL_JUMP: 'samurai-wall-jump-sheet',
  SAMURAI_DASH: 'samurai-dash-sheet',
  SAMURAI_HURT: 'samurai-hurt-sheet',
  SAMURAI_DEATH: 'samurai-death-sheet',
  SAMURAI_SHURIKEN: 'samurai-shuriken',
  DEMON_FLY: 'demon-fly-sheet',
  DEMON_ATTACK: 'demon-attack-sheet',
  DEMON_HURT: 'demon-hurt-sheet',
  DEMON_DEATH: 'demon-death-sheet',
  BOSS_IDLE: 'demon-samurai-idle-sheet',
  BOSS_RUN: 'demon-samurai-run-sheet',
  BOSS_ATTACK_1: 'demon-samurai-attack-1-sheet',
  BOSS_ATTACK_2: 'demon-samurai-attack-2-sheet',
  BOSS_JUMP_ATTACK: 'demon-samurai-jump-attack-sheet',
  BOSS_HURT: 'demon-samurai-hurt-sheet',
  BOSS_DEATH: 'demon-samurai-death-sheet',
  BOSS_SHOUT: 'demon-samurai-shout-sheet',
};

export const ANIM_KEYS = {
  SAMURAI_IDLE: 'samurai-idle',
  SAMURAI_RUN: 'samurai-run',
  SAMURAI_JUMP: 'samurai-jump',
  SAMURAI_FALL: 'samurai-fall',
  SAMURAI_ATTACK: 'samurai-attack',
  SAMURAI_THROW: 'samurai-throw',
  SAMURAI_DEFEND: 'samurai-defend',
  SAMURAI_WALL_SLIDE: 'samurai-wall-slide',
  SAMURAI_WALL_JUMP: 'samurai-wall-jump',
  SAMURAI_DASH: 'samurai-dash',
  SAMURAI_HURT: 'samurai-hurt',
  SAMURAI_DEATH: 'samurai-death',
  DEMON_FLY: 'demon-fly',
  DEMON_ATTACK: 'demon-attack',
  DEMON_HURT: 'demon-hurt',
  DEMON_DEATH: 'demon-death',
  BOSS_IDLE: 'demon-samurai-idle',
  BOSS_RUN: 'demon-samurai-run',
  BOSS_ATTACK_1: 'demon-samurai-attack-1',
  BOSS_ATTACK_2: 'demon-samurai-attack-2',
  BOSS_JUMP_ATTACK: 'demon-samurai-jump-attack',
  BOSS_HURT: 'demon-samurai-hurt',
  BOSS_DEATH: 'demon-samurai-death',
  BOSS_SHOUT: 'demon-samurai-shout',
};

import { audioManager } from './audio/AudioManager';

export const SFX_KEYS = {
  TITLE_BGM: 'sfx-title-bgm',
  GAME_BGM: 'sfx-game-bgm',
  TITLE_AMBIENT: 'sfx-title-ambient',
  MENU_HOVER: 'sfx-menu-hover',
  MENU_CONFIRM: 'sfx-menu-confirm',
  JUMP: 'sfx-jump',
  WALL_JUMP: 'sfx-wall-jump',
  ATTACK: 'sfx-attack',
  BLOCK: 'sfx-block',
  PICKUP: 'sfx-pickup',
  ENEMY_HIT: 'sfx-enemy-hit',
  PLAYER_HURT: 'sfx-player-hurt',
  FIREBALL_CAST: 'sfx-fireball-cast',
  FIREBALL_IMPACT: 'sfx-fireball-impact',
  PORTAL: 'sfx-portal',
  BOSS_BGM: 'sfx-boss-bgm',
};

export const GAME_ASSETS = {
  spritesheets: [
    // Samurai sheets are 96px tall and widths are clean 96px multiples.
    { key: TEXTURE_KEYS.SAMURAI_IDLE, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/IDLE.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_RUN, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/RUN.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_JUMP, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/JUMP.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_FALL, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/JUMP-FALL.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_ATTACK, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/ATTACK 1.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_THROW, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/THROW.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_DEFEND, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/DEFEND.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_WALL_SLIDE, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/WALL SLIDE.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_WALL_JUMP, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/WALL JUMP.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_DASH, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/DASH.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_HURT, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/HURT.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    { key: TEXTURE_KEYS.SAMURAI_DEATH, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/Sprites/DEATH.png', import.meta.url).href, frameWidth: 96, frameHeight: 96 },
    // Demon sheets are 69px tall; widths divide into 79px frames.
    { key: TEXTURE_KEYS.DEMON_FLY, url: new URL('../../assets/characters/Flying Demon 2D Pixel Art/Sprites/without_outline/FLYING.png', import.meta.url).href, frameWidth: 79, frameHeight: 69 },
    { key: TEXTURE_KEYS.DEMON_ATTACK, url: new URL('../../assets/characters/Flying Demon 2D Pixel Art/Sprites/without_outline/ATTACK.png', import.meta.url).href, frameWidth: 79, frameHeight: 69 },
    { key: TEXTURE_KEYS.DEMON_HURT, url: new URL('../../assets/characters/Flying Demon 2D Pixel Art/Sprites/without_outline/HURT.png', import.meta.url).href, frameWidth: 79, frameHeight: 69 },
    { key: TEXTURE_KEYS.DEMON_DEATH, url: new URL('../../assets/characters/Flying Demon 2D Pixel Art/Sprites/without_outline/DEATH.png', import.meta.url).href, frameWidth: 79, frameHeight: 69 },
    // Demon Samurai boss sheets use 128px-wide frames and 108px height.
    { key: TEXTURE_KEYS.BOSS_IDLE, url: new URL('../../assets/characters/Demon Samurai 2D Pixel Art/Sprites/IDLE (FLAMING SWORD).png', import.meta.url).href, frameWidth: 128, frameHeight: 108 },
    { key: TEXTURE_KEYS.BOSS_RUN, url: new URL('../../assets/characters/Demon Samurai 2D Pixel Art/Sprites/RUN (FLAMING SWORD).png', import.meta.url).href, frameWidth: 128, frameHeight: 108 },
    { key: TEXTURE_KEYS.BOSS_ATTACK_1, url: new URL('../../assets/characters/Demon Samurai 2D Pixel Art/Sprites/ATTACK 1 (FLAMING SWORD).png', import.meta.url).href, frameWidth: 128, frameHeight: 108 },
    { key: TEXTURE_KEYS.BOSS_ATTACK_2, url: new URL('../../assets/characters/Demon Samurai 2D Pixel Art/Sprites/ATTACK 2 (FLAMING SWORD).png', import.meta.url).href, frameWidth: 128, frameHeight: 108 },
    { key: TEXTURE_KEYS.BOSS_JUMP_ATTACK, url: new URL('../../assets/characters/Demon Samurai 2D Pixel Art/Sprites/JUMP ATTACK (FLAMING SWORD).png', import.meta.url).href, frameWidth: 128, frameHeight: 108 },
    { key: TEXTURE_KEYS.BOSS_HURT, url: new URL('../../assets/characters/Demon Samurai 2D Pixel Art/Sprites/HURT (FLAMING SWORD).png', import.meta.url).href, frameWidth: 128, frameHeight: 108 },
    { key: TEXTURE_KEYS.BOSS_DEATH, url: new URL('../../assets/characters/Demon Samurai 2D Pixel Art/Sprites/DEATH.png', import.meta.url).href, frameWidth: 128, frameHeight: 108 },
    { key: TEXTURE_KEYS.BOSS_SHOUT, url: new URL('../../assets/characters/Demon Samurai 2D Pixel Art/Sprites/SHOUT.png', import.meta.url).href, frameWidth: 128, frameHeight: 108 },
    { key: TEXTURE_KEYS.AUTUMN_TILES, url: new URL('../../assets/packs/Autumn Forest 2D Pixel Art/Autumn Forest 2D Pixel Art/Tileset/Tileset.png', import.meta.url).href, frameWidth: 32, frameHeight: 32 },
    { key: TEXTURE_KEYS.AUTUMN_TREES, url: new URL('../../assets/packs/Autumn Forest 2D Pixel Art/Autumn Forest 2D Pixel Art/Trees/Trees.png', import.meta.url).href, frameWidth: 80, frameHeight: 160 },
  ],
  images: [
    { key: TEXTURE_KEYS.AUTUMN_BG_NEAR, url: new URL('../../assets/packs/Autumn Forest 2D Pixel Art/Autumn Forest 2D Pixel Art/Background/1.png', import.meta.url).href },
    { key: TEXTURE_KEYS.AUTUMN_BG_MID, url: new URL('../../assets/packs/Autumn Forest 2D Pixel Art/Autumn Forest 2D Pixel Art/Background/2.png', import.meta.url).href },
    { key: TEXTURE_KEYS.AUTUMN_BG_FAR, url: new URL('../../assets/packs/Autumn Forest 2D Pixel Art/Autumn Forest 2D Pixel Art/Background/3.png', import.meta.url).href },
    { key: TEXTURE_KEYS.VILLAGE_PROP_TREE, url: new URL('../../assets/packs/Feudal Japan Village – 2D Pixel Art Platformer Asset Pack/Props/Prop (2)/Prop (2)1.png', import.meta.url).href },
    { key: TEXTURE_KEYS.DEMON_PROJECTILE, url: new URL('../../assets/characters/Flying Demon 2D Pixel Art/Sprites/projectile.png', import.meta.url).href },
    { key: TEXTURE_KEYS.SAMURAI_SHURIKEN, url: new URL('../../assets/characters/FULL_Samurai 2D Pixel Art v1.2/shuriken.png', import.meta.url).href },
  ],
  audio: [
    { key: SFX_KEYS.TITLE_BGM, url: new URL('../../assets/music/monkredeysounds-taiko-amp-brams-scene-171340.mp3', import.meta.url).href },
    { key: SFX_KEYS.GAME_BGM, url: new URL('../../assets/music/ebunny-samurai-loop-370026.mp3', import.meta.url).href },
    { key: SFX_KEYS.TITLE_AMBIENT, url: new URL('../../assets/sounds/Fireball_sounds/floraphonic-fireball-whoosh-1-179125.mp3', import.meta.url).href },
    { key: SFX_KEYS.MENU_HOVER, url: new URL('../../assets/sounds/12_Sword_Combat_Sounds/UI_Menu_Grab_Swod.wav', import.meta.url).href },
    { key: SFX_KEYS.MENU_CONFIRM, url: new URL('../../assets/sounds/12_Sword_Combat_Sounds/Sword_Draw.wav', import.meta.url).href },
    { key: SFX_KEYS.JUMP, url: new URL('../../assets/sounds/12_Sword_Combat_Sounds/Whoosh_Weapon_01.wav', import.meta.url).href },
    { key: SFX_KEYS.WALL_JUMP, url: new URL('../../assets/sounds/12_Sword_Combat_Sounds/Whoosh_Aggressive.wav', import.meta.url).href },
    { key: SFX_KEYS.ATTACK, url: new URL('../../assets/sounds/12_Sword_Combat_Sounds/Sword_Slahes_01.wav', import.meta.url).href },
    { key: SFX_KEYS.BLOCK, url: new URL('../../assets/sounds/12_Sword_Combat_Sounds/Block_With_Sword_04.wav', import.meta.url).href },
    { key: SFX_KEYS.PICKUP, url: new URL('../../assets/sounds/12_Sword_Combat_Sounds/UI_Menu_Grab_Swod.wav', import.meta.url).href },
    { key: SFX_KEYS.ENEMY_HIT, url: new URL('../../assets/sounds/12_Sword_Combat_Sounds/HitMark_Sword_01.wav', import.meta.url).href },
    { key: SFX_KEYS.PLAYER_HURT, url: new URL('../../assets/sounds/12_Sword_Combat_Sounds/Wound_01.wav', import.meta.url).href },
    { key: SFX_KEYS.FIREBALL_CAST, url: new URL('../../assets/sounds/Fireball_sounds/floraphonic-fireball-whoosh-1-179125.mp3', import.meta.url).href },
    { key: SFX_KEYS.FIREBALL_IMPACT, url: new URL('../../assets/sounds/Fireball_sounds/koiroylers-fireball-impact-351961.mp3', import.meta.url).href },
    { key: SFX_KEYS.PORTAL, url: new URL('../../assets/sounds/Fireball_sounds/floraphonic-fireball-whoosh-2-179126.mp3', import.meta.url).href },
    { key: SFX_KEYS.BOSS_BGM, url: new URL('../../assets/sounds/davidgallie-final-boss-483043 (1).mp3', import.meta.url).href },
  ],
};

export function preloadGameAssets(scene) {
  GAME_ASSETS.spritesheets.forEach(asset => {
    scene.load.spritesheet(asset.key, asset.url, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight,
    });
  });

  GAME_ASSETS.images.forEach(asset => {
    scene.load.image(asset.key, asset.url);
  });

  GAME_ASSETS.audio.forEach(asset => {
    scene.load.audio(asset.key, asset.url);
  });
}

export function createGameAnimations(scene) {
  const createAnimation = ({ key, texture, start, end, frameRate, repeat = -1 }) => {
    if (scene.anims.exists(key)) {
      return;
    }

    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, { start, end }),
      frameRate,
      repeat,
    });
  };

  createAnimation({ key: ANIM_KEYS.SAMURAI_IDLE, texture: TEXTURE_KEYS.SAMURAI_IDLE, start: 0, end: 9, frameRate: 10 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_RUN, texture: TEXTURE_KEYS.SAMURAI_RUN, start: 0, end: 15, frameRate: 16 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_JUMP, texture: TEXTURE_KEYS.SAMURAI_JUMP, start: 0, end: 2, frameRate: 8, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_FALL, texture: TEXTURE_KEYS.SAMURAI_FALL, start: 0, end: 2, frameRate: 8 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_ATTACK, texture: TEXTURE_KEYS.SAMURAI_ATTACK, start: 0, end: 6, frameRate: 18, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_THROW, texture: TEXTURE_KEYS.SAMURAI_THROW, start: 0, end: 6, frameRate: 18, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_DEFEND, texture: TEXTURE_KEYS.SAMURAI_DEFEND, start: 0, end: 5, frameRate: 12 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_WALL_SLIDE, texture: TEXTURE_KEYS.SAMURAI_WALL_SLIDE, start: 0, end: 2, frameRate: 8 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_WALL_JUMP, texture: TEXTURE_KEYS.SAMURAI_WALL_JUMP, start: 0, end: 2, frameRate: 10, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_DASH, texture: TEXTURE_KEYS.SAMURAI_DASH, start: 0, end: 7, frameRate: 22, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_HURT, texture: TEXTURE_KEYS.SAMURAI_HURT, start: 0, end: 3, frameRate: 12, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.SAMURAI_DEATH, texture: TEXTURE_KEYS.SAMURAI_DEATH, start: 0, end: 8, frameRate: 12, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.DEMON_FLY, texture: TEXTURE_KEYS.DEMON_FLY, start: 0, end: 3, frameRate: 8 });
  createAnimation({ key: ANIM_KEYS.DEMON_ATTACK, texture: TEXTURE_KEYS.DEMON_ATTACK, start: 0, end: 7, frameRate: 14, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.DEMON_HURT, texture: TEXTURE_KEYS.DEMON_HURT, start: 0, end: 3, frameRate: 10, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.DEMON_DEATH, texture: TEXTURE_KEYS.DEMON_DEATH, start: 0, end: 6, frameRate: 10, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.BOSS_IDLE, texture: TEXTURE_KEYS.BOSS_IDLE, start: 0, end: 5, frameRate: 8 });
  createAnimation({ key: ANIM_KEYS.BOSS_RUN, texture: TEXTURE_KEYS.BOSS_RUN, start: 0, end: 7, frameRate: 12 });
  createAnimation({ key: ANIM_KEYS.BOSS_ATTACK_1, texture: TEXTURE_KEYS.BOSS_ATTACK_1, start: 0, end: 6, frameRate: 13, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.BOSS_ATTACK_2, texture: TEXTURE_KEYS.BOSS_ATTACK_2, start: 0, end: 5, frameRate: 13, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.BOSS_JUMP_ATTACK, texture: TEXTURE_KEYS.BOSS_JUMP_ATTACK, start: 0, end: 10, frameRate: 12, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.BOSS_HURT, texture: TEXTURE_KEYS.BOSS_HURT, start: 0, end: 3, frameRate: 12, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.BOSS_DEATH, texture: TEXTURE_KEYS.BOSS_DEATH, start: 0, end: 25, frameRate: 14, repeat: 0 });
  createAnimation({ key: ANIM_KEYS.BOSS_SHOUT, texture: TEXTURE_KEYS.BOSS_SHOUT, start: 0, end: 16, frameRate: 13, repeat: 0 });
}

export function playSfx(scene, key, config = {}) {
  if (!scene) {
    return;
  }

  audioManager.playSfx(scene, key, {
    ...config,
    volume: config.volume ?? 1,
  });
}

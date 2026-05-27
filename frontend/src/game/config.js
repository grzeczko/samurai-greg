import Phaser from 'phaser';

export const GAMEPLAY_CAPTURE_KEYS = [
  Phaser.Input.Keyboard.KeyCodes.UP,
  Phaser.Input.Keyboard.KeyCodes.DOWN,
  Phaser.Input.Keyboard.KeyCodes.LEFT,
  Phaser.Input.Keyboard.KeyCodes.RIGHT,
  Phaser.Input.Keyboard.KeyCodes.SPACE,
  Phaser.Input.Keyboard.KeyCodes.W,
  Phaser.Input.Keyboard.KeyCodes.S,
  Phaser.Input.Keyboard.KeyCodes.A,
  Phaser.Input.Keyboard.KeyCodes.D,
  Phaser.Input.Keyboard.KeyCodes.X,
  Phaser.Input.Keyboard.KeyCodes.J,
  Phaser.Input.Keyboard.KeyCodes.C,
  Phaser.Input.Keyboard.KeyCodes.L,
  Phaser.Input.Keyboard.KeyCodes.SHIFT,
  Phaser.Input.Keyboard.KeyCodes.K,
  Phaser.Input.Keyboard.KeyCodes.P,
  Phaser.Input.Keyboard.KeyCodes.ESC,
];

const gameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-container',
  width: 1024,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  input: {
    keyboard: {
      capture: GAMEPLAY_CAPTURE_KEYS,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: false,
  },
};

export default gameConfig;

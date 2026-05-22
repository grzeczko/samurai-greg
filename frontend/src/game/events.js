import Phaser from 'phaser';

// Create a simple event emitter for Phaser-React communication
class EventBridge extends Phaser.Events.EventEmitter {
  constructor() {
    super();
  }
}

export const eventBridge = new EventBridge();

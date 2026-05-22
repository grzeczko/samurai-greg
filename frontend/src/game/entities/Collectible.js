import { getPowerupById } from '../../data/resumePowerups.js';
import { createPowerupOrb } from '../ui/worldVisuals.js';

export class Collectible {
  constructor(scene, x, y, powerupId) {
    this.scene = scene;
    this.powerupId = powerupId;
    this.powerup = getPowerupById(powerupId);
    this.collected = false;

    if (!this.powerup) {
      console.warn(`Powerup not found: ${powerupId}`);
      return;
    }

    const orb = createPowerupOrb(scene, x, y, this.powerup);
    this.sprite = orb.sprite;
    this.visuals = orb;

    // Store reference for collision detection
    this.sprite.collectible = this;
  }

  getSprite() {
    return this.sprite;
  }

  collect() {
    if (this.collected) {
      return false;
    }

    this.collected = true;
    this.scene.physics.world.disable(this.sprite);

    try {
      this.visuals?.burst?.();
      this.visuals?.destroy?.();
    } catch (error) {
      console.error('Failed to clean up collectible visuals:', error);
      this.sprite?.destroy();
    }

    return true;
  }
}

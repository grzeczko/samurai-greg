import { ANIM_KEYS, SFX_KEYS, TEXTURE_KEYS, playSfx } from '../assets.js';

const ENEMY_TUNING = {
  CHASE_RANGE: 430,
  THROW_RANGE: 560,
  CHASE_SPEED: 112,
  THROW_COOLDOWN: 2200,
  PROJECTILE_SPEED: 340,
  PROJECTILE_LIFETIME: 2600,
  MAX_PROJECTILES: 2,
  BOUND_PADDING: 18,
  TURN_COOLDOWN: 260,
};

const ENEMY_BODY = {
  WIDTH: 45,
  HEIGHT: 36,
  OFFSET_X: 18,
  OFFSET_Y: 25,
};

export class Enemy {
  constructor(scene, x, y, { leftBound, rightBound, speed = 82, phase = 0 } = {}) {
    this.scene = scene;
    this.leftBound = leftBound;
    this.rightBound = rightBound;
    this.speed = speed;
    this.phase = phase;
    this.nextThrowAt = 900 + phase;
    this.nextTurnAt = 0;
    this.direction = speed >= 0 ? 1 : -1;
    this.isSlain = false;
    this.spawnX = x;
    this.spawnY = y;

    this.projectiles = scene.physics.add.group({ allowGravity: false });
    this.sprite = scene.physics.add.sprite(x, y, TEXTURE_KEYS.DEMON_FLY, 0).setDepth(24);
    this.sprite.setScale(0.88);
    this.sprite.play(ANIM_KEYS.DEMON_FLY);

    this.ensureBody()?.setVelocityX(this.direction * this.speed);
  }

  ensureBody() {
    if (!this.sprite?.body) {
      this.scene.physics.add.existing(this.sprite);
    }

    const body = this.sprite?.body;

    if (!body) {
      return null;
    }

    body.setAllowGravity(false);
    body.setCollideWorldBounds(true);
    body.setSize(ENEMY_BODY.WIDTH, ENEMY_BODY.HEIGHT);
    body.setOffset(ENEMY_BODY.OFFSET_X, ENEMY_BODY.OFFSET_Y);

    return body;
  }

  update(playerSprite) {
    if (this.isSlain) {
      return;
    }

    const distanceToPlayer = playerSprite ? Math.abs(playerSprite.x - this.sprite.x) : Infinity;
    const playerDeltaX = playerSprite ? playerSprite.x - this.sprite.x : 0;
    const playerDeltaY = playerSprite ? playerSprite.y - this.sprite.y : 0;

    if (distanceToPlayer <= ENEMY_TUNING.CHASE_RANGE) {
      this.chasePlayer(playerDeltaX);
    } else {
      this.patrol();
    }

    if (distanceToPlayer <= ENEMY_TUNING.THROW_RANGE) {
      this.tryThrowProjectile(playerDeltaX, playerDeltaY);
    }

    this.hover();
    this.cleanupProjectiles();
    this.updateFacing();
  }

  patrol() {
    if (this.sprite.x <= this.leftBound + ENEMY_TUNING.BOUND_PADDING) {
      this.setDirection(1, true);
    } else if (this.sprite.x >= this.rightBound - ENEMY_TUNING.BOUND_PADDING) {
      this.setDirection(-1, true);
    }

    this.applyHorizontalVelocity(this.speed);
  }

  chasePlayer(playerDeltaX) {
    const direction = playerDeltaX >= 0 ? 1 : -1;

    if (this.sprite.x <= this.leftBound + ENEMY_TUNING.BOUND_PADDING) {
      this.setDirection(1, true);
      this.applyHorizontalVelocity(this.speed);
      return;
    }

    if (this.sprite.x >= this.rightBound - ENEMY_TUNING.BOUND_PADDING) {
      this.setDirection(-1, true);
      this.applyHorizontalVelocity(this.speed);
      return;
    }

    this.setDirection(direction);
    this.applyHorizontalVelocity(ENEMY_TUNING.CHASE_SPEED);
  }

  setDirection(direction, force = false) {
    const normalizedDirection = direction >= 0 ? 1 : -1;
    const now = this.scene.time.now;

    if (!force && normalizedDirection !== this.direction && now < this.nextTurnAt) {
      return;
    }

    if (normalizedDirection !== this.direction) {
      this.nextTurnAt = now + ENEMY_TUNING.TURN_COOLDOWN;
    }

    this.direction = normalizedDirection;
  }

  applyHorizontalVelocity(speed) {
    this.ensureBody()?.setVelocityX(this.direction * speed);
  }

  hover() {
    const wave = Math.sin((this.scene.time.now + this.phase) * 0.004);

    this.ensureBody()?.setVelocityY(wave * 34);
  }

  tryThrowProjectile(playerDeltaX, playerDeltaY) {
    if (
      this.scene.time.now < this.nextThrowAt
      || this.countActiveProjectiles() >= ENEMY_TUNING.MAX_PROJECTILES
      || Math.abs(playerDeltaY) > 220
    ) {
      return;
    }

    const direction = playerDeltaX >= 0 ? 1 : -1;
    const projectile = this.projectiles.create(
      this.sprite.x + (direction * 30),
      this.sprite.y + 2,
      TEXTURE_KEYS.DEMON_PROJECTILE
    ).setDepth(23);

    projectile.setScale(0.75);
    projectile.setFlipX(direction > 0);
    projectile.body.setAllowGravity(false);
    projectile.body.setImmovable(false);
    projectile.body.setSize(34, 20);
    projectile.body.setVelocity(
      direction * ENEMY_TUNING.PROJECTILE_SPEED,
      Math.max(-82, Math.min(82, playerDeltaY * 0.28))
    );
    projectile.spawnedAt = this.scene.time.now;
    projectile.body.moves = true;

    this.nextThrowAt = this.scene.time.now + ENEMY_TUNING.THROW_COOLDOWN;
    playSfx(this.scene, SFX_KEYS.FIREBALL_CAST, { volume: 0.34 });
    this.sprite.play(ANIM_KEYS.DEMON_ATTACK, true);
    this.sprite.once('animationcomplete', () => {
      if (!this.isSlain) {
        this.sprite.play(ANIM_KEYS.DEMON_FLY, true);
      }
    });
  }

  countActiveProjectiles() {
    return this.projectiles.getChildren().filter(projectile => projectile.active).length;
  }

  cleanupProjectiles() {
    this.projectiles.getChildren().forEach((projectile) => {
      const isExpired = this.scene.time.now - projectile.spawnedAt > ENEMY_TUNING.PROJECTILE_LIFETIME;
      const isOutOfBounds = projectile.x < this.leftBound - 260 || projectile.x > this.rightBound + 260;

      if (isExpired || isOutOfBounds) {
        this.destroyProjectile(projectile);
      }
    });
  }

  destroyProjectile(projectile) {
    if (projectile?.active) {
      projectile.destroy();
    }
  }

  clearDaggers() {
    this.clearProjectiles();
  }

  clearProjectiles() {
    this.projectiles.getChildren().forEach(projectile => this.destroyProjectile(projectile));
  }

  resumePatrol() {
    if (this.isSlain) {
      return;
    }

    const body = this.ensureBody();

    if (!body) {
      return;
    }

    if (body.velocity.x === 0) {
      this.applyHorizontalVelocity(this.speed);
    }

    this.sprite.play(ANIM_KEYS.DEMON_FLY, true);
  }

  slayAndRespawnFromRight() {
    if (this.isSlain) {
      return false;
    }

    const body = this.ensureBody();

    if (!body) {
      return false;
    }

    this.isSlain = true;
    this.clearProjectiles();
    body.setVelocity(0, 0);
    body.enable = false;
    this.sprite.play(ANIM_KEYS.DEMON_DEATH, true);

    this.scene.time.delayedCall(620, () => this.sprite.setVisible(false));
    this.scene.time.delayedCall(1800, () => this.respawnFromRight());

    return true;
  }

  respawnFromRight() {
    const respawnX = this.rightBound + 180;
    const body = this.ensureBody();

    if (!body) {
      return;
    }

    this.isSlain = false;
    this.sprite.setVisible(true);
    body.enable = true;
    body.reset(respawnX, this.spawnY);
    this.direction = -1;
    body.setVelocity(this.direction * this.speed, 0);
    this.nextThrowAt = this.scene.time.now + 1400;
    this.sprite.play(ANIM_KEYS.DEMON_FLY, true);
    this.updateFacing();
  }

  isDefeated() {
    return this.isSlain;
  }

  updateFacing() {
    this.sprite.setFlipX(this.direction > 0);
  }

  setVisible(isVisible) {
    this.sprite.setVisible(isVisible);
  }

  getSprite() {
    return this.sprite;
  }

  getDaggers() {
    return this.projectiles;
  }

  destroy() {
    this.clearProjectiles();
    this.projectiles.destroy();
    this.sprite.destroy();
  }
}

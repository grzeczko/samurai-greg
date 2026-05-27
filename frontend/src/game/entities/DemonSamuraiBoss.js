import { ANIM_KEYS, SFX_KEYS, TEXTURE_KEYS, playSfx } from '../assets.js';

const BOSS_TUNING = {
  MAX_HP: 12,
  SCALE: 1.28,
  BODY_WIDTH: 34,
  BODY_HEIGHT: 66,
  BODY_OFFSET_X: 47,
  BODY_OFFSET_Y: 35,
  SPEED: 132,
  RAGE_SPEED: 156,
  DASH_SPEED: 360,
  RAGE_DASH_SPEED: 420,
  JUMP_X_SPEED: 145,
  JUMP_Y_SPEED: -430,
  DAMAGE_COOLDOWN_MS: 480,
  ATTACK_COOLDOWN_MS: 940,
  RAGE_ATTACK_COOLDOWN_MS: 780,
  SLAM_COOLDOWN_MS: 3400,
  RAGE_SLAM_COOLDOWN_MS: 2700,
  COUNTER_HIT_INTERVAL: 4,
  EVADE_SPEED: 220,
  EVADE_MS: 230,
};

export class DemonSamuraiBoss {
  constructor(scene, x, y, { leftBound, rightBound } = {}) {
    this.scene = scene;
    this.spawnX = x;
    this.spawnY = y;
    this.leftBound = leftBound ?? x - 260;
    this.rightBound = rightBound ?? x + 260;
    this.maxHp = BOSS_TUNING.MAX_HP;
    this.hp = this.maxHp;
    this.direction = -1;
    this.state = 'dormant';
    this.active = false;
    this.defeated = false;
    this.nextAttackAt = 0;
    this.nextDamageAt = 0;
    this.nextSlamAt = 0;
    this.slamResolved = false;
    this.hitCount = 0;
    this.rageActive = false;
    this.timers = [];

    this.aura = scene.add.circle(x, y + 12, 64, 0xef4444, 0.16)
      .setDepth(21)
      .setVisible(false);

    this.sprite = scene.physics.add.sprite(x, y, TEXTURE_KEYS.BOSS_IDLE, 0)
      .setDepth(26)
      .setScale(BOSS_TUNING.SCALE)
      .setVisible(false);
    this.sprite.body.setSize(BOSS_TUNING.BODY_WIDTH, BOSS_TUNING.BODY_HEIGHT, false);
    this.sprite.body.setOffset(BOSS_TUNING.BODY_OFFSET_X, BOSS_TUNING.BODY_OFFSET_Y);
    this.sprite.body.setMaxVelocity(BOSS_TUNING.RAGE_DASH_SPEED, 720);
    this.sprite.body.enable = false;
    this.sprite.play(ANIM_KEYS.BOSS_IDLE);

    this.attackHitbox = scene.add.rectangle(x, y, 96, 64, 0xfff1a6, 0)
      .setDepth(27)
      .setVisible(false);
    scene.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.setAllowGravity(false);
    this.attackHitbox.body.enable = false;
  }

  startIntro({ immediate = false } = {}) {
    this.clearTimers();
    this.clearAttackHitbox();
    this.hp = this.maxHp;
    this.active = true;
    this.defeated = false;
    this.state = 'intro';
    this.direction = -1;
    this.slamResolved = false;
    this.hitCount = 0;
    this.rageActive = false;
    this.nextAttackAt = this.scene.time.now + 1600;
    this.nextDamageAt = 0;
    this.nextSlamAt = this.scene.time.now + 2500;

    this.sprite.body.enable = true;
    this.sprite.setVisible(true);
    this.sprite.setAlpha(1);
    this.sprite.clearTint();
    this.sprite.setPosition(this.spawnX + 150, this.spawnY);
    this.sprite.body.setVelocity(0, 0);
    this.faceDirection(-1);
    this.sprite.play(ANIM_KEYS.BOSS_SHOUT, true);

    this.aura.setPosition(this.sprite.x, this.sprite.y + 12)
      .setVisible(true)
      .setAlpha(0);

    if (immediate) {
      this.sprite.setPosition(this.spawnX, this.spawnY);
      this.aura.setPosition(this.spawnX, this.spawnY + 12)
        .setVisible(true)
        .setAlpha(0.18)
        .setScale(1.25, 0.82);
      playSfx(this.scene, SFX_KEYS.PORTAL, { volume: 0.32, rate: 0.72, detune: -260 });

      this.addTimer(1260, () => {
        if (this.state !== 'intro' || this.defeated) {
          return;
        }

        this.state = 'idle';
        this.sprite.play(ANIM_KEYS.BOSS_IDLE, true);
      });

      return;
    }

    this.scene.tweens.add({
      targets: this.aura,
      alpha: 0.18,
      scaleX: 1.25,
      scaleY: 0.82,
      duration: 720,
      ease: 'Sine.out',
    });
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.spawnX,
      duration: 980,
      ease: 'Cubic.out',
    });

    playSfx(this.scene, SFX_KEYS.PORTAL, { volume: 0.32, rate: 0.72, detune: -260 });

    this.addTimer(1260, () => {
      if (this.state !== 'intro' || this.defeated) {
        return;
      }

      this.state = 'idle';
      this.sprite.play(ANIM_KEYS.BOSS_IDLE, true);
    });
  }

  update(playerSprite) {
    this.enforceArenaBounds();
    this.syncEffects();

    if (!this.active || this.defeated || !playerSprite) {
      return;
    }

    if (this.state === 'intro' || this.state === 'rage' || this.state === 'dying') {
      this.sprite.body.setVelocityX(0);
      return;
    }

    if (this.state === 'hurt' || this.state === 'evade') {
      return;
    }

    if (this.state === 'slash' || this.state === 'dash' || this.state === 'counter') {
      this.syncAttackHitbox();
      return;
    }

    if (this.state === 'jumpSlam') {
      this.updateJumpSlam();
      return;
    }

    const deltaX = playerSprite.x - this.sprite.x;
    const distance = Math.abs(deltaX);
    const direction = deltaX >= 0 ? 1 : -1;
    this.faceDirection(direction);

    if (this.scene.time.now >= this.nextAttackAt) {
      if (distance < 108) {
        this.startSlash();
        return;
      }

      if (this.scene.time.now >= this.nextSlamAt && distance < (this.rageActive ? 440 : 390)) {
        this.startJumpSlam();
        return;
      }

      if (distance < (this.rageActive ? 500 : 430)) {
        this.startDash();
        return;
      }
    }

    this.patrolTowardPlayer(distance);
  }

  patrolTowardPlayer(distance) {
    if (this.sprite.x <= this.leftBound + 18) {
      this.faceDirection(1);
    } else if (this.sprite.x >= this.rightBound - 18) {
      this.faceDirection(-1);
    }

    if (distance > 82) {
      this.sprite.body.setVelocityX(this.direction * this.getMoveSpeed());
      this.sprite.play(ANIM_KEYS.BOSS_RUN, true);
      return;
    }

    this.sprite.body.setVelocityX(0);
    this.sprite.play(ANIM_KEYS.BOSS_IDLE, true);
  }

  startSlash() {
    this.state = 'slash';
    this.nextAttackAt = this.scene.time.now + this.getAttackCooldown();
    this.sprite.body.setVelocityX(0);
    this.sprite.play(ANIM_KEYS.BOSS_ATTACK_1, true);
    playSfx(this.scene, SFX_KEYS.ATTACK, { volume: 0.3, rate: 0.82, detune: -90 });

    this.addTimer(210, () => this.enableAttackHitbox(this.rageActive ? 88 : 78, 62, 44, -2));
    this.addTimer(470, () => this.clearAttackHitbox());
    this.addTimer(this.rageActive ? 660 : 740, () => this.returnToIdle());
  }

  startDash() {
    this.state = 'dash';
    this.nextAttackAt = this.scene.time.now + this.getAttackCooldown() + 300;
    this.sprite.play(ANIM_KEYS.BOSS_ATTACK_2, true);
    this.sprite.body.setVelocityX(this.direction * this.getDashSpeed());
    playSfx(this.scene, SFX_KEYS.WALL_JUMP, { volume: 0.24, rate: 0.76, detune: -160 });
    this.enableAttackHitbox(this.rageActive ? 132 : 118, 58, 64, 0);

    this.addTimer(430, () => {
      this.sprite.body.setVelocityX(0);
      this.clearAttackHitbox();
    });
    this.addTimer(this.rageActive ? 610 : 680, () => this.returnToIdle());
  }

  startJumpSlam() {
    this.state = 'jumpSlam';
    this.slamResolved = false;
    this.nextAttackAt = this.scene.time.now + this.getAttackCooldown() + 560;
    this.nextSlamAt = this.scene.time.now + this.getSlamCooldown();
    this.sprite.play(ANIM_KEYS.BOSS_JUMP_ATTACK, true);
    this.sprite.body.setVelocity(
      this.direction * (this.rageActive ? BOSS_TUNING.JUMP_X_SPEED + 26 : BOSS_TUNING.JUMP_X_SPEED),
      BOSS_TUNING.JUMP_Y_SPEED
    );
    playSfx(this.scene, SFX_KEYS.WALL_JUMP, { volume: 0.22, rate: 0.66, detune: -240 });
  }

  updateJumpSlam() {
    if (!this.slamResolved && this.sprite.body.blocked.down && this.sprite.body.velocity.y >= 0) {
      this.slamResolved = true;
      this.sprite.body.setVelocityX(0);
      this.enableAttackHitbox(this.rageActive ? 176 : 148, 74, 72, 8);
      this.scene.cameras.main.shake(180, 0.006);
      playSfx(this.scene, SFX_KEYS.FIREBALL_IMPACT, { volume: 0.28, rate: 0.78, detune: -180 });
      this.addTimer(210, () => this.clearAttackHitbox());
      this.addTimer(520, () => this.returnToIdle());
    }
  }

  takeDamage(fromX) {
    if (!this.active || this.defeated || this.state === 'dying' || this.scene.time.now < this.nextDamageAt) {
      return false;
    }

    this.hp = Math.max(0, this.hp - 1);
    this.nextDamageAt = this.scene.time.now + BOSS_TUNING.DAMAGE_COOLDOWN_MS;
    this.hitCount += 1;
    this.clearTimers();
    this.clearAttackHitbox();

    if (this.hp <= 0) {
      this.die(fromX);
      return true;
    }

    if (!this.rageActive && this.hp <= Math.ceil(this.maxHp * 0.5)) {
      this.startRageBurst(fromX);
      return true;
    }

    this.state = 'hurt';
    this.sprite.body.setVelocityX(fromX < this.sprite.x ? 72 : -72);
    this.sprite.play(ANIM_KEYS.BOSS_HURT, true);
    this.flash();
    playSfx(this.scene, SFX_KEYS.ENEMY_HIT, { volume: 0.38, rate: 0.82 });

    const shouldCounter = this.hitCount % BOSS_TUNING.COUNTER_HIT_INTERVAL === 0;
    this.addTimer(shouldCounter ? 150 : 240, () => {
      this.sprite.body.setVelocityX(0);
      if (shouldCounter) {
        this.startEvadeCounter(fromX);
      } else {
        this.returnToIdle();
      }
    });

    return true;
  }

  startRageBurst(fromX) {
    this.rageActive = true;
    this.state = 'rage';
    this.faceDirection(fromX < this.sprite.x ? -1 : 1);
    this.sprite.body.setVelocity(0, 0);
    this.sprite.play(ANIM_KEYS.BOSS_SHOUT, true);
    this.flash(0xff7733, 160);
    this.scene.cameras.main.shake(260, 0.007);
    playSfx(this.scene, SFX_KEYS.PORTAL, { volume: 0.34, rate: 0.66, detune: -320 });

    this.scene.tweens.add({
      targets: this.aura,
      alpha: 0.3,
      scaleX: 1.45,
      scaleY: 0.92,
      duration: 300,
      yoyo: true,
      ease: 'Sine.inOut',
    });

    this.addTimer(480, () => {
      if (this.defeated || !this.active) {
        return;
      }

      this.enableAttackHitbox(188, 78, 0, 4);
      playSfx(this.scene, SFX_KEYS.FIREBALL_IMPACT, { volume: 0.24, rate: 0.72, detune: -220 });
    });
    this.addTimer(680, () => this.clearAttackHitbox());
    this.addTimer(900, () => this.returnToIdle());
  }

  startEvadeCounter(fromX) {
    if (!this.active || this.defeated) {
      return;
    }

    const attackerIsLeft = fromX < this.sprite.x;
    let evadeDirection = attackerIsLeft ? 1 : -1;

    if (this.sprite.x >= this.rightBound - 44 && evadeDirection > 0) {
      evadeDirection = -1;
    } else if (this.sprite.x <= this.leftBound + 44 && evadeDirection < 0) {
      evadeDirection = 1;
    }

    this.state = 'evade';
    this.faceDirection(-evadeDirection);
    this.sprite.play(ANIM_KEYS.BOSS_RUN, true);
    this.sprite.body.setVelocityX(evadeDirection * BOSS_TUNING.EVADE_SPEED);
    playSfx(this.scene, SFX_KEYS.WALL_JUMP, { volume: 0.18, rate: 0.92, detune: -80 });

    this.addTimer(BOSS_TUNING.EVADE_MS, () => {
      if (!this.active || this.defeated) {
        return;
      }

      this.sprite.body.setVelocityX(0);
      this.faceDirection(attackerIsLeft ? -1 : 1);
      this.startCounterSlash();
    });
  }

  startCounterSlash() {
    if (!this.active || this.defeated) {
      return;
    }

    this.state = 'counter';
    this.nextAttackAt = this.scene.time.now + this.getAttackCooldown();
    this.sprite.body.setVelocityX(0);
    this.sprite.play(ANIM_KEYS.BOSS_ATTACK_1, true);
    playSfx(this.scene, SFX_KEYS.ATTACK, { volume: 0.34, rate: 0.9, detune: -30 });

    this.addTimer(100, () => this.enableAttackHitbox(this.rageActive ? 96 : 84, 62, 46, -2));
    this.addTimer(360, () => this.clearAttackHitbox());
    this.addTimer(570, () => this.returnToIdle());
  }

  die(fromX) {
    this.defeated = true;
    this.active = false;
    this.state = 'dying';
    this.clearTimers();
    this.clearAttackHitbox();
    this.faceDirection(fromX < this.sprite.x ? -1 : 1);
    this.sprite.body.setVelocity(0, 0);
    this.sprite.body.enable = false;
    this.sprite.play(ANIM_KEYS.BOSS_DEATH, true);
    this.flash(0xffd166, 180);
    playSfx(this.scene, SFX_KEYS.PLAYER_HURT, { volume: 0.34, rate: 0.7, detune: -260 });
  }

  resetForRetry() {
    this.clearTimers();
    this.clearAttackHitbox();
    this.hp = this.maxHp;
    this.active = false;
    this.defeated = false;
    this.state = 'dormant';
    this.direction = -1;
    this.nextAttackAt = 0;
    this.nextDamageAt = 0;
    this.nextSlamAt = 0;
    this.slamResolved = false;
    this.hitCount = 0;
    this.rageActive = false;
    this.scene.tweens.killTweensOf([this.sprite, this.aura]);
    this.sprite.body.enable = false;
    this.sprite.body.setVelocity(0, 0);
    this.sprite.setPosition(this.spawnX, this.spawnY);
    this.sprite.setVisible(false).setAlpha(1).clearTint();
    this.sprite.play(ANIM_KEYS.BOSS_IDLE, true);
    this.aura.setVisible(false).setAlpha(0).setScale(1);
  }

  returnToIdle() {
    if (!this.active || this.defeated || this.state === 'dying') {
      return;
    }

    this.state = 'idle';
    this.clearAttackHitbox();
    this.sprite.body.setVelocityX(0);
    this.sprite.play(ANIM_KEYS.BOSS_IDLE, true);
  }

  faceDirection(direction) {
    this.direction = direction >= 0 ? 1 : -1;
    this.sprite.setFlipX(this.direction < 0);
  }

  getMoveSpeed() {
    return this.rageActive ? BOSS_TUNING.RAGE_SPEED : BOSS_TUNING.SPEED;
  }

  getDashSpeed() {
    return this.rageActive ? BOSS_TUNING.RAGE_DASH_SPEED : BOSS_TUNING.DASH_SPEED;
  }

  getAttackCooldown() {
    return this.rageActive ? BOSS_TUNING.RAGE_ATTACK_COOLDOWN_MS : BOSS_TUNING.ATTACK_COOLDOWN_MS;
  }

  getSlamCooldown() {
    return this.rageActive ? BOSS_TUNING.RAGE_SLAM_COOLDOWN_MS : BOSS_TUNING.SLAM_COOLDOWN_MS;
  }

  enforceArenaBounds() {
    const clampedX = Math.min(this.rightBound, Math.max(this.leftBound, this.sprite.x));

    if (clampedX === this.sprite.x) {
      return;
    }

    this.sprite.setX(clampedX);
    this.sprite.body.setVelocityX(0);
  }

  enableAttackHitbox(width, height, offsetX, offsetY) {
    this.attackHitbox.setSize(width, height);
    this.attackHitbox.body.setSize(width, height);
    this.attackHitbox.body.enable = true;
    this.syncAttackHitbox(offsetX, offsetY);
  }

  syncAttackHitbox(offsetX = this.attackOffsetX ?? 58, offsetY = this.attackOffsetY ?? 0) {
    this.attackOffsetX = offsetX;
    this.attackOffsetY = offsetY;
    this.attackHitbox.setPosition(
      this.sprite.x + (this.direction * offsetX),
      this.sprite.y + offsetY
    );
  }

  clearAttackHitbox() {
    this.attackHitbox.body.enable = false;
    this.attackHitbox.setPosition(this.sprite.x, this.sprite.y);
  }

  clearTimers() {
    this.timers.forEach(timer => timer.remove(false));
    this.timers = [];
  }

  addTimer(delay, callback) {
    const timer = this.scene.time.delayedCall(delay, callback);
    this.timers.push(timer);
    return timer;
  }

  flash(color = 0xffffff, duration = 90) {
    this.sprite.setTint(color);
    this.scene.time.delayedCall(duration, () => {
      if (!this.sprite?.active) {
        return;
      }

      this.sprite.clearTint();
    });
  }

  syncEffects() {
    if (!this.aura.visible) {
      return;
    }

    this.aura.setPosition(this.sprite.x, this.sprite.y + 14);
  }

  getSprite() {
    return this.sprite;
  }

  getAttackHitbox() {
    return this.attackHitbox;
  }

  getHealthRatio() {
    return this.hp / this.maxHp;
  }

  isActive() {
    return this.active && !this.defeated;
  }

  isDefeated() {
    return this.defeated;
  }

  destroy() {
    this.clearTimers();
    this.attackHitbox.destroy();
    this.aura.destroy();
    this.sprite.destroy();
  }
}

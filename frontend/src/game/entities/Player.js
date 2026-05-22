import Phaser from 'phaser';
import { PLAYER, WORLD } from '../utils/constants.js';
import { ANIM_KEYS, SFX_KEYS, TEXTURE_KEYS, playSfx } from '../assets.js';
import { gameControls } from '../input/controlsState.js';

const BODY = {
  WIDTH: 16,
  HEIGHT: 44,
  OFFSET_X: 40,
  OFFSET_Y: 38,
  WALL_SLIDE_LEFT_WALL_OFFSET_X: 48,
  WALL_SLIDE_RIGHT_WALL_OFFSET_X: 32,
};

const THROW = {
  MAX_COUNT: 5,
  SPEED: 520,
  COOLDOWN_MS: 520,
  ANIM_MS: 360,
  SPAWN_DELAY_MS: 145,
  LIFETIME_MS: 1450,
};

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.facingDirection = 1;
    this.isAttacking = false;
    this.isThrowing = false;
    this.isDefending = false;
    this.isDashing = false;
    this.isWallSliding = false;
    this.isDead = false;
    this.wallSide = 0;
    this.nextAttackAt = 0;
    this.nextThrowAt = 0;
    this.nextDashAt = 0;
    this.dashUntil = 0;
    this.wallJumpLockUntil = 0;
    this.wallJumpAnimUntil = 0;
    this.lastWallSide = 0;
    this.lastWallContactAt = 0;
    this.hurtAnimUntil = 0;
    this.wasJumpDown = false;
    this.wasDashDown = false;
    this.bodyOffsetInitialized = false;

    this.sprite = scene.physics.add.sprite(x, y, TEXTURE_KEYS.SAMURAI_IDLE, 0).setDepth(20);
    this.sprite.setScale(PLAYER.SPRITE_SCALE);
    this.sprite.setFlipX(false);
    this.sprite.play(ANIM_KEYS.SAMURAI_IDLE);

    this.sprite.body.setBounce(0.05);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setMaxVelocity(PLAYER.DASH_SPEED, 720);
    this.sprite.body.setSize(BODY.WIDTH, BODY.HEIGHT, false);
    this.updateBodyOffset({ preserveBodyPosition: false });

    this.swordHitbox = scene.add.rectangle(x + 66, y + 4, 86, 58, 0xffffff, 0);
    scene.physics.add.existing(this.swordHitbox);
    this.swordHitbox.body.setAllowGravity(false);
    this.swordHitbox.body.enable = false;

    this.throwProjectiles = scene.physics.add.group({
      allowGravity: false,
      immovable: false,
    });
    this.throwsRemaining = THROW.MAX_COUNT;

    this.pressedKeys = new Set();
    this.controlsState = gameControls;

    this.setupControls();
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  setupControls() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keys = {
      w: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      space: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      x: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      j: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      c: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
      l: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      s: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      shift: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      k: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
    };

    this.handleKeyDown = (event) => this.trackKey(event, true);
    this.handleKeyUp = (event) => this.trackKey(event, false);
    this.handleBlur = () => {
      this.pressedKeys.clear();
      this.controlsState.resetAll();
    };

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  trackKey(event, isDown) {
    const movementKeys = new Set([
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'KeyA',
      'KeyD',
      'KeyW',
      'ArrowDown',
      'KeyX',
      'KeyJ',
      'KeyC',
      'KeyL',
      'KeyS',
      'KeyK',
      'ShiftLeft',
      'ShiftRight',
      'Space',
    ]);

    if (!movementKeys.has(event.code)) {
      return;
    }

    event.preventDefault();

    if (isDown) {
      this.pressedKeys.add(event.code);
    } else {
      this.pressedKeys.delete(event.code);
    }
  }

  isPressed(...codes) {
    return codes.some(code => this.pressedKeys.has(code));
  }

  syncKeyboardControls() {
    this.controlsState.setKeyboardState({
      left: this.cursors.left.isDown || this.keys.a.isDown || this.isPressed('ArrowLeft', 'KeyA'),
      right: this.cursors.right.isDown || this.keys.d.isDown || this.isPressed('ArrowRight', 'KeyD'),
      jump: this.cursors.up.isDown
        || this.keys.w.isDown
        || this.keys.space.isDown
        || this.isPressed('ArrowUp', 'KeyW', 'Space'),
      attack: this.keys.x.isDown || this.keys.j.isDown || this.isPressed('KeyX', 'KeyJ'),
      dash: this.keys.shift.isDown || this.keys.k.isDown || this.isPressed('ShiftLeft', 'ShiftRight', 'KeyK'),
      throw: this.keys.c.isDown || this.keys.l.isDown || this.isPressed('KeyC', 'KeyL'),
      defend: this.cursors.down.isDown || this.keys.s.isDown || this.isPressed('ArrowDown', 'KeyS'),
    });
  }

  update() {
    const body = this.sprite.body;
    const now = this.scene.time.now;

    this.updateThrowProjectiles();

    if (this.isDead) {
      this.syncSword();
      return;
    }

    if (this.isDashing && now >= this.dashUntil) {
      this.stopDash();
    }

    this.syncKeyboardControls();
    const controls = this.controlsState.snapshot();
    const movingLeft = controls.left;
    const movingRight = controls.right;
    const jumpJustPressed = controls.justPressed.jump;
    const isDefendDown = controls.defend;

    this.updateWallState();
    this.updateDefendState(isDefendDown);

    if (jumpJustPressed && !this.isDefending) {
      this.tryJump();
    }

    if (!this.isDefending) {
      this.handleDashInput(controls);
    } else {
      body.setVelocityX(0);
    }

    if (!this.isDefending && !this.isDashing && now >= this.wallJumpLockUntil) {
      this.applyHorizontalMovement(movingLeft, movingRight);
    } else if (this.isDashing) {
      body.setVelocity(this.facingDirection * PLAYER.DASH_SPEED, 0);
    }

    if (this.isWallSliding && body.velocity.y > PLAYER.WALL_SLIDE_SPEED) {
      body.setVelocityY(PLAYER.WALL_SLIDE_SPEED);
    }

    if (this.isWallSliding) {
      this.faceWallSlideDirection();
    }

    if (!this.isDefending) {
      this.handleAttackInput(controls);
      this.handleThrowInput(controls);
    }
    this.syncSword();
    this.updateAnimation(movingLeft, movingRight);
  }

  updateWallState() {
    const body = this.sprite.body;
    const onFloor = this.isOnFloor();
    const touchingLeft = body.blocked.left || body.touching.left;
    const touchingRight = body.blocked.right || body.touching.right;
    const exactWallSide = touchingLeft ? -1 : touchingRight ? 1 : 0;

    this.wallSide = exactWallSide;

    if (exactWallSide !== 0) {
      this.lastWallSide = this.wallSide;
      this.lastWallContactAt = this.scene.time.now;
    }

    this.isWallSliding = !onFloor && exactWallSide !== 0 && body.velocity.y > 10;
  }

  tryJump() {
    const body = this.sprite.body;
    const wallSide = this.getWallJumpSide();

    if (wallSide !== 0 && !this.isOnFloor()) {
      const jumpDirection = -wallSide;

      this.facingDirection = jumpDirection;
      body.setVelocity(jumpDirection * PLAYER.WALL_JUMP_X, PLAYER.WALL_JUMP_Y);
      this.wallJumpLockUntil = this.scene.time.now + PLAYER.WALL_JUMP_LOCK_MS;
      this.wallJumpAnimUntil = this.scene.time.now + 260;
      this.isWallSliding = false;
      this.updateBodyOffset();
      this.sprite.setFlipX(this.facingDirection < 0);
      this.sprite.play(ANIM_KEYS.SAMURAI_WALL_JUMP, true);
      playSfx(this.scene, SFX_KEYS.WALL_JUMP, { volume: 0.36 });
      return;
    }

    if (this.isOnFloor()) {
      body.setVelocityY(PLAYER.JUMP_VELOCITY);
      this.sprite.play(ANIM_KEYS.SAMURAI_JUMP, true);
      playSfx(this.scene, SFX_KEYS.JUMP, { volume: 0.32 });
    }
  }

  applyHorizontalMovement(movingLeft, movingRight) {
    const body = this.sprite.body;

    if (movingLeft) {
      this.facingDirection = -1;
      body.setVelocityX(-PLAYER.SPEED);
    } else if (movingRight) {
      this.facingDirection = 1;
      body.setVelocityX(PLAYER.SPEED);
    } else {
      body.setVelocityX(0);
    }

    this.updateBodyOffset();
    this.sprite.setFlipX(this.facingDirection < 0);
  }

  updateBodyOffset({ preserveBodyPosition = true } = {}) {
    const offsetX = this.getBodyOffsetX();
    const previousOffsetX = this.sprite.body.offset.x;

    if (preserveBodyPosition && this.bodyOffsetInitialized && previousOffsetX !== offsetX) {
      this.sprite.x += (previousOffsetX - offsetX) * this.sprite.scaleX;
    }

    this.sprite.body.setOffset(offsetX, BODY.OFFSET_Y);
    this.bodyOffsetInitialized = true;
  }

  getBodyOffsetX() {
    if (!this.isWallSliding) {
      return BODY.OFFSET_X;
    }

    if (this.wallSide < 0) {
      return BODY.WALL_SLIDE_LEFT_WALL_OFFSET_X;
    }

    if (this.wallSide > 0) {
      return BODY.WALL_SLIDE_RIGHT_WALL_OFFSET_X;
    }

    return BODY.OFFSET_X;
  }

  faceWallSlideDirection() {
    // The slide pose should face away from the contacted wall.
    this.facingDirection = -this.wallSide;
    this.updateBodyOffset();
    this.sprite.setFlipX(this.facingDirection < 0);
  }

  updateDefendState(isDefendDown) {
    const canDefend = isDefendDown
      && this.isOnFloor()
      && !this.isAttacking
      && !this.isThrowing
      && !this.isDashing
      && !this.isWallSliding;

    this.isDefending = canDefend;

    if (this.isDefending) {
      this.swordHitbox.body.enable = false;
    }
  }

  handleDashInput(controls) {
    const dashJustPressed = controls.justPressed.dash;

    if (!dashJustPressed || this.scene.time.now < this.nextDashAt || this.isAttacking || this.isThrowing) {
      return;
    }

    this.isDashing = true;
    this.dashUntil = this.scene.time.now + PLAYER.DASH_MS;
    this.nextDashAt = this.scene.time.now + PLAYER.DASH_COOLDOWN_MS;
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setVelocity(this.facingDirection * PLAYER.DASH_SPEED, 0);
    this.sprite.play(ANIM_KEYS.SAMURAI_DASH, true);
  }

  stopDash() {
    this.isDashing = false;
    this.sprite.body.setAllowGravity(true);
  }

  handleAttackInput(controls) {
    const isSwinging = controls.attack || controls.justPressed.attack;

    if (!isSwinging || this.scene.time.now < this.nextAttackAt || this.isDashing || this.isThrowing) {
      return;
    }

    this.isAttacking = true;
    this.nextAttackAt = this.scene.time.now + 430;
    this.swordHitbox.body.enable = true;
    this.syncSword();
    this.sprite.play(ANIM_KEYS.SAMURAI_ATTACK, true);
    playSfx(this.scene, SFX_KEYS.ATTACK, { volume: 0.34 });

    this.scene.time.delayedCall(210, () => {
      this.swordHitbox.body.enable = false;
    });

    this.scene.time.delayedCall(330, () => {
      this.isAttacking = false;
      this.syncSword();
    });
  }

  handleThrowInput(controls) {
    const isThrowing = controls.justPressed.throw;

    if (!isThrowing
      || this.throwsRemaining <= 0
      || this.scene.time.now < this.nextThrowAt
      || this.isDashing
      || this.isAttacking
      || this.isThrowing) {
      return;
    }

    this.isThrowing = true;
    this.throwsRemaining -= 1;
    this.nextThrowAt = this.scene.time.now + THROW.COOLDOWN_MS;
    this.sprite.play(ANIM_KEYS.SAMURAI_THROW, true);
    this.scene.refreshHudCounters?.();
    playSfx(this.scene, SFX_KEYS.ATTACK, { volume: 0.24, rate: 1.28, detune: 120 });

    const throwDirection = this.facingDirection;
    this.scene.time.delayedCall(THROW.SPAWN_DELAY_MS, () => {
      if (!this.sprite?.active || this.isDead) {
        return;
      }

      this.spawnThrowProjectile(throwDirection);
    });

    this.scene.time.delayedCall(THROW.ANIM_MS, () => {
      this.isThrowing = false;
    });
  }

  spawnThrowProjectile(direction = this.facingDirection) {
    const projectile = this.throwProjectiles.create(
      this.sprite.x + (direction * 42),
      this.sprite.y - 2,
      TEXTURE_KEYS.SAMURAI_SHURIKEN
    );

    projectile
      .setDepth(23)
      .setScale(2.4)
      .setAlpha(0.95)
      .setData('expiresAt', this.scene.time.now + THROW.LIFETIME_MS);
    projectile.body.setAllowGravity(false);
    projectile.body.setSize(8, 8);
    projectile.body.setVelocityX(direction * THROW.SPEED);
    projectile.body.setVelocityY(0);
  }

  updateThrowProjectiles() {
    const now = this.scene.time.now;

    this.throwProjectiles?.getChildren().forEach((projectile) => {
      if (!projectile?.active) {
        return;
      }

      projectile.angle += 22;

      const expired = now >= (projectile.getData('expiresAt') ?? 0);
      const outsideWorld = projectile.x < -32 || projectile.x > WORLD.WIDTH + 32;

      if (expired || outsideWorld) {
        this.destroyThrowProjectile(projectile);
      }
    });
  }

  updateAnimation(movingLeft, movingRight) {
    const body = this.sprite.body;
    const now = this.scene.time.now;

    if (this.isAttacking || this.isThrowing || this.isDashing || now < this.hurtAnimUntil || now < this.wallJumpAnimUntil) {
      return;
    }

    if (this.isDefending) {
      this.sprite.play(ANIM_KEYS.SAMURAI_DEFEND, true);
      return;
    }

    if (this.isWallSliding) {
      this.sprite.play(ANIM_KEYS.SAMURAI_WALL_SLIDE, true);
      return;
    }

    if (!this.isOnFloor()) {
      this.sprite.play(body.velocity.y < -20 ? ANIM_KEYS.SAMURAI_JUMP : ANIM_KEYS.SAMURAI_FALL, true);
      return;
    }

    if (movingLeft || movingRight || Math.abs(body.velocity.x) > 8) {
      this.sprite.play(ANIM_KEYS.SAMURAI_RUN, true);
      return;
    }

    this.sprite.play(ANIM_KEYS.SAMURAI_IDLE, true);
  }

  syncSword() {
    const hitboxOffsetX = this.facingDirection * 66;

    this.swordHitbox.setPosition(this.sprite.x + hitboxOffsetX, this.sprite.y + 4);
  }

  getWallJumpSide() {
    if (this.wallSide !== 0) {
      return this.wallSide;
    }

    const bufferedWallSide = this.scene.getWallJumpSideForPlayer?.(this.sprite) ?? 0;

    if (bufferedWallSide !== 0) {
      return bufferedWallSide;
    }

    if (this.scene.time.now - this.lastWallContactAt <= PLAYER.WALL_JUMP_GRACE_MS) {
      return this.lastWallSide;
    }

    return 0;
  }

  isOnFloor() {
    const body = this.sprite.body;

    return body.blocked.down || body.touching.down || body.onFloor();
  }

  playHurt() {
    this.hurtAnimUntil = this.scene.time.now + 320;
    this.sprite.play(ANIM_KEYS.SAMURAI_HURT, true);
  }

  playDefendBlock() {
    this.sprite.play(ANIM_KEYS.SAMURAI_DEFEND, true);
  }

  playDeath() {
    this.isDead = true;
    this.stopDash();
    this.isAttacking = false;
    this.isThrowing = false;
    this.isDefending = false;
    this.isWallSliding = false;
    this.swordHitbox.body.enable = false;
    this.clearThrowProjectiles();
    this.sprite.body.setVelocity(0, 0);
    this.sprite.body.setAllowGravity(true);
    this.sprite.play(ANIM_KEYS.SAMURAI_DEATH, true);
  }

  getSprite() {
    return this.sprite;
  }

  getSwordHitbox() {
    return this.swordHitbox;
  }

  getThrowProjectiles() {
    return this.throwProjectiles;
  }

  getThrowsRemaining() {
    return this.throwsRemaining;
  }

  isSwordActive() {
    return this.isAttacking && this.swordHitbox.body.enable;
  }

  isDefendingNow() {
    return this.isDefending && !this.isDead;
  }

  destroyThrowProjectile(projectile) {
    if (projectile?.active) {
      projectile.destroy();
    }
  }

  clearThrowProjectiles() {
    this.throwProjectiles?.getChildren().forEach((projectile) => {
      this.destroyThrowProjectile(projectile);
    });
  }

  replenishThrows() {
    this.throwsRemaining = THROW.MAX_COUNT;
    this.scene.refreshHudCounters?.();
  }

  resetToStart() {
    this.resetToPosition(PLAYER.START_X, WORLD.HEIGHT - PLAYER.START_Y_OFFSET);
  }

  resetToPosition(x, y) {
    this.stopDash();
    this.isDead = false;
    this.sprite.setPosition(x, y);
    this.sprite.body.setVelocity(0, 0);
    this.isAttacking = false;
    this.isThrowing = false;
    this.isDefending = false;
    this.isWallSliding = false;
    this.wallSide = 0;
    this.lastWallSide = 0;
    this.lastWallContactAt = 0;
    this.swordHitbox.body.enable = false;
    this.clearThrowProjectiles();
    this.replenishThrows();
    this.updateBodyOffset({ preserveBodyPosition: false });
    this.sprite.setAlpha(1);
    this.sprite.play(ANIM_KEYS.SAMURAI_IDLE, true);
    this.syncSword();
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.pressedKeys.clear();
    this.controlsState.resetAll();
    this.clearThrowProjectiles();
    this.throwProjectiles.destroy(true);
    this.swordHitbox.destroy();
  }
}

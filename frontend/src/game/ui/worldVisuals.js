import Phaser from 'phaser';
import { getPowerupTheme } from '../../data/resumePowerups.js';

const SECTION_VISUALS = {
  education: { kind: 'spirit', primary: 0x8b5cf6, secondary: 0xf7d774, label: 'ED' },
  skills: { kind: 'crystal', primary: 0x38bdf8, secondary: 0x93c5fd, label: 'SK' },
  experience: { kind: 'flame', primary: 0xf97316, secondary: 0xfb7185, label: 'XP' },
  earlier: { kind: 'spirit', primary: 0x34d399, secondary: 0xf6c85f, label: 'ER' },
  achievements: { kind: 'scroll', primary: 0xf59e0b, secondary: 0xfef3c7, label: 'GO' },
};

function resolveVisual(powerup) {
  if (powerup.id === 'music-battle-x') {
    return { kind: 'spirit', primary: 0xff6fb5, secondary: 0xffd166, label: 'MBX' };
  }

  return SECTION_VISUALS[powerup.section] ?? SECTION_VISUALS.skills;
}

function createSpiritCore(scene, visual) {
  return [
    scene.add.circle(0, 0, 10, visual.primary, 1).setStrokeStyle(2, 0xffffff, 0.9),
    scene.add.circle(-3, -3, 4, visual.secondary, 0.92),
    scene.add.circle(3, 4, 2, 0xffffff, 0.38),
  ];
}

function createCrystalCore(scene, visual) {
  return [
    scene.add.rectangle(0, 0, 16, 16, visual.primary, 1).setRotation(Math.PI / 4).setStrokeStyle(2, 0xffffff, 0.9),
    scene.add.rectangle(0, -1, 8, 8, visual.secondary, 0.92).setRotation(Math.PI / 4),
    scene.add.rectangle(3, 3, 3, 3, 0xffffff, 0.35).setRotation(Math.PI / 4),
  ];
}

function createFlameCore(scene, visual) {
  return [
    scene.add.triangle(0, -2, 0, 12, 7, -10, 14, 12, visual.primary, 1).setStrokeStyle(2, 0xffffff, 0.85),
    scene.add.circle(0, 4, 6, visual.secondary, 0.82),
    scene.add.circle(0, -2, 3, 0xffffff, 0.22),
  ];
}

function createScrollCore(scene, visual) {
  return [
    scene.add.rectangle(0, 0, 18, 14, visual.secondary, 1).setStrokeStyle(2, 0x7c2d12, 0.75),
    scene.add.circle(-9, 0, 3, 0x7c2d12, 1),
    scene.add.circle(9, 0, 3, 0x7c2d12, 1),
    scene.add.circle(0, 0, 3, visual.primary, 1),
  ];
}

function createCollectibleCore(scene, visual) {
  if (visual.kind === 'crystal') {
    return createCrystalCore(scene, visual);
  }

  if (visual.kind === 'flame') {
    return createFlameCore(scene, visual);
  }

  if (visual.kind === 'scroll') {
    return createScrollCore(scene, visual);
  }

  return createSpiritCore(scene, visual);
}

export function createPowerupOrb(scene, x, y, powerup) {
  const visual = resolveVisual(powerup);
  const theme = getPowerupTheme(powerup.iconKey);
  const created = [];
  const track = (object) => {
    created.push(object);
    return object;
  };

  try {
    const hitArea = track(scene.add.circle(x, y, 11, 0xffffff, 0.001).setDepth(24));
    scene.physics.add.existing(hitArea, true);
    hitArea.body.setCircle(11);

    const container = track(scene.add.container(x, y).setDepth(28));
    const halo = track(scene.add.circle(0, 0, 19, visual.primary, 0.18).setBlendMode(Phaser.BlendModes.SCREEN));
    const ring = track(scene.add.circle(0, 0, 14, visual.secondary, 0).setStrokeStyle(2, 0xffffff, 0.65));
    const innerGlow = track(scene.add.circle(0, 0, 6, visual.secondary, 0.2));
    const coreParts = createCollectibleCore(scene, visual).map(track);
    const label = track(scene.add.text(0, 0, visual.label || theme.iconLabel || '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: visual.kind === 'scroll' ? '7px' : '8px',
      fontStyle: 'bold',
      color: '#fff8dc',
      stroke: '#28170d',
      strokeThickness: 2,
      align: 'center',
    }).setOrigin(0.5));

    if (visual.kind === 'scroll') {
      label.setY(0.5);
    }

    const sparkleOffsets = [
      { x: -13, y: -9, delay: 0 },
      { x: 14, y: -5, delay: 240 },
      { x: -8, y: 12, delay: 480 },
    ];

    const sparkles = sparkleOffsets.map(({ x: offsetX, y: offsetY, delay }) => {
      const sparkle = track(scene.add.circle(offsetX, offsetY, 1.8, visual.secondary, 0.7).setScale(0.7));

      scene.tweens.add({
        targets: sparkle,
        y: offsetY - 4,
        alpha: 0.9,
        scale: 0.9,
        duration: 780,
        delay,
        ease: 'Sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      return sparkle;
    });

    container.add([halo, ring, innerGlow, ...coreParts, label, ...sparkles]);

    scene.tweens.add({
      targets: container,
      y: y - 6,
      duration: 1300,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    scene.tweens.add({
      targets: halo,
      scaleX: 1.14,
      scaleY: 1.14,
      alpha: 0.52,
      duration: 1450,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    scene.tweens.add({
      targets: ring,
      angle: 360,
      duration: visual.kind === 'crystal' ? 5400 : 6800,
      ease: 'Linear',
      repeat: -1,
    });

    return {
      sprite: hitArea,
      visuals: [container, halo, ring, ...coreParts, innerGlow, label, ...sparkles],
      burst() {
        for (let index = 0; index < 7; index += 1) {
          const angle = (Math.PI * 2 * index) / 7;
          const sparkle = scene.add.circle(container.x, container.y, 2.5, visual.secondary, 0.88)
            .setDepth(30)
            .setScale(0.75);

          scene.tweens.add({
            targets: sparkle,
            x: container.x + Math.cos(angle) * 22,
            y: container.y + Math.sin(angle) * 18,
            alpha: 0,
            scale: 0.1,
            duration: 320,
            ease: 'Cubic.out',
            onComplete: () => sparkle.destroy(),
          });
        }
      },
      destroy() {
        scene.tweens.killTweensOf([container, halo, ring, innerGlow, label, ...coreParts, ...sparkles]);
        hitArea.destroy();
        container.destroy(true);
      },
    };
  } catch (error) {
    console.error('Collectible orb render failed, using fallback orb:', error);

    scene.tweens.killTweensOf(created);
    created.forEach((object) => {
      if (object && !object.destroyed && typeof object.destroy === 'function') {
        object.destroy();
      }
    });

    const fallbackColor = theme.color;
    const sprite = scene.add.circle(x, y, 12, fallbackColor, 1).setDepth(29).setStrokeStyle(2, 0xffffff, 0.9);
    const glow = scene.add.circle(x, y, 22, fallbackColor, 0.26).setDepth(27);
    const ring = scene.add.circle(x, y, 16, fallbackColor, 0).setDepth(28).setStrokeStyle(2, 0xffffff, 0.5);

    scene.physics.add.existing(sprite, true);
    sprite.body.setCircle(12);

    scene.tweens.add({
      targets: [sprite, ring],
      scale: 1.08,
      duration: 900,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    scene.tweens.add({
      targets: glow,
      alpha: 0.5,
      scale: 1.2,
      duration: 1200,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    return {
      sprite,
      visuals: [glow, ring, sprite],
      burst() {},
      destroy() {
        scene.tweens.killTweensOf([glow, ring, sprite]);
        glow.destroy();
        ring.destroy();
        sprite.destroy();
      },
    };
  }
}

export function createSectionSign(scene, x, y, label, color) {
  const signWidth = Phaser.Math.Clamp((label.length * 9) + 84, 210, 320);
  const container = scene.add.container(x, y).setDepth(16);
  const shadow = scene.add.rectangle(4, -58, signWidth, 54, 0x000000, 0.28);
  const post = scene.add.rectangle(0, -20, 10, 46, 0x3a2314, 1).setStrokeStyle(1, 0x8b5e34, 0.7);
  const beam = scene.add.rectangle(0, -61, signWidth, 44, 0x4a2d18, 0.96).setStrokeStyle(2, 0xd9b36c, 0.65);
  const headerCap = scene.add.rectangle(0, -79, signWidth - 16, 10, 0x2a180f, 0.92).setStrokeStyle(1, 0xe6c27a, 0.35);
  const leftLantern = scene.add.circle(-(signWidth / 2) + 14, -61, 6, color, 0.22).setStrokeStyle(1, 0xf5deb3, 0.55);
  const rightLantern = scene.add.circle((signWidth / 2) - 14, -61, 6, color, 0.22).setStrokeStyle(1, 0xf5deb3, 0.55);
  const accentBar = scene.add.rectangle(0, -61, signWidth - 28, 2, color, 0.24);
  const leftCorner = scene.add.rectangle(-(signWidth / 2) + 10, -79, 8, 8, 0x2a180f, 1);
  const rightCorner = scene.add.rectangle((signWidth / 2) - 10, -79, 8, 8, 0x2a180f, 1);
  const text = scene.add.text(0, -62, label, {
    fontFamily: 'Arial, sans-serif',
    fontSize: label.length > 22 ? '15px' : '17px',
    fontStyle: 'bold',
    color: '#f8f1dc',
    stroke: '#24120a',
    strokeThickness: 4,
    align: 'center',
  }).setOrigin(0.5);

  container.add([
    shadow,
    post,
    beam,
    headerCap,
    accentBar,
    leftCorner,
    rightCorner,
    leftLantern,
    rightLantern,
    text,
  ]);

  scene.tweens.add({
    targets: [leftLantern, rightLantern],
    alpha: 0.7,
    duration: 1400,
    ease: 'Sine.inOut',
    yoyo: true,
    repeat: -1,
  });

  scene.tweens.add({
    targets: container,
    alpha: { from: 0, to: 1 },
    y: y - 2,
    duration: 540,
    ease: 'Cubic.out',
  });

  return container;
}

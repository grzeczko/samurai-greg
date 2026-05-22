import { useEffect, useRef } from 'react';
import { ExternalLink, Flower2 } from 'lucide-react';
import { getPowerupTheme } from '../data/resumePowerups.js';
import { eventBridge } from '../game/events.js';
import ScrollButton from './ScrollButton.jsx';
import ScrollPanel from './ScrollPanel.jsx';
import { SCROLL_ASSET_URLS } from './scrollAssets.js';

const RARITY_CHROMA = {
  common: { label: 'Common', glow: '#c08b5d', rgb: '192 139 93' },
  uncommon: { label: 'Uncommon', glow: '#b8b06b', rgb: '184 176 107' },
  rare: { label: 'Rare', glow: '#6fb4ff', rgb: '111 180 255' },
  epic: { label: 'Epic', glow: '#b28bff', rgb: '178 139 255' },
  legendary: { label: 'Legendary', glow: '#efc46b', rgb: '239 196 107' },
  default: { label: 'Recovered', glow: '#fef3c7', rgb: '254 243 199' },
};

const PETAL_LAYOUT = [
  { left: '11%', top: '14%', width: '12px', height: '18px', delay: '0s', duration: '11s', rotation: '-18deg' },
  { left: '82%', top: '16%', width: '10px', height: '16px', delay: '1.1s', duration: '12.4s', rotation: '18deg' },
  { left: '71%', top: '74%', width: '10px', height: '15px', delay: '2.3s', duration: '13.6s', rotation: '-16deg' },
];

const SPARK_LAYOUT = [
  { left: '18%', top: '28%', size: '5px', delay: '0.4s', duration: '6.8s' },
  { left: '68%', top: '22%', size: '4px', delay: '1.2s', duration: '7.1s' },
  { left: '78%', top: '60%', size: '5px', delay: '2s', duration: '7.8s' },
];

const DUST_LAYOUT = [
  { left: '26%', top: '20%', size: '2px', delay: '0.3s', duration: '9.8s' },
  { left: '62%', top: '30%', size: '3px', delay: '1.2s', duration: '11.2s' },
  { left: '14%', top: '58%', size: '2px', delay: '2.1s', duration: '10.7s' },
  { left: '76%', top: '72%', size: '2px', delay: '2.8s', duration: '12.4s' },
];

function titleCase(value) {
  return String(value || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
}

function hexToRgbChannels(hexColor) {
  const normalized = String(hexColor || '#ffffff').replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map(channel => `${channel}${channel}`).join('')
    : normalized;

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
}

export default function ScrollCodexPopup({ powerup, onContinue }) {
  const openedAtRef = useRef(0);
  const lastHoverSoundAtRef = useRef(0);
  const theme = getPowerupTheme(powerup.iconKey);
  const rarityKey = powerup.rarity || 'default';
  const rarity = RARITY_CHROMA[rarityKey] ?? RARITY_CHROMA.default;
  const bullets = powerup.bullets || powerup.resumeBullets || [];
  const title = powerup.title || powerup.label;
  const subtitle = powerup.subtitle || powerup.type;
  const displayDetail = powerup.detail || powerup.description;
  const categoryLabel = powerup.category || titleCase(powerup.section || '');
  const metadata = [powerup.dates, powerup.subtitle ? powerup.type : null].filter(Boolean);
  const titleId = `scroll-codex-title-${powerup.id}`;
  const contentId = `scroll-codex-content-${powerup.id}`;

  const codexStyle = {
    '--scroll-accent': theme.accent,
    '--scroll-accent-rgb': hexToRgbChannels(theme.accent),
    '--scroll-rarity-glow': rarity.glow,
    '--scroll-rarity-rgb': rarity.rgb,
    '--scroll-parchment-image': `url(${SCROLL_ASSET_URLS.cleanPanel})`,
    '--scroll-ornament-image': `url(${SCROLL_ASSET_URLS.tileset})`,
  };

  useEffect(() => {
    openedAtRef.current = performance.now();
    eventBridge.emit('codex:open', {
      id: powerup.id,
      rarity: rarityKey,
    });
  }, [powerup.id, rarityKey]);

  const handleActionHover = () => {
    const now = performance.now();

    if (now - openedAtRef.current < 260) {
      return;
    }

    if (now - lastHoverSoundAtRef.current < 160) {
      return;
    }

    lastHoverSoundAtRef.current = now;
    eventBridge.emit('codex:hover', {
      id: powerup.id,
      rarity: rarityKey,
    });
  };

  const handleSiteOpen = () => {
    eventBridge.emit('codex:confirm', {
      id: powerup.id,
      rarity: rarityKey,
      action: 'visit-site',
    });
  };

  const handleContinue = () => {
    eventBridge.emit('codex:confirm', {
      id: powerup.id,
      rarity: rarityKey,
      action: 'continue',
    });
    onContinue();
  };

  return (
    <div className="scroll-codex-overlay" style={codexStyle}>
      <div className="scroll-codex__ambient" aria-hidden="true">
        <span className="scroll-codex__vignette" />
        <span className="scroll-codex__moon-glow" />
        <span className="scroll-codex__ambient-flicker" />
        {PETAL_LAYOUT.map((petal, index) => (
          <span
            key={`scroll-petal-${index}`}
            className="scroll-codex__petal"
            style={{
              left: petal.left,
              top: petal.top,
              width: petal.width,
              height: petal.height,
              animationDelay: petal.delay,
              animationDuration: petal.duration,
              '--scroll-petal-rotation': petal.rotation,
            }}
          />
        ))}
        {SPARK_LAYOUT.map((spark, index) => (
          <span
            key={`scroll-spark-${index}`}
            className="scroll-codex__spark"
            style={{
              left: spark.left,
              top: spark.top,
              width: spark.size,
              height: spark.size,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }}
          />
        ))}
        {DUST_LAYOUT.map((mote, index) => (
          <span
            key={`scroll-dust-${index}`}
            className="scroll-codex__dust"
            style={{
              left: mote.left,
              top: mote.top,
              width: mote.size,
              height: mote.size,
              animationDelay: mote.delay,
              animationDuration: mote.duration,
            }}
          />
        ))}
      </div>

      <ScrollPanel
        as="article"
        className="scroll-codex"
        panel="clean"
        data-rarity={rarityKey}
        style={codexStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={contentId}
      >
        <span className="scroll-codex__top-light" aria-hidden="true" />
        <span className="scroll-codex__relic-aura" aria-hidden="true" />

        <header className="scroll-codex__header">
          <div className="scroll-codex__seal" aria-hidden="true">
            <span className="scroll-codex__seal-medallion">
              <Flower2 className="scroll-codex__seal-symbol" strokeWidth={1.9} />
            </span>
          </div>

          <div className="scroll-codex__heading">
            <div className="scroll-codex__eyebrow">
              <span className="scroll-codex__eyebrow-rule" />
              <span className="scroll-codex__eyebrow-text">Codex recovered</span>
              <span className="scroll-codex__eyebrow-rule" />
              <span className="scroll-codex__eyebrow-shimmer" />
            </div>

            <div className="scroll-codex__title-wrap">
              <h3 id={titleId} className="scroll-codex__title">{title}</h3>
            </div>

            {subtitle && <p className="scroll-codex__subtitle">{subtitle}</p>}

            <div className="scroll-codex__badges">
              <span className="scroll-codex__badge scroll-codex__badge--rarity">{rarity.label}</span>
              {categoryLabel && <span className="scroll-codex__badge">{categoryLabel}</span>}
            </div>

            {metadata.length > 0 && (
              <div className="scroll-codex__metadata">
                {metadata.map((entry) => (
                  <span key={`${powerup.id}-${entry}`} className="scroll-codex__metadata-item">{entry}</span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div id={contentId} className="scroll-codex__body">
          <span className="scroll-codex__body-edge-shade" aria-hidden="true" />
          <div className="scroll-codex__body-shell">
            {displayDetail && <p className="scroll-codex__detail">{displayDetail}</p>}

            {displayDetail && bullets.length > 0 && <div className="scroll-codex__divider" aria-hidden="true" />}

            {bullets.length > 0 && (
              <ul className="scroll-codex__list">
                {bullets.map((bullet, index) => (
                  <li
                    key={`${powerup.id}-bullet-${index}`}
                    className="scroll-codex__bullet"
                    style={{ '--scroll-index': index }}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <footer className="scroll-codex__footer">
          <div className="scroll-codex__actions">
            {powerup.url && (
              <ScrollButton
                href={powerup.url}
                icon={ExternalLink}
                variant="ghost"
                onClick={handleSiteOpen}
                onPointerEnter={handleActionHover}
                onFocus={handleActionHover}
              >
                {powerup.urlLabel || 'Visit Site'}
              </ScrollButton>
            )}
            <ScrollButton
              onClick={handleContinue}
              autoFocus
              variant="primary"
              onPointerEnter={handleActionHover}
              onFocus={handleActionHover}
            >
              Continue Journey
            </ScrollButton>
          </div>
        </footer>
      </ScrollPanel>
    </div>
  );
}

import { useState } from 'react';
import { Copy, Mail } from 'lucide-react';

const SHARE_COPY = {
  title: 'Share the Quest',
  subtitle: 'Pass the interactive resume onward.',
  message: 'Explore Samurai Greg and the Quest for the Golden Resume - an interactive samurai-themed resume platformer built with Phaser, React, and cinematic UI.',
};

function getShareUrl(platform, pageUrl, message) {
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedMessage = encodeURIComponent(message);

  switch (platform) {
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'x':
      return `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'reddit':
      return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedMessage}`;
    case 'email':
      return `mailto:?subject=${encodeURIComponent('Samurai Greg and the Quest for the Golden Resume')}&body=${encodeURIComponent(`${message}\n\n${pageUrl}`)}`;
    default:
      return pageUrl;
  }
}

function ShareButton({ href, label, icon: Icon, monogram, onClick, external = true }) {
  const classes = 'group inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/16 bg-black/22 text-amber-100/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_22px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-amber-200/40 hover:bg-amber-300/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 active:translate-y-px active:scale-[0.97]';

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        aria-label={label}
        title={label}
        className={classes}
        onClick={onClick}
      >
        {Icon ? <Icon size={17} aria-hidden="true" className="transition duration-200 group-hover:scale-[1.06]" /> : <span className="text-[0.72rem] font-black uppercase tracking-[0.16em] transition duration-200 group-hover:scale-[1.06]">{monogram}</span>}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={classes}
      onClick={onClick}
    >
      {Icon ? <Icon size={17} aria-hidden="true" className="transition duration-200 group-hover:scale-[1.06]" /> : <span className="text-[0.72rem] font-black uppercase tracking-[0.16em] transition duration-200 group-hover:scale-[1.06]">{monogram}</span>}
    </button>
  );
}

export default function ShareQuestBar({ onActionHover, onActionPress }) {
  const [copied, setCopied] = useState(false);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://samuraigreg.com';
  const shareActions = [
    { key: 'linkedin', label: 'Share on LinkedIn', monogram: 'in' },
    { key: 'x', label: 'Share on X', monogram: 'X' },
    { key: 'facebook', label: 'Share on Facebook', monogram: 'f' },
    { key: 'reddit', label: 'Share on Reddit', monogram: 'r' },
    { key: 'email', label: 'Share by email', icon: Mail, external: false },
  ];

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl);
      } else {
        const input = document.createElement('input');
        input.value = pageUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }

      onActionPress?.();
      setCopied(true);
      window.clearTimeout(window.__samuraiGregShareToastTimer);
      window.__samuraiGregShareToastTimer = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="game-header__share-shell mt-2 w-full max-w-3xl">
      <div className="pointer-events-none mx-auto mb-3 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-amber-200/24 to-transparent" aria-hidden="true" />
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="space-y-1">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-amber-100/70">{SHARE_COPY.title}</p>
          <p className="text-sm italic text-amber-100/62">{SHARE_COPY.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {shareActions.map(({ key, label, icon, monogram, external }) => (
            <span key={key} onPointerEnter={onActionHover} onFocus={onActionHover}>
              <ShareButton
                href={getShareUrl(key, pageUrl, SHARE_COPY.message)}
                label={label}
                icon={icon}
                monogram={monogram}
                external={external}
                onClick={onActionPress}
              />
            </span>
          ))}

          <span onPointerEnter={onActionHover} onFocus={onActionHover}>
            <ShareButton label="Copy site link" icon={Copy} onClick={handleCopy} />
          </span>
        </div>

        <div className="min-h-5 text-xs font-bold uppercase tracking-[0.2em] text-amber-100/72" aria-live="polite">
          {copied ? 'Link copied' : ' '} 
        </div>
      </div>
    </div>
  );
}
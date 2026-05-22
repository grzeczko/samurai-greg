import { Link } from 'react-router-dom';
import { ExternalLink, Mail, Play } from 'lucide-react';
import { getPowerupTheme } from '../data/resumePowerups.js';
import ResumeDownloadButtons from './ResumeDownloadButtons.jsx';

const QUEST_LINKS = {
  musicBattleX: 'https://musicbattlex.com',
  contact: '/contact',
};

function OverlayShell({ children }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/85 p-6 text-white backdrop-blur-sm">
      {children}
    </div>
  );
}

export function StartScreen({ onStart, title, subtitle }) {
  return (
    <OverlayShell>
      <div className="w-full max-w-2xl rounded-lg border border-cyan-300/40 bg-gray-900/95 px-8 py-10 text-center shadow-2xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-cyan-300">
          Resume platformer
        </p>
        <h2 className="text-4xl font-bold leading-tight text-white">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-300">
          {subtitle}
        </p>
        <button
          type="button"
          onClick={onStart}
          className="mt-8 inline-flex min-w-44 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-8 py-4 text-base font-bold text-gray-950 shadow-lg transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
        >
          <Play size={18} aria-hidden="true" />
          Start Game
        </button>
        <p className="mx-auto mt-8 max-w-sm border-t border-white/10 pt-5 text-sm text-gray-400">
          Move with Arrow keys / WASD. Space jumps, Shift/K dashes, X/J swings, C/L throws, S/Down defends.
        </p>
      </div>
    </OverlayShell>
  );
}

export function CompletionScreen({ collectedPowerups }) {
  // Group powerups by zone
  const groupedPowerups = {
    education: collectedPowerups.filter(p => p.zone === 'education'),
    skills: collectedPowerups.filter(p => p.zone === 'skills'),
    experience: collectedPowerups.filter(p => p.zone === 'experience'),
    earlier: collectedPowerups.filter(p => p.zone === 'earlier'),
    achievements: collectedPowerups.filter(p => p.zone === 'achievements'),
  };

  const zoneLabels = {
    education: 'Education Foundation',
    skills: 'Core Technologies',
    experience: 'Professional Experience',
    earlier: 'Earlier Experience',
    achievements: 'Achievements & References',
  };

  const zoneColors = {
    education: 'text-purple-300',
    skills: 'text-cyan-300',
    experience: 'text-rose-300',
    earlier: 'text-emerald-300',
    achievements: 'text-amber-300',
  };

  return (
    <OverlayShell>
      <div className="w-full max-w-4xl rounded-lg border border-emerald-300/40 bg-gray-900/95 px-8 py-7 shadow-2xl">
        <div className="text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-300">
            Final portal reached
          </p>
          <h2 className="text-4xl font-bold text-white">Resume Quest Complete</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-300">
            You collected {collectedPowerups.length} resume powerups from {Object.values(groupedPowerups).filter(g => g.length > 0).length} zones.
          </p>
        </div>

        <div className="mt-6 max-h-80 space-y-4 overflow-y-auto pr-2">
          {Object.entries(groupedPowerups).map(([zone, powerups]) => {
            if (powerups.length === 0) return null;

            return (
              <div key={zone} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h3 className={`mb-3 text-sm font-bold uppercase tracking-wide ${zoneColors[zone]}`}>
                  {zoneLabels[zone]} ({powerups.length})
                </h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {powerups.map(powerup => {
                    const theme = getPowerupTheme(powerup.iconKey);
                    const displayLabel = powerup.title || powerup.label;

                    return (
                      <div key={powerup.id} className="flex items-center gap-3 rounded border border-white/5 bg-black/30 p-2">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-xs font-bold"
                          style={{ backgroundColor: theme.accent, color: '#000' }}
                        >
                          {theme.iconLabel}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white">{displayLabel}</p>
                          <p className="truncate text-xs text-gray-400">{powerup.subtitle || powerup.type || ''}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <ResumeDownloadButtons className="mt-6" showViewResume />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to={QUEST_LINKS.contact}
            aria-label="Contact Gregory about opportunities"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 px-6 py-3 font-black text-slate-950 shadow-[0_0_34px_rgba(251,191,36,0.24)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
          >
            <Mail size={18} aria-hidden="true" />
            Contact Gregory
          </Link>
          <a
            href={QUEST_LINKS.musicBattleX}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-5 py-3 font-bold text-white transition hover:border-pink-300 hover:text-pink-200"
          >
            <ExternalLink size={18} aria-hidden="true" />
            Visit MusicBattleX.com
          </a>
        </div>
      </div>
    </OverlayShell>
  );
}

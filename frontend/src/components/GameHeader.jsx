import { ChevronDown, ExternalLink, Mail, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resumeLinks } from '../data/resumeData.js';
import { GAME_HEADER_COPY } from './gameHeaderCopy.js';
import ResumeDownloadButtons from './ResumeDownloadButtons.jsx';
import ShareQuestBar from './ShareQuestBar.jsx';

export default function GameHeader({ onActionHover, onActionPress, onPressStart }) {
  const pressStartHelperId = 'game-header-press-start-helper';

  return (
    <header className="game-header relative isolate w-full overflow-hidden px-4 pb-8 pt-10 text-center text-white sm:px-6 sm:pb-10 sm:pt-14 lg:pb-12 lg:pt-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.2),transparent_34%),linear-gradient(180deg,rgba(7,8,12,0.98),rgba(17,24,39,0.88)_48%,rgba(7,8,12,0.96))]" />
      <div className="game-header__fog pointer-events-none absolute inset-x-0 top-0 -z-10 h-full opacity-70" />

      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 sm:absolute sm:right-6 sm:top-5 sm:mb-0 sm:justify-end">
        <Link
          to="/resume"
          aria-label="View Gregory resume"
          onPointerEnter={onActionHover}
          onFocus={onActionHover}
          onClick={onActionPress}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-orange-200/35 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-normal text-orange-50 shadow-[0_0_18px_rgba(249,115,22,0.1)] backdrop-blur transition hover:border-orange-200/70 hover:bg-orange-300/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
        >
          <ExternalLink size={15} aria-hidden="true" />
          View Resume
        </Link>

        <Link
          to="/contact"
          aria-label="Contact Gregory"
          onPointerEnter={onActionHover}
          onFocus={onActionHover}
          onClick={onActionPress}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-amber-200/35 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-normal text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.1)] backdrop-blur transition hover:border-amber-200/70 hover:bg-amber-300/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
        >
          <Mail size={15} aria-hidden="true" />
          Contact Me
        </Link>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <div className="game-header__badge inline-flex items-center rounded-full border border-orange-300/35 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-100 shadow-[0_0_28px_rgba(249,115,22,0.2)]">
          {GAME_HEADER_COPY.badge}
        </div>

        <div className="game-header__ornament mt-6 flex w-full items-center justify-center gap-4 text-amber-200/65" aria-hidden="true">
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-amber-300/60 sm:w-24" />
          <span className="h-2 w-2 rotate-45 border border-amber-200/70 bg-amber-300/20" />
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-amber-300/60 sm:w-24" />
        </div>

        <div className="mt-6 space-y-4 sm:space-y-5">
          <h1 className="game-header__title w-full text-[clamp(2.5rem,8.5vw,6.75rem)] font-black uppercase leading-[0.9] tracking-[0.08em] text-white">
            {GAME_HEADER_COPY.brandTitle}
          </h1>

          <p className="game-header__quest mx-auto max-w-3xl text-balance text-[clamp(1.1rem,2.4vw,1.75rem)] font-normal italic leading-snug tracking-wide text-amber-200/80">
            {GAME_HEADER_COPY.questTitle}
          </p>
        </div>

        <div className="game-header__identity mt-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 backdrop-blur-[2px] sm:px-8 sm:py-6">
          <p className="text-[clamp(1.05rem,2.3vw,1.45rem)] font-semibold tracking-[0.16em] text-white/92 uppercase">
            {GAME_HEADER_COPY.identity}
          </p>

          <div className="game-header__identity-divider mt-4 flex items-center justify-center gap-3 text-amber-200/55" aria-hidden="true">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-200/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-200/70" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-200/50" />
          </div>

          <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-200 sm:text-base">
            {GAME_HEADER_COPY.roles.map((role) => (
              <p key={role} className="game-header__role text-balance">
                {role}
              </p>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
            <a
              href={resumeLinks.linkedIn}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-black/20 px-4 py-2 text-slate-100 transition hover:border-amber-200/45 hover:text-white"
            >
              <ExternalLink size={15} aria-hidden="true" />
              LinkedIn
            </a>
            <a
              href={resumeLinks.stackOverflow}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-black/20 px-4 py-2 text-slate-100 transition hover:border-amber-200/45 hover:text-white"
            >
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-100/90">SO</span>
              Stack Overflow
            </a>
            <a
              href={resumeLinks.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-black/20 px-4 py-2 text-slate-100 transition hover:border-amber-200/45 hover:text-white"
            >
              <ExternalLink size={15} aria-hidden="true" />
              GitHub
            </a>
          </div>
        </div>

        <div className="game-header__action-panel mt-8 w-full max-w-4xl overflow-hidden rounded-[30px] border border-amber-200/14 bg-[linear-gradient(180deg,rgba(20,16,12,0.8),rgba(9,12,18,0.92))] px-4 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.35),0_0_30px_rgba(245,158,11,0.08)] backdrop-blur-md sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/45 to-transparent" aria-hidden="true" />
          <div className="game-header__action-shell relative flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={onPressStart}
              onPointerEnter={onActionHover}
              onFocus={onActionHover}
              className="game-header__cta-primary group inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-amber-200/55 bg-[linear-gradient(135deg,rgba(255,226,154,0.96),rgba(245,158,11,0.92)_44%,rgba(190,24,93,0.84))] px-7 py-3 text-sm font-black uppercase tracking-[0.22em] text-[#150b07] shadow-[0_14px_36px_rgba(190,24,93,0.28),0_0_28px_rgba(251,191,36,0.18)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 active:translate-y-px active:scale-[0.985] sm:min-h-16 sm:px-10 sm:text-base"
              aria-label="Move focus to the Samurai Greg game area and enable game audio"
              aria-describedby={pressStartHelperId}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/12 ring-1 ring-black/10 transition duration-200 group-hover:bg-black/16">
                <Play size={18} aria-hidden="true" className="translate-x-[1px]" />
              </span>
              Press Start
            </button>

            <p id={pressStartHelperId} className="game-header__cta-helper text-sm italic tracking-[0.1em] text-amber-100/80 sm:text-[0.95rem]">
              Begin the interactive résumé quest
            </p>

            <ResumeDownloadButtons
              className="w-full"
              showViewResume
              showContact
              variant="hero"
              onActionHover={onActionHover}
              onActionPress={onActionPress}
            />

            <ShareQuestBar
              onActionHover={onActionHover}
              onActionPress={onActionPress}
            />
          </div>
        </div>

        <ChevronDown
          className="game-header__arrow mt-4 text-amber-200/55"
          size={22}
          aria-hidden="true"
        />
      </div>
    </header>
  );
}

import { Download, FileText, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RESUME_FILES } from '../data/resumeFiles.js';

const baseButtonClasses = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4';

const variants = {
  game: {
    wrap: 'flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap',
    link: `${baseButtonClasses} border border-orange-300/35 bg-red-500/10 text-orange-50 shadow-[0_0_24px_rgba(239,68,68,0.14)] hover:border-orange-200 hover:bg-orange-400/20 hover:text-white focus-visible:outline-orange-300`,
    view: `${baseButtonClasses} border border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)] hover:border-cyan-200 hover:bg-cyan-300/20 hover:text-white focus-visible:outline-cyan-300`,
    contact: `${baseButtonClasses} border border-amber-200/40 bg-black/25 text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.12)] hover:border-amber-200/75 hover:bg-amber-300/10 hover:text-white focus-visible:outline-amber-300`,
  },
  hero: {
    wrap: 'flex w-full flex-wrap items-stretch justify-center gap-3',
    link: `${baseButtonClasses} min-h-12 w-full min-w-[11.5rem] border border-amber-200/28 bg-[#0d1118]/78 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:border-orange-200/55 hover:bg-[#171a24]/90 hover:text-white focus-visible:outline-amber-300 sm:w-auto`,
    view: `${baseButtonClasses} min-h-12 w-full min-w-[11.5rem] border border-orange-300/34 bg-[linear-gradient(180deg,rgba(38,28,17,0.9),rgba(17,19,27,0.92))] text-orange-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:border-amber-200/58 hover:bg-[linear-gradient(180deg,rgba(55,36,18,0.94),rgba(21,22,30,0.96))] hover:text-white focus-visible:outline-amber-300 sm:w-auto`,
    contact: `${baseButtonClasses} min-h-12 w-full min-w-[11.5rem] border border-amber-200/32 bg-[#0d1118]/78 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 hover:border-amber-200/62 hover:bg-[#171a24]/90 hover:text-white focus-visible:outline-amber-300 sm:w-auto`,
  },
  resume: {
    wrap: 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end',
    link: `${baseButtonClasses} min-h-10 border border-amber-200/20 bg-[linear-gradient(180deg,rgba(20,18,16,0.82),rgba(12,14,20,0.9))] text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_24px_rgba(0,0,0,0.22)] hover:border-amber-200/45 hover:bg-[linear-gradient(180deg,rgba(34,28,20,0.9),rgba(18,20,28,0.94))] hover:text-white focus-visible:outline-amber-300`,
    view: `${baseButtonClasses} min-h-10 border border-amber-200/28 bg-[linear-gradient(135deg,rgba(255,226,154,0.96),rgba(245,158,11,0.9)_52%,rgba(180,83,9,0.84))] text-[#1d1109] shadow-[0_12px_28px_rgba(180,83,9,0.2),0_0_22px_rgba(251,191,36,0.12)] hover:brightness-105 focus-visible:outline-amber-300`,
    contact: `${baseButtonClasses} min-h-10 border border-amber-200/24 bg-[linear-gradient(180deg,rgba(19,19,21,0.78),rgba(10,12,18,0.9))] text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_24px_rgba(0,0,0,0.22)] hover:border-amber-200/55 hover:bg-[linear-gradient(180deg,rgba(29,25,21,0.88),rgba(14,16,22,0.94))] hover:text-white focus-visible:outline-amber-300`,
  },
};

export default function ResumeDownloadButtons({
  className = '',
  showContact = false,
  showViewResume = false,
  onActionHover,
  onActionPress,
  variant = 'game',
}) {
  const styles = variants[variant] ?? variants.game;

  return (
    <div className={`${styles.wrap} ${className}`}>
      {showViewResume && (
        <Link to="/resume" className={styles.view} onPointerEnter={onActionHover} onFocus={onActionHover} onClick={onActionPress}>
          <FileText size={17} aria-hidden="true" />
          View Resume
        </Link>
      )}
      {showContact && (
        <Link
          to="/contact"
          className={styles.contact}
          aria-label="Contact Gregory"
          onPointerEnter={onActionHover}
          onFocus={onActionHover}
          onClick={onActionPress}
        >
          <Mail size={17} aria-hidden="true" />
          Contact Me
        </Link>
      )}
      <a
        href={RESUME_FILES.pdf.href}
        download={RESUME_FILES.pdf.filename}
        className={styles.link}
        onPointerEnter={onActionHover}
        onFocus={onActionHover}
        onClick={onActionPress}
      >
        <Download size={17} aria-hidden="true" />
        {RESUME_FILES.pdf.label}
      </a>
      <a
        href={RESUME_FILES.docx.href}
        download={RESUME_FILES.docx.filename}
        className={styles.link}
        onPointerEnter={onActionHover}
        onFocus={onActionHover}
        onClick={onActionPress}
      >
        <Download size={17} aria-hidden="true" />
        {RESUME_FILES.docx.label}
      </a>
    </div>
  );
}

import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resumeData, resumeLinks } from '../data/resumeData.js';
import ResumeDownloadButtons from './ResumeDownloadButtons.jsx';

const inlineLinks = [
  { text: 'Rzeczko.com', href: resumeLinks.interactiveResume },
  { text: 'www.musicbattlex.com', href: 'https://www.musicbattlex.com' },
  { text: 'www.themusichutch.com', href: 'https://www.themusichutch.com' },
  { text: 'MusicBattleX.com', href: resumeLinks.musicBattleX },
  { text: 'TheMusicHutch.com', href: resumeLinks.theMusicHutch },
  { text: 'github.com/grzeczko', href: resumeLinks.github },
  { text: 'stackoverflow.com/users/2872366/gregory-r', href: resumeLinks.stackOverflow },
  { text: 'www.deloitte.com', href: 'https://www.deloitte.com' },
  { text: 'www.msg.com', href: 'https://www.msg.com' },
  { text: 'www.westelm.com', href: 'https://www.westelm.com' },
  { text: 'www.ddbhealth.com', href: 'https://www.ddbhealth.com' },
  { text: 'www.high5games.com', href: 'https://www.high5games.com' },
].sort((a, b) => b.text.length - a.text.length);

function InlineLinkedText({ text }) {
  const parts = [];
  let cursor = 0;

  while (cursor < text.length) {
    let nextMatch = null;

    inlineLinks.forEach((link) => {
      const index = text.indexOf(link.text, cursor);

      if (index === -1) {
        return;
      }

      if (!nextMatch || index < nextMatch.index || (index === nextMatch.index && link.text.length > nextMatch.link.text.length)) {
        nextMatch = { index, link };
      }
    });

    if (!nextMatch) {
      parts.push(text.slice(cursor));
      break;
    }

    if (nextMatch.index > cursor) {
      parts.push(text.slice(cursor, nextMatch.index));
    }

    parts.push(
      <a
        key={`${nextMatch.link.text}-${nextMatch.index}`}
        href={nextMatch.link.href}
        target="_blank"
        rel="noreferrer"
        className="resume-link"
      >
        {nextMatch.link.text}
      </a>
    );
    cursor = nextMatch.index + nextMatch.link.text.length;
  }

  return parts;
}

function ContactRow({ items }) {
  return (
    <p className="resume-contact-row">
      {items.map((item, index) => (
        <span key={item.text}>
          {index > 0 && <span className="resume-contact-separator"> • </span>}
          {item.href ? (
            <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined} className="resume-link">
              {item.text}
            </a>
          ) : (
            item.text
          )}
        </span>
      ))}
    </p>
  );
}

function Section({ title, children }) {
  return (
    <section className="resume-section">
      <h2 className="resume-section-title">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul className="resume-bullets">
      {items.map(item => (
        <li key={item}>
          <InlineLinkedText text={item} />
        </li>
      ))}
    </ul>
  );
}

function ExperienceEntry({ entry }) {
  return (
    <article className="resume-job">
      <div className="resume-job-heading">
        <div>
          <h3>{entry.company}</h3>
          <p className="resume-job-title">{entry.title}</p>
          <p className="resume-job-site">
            <InlineLinkedText text={entry.website} />
          </p>
        </div>
        <p className="resume-job-dates">{entry.dates}</p>
      </div>
      <BulletList items={entry.bullets} />
    </article>
  );
}

export default function ResumePage() {
  return (
    <main className="resume-page relative isolate min-h-screen overflow-hidden px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="resume-page__backdrop" aria-hidden="true">
        <div className="resume-page__fog" />
        <div className="resume-page__glow" />
        <div className="resume-page__grid" />
      </div>

      <div className="resume-page__shell relative z-10 mx-auto max-w-7xl">
      <div className="resume-no-print resume-action-bar mx-auto mb-6 flex max-w-[62.5rem] flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/"
          className="resume-action-bar__back inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to Resume Quest
        </Link>
        <ResumeDownloadButtons variant="resume" showContact />
      </div>

      <article className="resume-sheet mx-auto max-w-[62.5rem] px-6 py-8 sm:px-10 md:px-12 md:py-10">
        <header className="resume-header">
          <h1>{resumeData.name}</h1>
          {resumeData.contactRows.map(row => (
            <ContactRow key={row.map(item => item.text).join('|')} items={row} />
          ))}
        </header>

        <Section title="SUMMARY">
          <p className="resume-summary">{resumeData.summary}</p>
        </Section>

        <Section title="CORE TECHNOLOGIES">
          <table className="resume-tech-table">
            <tbody>
              {resumeData.coreTechnologies.map(row => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="PROFESSIONAL EXPERIENCE">
          {resumeData.professionalExperience.map(entry => (
            <ExperienceEntry key={entry.company} entry={entry} />
          ))}
        </Section>

        <Section title="EARLIER EXPERIENCE">
          {resumeData.earlierExperience.map(entry => (
            <ExperienceEntry key={entry.company} entry={entry} />
          ))}
        </Section>

        <Section title="ADDITIONAL ROLES (SELECTED)">
          {resumeData.additionalRoles.map(role => (
            <div className="resume-additional-role" key={role.title ?? role.text}>
              {role.title && <p className="resume-additional-title">{role.title}</p>}
              {role.bullets && <BulletList items={role.bullets} />}
              {role.text && (
                <p className="resume-additional-text">
                  <InlineLinkedText text={role.text} />
                </p>
              )}
            </div>
          ))}
        </Section>

        <Section title="EDUCATION">
          {resumeData.education.map(item => (
            <div className="resume-education-item" key={item.title}>
              <p className="resume-education-title">{item.title}</p>
              {item.detail && <p className="resume-education-detail">{item.detail}</p>}
            </div>
          ))}
        </Section>

        <Section title="SELECTED ACHIEVEMENTS">
          <BulletList items={resumeData.selectedAchievements} />
        </Section>

        <p className="resume-references">{resumeData.references}</p>
      </article>
      </div>
    </main>
  );
}

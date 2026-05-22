import { Link } from 'react-router-dom';
import { resumePowerups, getPowerupTheme } from '../data/resumePowerups.js';

export default function FullResume() {
  return (
    <main className="min-h-screen bg-gray-900 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="text-sm font-bold text-cyan-300 hover:text-white">
          Back to Resume Quest
        </Link>

        <header className="mt-8 border-b border-white/10 pb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-300">Interactive resume</p>
          <h1 className="mt-3 text-5xl font-bold">Gregory Rzeczko</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            Full-stack engineer focused on product architecture, backend systems, AI workflows, infrastructure, and game-inspired experiences.
          </p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {resumePowerups.map(powerup => {
            const theme = getPowerupTheme(powerup.iconKey);

            return (
              <article key={powerup.id} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-black text-sm font-bold"
                    style={{ color: theme.accent }}
                  >
                    {theme.iconLabel}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">{powerup.label}</h2>
                    <p className="text-sm" style={{ color: theme.accent }}>{powerup.type}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-300">{powerup.description}</p>
                <ul className="mt-4 space-y-2">
                  {powerup.resumeBullets.map(bullet => (
                    <li key={bullet} className="text-sm leading-relaxed text-gray-300">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

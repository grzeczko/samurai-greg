import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

const STORY_PARAGRAPHS = [
  'Long ago, in the lands of Connecticut, a young warrior named Samurai Greg began his journey mastering the ancient arts of logic, code, and creation.',
  'Seeking greater challenges, he traveled to the towering kingdoms of New York City, where for nearly two decades he fought through the chaotic realms of enterprise systems, cloud architecture, AI, media, and high-traffic digital empires.',
  'From Wall Street towers to global platforms, Samurai Greg forged powerful systems, defeated impossible deadlines, and mastered the disciplines of frontend, backend, cloud, and machine intelligence.',
  'But darkness spread across the digital realm.',
  'The Demon Samurai emerged from the shadows, corrupting balance across the land and sealing away the legendary Golden Résumé — the sacred artifact containing Samurai Greg’s full power, wisdom, and legacy.',
  'Without it, the realm fell into disorder.',
  'Leaving behind the noise of New York, Samurai Greg journeyed south to Nashville, Tennessee — a new land of music, creativity, and reflection — to prepare for one final quest.',
  'Now the path begins.',
  'Help Samurai Greg reclaim the Golden Résumé, defeat the Demon Samurai, and restore honor, balance, and purpose to the realm.',
  'Only then can he return as a true Full-Time Samurai — serving good, building with honor, and following the Way of the Samurai.',
];

const OBJECTIVES = [
  'Recover the Lost Codexes',
  'Master Ancient Technologies',
  'Reclaim the Golden Résumé',
  'Defeat the Demon Samurai',
  'Restore Honor to the Realm',
];

export default function ObjectiveScreen({ onBeginJourney }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
    }
  }, []);

  const handleBeginJourney = () => {
    if (isLeaving) {
      return;
    }

    setIsLeaving(true);
    transitionTimeoutRef.current = window.setTimeout(() => {
      onBeginJourney();
    }, 460);
  };

  return (
    <section
      className={`objective-screen ${isLeaving ? 'objective-screen--leaving' : ''}`}
      aria-labelledby="objective-heading"
      aria-describedby="objective-story"
    >
      <div className="objective-screen__fog" aria-hidden="true" />
      <div className="objective-screen__embers" aria-hidden="true" />

      <div className="objective-screen__panel">
        <header className="objective-screen__header">
          <p className="objective-screen__chapter">CHAPTER I</p>
          <h2 id="objective-heading" className="objective-screen__title">
            The Quest Begins
          </h2>
        </header>

        <div id="objective-story" className="objective-screen__story" tabIndex={0}>
          {STORY_PARAGRAPHS.map((paragraph, index) => (
            <p
              key={paragraph}
              className="objective-screen__paragraph"
              style={{ '--objective-delay': `${180 + (index * 58)}ms` }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <section className="objective-screen__objectives" aria-labelledby="objective-list-heading">
          <h3 id="objective-list-heading" className="objective-screen__objectives-title">
            OBJECTIVES
          </h3>
          <ul className="objective-screen__objective-list">
            {OBJECTIVES.map((objective, index) => (
              <li
                key={objective}
                className="objective-screen__objective-item"
                style={{ '--objective-delay': `${720 + (index * 54)}ms` }}
              >
                {objective}
              </li>
            ))}
          </ul>
        </section>

        <button
          type="button"
          className="objective-screen__button"
          onClick={handleBeginJourney}
          disabled={isLeaving}
        >
          <Play size={17} strokeWidth={2.4} aria-hidden="true" />
          BEGIN JOURNEY
        </button>
      </div>
    </section>
  );
}

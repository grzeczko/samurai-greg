import { RotateCcw, Smartphone } from 'lucide-react';

export default function MobileRotatePrompt() {
  return (
    <section
      className="mobile-rotate-prompt"
      aria-labelledby="mobile-rotate-heading"
      role="dialog"
      aria-modal="true"
    >
      <div className="mobile-rotate-prompt__glow" aria-hidden="true" />
      <div className="mobile-rotate-prompt__panel">
        <div className="mobile-rotate-prompt__icon" aria-hidden="true">
          <Smartphone size={42} strokeWidth={1.7} />
          <RotateCcw size={26} strokeWidth={2.2} />
        </div>
        <h2 id="mobile-rotate-heading" className="mobile-rotate-prompt__message">
          Rotate your device to landscape to begin the quest.
        </h2>
      </div>
    </section>
  );
}

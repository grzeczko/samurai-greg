import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContactForm from './contact/ContactForm.jsx';

export default function ContactPage() {
  return (
    <main className="contact-page relative isolate min-h-screen overflow-hidden px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="contact-page__backdrop" aria-hidden="true">
        <div className="contact-page__fog" />
        <div className="contact-page__glow" />
        <div className="contact-page__grid" />
        <span className="contact-page__petal contact-page__petal--one" />
        <span className="contact-page__petal contact-page__petal--two" />
        <span className="contact-page__petal contact-page__petal--three" />
        <span className="contact-page__ember contact-page__ember--one" />
        <span className="contact-page__ember contact-page__ember--two" />
        <span className="contact-page__ember contact-page__ember--three" />
      </div>

      <div className="resume-no-print contact-page__shell relative mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-7xl flex-col justify-center">
        <div className="mb-5 sm:mb-7">
          <Link
            to="/resume"
            className="contact-page__back-link inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-black/20 px-4 py-2 text-sm font-bold text-amber-100/88 transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Back to Resume
          </Link>
        </div>

        <ContactForm />
      </div>
    </main>
  );
}
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, Mail, Send, Sparkles, Swords } from 'lucide-react';
import { sendContactMessage } from '../../services/contactService.js';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
const RECAPTCHA_SCRIPT_ID = 'google-recaptcha-v2-script';
const MISSING_RECAPTCHA_MESSAGE = 'Contact form setup is missing VITE_RECAPTCHA_SITE_KEY. Add it to the repo root .env and restart the root Vite dev server.';
const RECAPTCHA_LOAD_ERROR_MESSAGE = 'Unable to load reCAPTCHA. Check browser blocking or network access and try again.';
const RECAPTCHA_RENDER_ERROR_MESSAGE = 'reCAPTCHA could not initialize for this page. Check the site key domain settings and try again.';

const initialFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
  portfolio_url: '',
};

const OPEN_TO_ITEMS = [
  'Senior Software Architect roles',
  'Creative direction / product work',
  'AI / cloud / full-stack projects',
  'Music and video collaborations',
];

function loadRecaptchaScript() {
  const resolveGrecaptcha = (resolve, reject) => {
    const grecaptcha = window.grecaptcha;

    if (!grecaptcha?.ready) {
      reject(new Error('Google reCAPTCHA loaded without grecaptcha.ready.'));
      return;
    }

    grecaptcha.ready(() => {
      if (!window.grecaptcha?.render) {
        reject(new Error('Google reCAPTCHA is ready but render is unavailable.'));
        return;
      }

      resolve(window.grecaptcha);
    });
  };

  if (window.grecaptcha?.render) {
    return Promise.resolve(window.grecaptcha);
  }

  if (window.__samuraiGregRecaptchaPromise) {
    return window.__samuraiGregRecaptchaPromise;
  }

  window.__samuraiGregRecaptchaPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID);

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        resolveGrecaptcha(resolve, reject);
        return;
      }

      existingScript.addEventListener('load', () => resolveGrecaptcha(resolve, reject), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google reCAPTCHA script.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolveGrecaptcha(resolve, reject);
    };
    script.onerror = () => reject(new Error('Failed to load Google reCAPTCHA script.'));

    document.head.appendChild(script);

    return undefined;
  }).catch((error) => {
    window.__samuraiGregRecaptchaPromise = null;
    throw error;
  });

  return window.__samuraiGregRecaptchaPromise;
}

export default function ContactForm() {
  const captchaContainerRef = useRef(null);
  const captchaWidgetIdRef = useRef(null);
  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isCaptchaReady, setIsCaptchaReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(() => (
    RECAPTCHA_SITE_KEY
      ? { type: 'idle', message: '' }
      : { type: 'error', message: MISSING_RECAPTCHA_MESSAGE }
  ));

  useEffect(() => {
    if (!import.meta.env.DEV || window.__samuraiGregViteEnvLogged) {
      return;
    }

    window.__samuraiGregViteEnvLogged = true;
    console.log(import.meta.env);
  }, []);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      return undefined;
    }

    let isMounted = true;

    loadRecaptchaScript()
      .then((grecaptcha) => {
        if (!isMounted || !captchaContainerRef.current || captchaWidgetIdRef.current !== null) {
          return;
        }

        try {
          captchaWidgetIdRef.current = grecaptcha.render(captchaContainerRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
            theme: 'dark',
            callback: token => {
              setRecaptchaToken(token);
              setFieldErrors(prev => ({ ...prev, recaptcha_token: undefined }));
            },
            'expired-callback': () => setRecaptchaToken(''),
            'error-callback': () => {
              setRecaptchaToken('');
              setStatus({
                type: 'error',
                message: 'reCAPTCHA could not verify this request. Please try again.',
              });
            },
          });
          setIsCaptchaReady(true);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('reCAPTCHA render failed:', error);
          }

          if (!isMounted) {
            return;
          }

          setIsCaptchaReady(false);
          setStatus({
            type: 'error',
            message: RECAPTCHA_RENDER_ERROR_MESSAGE,
          });
        }
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error('reCAPTCHA load failed:', error);
        }

        if (!isMounted) {
          return;
        }

        setIsCaptchaReady(false);
        setStatus({
          type: 'error',
          message: RECAPTCHA_LOAD_ERROR_MESSAGE,
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resetCaptcha = () => {
    setRecaptchaToken('');

    if (window.grecaptcha && captchaWidgetIdRef.current !== null) {
      window.grecaptcha.reset(captchaWidgetIdRef.current);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors({});
    setStatus({ type: 'idle', message: '' });

    if (!RECAPTCHA_SITE_KEY || !recaptchaToken) {
      setFieldErrors(prev => ({
        ...prev,
        recaptcha_token: ['Please complete the reCAPTCHA check.'],
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = await sendContactMessage({
        ...formData,
        recaptcha_token: recaptchaToken,
      });

      setFormData(initialFormState);
      resetCaptcha();
      setStatus({
        type: 'success',
        message: payload?.message || 'Thanks, your message has been sent.',
      });
    } catch (error) {
      setFieldErrors(error?.errors || {});
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to send your message right now.',
      });
      resetCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldError = (field) => {
    const error = fieldErrors[field]?.[0];

    if (!error) {
      return null;
    }

    return <p className="mt-2 text-sm text-rose-200">{error}</p>;
  };

  return (
    <section
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-heading"
      className="resume-no-print contact-form-shell mx-auto w-full max-w-6xl scroll-mt-8 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-amber-300"
    >
      <div className="contact-quest-panel relative grid overflow-hidden rounded-[30px] border border-amber-200/18 bg-[linear-gradient(180deg,rgba(18,12,9,0.94),rgba(8,9,14,0.97))] text-white shadow-[0_34px_120px_rgba(0,0,0,0.56),0_0_40px_rgba(245,158,11,0.08)] lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
        <div className="contact-quest-panel__glow" aria-hidden="true" />

        <div className="relative z-10 border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="contact-quest-panel__header border-b border-white/10 px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-center gap-3 text-amber-300">
              <Mail size={18} aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.28em]">Samurai Greg Contact</p>
            </div>
            <h2 id="contact-heading" className="contact-quest-panel__title mt-3 text-[clamp(2rem,4vw,3.4rem)] font-black uppercase leading-[0.95] tracking-[0.08em] text-white">
              Contact Gregory
            </h2>
            <p className="contact-quest-panel__subtitle mt-3 max-w-2xl text-balance text-base italic leading-relaxed text-amber-100/82 sm:text-lg">
              Send a message without leaving the quest
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
          {status.message && (
            <div
              role={status.type === 'error' ? 'alert' : 'status'}
              className={`mb-5 flex gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${status.type === 'success' ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100' : 'border-rose-300/40 bg-rose-500/10 text-rose-100'}`}
            >
              {status.type === 'success' ? <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" /> : <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="sm:col-span-1">
              <label htmlFor="contact-name" className="contact-quest-panel__label mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-amber-100/72">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                className="contact-quest-panel__field w-full rounded-2xl border border-amber-100/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-3 text-base text-white outline-none transition placeholder:text-amber-100/28 focus:border-amber-200/55 focus:bg-white/[0.07]"
                placeholder="Your Name"
                required
              />
              {renderFieldError('name')}
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="contact-email" className="contact-quest-panel__label mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-amber-100/72">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className="contact-quest-panel__field w-full rounded-2xl border border-amber-100/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-3 text-base text-white outline-none transition placeholder:text-amber-100/28 focus:border-amber-200/55 focus:bg-white/[0.07]"
                placeholder="you@example.com"
                required
              />
              {renderFieldError('email')}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="contact-subject" className="contact-quest-panel__label mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-amber-100/72">
                Subject
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                disabled={isSubmitting}
                className="contact-quest-panel__field w-full rounded-2xl border border-amber-100/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-3 text-base text-white outline-none transition placeholder:text-amber-100/28 focus:border-amber-200/55 focus:bg-white/[0.07]"
                placeholder="Role, project, collaboration, or question"
              />
              {renderFieldError('subject')}
            </div>

            <div className="sr-only" aria-hidden="true">
              <label htmlFor="contact-portfolio-url">Portfolio URL</label>
              <input
                id="contact-portfolio-url"
                name="portfolio_url"
                type="text"
                tabIndex={-1}
                autoComplete="nope"
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                value={formData.portfolio_url}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="contact-message" className="contact-quest-panel__label mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-amber-100/72">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
                className="contact-quest-panel__field contact-quest-panel__field--message w-full rounded-[1.65rem] border border-amber-100/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-3 text-base text-white outline-none transition placeholder:text-amber-100/28 focus:border-amber-200/55 focus:bg-white/[0.07]"
                placeholder="Tell me about the role, project, or collaboration."
                required
              />
              {renderFieldError('message')}
            </div>

            <div className="sm:col-span-2">
              <div className="contact-quest-panel__captcha rounded-2xl border border-amber-100/10 bg-black/20 px-3 py-3 sm:px-4">
                <div ref={captchaContainerRef} className="min-h-[78px]" />
              </div>
              {renderFieldError('recaptcha_token')}
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitting || !isCaptchaReady || !recaptchaToken}
                className="contact-quest-panel__submit inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-amber-100/55 bg-[linear-gradient(135deg,rgba(255,226,154,0.98),rgba(245,158,11,0.92)_44%,rgba(190,24,93,0.82))] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#150b07] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 active:translate-y-px active:scale-[0.985] sm:w-auto sm:min-w-[13rem]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/12 ring-1 ring-black/10">
                  {isSubmitting ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
                </span>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
          </div>
        </div>

        <aside className="contact-quest-side relative z-10 flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8">
          <div className="contact-quest-side__panel rounded-[28px] border border-amber-200/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/16 bg-amber-400/8 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-amber-100/78">
              <Sparkles size={14} aria-hidden="true" />
              Open to
            </div>
            <ul className="mt-5 grid gap-3">
              {OPEN_TO_ITEMS.map((item) => (
                <li key={item} className="contact-quest-side__item flex items-start gap-3 rounded-2xl border border-white/8 bg-black/16 px-4 py-3 text-sm leading-6 text-slate-200">
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-200/24 bg-amber-300/10 text-amber-200">
                    <Swords size={12} aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="contact-quest-side__panel rounded-[28px] border border-white/10 bg-black/16 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-100/66">Quest Dispatch</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Use this chamber for roles, product conversations, architecture leadership, and cross-disciplinary collaborations. The message route stays the same; only the presentation now matches the quest.
            </p>
          </div>
        </aside>
        </div>
    </section>
  );
}

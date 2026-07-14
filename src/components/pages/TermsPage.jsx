import { AnimatePresence, motion } from 'motion/react';
import { X, ShieldCheck } from 'lucide-react';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.0.0';
// window.location.origin reflects wherever this build is actually running
// (localhost, a Vercel preview URL, or production) - the old __APP_URL__
// build-time constant was hardcoded to production regardless of that,
// which only mattered for this display text but was still wrong on any
// non-production build.
const APP_URL = typeof window !== 'undefined' && window.location?.origin
  ? window.location.origin + '/'
  : (typeof __APP_URL__ !== 'undefined' ? __APP_URL__ : 'https://manus-jet.vercel.app/');

const SECTIONS = [
  {
    title: '1. Overview',
    body: 'Manus is a free, open-source, client-side web application created by Satvik Hemant Gupta. It converts typed text into handwriting-style rendered output for export as image or PDF files. By using this application, you agree to these terms.',
  },
  {
    title: '2. No data collection',
    body: 'By default, Manus runs entirely in your browser as a guest - all text, settings, fonts, and pages are stored locally on your device using IndexedDB and localStorage, and nothing is transmitted to a server. Loading the built-in handwriting fonts does involve a request to Google Fonts\' servers; see section 3. If you use the optional voice dictation feature, your browser\'s built-in speech recognition handles the audio - in Chrome, this means the audio is sent to Google\'s servers to be transcribed. Dictation is entirely opt-in; nothing is recorded unless you press the microphone button. If you choose to sign in with Google, your notebooks and pages are backed up to your account (via Firebase/Google Cloud) roughly once an hour so you can access them from another device; your local copy on this device is never deleted by this process. Signing in also stores your email, display name, and a simple login-streak count. Signing in is entirely optional - guest mode is never required and works exactly the same with or without an account.',
  },
  {
    title: '3. Font usage',
    body: 'Built-in handwriting fonts are served via Google Fonts under the SIL Open Font License. Fonts you upload yourself are stored only in your browser and never leave your device. You are responsible for ensuring you hold the right to use any font you upload.',
  },
  {
    title: '4. Intended use',
    body: 'Manus is intended for personal note-taking, academic assignments, and creative projects. You agree not to use it to produce fraudulent documents, misrepresent generated content as authentic handwriting in deceptive contexts, or otherwise violate applicable law.',
  },
  {
    title: '5. No warranty',
    body: 'This application is provided "as is," without warranty of any kind, express or implied. The author is not liable for any damages, data loss, or other issues arising from its use. Rendering and export results may vary slightly across devices and browsers.',
  },
  {
    title: '6. Open source license',
    body: 'Manus is released under the MIT license. Forks, contributions, and redistribution are welcome provided attribution to the original author is preserved.',
  },
  {
    title: '7. Contact',
    body: null,
    link: { href: 'https://github.com/SatvikHGupta', label: 'github.com/SatvikHGupta' },
  },
];

export function TermsPage({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[95] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85dvh] flex flex-col overflow-hidden"
          initial={{ scale: 0.94, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-accent/10 dark:border-neutral-800 shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <ShieldCheck size={17} className="text-neutral-600 dark:text-neutral-300" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Terms &amp; Conditions</h1>
                <p className="text-[11px] text-neutral-400 mt-0.5">Manus v{APP_VERSION} &middot; Updated June 2026</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {SECTIONS.map(s => (
              <section key={s.title}>
                <h2 className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">{s.title}</h2>
                {s.body && <p className="text-[13px]">{s.body}</p>}
                {s.link && (
                  <p className="text-[13px]">
                    For questions, reach out via GitHub:{' '}
                    <a
                      href={s.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-neutral-300 dark:decoration-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100"
                    >
                      {s.link.label}
                    </a>
                  </p>
                )}
              </section>
            ))}
          </div>

          <div className="px-6 py-3.5 border-t border-accent/10 dark:border-neutral-800 shrink-0 flex items-center justify-between">
            <p className="text-[11px] text-neutral-400">{APP_URL.replace(/^https?:\/\//, '')}</p>
            <p className="text-[11px] text-neutral-400">Author: Satvik Hemant Gupta</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { StickerArt } from './ui';

export function AuthModal() {
  const { auth, openAuth, signIn, signUp, creations } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const first = useRef<HTMLInputElement>(null);
  const up = auth === 'signup';

  useEffect(() => { setErr(''); if (auth) setTimeout(() => first.current?.focus(), 120); }, [auth]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') openAuth(null); };
    window.addEventListener('keydown', on); return () => window.removeEventListener('keydown', on);
  }, [openAuth]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { up ? await signUp(name, email, pw) : await signIn(email, pw); setPw(''); }
    catch (x: any) { setErr(x?.message ?? 'Something went wrong — please try again.'); }
    finally { setBusy(false); }
  };

  return (
    <AnimatePresence>
      {auth && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center p-4 bg-cocoa/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && openAuth(null)}>
          <motion.div role="dialog" aria-modal="true" aria-label={up ? 'Create an account' : 'Sign in'} initial={{ y: 30, scale: .96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-[420px] bg-paper rounded-[28px] shadow-card p-7 sm:p-8 overflow-hidden">
            <StickerArt id={up ? 'bowPink' : 'sparkleG'} className="absolute -right-3 -top-3 w-20 rotate-12 opacity-90" />
            <button className="absolute right-4 top-4 w-9 h-9 rounded-full hover:bg-beige grid place-items-center text-lg z-10" onClick={() => openAuth(null)} aria-label="Close">×</button>
            <div className="label">{up ? 'Join the booth' : 'Welcome back'}</div>
            <h2 className="font-serif text-4xl leading-none mt-2">{up ? <>Keep every <span className="italic text-cherry">moment</span></> : <>Sign <span className="italic text-cherry">in</span></>}</h2>
            <p className="text-sm text-mocha mt-3">{up ? 'Save your strips, notes and edits so you can come back, download again or keep decorating.' : 'Pick up where you left off — your saved strips are waiting.'}</p>
            {creations.length > 0 && <p className="text-xs mt-2 bg-butter/50 rounded-xl px-3 py-2">✦ The {creations.length} strip{creations.length > 1 ? 's' : ''} you made this visit will be saved to your account.</p>}
            <form onSubmit={submit} className="mt-5 space-y-3">
              {up && <Field label="Your name"><input ref={first} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className="inp" placeholder="Riya" /></Field>}
              <Field label="Email"><input ref={up ? undefined : first} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="inp" placeholder="you@example.com" /></Field>
              <Field label="Password">
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={up ? 'new-password' : 'current-password'} required minLength={up ? 6 : 1} className="inp pr-16" placeholder={up ? 'At least 6 characters' : '••••••'} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-mocha px-2 py-1">{show ? 'Hide' : 'Show'}</button>
                </div>
              </Field>
              {err && <div className="text-sm text-cherry font-semibold" role="alert">{err}</div>}
              <button className="btn btn-primary w-full !py-3.5" disabled={busy}>{busy ? 'One moment…' : up ? 'Create my account' : 'Sign in'}</button>
            </form>
            <div className="text-sm text-center mt-4">
              {up ? <>Already have an account? <button className="font-bold text-cherry underline" onClick={() => openAuth('signin')}>Sign in</button></>
                : <>New here? <button className="font-bold text-cherry underline" onClick={() => openAuth('signup')}>Create an account</button></>}
            </div>
            <p className="text-[11px] text-mocha/80 text-center mt-4 leading-relaxed">🔒 Your account and photos are stored privately in this browser on this device — nothing is uploaded. Sign in on the same device to see them again.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-bold text-mocha">{label}</span><div className="mt-1">{children}</div></label>;
}

export function AccountButton() {
  const { user, openAuth, signOut, go, authReady } = useStore();
  const [open, setOpen] = useState(false);
  if (!authReady) return null;
  if (!user) return <button className="btn btn-ghost btn-sm" onClick={() => openAuth('signin')}>Sign in</button>;
  const initials = user.name.split(/\s+/).map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-10 h-10 rounded-full bg-blush text-cocoa font-bold text-sm grid place-items-center border-2 border-paper shadow-soft" aria-label="Account menu">{initials}</button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 mt-2 w-60 bg-paper rounded-2xl shadow-card border border-cocoa/10 p-2 z-50" onMouseLeave={() => setOpen(false)}>
            <div className="px-3 py-2"><div className="font-semibold text-sm truncate">{user.name}</div><div className="text-xs text-mocha truncate">{user.email}</div></div>
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-beige/60 text-sm font-semibold" onClick={() => { go('creations'); setOpen(false); }}>My saved creations</button>
            <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-beige/60 text-sm font-semibold" onClick={() => { signOut(); setOpen(false); }}>Sign out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

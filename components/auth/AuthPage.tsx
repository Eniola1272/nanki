'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/db/supabase-browser';
import { safeAuthRedirect } from '@/lib/auth/redirect';
import styles from './auth.module.css';

type Mode = 'signin' | 'signup' | 'forgot-password' | 'update-password';
const copy = {
  signin: { title: 'Welcome back.', subtitle: 'A little practice. A little progress. Every day.', action: 'Sign in' },
  signup: { title: 'Make room for discovery.', subtitle: 'Create your account. Start learning your way.', action: 'Create account' },
  'forgot-password': { title: 'Let’s get you back in.', subtitle: 'We’ll send you a link to reset your password.', action: 'Send reset link' },
  'update-password': { title: 'A fresh start.', subtitle: 'Choose a new password for your Nanki account.', action: 'Save new password' },
};

function GoogleIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.5a4.7 4.7 0 0 1-2.1 3.1v2.6h3.4c2-1.9 3-4.5 3-7.6Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.8-2.5l-3.4-2.6c-.9.6-2 .9-3.4.9-2.6 0-4.9-1.8-5.7-4.2H2.8v2.7A10.3 10.3 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.3 13.6a6 6 0 0 1 0-3.2V7.7H2.8a10 10 0 0 0 0 8.6l3.5-2.7Z"/><path fill="#EA4335" d="M12 6.2c1.5 0 2.9.5 4 1.5l3-3A10 10 0 0 0 2.8 7.7l3.5 2.7A6 6 0 0 1 12 6.2Z"/></svg>;
}

export default function AuthPage({ mode }: { mode: Mode }) {
  const search = useSearchParams();
  const next = safeAuthRedirect(search.get('callbackUrl'));
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState<'email' | 'google' | null>(null);
  const busyRef = useRef(false);
  const [error, setError] = useState(search.has('error') ? 'We couldn’t complete sign-in. Please try again.' : '');
  const [notice, setNotice] = useState('');
  const text = copy[mode];
  const accountMode = mode === 'signin' || mode === 'signup';
  const route = (path: string) => `${path}?callbackUrl=${encodeURIComponent(next)}`;
  const callback = (destination: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true; setBusy('email'); setError(''); setNotice('');
    try {
      const db = createClient();
      if (mode === 'signin') {
        const { error } = await db.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        window.location.replace(next);
      } else if (mode === 'signup') {
        const { data, error } = await db.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: callback(next) } });
        if (error) throw error;
        // Notify admin of new signup in the background
        fetch('/api/auth/notify-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim(),
            userId: data.user?.id,
            method: 'email',
          }),
        }).catch(() => {});
        if (data.session) window.location.replace(next);
        else { setNotice('Check your inbox for a confirmation link to finish creating your account. If you already have an account, sign in instead.'); setPassword(''); }
      } else if (mode === 'forgot-password') {
        const { error } = await db.auth.resetPasswordForEmail(email.trim(), { redirectTo: callback('/auth/update-password') });
        if (error) throw error;
        setNotice('If an account exists for that email, you’ll receive a password reset link. Check your inbox and spam folder.');
      } else {
        const { data: { user } } = await db.auth.getUser();
        if (!user) throw new Error('Your reset link has expired. Request a new link to continue.');
        const { error } = await db.auth.updateUser({ password });
        if (error) throw error;
        window.location.replace('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally { busyRef.current = false; setBusy(null); }
  };

  const google = async () => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy('google'); setError(''); setNotice('');
    try {
      const { error } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callback(next) } });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in is unavailable. Please try again.');
      busyRef.current = false; setBusy(null);
    }
  };

  return <div className={styles.page}>
    <div className={styles.shell}>
      <aside className={styles.art} aria-label="Learning grows with practice">
        <Image src="/images/auth-botanical.png" alt="" fill sizes="(min-width: 900px) 46vw, 100vw" priority className={styles.artImage} />
        <div className={styles.artShade} />
        <Link href="/" className={styles.back}><ArrowLeft size={15} /> Back to Nanki</Link>
        <div className={styles.artCopy}>
          <span className={styles.eyebrow}><span /> A LITTLE EVERY DAY</span>
          <h2>Give your mind<br />room to grow.</h2>
          <p>Quizzes, flashcards, and small wins.<br />Build knowledge that stays with you.</p>
        </div>
      </aside>
      <section className={styles.formPanel} aria-labelledby="auth-title">
        <Link href="/" className={styles.brand} aria-label="Nanki home"><span className={styles.brandIcon}><Sparkles size={22} strokeWidth={1.6} /></span>nanki<span className={styles.brandDot}>.</span></Link>
        <div className={styles.heading}><h1 id="auth-title">{text.title}</h1><p>{text.subtitle}</p></div>
        <form onSubmit={submit} className={styles.form}>
          <fieldset disabled={busy !== null} className={styles.fields}>
            {mode === 'signup' && <label className={styles.label}>Your name<input name="name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?" required maxLength={100} /></label>}
            {mode !== 'update-password' && <label className={styles.label}>Email address<input type="email" name="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></label>}
            {mode !== 'forgot-password' && <label className={styles.label}>Password<span className={styles.passwordWrap}><input type={visible ? 'text' : 'password'} name="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password'} minLength={mode === 'signin' ? undefined : 8} required aria-describedby={mode === 'signin' ? undefined : 'password-hint'} /><button type="button" className={styles.eye} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(v => !v)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>{mode !== 'signin' && <span id="password-hint" className={styles.hint}>Use at least 8 characters.</span>}</label>}
            {mode === 'signin' && <div className={styles.formMeta}><span>Your next small win is waiting.</span><Link href={route('/auth/forgot-password')}>Forgot password?</Link></div>}
            {error && <p role="alert" className={styles.error}>{error}</p>}
            {notice && <p role="status" className={styles.notice}>{notice}</p>}
            <button type="submit" className={styles.primary}>{busy === 'email' ? <><LoaderCircle className={styles.spinner} size={18} /> Please wait…</> : <>{text.action}<ArrowRight size={17} /></>}</button>
          </fieldset>
        </form>
        {accountMode && <><div className={styles.divider}><span />or continue with<span /></div><button type="button" onClick={() => void google()} disabled={busy !== null} className={styles.google}>{busy === 'google' ? <LoaderCircle className={styles.spinner} size={18} /> : <GoogleIcon />}{busy === 'google' ? 'Connecting to Google…' : 'Continue with Google'}</button></>}
        <p className={styles.switch}>{mode === 'signin' ? <>New here? <Link href={route('/auth/signup')}>Create an account</Link></> : mode === 'signup' ? <>Already learning with us? <Link href={route('/auth/signin')}>Sign in</Link></> : <Link href={route(mode === 'update-password' ? '/auth/forgot-password' : '/auth/signin')}>{mode === 'update-password' ? 'Request a new reset link' : 'Back to sign in'}</Link>}</p>
        <div className={styles.footer}>A calmer way to learn.</div>
      </section>
    </div>
  </div>;
}

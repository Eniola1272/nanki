import { Suspense } from 'react';
import AuthPage from '@/components/auth/AuthPage';

export default function Page() {
  return <Suspense fallback={<div className="min-h-screen grid place-items-center bg-[#d9d8d3] text-[#624187]">Loading…</div>}><AuthPage mode="update-password" /></Suspense>;
}

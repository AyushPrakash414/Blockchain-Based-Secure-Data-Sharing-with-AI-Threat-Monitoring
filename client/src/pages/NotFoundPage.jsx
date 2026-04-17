import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface max-w-xl rounded-[var(--radius-xl)] p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl accent-bg-strong text-[var(--accent)]">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-base-muted">The route you requested does not exist in the rebuilt Sentinel Grid experience.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition-theme hover:brightness-110">
          <ArrowLeft className="h-4 w-4" />
          Return home
        </Link>
      </div>
    </div>
  );
}
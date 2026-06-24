import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={clsx('animate-spin text-brand-400', className)}
      size={24}
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center animate-pulse-glow">
          <Spinner className="w-8 h-8" />
        </div>
        <span className="absolute -top-2 -right-2 text-xl animate-bounce-soft">🍽️</span>
      </div>
      <p className="text-slate-500 text-sm animate-pulse">Loading delicious options...</p>
    </div>
  );
}
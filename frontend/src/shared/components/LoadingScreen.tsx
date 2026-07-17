import { BrainCircuit } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
          <BrainCircuit className="w-12 h-12 text-indigo-600 animate-pulse relative z-10" />
        </div>
        <p className="mt-4 text-sm font-medium text-neutral-500">Initializing CreatorMind...</p>
      </div>
    </div>
  );
}

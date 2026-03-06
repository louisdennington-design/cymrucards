'use client';

import Image from 'next/image';
import type { SessionHistoryPoint } from '@/lib/flashcards';
import { getLevelProgress } from '@/lib/progression';

type LevelCardProps = {
  history: SessionHistoryPoint[];
};

export function LevelCard({ history }: LevelCardProps) {
  const { currentLevel, nextLevel, progressLabel, progressPercentage } = getLevelProgress(history);

  return (
    <section className="rounded-[2rem] border border-white/50 bg-white/84 p-5 shadow-[0_22px_50px_rgba(26,67,46,0.12)] backdrop-blur">
      <p className="text-center text-sm leading-6 text-slate-700">
        <span className="font-semibold text-slate-900">Your current level:</span> {currentLevel.name}
      </p>
      <div className="mt-4 flex justify-center">
        <div className="relative aspect-square w-1/3 max-w-[7rem] min-w-[4.5rem]">
          <Image alt={currentLevel.name} className="object-contain" fill sizes="(max-width: 768px) 33vw, 120px" src={currentLevel.glyph} />
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{currentLevel.description}</p>
      <div className="mt-4 rounded-[1.5rem] bg-[#f4f7ea] p-4">
        <p className="text-sm font-semibold text-slate-900">Progress to next level</p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#dfe8c6]">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ backgroundColor: '#2C5439', width: `${progressPercentage}%` }}
          />
        </div>
        {nextLevel ? null : <p className="mt-2 text-sm text-slate-600">{progressLabel}</p>}
      </div>
    </section>
  );
}

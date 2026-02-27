'use client';

import { useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/server/supabase-browser';
import type { Database } from '@/types/database';

type SessionWord = Pick<Database['public']['Tables']['words']['Row'], 'english' | 'id' | 'welsh'>;

type FlashcardSessionProps = {
  initialUser: Pick<User, 'id'> | null;
  isUnlimited: boolean;
  sessionLabel: string;
  words: SessionWord[];
};

type UserProgressInsert = Database['public']['Tables']['user_progress']['Insert'];
type UserProgressStats = Pick<
  Database['public']['Tables']['user_progress']['Row'],
  'easiness_factor' | 'interval' | 'repetitions' | 'review_count'
>;

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

function getNextProgress(existingProgress: UserProgressStats | null, isCorrect: boolean, reviewedAt: Date) {
  const previousEasinessFactor = existingProgress?.easiness_factor ?? 2.5;
  const previousInterval = existingProgress?.interval ?? 0;
  const previousRepetitions = existingProgress?.repetitions ?? 0;
  const previousReviewCount = existingProgress?.review_count ?? 0;

  if (!isCorrect) {
    const easinessFactor = Math.max(1.3, roundToTwoDecimals(previousEasinessFactor - 0.1));

    return {
      dueDate: addDays(reviewedAt, 1).toISOString().slice(0, 10),
      easinessFactor,
      interval: 1,
      repetitions: 0,
      reviewCount: previousReviewCount + 1,
      status: 'failed' as const,
    };
  }

  const repetitions = previousRepetitions + 1;
  let interval = 1;

  if (repetitions === 2) {
    interval = 6;
  } else if (repetitions > 2) {
    interval = Math.max(1, Math.round(previousInterval * previousEasinessFactor));
  }

  return {
    dueDate: addDays(reviewedAt, interval).toISOString().slice(0, 10),
    easinessFactor: roundToTwoDecimals(previousEasinessFactor + 0.1),
    interval,
    repetitions,
    reviewCount: previousReviewCount + 1,
    status: 'learning' as const,
  };
}

export function FlashcardSession({ initialUser, isUnlimited, sessionLabel, words }: FlashcardSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<Pick<User, 'id'> | null>(initialUser);
  const dragStartX = useRef<number | null>(null);
  const supabase = createSupabaseBrowserClient();

  const currentWord = words[currentIndex];
  const isComplete = currentIndex >= words.length;

  async function saveProgress(wordId: string, isCorrect: boolean) {
    const activeUser =
      user ??
      (await supabase.auth.getUser().then(({ data }) => {
        const nextUser = data.user ? { id: data.user.id } : null;
        setUser(nextUser);
        return nextUser;
      }));

    if (!activeUser) {
      setSaveError('Progress is only saved for signed-in users. Session results are local for now.');
      return;
    }

    const reviewedAt = new Date();
    const reviewedAtIso = reviewedAt.toISOString();
    const { data: existingProgress, error: existingProgressError } = await supabase
      .schema('public')
      .from('user_progress')
      .select('easiness_factor, interval, repetitions, review_count')
      .eq('user_id', activeUser.id)
      .eq('word_id', wordId)
      .maybeSingle();

    if (existingProgressError) {
      throw existingProgressError;
    }

    const nextProgress = getNextProgress(existingProgress, isCorrect, reviewedAt);
    const payload: UserProgressInsert = {
      user_id: activeUser.id,
      word_id: wordId,
      due_date: nextProgress.dueDate,
      easiness_factor: nextProgress.easinessFactor,
      interval: nextProgress.interval,
      last_reviewed: reviewedAtIso,
      repetitions: nextProgress.repetitions,
      review_count: nextProgress.reviewCount,
      status: nextProgress.status,
    };
    const { error } = await supabase.schema('public').from('user_progress').upsert(payload, {
      onConflict: 'user_id,word_id',
    });

    if (error) {
      throw error;
    }
  }

  async function completeSession() {
    const activeUser =
      user ??
      (await supabase.auth.getUser().then(({ data }) => {
        const nextUser = data.user ? { id: data.user.id } : null;
        setUser(nextUser);
        return nextUser;
      }));

    if (!activeUser) {
      return;
    }

    const lastSessionDate = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.schema('public').from('user_stats').upsert(
      {
        user_id: activeUser.id,
        last_session_date: lastSessionDate,
      },
      { onConflict: 'user_id' },
    );

    if (error) {
      throw error;
    }
  }

  async function handleAnswer(isCorrect: boolean) {
    if (!currentWord) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveProgress(currentWord.id, isCorrect);
      if (currentIndex === words.length - 1) {
        await completeSession();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save progress.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }

    if (isCorrect) {
      setCorrectCount((count) => count + 1);
    } else {
      setIncorrectCount((count) => count + 1);
    }

    setCurrentIndex((index) => index + 1);
    setDragOffset(0);
    setIsAnswerVisible(false);
  }

  function handleCardTap() {
    if (isSaving || isAnswerVisible) {
      return;
    }

    setIsAnswerVisible(true);
    setDragOffset(0);
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    handleCardTap();
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!isAnswerVisible || isSaving) {
      return;
    }

    dragStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null || !isAnswerVisible || isSaving) {
      return;
    }

    setDragOffset(event.clientX - dragStartX.current);
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    const finalOffset = dragOffset;
    dragStartX.current = null;

    if (finalOffset <= -100) {
      void handleAnswer(true);
      return;
    }

    if (finalOffset >= 100) {
      void handleAnswer(false);
      return;
    }

    setDragOffset(0);
  }

  if (words.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold">No flashcards available</h2>
        <p className="mt-2 text-sm text-slate-600">The words table did not return any entries yet.</p>
      </section>
    );
  }

  if (isComplete) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">Session complete</h2>
        <p className="mt-4 text-sm text-slate-600">Learned: {correctCount}</p>
        <p className="mt-1 text-sm text-slate-600">Keep learning: {incorrectCount}</p>
        {saveError ? <p className="mt-4 text-sm text-amber-700">{saveError}</p> : null}
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-600">Session length: {sessionLabel}</p>
      <p className="mt-1 text-sm text-slate-600">
        Card {currentIndex + 1} of {isUnlimited ? `${words.length}` : words.length}
      </p>
      <div
        className="flashcard-scene mt-4"
        onClick={handleCardTap}
        onKeyDown={handleCardKeyDown}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        role="button"
        tabIndex={0}
      >
        <div
          className="flashcard-inner"
          style={{
            transform: `translateX(${dragOffset}px) rotate(${dragOffset / 14}deg) rotateY(${isAnswerVisible ? 180 : 0}deg)`,
          }}
        >
          <div className="flashcard-face rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Welsh</p>
            <p className="mt-4 text-2xl font-semibold">{currentWord.welsh}</p>
            <p className="mt-6 text-sm text-slate-500">Tap to flip</p>
          </div>
          <div className="flashcard-face flashcard-face-back rounded-lg border border-slate-200 bg-white p-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">English</p>
            <p className="mt-4 text-2xl font-semibold">{currentWord.english}</p>
            <p className="mt-6 text-sm text-slate-500">Swipe left if learned, right if you want to keep learning.</p>
          </div>
        </div>
      </div>

      {isAnswerVisible ? (
        <div className="mt-4 flex gap-3">
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={isSaving}
            onClick={() => void handleAnswer(false)}
            type="button"
          >
            Keep learning
          </button>
          <button
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={isSaving}
            onClick={() => void handleAnswer(true)}
            type="button"
          >
            Learned
          </button>
        </div>
      ) : null}

      {isSaving ? <p className="mt-3 text-sm text-slate-600">Saving progress…</p> : null}
      {saveError ? <p className="mt-3 text-sm text-amber-700">{saveError}</p> : null}
      {!user ? (
        <p className="mt-3 text-sm text-slate-500">Not signed in. Session still works, but progress will not persist.</p>
      ) : null}
    </section>
  );
}

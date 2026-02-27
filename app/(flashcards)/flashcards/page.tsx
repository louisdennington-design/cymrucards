import { FlashcardSession } from '@/components/flashcard-session';
import { createSupabaseAdminClient } from '@/server/supabase-admin';
import { createSupabaseServerClient } from '@/server/supabase-server';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

type SessionWord = Pick<Database['public']['Tables']['words']['Row'], 'english' | 'id' | 'welsh'>;
type UserProgressSelection = Pick<Database['public']['Tables']['user_progress']['Row'], 'next_due_at' | 'word_id'>;

function buildScheduledWords(
  allWords: SessionWord[],
  progressRows: UserProgressSelection[],
  limit: number,
  now: Date,
) {
  const progressByWordId = new Map(progressRows.map((row) => [row.word_id, row]));
  const dueWords = allWords.filter((word) => {
    const progress = progressByWordId.get(word.id);

    if (!progress) {
      return false;
    }

    return !progress.next_due_at || new Date(progress.next_due_at) <= now;
  });
  const unseenWords = allWords.filter((word) => !progressByWordId.has(word.id));

  return [...dueWords, ...unseenWords].slice(0, limit);
}

export default async function FlashcardsPage() {
  const supabaseAdmin = createSupabaseAdminClient();
  const supabaseServer = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  let words: SessionWord[] = [];

  if (user) {
    const [{ data: allWords, error: wordsError }, { data: progressRows, error: progressError }] =
      await Promise.all([
        supabaseAdmin.from('words').select('id, welsh, english'),
        supabaseAdmin
          .from('user_progress')
          .select('word_id, next_due_at')
          .eq('user_id', user.id),
      ]);

    if (wordsError) {
      throw new Error(`Unable to load flashcards: ${wordsError.message}`);
    }

    if (progressError) {
      throw new Error(`Unable to load review progress: ${progressError.message}`);
    }

    words = buildScheduledWords(allWords ?? [], progressRows ?? [], 10, new Date());
  } else {
    const { data: fallbackWords, error } = await supabaseAdmin.from('words').select('id, welsh, english').limit(10);

    if (error) {
      throw new Error(`Unable to load flashcards: ${error.message}`);
    }

    words = fallbackWords ?? [];
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Flashcard session</h1>
        <p className="text-sm text-slate-600">
          Minimal Phase 2 session loop. Text only, simple due-based scheduling, no gestures.
        </p>
      </div>
      <FlashcardSession initialUser={user ? { id: user.id } : null} words={words} />
    </main>
  );
}

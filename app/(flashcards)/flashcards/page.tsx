import { AuthPanel } from '@/components/auth-panel';
import { FlashcardSession } from '@/components/flashcard-session';
import { SessionSetupForm } from '@/components/session-setup-form';
import { createSupabaseAdminClient } from '@/server/supabase-admin';
import { createSupabaseServerClient } from '@/server/supabase-server';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

const CARDS_PER_MINUTE = 10;
const DEFAULT_FILTER_TYPES: PartOfSpeechOption[] = ['noun', 'adjective', 'verb_infinitive', 'conjugation', 'phrase'];

type SessionWord = Pick<Database['public']['Tables']['words']['Row'], 'english' | 'id' | 'welsh'>;
type DurationOption = '1' | '3' | '5' | 'unlimited';
type PartOfSpeechOption = 'adjective' | 'conjugation' | 'noun' | 'phrase' | 'verb_infinitive';
type RarityOption = 'common' | 'intermediate' | 'rare';
type SearchParams = {
  duration?: DurationOption;
  rarity?: RarityOption;
  types?: string;
};
type UserProgressSelection = Pick<Database['public']['Tables']['user_progress']['Row'], 'due_date' | 'word_id'>;
type FilterableWord = Pick<
  Database['public']['Tables']['words']['Row'],
  'english' | 'frequency_rank' | 'id' | 'part_of_speech' | 'welsh'
>;

const SESSION_OPTIONS: Array<{ estimatedCards: number | null; label: string; value: DurationOption }> = [
  { estimatedCards: 10, label: '1 minute', value: '1' },
  { estimatedCards: 30, label: '3 minutes', value: '3' },
  { estimatedCards: 50, label: '5 minutes', value: '5' },
  { estimatedCards: null, label: 'Unlimited', value: 'unlimited' },
];

function getQueueSize(duration: DurationOption) {
  if (duration === 'unlimited') {
    return null;
  }

  return Number(duration) * CARDS_PER_MINUTE;
}

function getSelectedTypes(rawTypes: string | undefined) {
  if (!rawTypes) {
    return DEFAULT_FILTER_TYPES;
  }

  const parsedTypes = rawTypes
    .split(',')
    .map((type) => type.trim())
    .filter((type): type is PartOfSpeechOption => DEFAULT_FILTER_TYPES.includes(type as PartOfSpeechOption));

  return parsedTypes.length > 0 ? parsedTypes : DEFAULT_FILTER_TYPES;
}

function matchesRarity(word: Pick<FilterableWord, 'frequency_rank'>, rarity: RarityOption) {
  if (word.frequency_rank === null) {
    return true;
  }

  if (rarity === 'common') {
    return word.frequency_rank >= 1 && word.frequency_rank <= 500;
  }

  if (rarity === 'intermediate') {
    return word.frequency_rank >= 501 && word.frequency_rank <= 2000;
  }

  return word.frequency_rank >= 2001;
}

function applyWordFilters(words: FilterableWord[], rarity: RarityOption, types: PartOfSpeechOption[]) {
  const allowedTypes = new Set(types);

  return words.filter((word) => allowedTypes.has(word.part_of_speech as PartOfSpeechOption) && matchesRarity(word, rarity));
}

function buildScheduledWords(
  allWords: FilterableWord[],
  progressRows: UserProgressSelection[],
  limit: number | null,
  today: string,
) {
  const progressByWordId = new Map(progressRows.map((row) => [row.word_id, row]));
  const dueWords = allWords.filter((word) => {
    const progress = progressByWordId.get(word.id);

    if (!progress) {
      return false;
    }

    return progress.due_date !== null && progress.due_date <= today;
  });
  const newWords = allWords.filter((word) => !progressByWordId.has(word.id));
  const backlogWords = allWords.filter((word) => {
    const progress = progressByWordId.get(word.id);

    if (!progress) {
      return false;
    }

    return progress.due_date === null || progress.due_date > today;
  });

  const orderedWords = [...dueWords, ...newWords, ...backlogWords];

  return limit === null ? orderedWords : orderedWords.slice(0, limit);
}

export default async function FlashcardsPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabaseAdmin = createSupabaseAdminClient();
  const supabaseServer = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  const selectedDuration = searchParams?.duration;
  const selectedRarity = searchParams?.rarity ?? 'common';
  const selectedTypes = getSelectedTypes(searchParams?.types);

  if (!selectedDuration) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 p-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Flashcard session</h1>
          <p className="text-sm text-slate-600">
            Sign in, choose a queue, and begin the text-only flashcard review.
          </p>
        </div>
        <AuthPanel initialUserEmail={user?.email ?? null} redirectPath="/flashcards" />
        <SessionSetupForm initialRarity={selectedRarity} initialTypes={selectedTypes} />
      </main>
    );
  }

  const queueSize = getQueueSize(selectedDuration);
  const sessionLabel = SESSION_OPTIONS.find((option) => option.value === selectedDuration)?.label ?? 'Custom';
  let words: SessionWord[] = [];

  if (user) {
    const [{ data: allWords, error: wordsError }, { data: progressRows, error: progressError }] =
      await Promise.all([
        supabaseAdmin.from('words').select('id, welsh, english, frequency_rank, part_of_speech'),
        supabaseAdmin
          .from('user_progress')
          .select('word_id, due_date')
          .eq('user_id', user.id),
      ]);

    if (wordsError) {
      throw new Error(`Unable to load flashcards: ${wordsError.message}`);
    }

    if (progressError) {
      throw new Error(`Unable to load review progress: ${progressError.message}`);
    }

    const filteredWords = applyWordFilters(allWords ?? [], selectedRarity, selectedTypes);
    words = buildScheduledWords(filteredWords, progressRows ?? [], queueSize, new Date().toISOString().slice(0, 10));
  } else {
    const { data: fallbackWords, error } = await supabaseAdmin
      .from('words')
      .select('id, welsh, english, frequency_rank, part_of_speech')
      .limit(100);

    if (error) {
      throw new Error(`Unable to load flashcards: ${error.message}`);
    }

    const filteredWords = applyWordFilters(fallbackWords ?? [], selectedRarity, selectedTypes);
    words = filteredWords.slice(0, queueSize ?? filteredWords.length).map((word) => ({
      english: word.english,
      id: word.id,
      welsh: word.welsh,
    }));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Flashcard session</h1>
        <p className="text-sm text-slate-600">
          Tap to flip, swipe right to keep learning, and swipe left to mark a card learned.
        </p>
      </div>
      <FlashcardSession
        initialUser={user ? { id: user.id } : null}
        isUnlimited={selectedDuration === 'unlimited'}
        sessionLabel={sessionLabel}
        words={words}
      />
    </main>
  );
}

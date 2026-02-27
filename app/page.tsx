import legacyWords from '@/supabase/seed/legacy-words.json';

export default function HomePage() {
  const audioWords = legacyWords.words.filter((word) => word.audio_url);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Welsh Vocabulary Practice</h1>
      <p className="text-sm text-slate-600">
        Phase 2 adds pronunciation audio support for vocabulary entries. Flashcard flow
        remains out of scope here.
      </p>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold">Pronunciation audio</h2>
        <p className="mt-2 text-sm text-slate-600">
          Audio is optional on each word via the new <code>audio_url</code> field.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Audio-enabled seed words: {audioWords.length}
        </p>
        {audioWords.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {audioWords.slice(0, 3).map((word) => (
              <li key={`${word.welsh}-${word.english}`} className="rounded-md border border-slate-200 p-3">
                <p className="font-medium">{word.welsh}</p>
                <p className="text-sm text-slate-600">{word.english}</p>
                <audio className="mt-3 w-full" controls preload="none" src={word.audio_url ?? undefined}>
                  Your browser does not support audio playback.
                </audio>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            No pronunciation files are present in the current seed data yet.
          </p>
        )}
      </section>
    </main>
  );
}

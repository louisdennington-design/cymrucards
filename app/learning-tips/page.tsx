export default function LearningTipsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-5 py-8">
      <section
        className="rounded-[2rem] border p-6 shadow-[0_28px_80px_rgba(26,67,46,0.16)] backdrop-blur"
        style={{ backgroundColor: '#2C5439', borderColor: '#2C5439' }}
      >
        <h1 className="text-lg font-semibold text-white">Learning tips</h1>
      </section>
      <section className="rounded-[2rem] border border-white/50 bg-white/84 p-5 shadow-[0_22px_50px_rgba(26,67,46,0.12)] backdrop-blur">
        <div className="space-y-5 text-sm leading-6 text-slate-700">
          <p>
            <strong>Learning works best when you practise regularly.</strong> Short sessions done often are much more
            effective than long sessions done rarely. When you come back to words after a gap, your brain has to work a
            little to remember them. That effort strengthens memory. Try to use the app most days, even for five or ten
            minutes.
          </p>
          <p>
            <strong>When you see a card, try to recall the answer before you flip it.</strong> Do not just read the
            translation straight away. Actively trying to bring the word to mind helps you learn it faster and remember
            it for longer. Even if you are not sure, make a guess. The act of retrieval is what builds memory.
          </p>
          <p>
            <strong>Say the word out loud whenever you can.</strong> Hearing yourself say it helps your pronunciation
            and builds a stronger mental link than reading alone. Language is spoken as well as written. Using your
            voice helps you remember the sound, rhythm and stress of the word.
          </p>
          <p>
            <strong>Start by learning common, high frequency words.</strong> These are the words that appear most often
            in everyday conversation. They give you the strongest foundation for understanding and being understood.
            Once these feel familiar, move on to less common words and more complex phrases. This builds your
            communication skills step by step.
          </p>
        </div>
      </section>

      <section
        className="rounded-[2rem] border p-6 shadow-[0_28px_80px_rgba(26,67,46,0.16)] backdrop-blur"
        style={{ backgroundColor: '#2C5439', borderColor: '#2C5439' }}
      >
        <h2 className="text-lg font-semibold text-white">The Welsh Language</h2>
      </section>

      <section className="rounded-[2rem] border border-white/50 bg-white/84 p-5 shadow-[0_22px_50px_rgba(26,67,46,0.12)] backdrop-blur">
        <ol className="space-y-4 pl-5 text-sm leading-6 text-slate-700 list-decimal">
          <li>
            <strong>Welsh spelling is regular.</strong> Once you learn the sounds of the letters and letter
            combinations, you can usually pronounce any word correctly. It is much more consistent than English.
          </li>
          <li>
            <strong>Some letter pairs are single letters.</strong> Combinations like ll, dd, th, rh, ng and ch count
            as separate letters and have their own sounds. They are not just two ordinary letters placed together.
          </li>
          <li>
            <strong>Word order is often verb first.</strong> In many sentences the verb comes before the subject. For
            example &ldquo;Dw i&rsquo;n mynd&rdquo; literally begins with &ldquo;Am going I.&rdquo; This feels unfamiliar
            at first but becomes natural with exposure.
          </li>
          <li>
            <strong>&ldquo;Mutations&rdquo; change the first letter of words.</strong> This can make recognising them
            tricky for beginners. For example &ldquo;pen&rdquo; can become &ldquo;ben&rdquo; depending on the end of
            the last word. Don&apos;t worry too much about this to begin with. It will come naturally the more you
            learn.
          </li>
          <li>
            <strong>Prepositions combine with pronouns.</strong> Instead of saying &ldquo;to me&rdquo; as two words,
            Welsh often uses one word such as &ldquo;i mi&rdquo; or &ldquo;ata i,&rdquo; and some forms are fully
            fused, such as &ldquo;iddi hi&rdquo; becoming &ldquo;iddi.&rdquo; Eventually, you will learn these
            patterns.
          </li>
          <li>
            <strong>There is no separate word for &ldquo;do&rdquo; in questions.</strong> Questions and negatives are
            formed by changing the verb structure instead.
          </li>
          <li>
            <strong>Gender matters.</strong> Nouns are either masculine or feminine. This affects adjectives, numbers
            and mutations. Gender often has to be memorised with the noun, because it&apos;s not obvious from the
            sound.
          </li>
          <li>
            <strong>There are formal and informal &ldquo;you&rdquo; forms.</strong> &ldquo;Ti&rdquo; is informal and
            &ldquo;chi&rdquo; is formal or plural. Choosing the right one depends on context and social setting.
          </li>
          <li>
            <strong>Spoken Welsh often differs from textbook Welsh.</strong> Colloquial forms such as
            &ldquo;dw i&rsquo;n&rdquo; instead of &ldquo;rydw i&rsquo;n&rdquo; are normal in everyday speech.
            Learning common spoken patterns will help you understand real conversations.
          </li>
          <li>
            <strong>Vocabulary overlaps less with English than some European languages.</strong> Welsh is Celtic, not
            Germanic or Romance. Many words will feel unfamiliar. Don&apos;t worry. You&apos;ll get there with enough
            repetition, which is exactly what this app is for. High frequency everyday words give the strongest
            foundation for communication.
          </li>
        </ol>
      </section>
    </main>
  );
}

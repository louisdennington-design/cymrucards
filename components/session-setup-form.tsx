'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DurationOption = '1' | '3' | '5' | 'unlimited';
type PartOfSpeechOption = 'adjective' | 'conjugation' | 'noun' | 'phrase' | 'verb_infinitive';
type RarityOption = 'common' | 'intermediate' | 'rare';

type SessionSetupFormProps = {
  initialDuration?: DurationOption;
  initialRarity?: RarityOption;
  initialTypes: PartOfSpeechOption[];
};

const DURATION_OPTIONS: Array<{ description: string; label: string; value: DurationOption }> = [
  { description: 'About 10 cards', label: '1 minute', value: '1' },
  { description: 'About 30 cards', label: '3 minutes', value: '3' },
  { description: 'About 50 cards', label: '5 minutes', value: '5' },
  { description: 'No card limit', label: 'Unlimited', value: 'unlimited' },
];

const TYPE_OPTIONS: Array<{ label: string; value: PartOfSpeechOption }> = [
  { label: 'Nouns', value: 'noun' },
  { label: 'Adjectives', value: 'adjective' },
  { label: 'Verb infinitives', value: 'verb_infinitive' },
  { label: 'Conjugations', value: 'conjugation' },
  { label: 'Phrases', value: 'phrase' },
];

const RARITY_BY_SLIDER_VALUE: Record<string, RarityOption> = {
  '1': 'common',
  '2': 'intermediate',
  '3': 'rare',
};

const SLIDER_LABELS: Record<RarityOption, string> = {
  common: 'Common (rank 1-500)',
  intermediate: 'Intermediate (rank 501-2000)',
  rare: 'Rare (rank 2001+)',
};

function getSliderValue(rarity: RarityOption) {
  if (rarity === 'common') {
    return '1';
  }

  if (rarity === 'intermediate') {
    return '2';
  }

  return '3';
}

export function SessionSetupForm({
  initialDuration = '3',
  initialRarity = 'common',
  initialTypes,
}: SessionSetupFormProps) {
  const [duration, setDuration] = useState<DurationOption>(initialDuration);
  const [rarity, setRarity] = useState<RarityOption>(initialRarity);
  const [types, setTypes] = useState<PartOfSpeechOption[]>(initialTypes);
  const router = useRouter();

  function toggleType(type: PartOfSpeechOption) {
    setTypes((currentTypes) => {
      if (currentTypes.includes(type)) {
        if (currentTypes.length === 1) {
          return currentTypes;
        }

        return currentTypes.filter((currentType) => currentType !== type);
      }

      return [...currentTypes, type];
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams({
      duration,
      rarity,
      types: types.join(','),
    });

    router.push(`/flashcards?${params.toString()}`);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold">Session setup</h2>
      <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-900">Session length</legend>
          <div className="grid gap-2">
            {DURATION_OPTIONS.map((option) => (
              <label
                className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200 px-3 py-3 text-sm"
                key={option.value}
              >
                <span>
                  <span className="block font-medium text-slate-900">{option.label}</span>
                  <span className="block text-slate-600">{option.description}</span>
                </span>
                <input
                  checked={duration === option.value}
                  className="h-4 w-4"
                  name="duration"
                  onChange={() => setDuration(option.value)}
                  type="radio"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-900">Rarity</legend>
          <input
            className="w-full"
            max="3"
            min="1"
            onChange={(event) => setRarity(RARITY_BY_SLIDER_VALUE[event.target.value])}
            step="1"
            type="range"
            value={getSliderValue(rarity)}
          />
          <p className="text-sm text-slate-600">{SLIDER_LABELS[rarity]}</p>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-900">Linguistic type</legend>
          <div className="grid gap-2">
            {TYPE_OPTIONS.map((option) => (
              <label
                className="flex cursor-pointer items-center justify-between rounded-md border border-slate-200 px-3 py-3 text-sm"
                key={option.value}
              >
                <span className="font-medium text-slate-900">{option.label}</span>
                <input
                  checked={types.includes(option.value)}
                  className="h-4 w-4"
                  onChange={() => toggleType(option.value)}
                  type="checkbox"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="submit">
          Start session
        </button>
      </form>
    </section>
  );
}

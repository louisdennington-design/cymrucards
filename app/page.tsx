export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Welsh Vocabulary Practice</h1>
      <p className="text-sm text-slate-600">
        Phase 1 scaffold complete. This MVP remains focused on text-based vocabulary
        learning only.
      </p>
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold">Current scope</h2>
        <p className="mt-2 text-sm text-slate-600">
          The current MVP covers the app foundation, Welsh vocabulary data migration,
          and the mobile-ready web shell.
        </p>
      </section>
    </main>
  );
}

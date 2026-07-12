export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-blue-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">This section is coming soon.</p>
    </div>
  );
}

export function CodeWindow() {
  const sample = `{
  "lesson": {
    "title": "Greetings — Lesson 1",
    "audio": "pimsleur_greetings_l1.mp3",
    "dictionary": [
      { "jp": "こんにちは", "romaji": "konnichiwa", "en": "hello" },
      { "jp": "ありがとう", "romaji": "arigatou", "en": "thank you" }
    ],
    "flashcards": 24,
    "quiz": { "questions": 10 },
    "progress": { "completed": 0, "streak": 0 }
  }
}`;

  return (
    <div className="relative">
      <div className="card-glow rounded-2xl p-[1px]">
        <div className="rounded-2xl bg-zinc-900/90 border border-white/10 overflow-hidden">
          <div className="flex items-center gap-2 px-4 h-10 border-b border-white/10 bg-white/5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-white/60">generate-lessons.json</span>
          </div>
          <pre className="text-xs leading-relaxed text-white/80 p-4 overflow-auto">
            <code>{sample}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

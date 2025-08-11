export function PhoneMock() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      <div className="absolute -inset-6 rounded-[2rem] bg-black/40 blur-2xl" aria-hidden />
      <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl">
        <div className="rounded-[1.5rem] bg-white">
          {/* top bar */}
          <div className="h-10 flex items-center justify-center text-xs text-zinc-400 border-b border-zinc-200">
            <span className="font-medium text-zinc-800">BŪKI</span>
          </div>
          {/* content */}
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-20 rounded-md bg-zinc-200" />
              <div className="h-20 rounded-md bg-zinc-200" />
            </div>
            <div className="h-8 rounded-md bg-zinc-200" />
            <div className="h-8 rounded-md bg-zinc-200" />
            <div className="h-10 rounded-md bg-brand-600/90" />
          </div>
        </div>
      </div>
    </div>
  );
}

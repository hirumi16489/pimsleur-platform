export function Footer() {
  return (
    <footer className="border-t border-zinc-200 mt-16">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between text-sm text-zinc-600">
        <p>&copy; {new Date().getFullYear()} Upload Portal</p>
        <div className="flex gap-4">
          <a className="hover:text-zinc-900" href="#">
            Docs
          </a>
          <a className="hover:text-zinc-900" href="#">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}

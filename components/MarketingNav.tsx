import Link from "next/link";

export function MarketingNav() {
  return (
    <header className="border-b border-aqua-pale/30 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-xl font-semibold text-teal-deep">
          SafePool
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-teal-deep/80 transition hover:text-teal-deep"
          >
            About
          </Link>
          <Link
            href="/pricing"
            className="text-teal-deep/80 transition hover:text-teal-deep"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="text-teal-deep/80 transition hover:text-teal-deep"
          >
            Contact
          </Link>
          <Link
            href="/register"
            className="text-teal-deep/80 transition hover:text-teal-deep"
          >
            Sign up
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-teal-deep px-4 py-2 text-white transition hover:bg-teal-dark"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}

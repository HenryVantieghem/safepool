import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="font-serif text-4xl font-bold text-teal-deep md:text-5xl">
          Extra underwater eyes for every pool
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          AI-powered distress detection that assists lifeguards—never replaces
          them. Catch underwater danger faster with clear, timely alerts.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-lg bg-teal-deep px-6 py-3 text-white transition hover:bg-teal-dark"
          >
            Request Demo
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-teal-deep px-6 py-3 text-teal-deep transition hover:bg-aqua-pale/20"
          >
            Dashboard
          </Link>
        </div>
      </section>

      <section className="border-t border-aqua-pale/30 bg-teal-deep/5 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-serif text-3xl font-semibold text-teal-deep">
            How It Works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="text-3xl font-bold text-aqua-light">1</div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-teal-deep">
                Camera captures
              </h3>
              <p className="mt-2 text-gray-600">
                Waterproof cameras monitor the pool. Works with existing setups
                or our hardware.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="text-3xl font-bold text-aqua-light">2</div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-teal-deep">
                AI analyzes
              </h3>
              <p className="mt-2 text-gray-600">
                Pose and motion detection flags potential distress. Privacy by
                design—no facial identification.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="text-3xl font-bold text-aqua-light">3</div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-teal-deep">
                Clear alerts
              </h3>
              <p className="mt-2 text-gray-600">
                Simple &quot;look here&quot; signal to the guard station. Fits
                real workflow, not replacement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="font-serif text-2xl font-semibold text-teal-deep">
            Trust badges
          </h2>
          <p className="mt-2 text-gray-600">
            Privacy by design · Accuracy over hype · Built for lifeguards
          </p>
        </div>
      </section>
    </div>
  );
}

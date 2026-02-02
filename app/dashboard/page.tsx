import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-teal-deep">Overview</h1>
      <p className="mt-2 text-gray-600">
        Welcome to SafePool. Monitor your pool feeds and manage incidents.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/live"
          className="rounded-lg border border-aqua-pale/50 bg-white p-6 shadow-sm transition hover:border-teal-deep/30"
        >
          <h2 className="font-serif text-lg font-semibold text-teal-deep">
            Live Feeds
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            View camera feeds and real-time AI distress detection.
          </p>
        </Link>
        <Link
          href="/dashboard/incidents"
          className="rounded-lg border border-aqua-pale/50 bg-white p-6 shadow-sm transition hover:border-teal-deep/30"
        >
          <h2 className="font-serif text-lg font-semibold text-teal-deep">
            Incidents
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Review and resolve detected incidents.
          </p>
        </Link>
      </div>
    </div>
  );
}

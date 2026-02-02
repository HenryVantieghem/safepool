import { MarketingNav } from "@/components/MarketingNav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <main id="main">{children}</main>
      <footer className="mt-24 border-t border-aqua-pale/30 bg-teal-deep/5 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <span className="font-serif text-lg font-semibold text-teal-deep">
              SafePool
            </span>
            <p className="text-sm text-gray-600">
              Making pools safer with AI. Assist lifeguards, never replace them.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

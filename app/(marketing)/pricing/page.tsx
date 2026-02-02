import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — SafePool",
  description: "Pricing and demo requests for SafePool pool safety system.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-serif text-4xl font-bold text-teal-deep">Pricing</h1>
      <p className="mt-4 text-lg text-gray-600">
        Get a customized quote for your facility. We offer flexible packages for
        public pools, private clubs, and aquatic centers.
      </p>

      <div className="mt-12 rounded-xl border-2 border-teal-deep/20 bg-aqua-pale/10 p-8">
        <h2 className="font-serif text-2xl font-semibold text-teal-deep">
          Starting around $5,000
        </h2>
        <p className="mt-2 text-gray-600">
          Typical hardware + software package for a standard pool. Includes
          waterproof camera modules, AI monitoring, and central station alerts.
        </p>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>• Real-time underwater monitoring</li>
          <li>• AI-powered distress detection</li>
          <li>• Clear alerts to lifeguard station</li>
          <li>• Privacy by design (pose only, no facial recognition)</li>
        </ul>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-lg bg-teal-deep px-6 py-3 text-white transition hover:bg-teal-dark"
        >
          Request Demo
        </Link>
      </div>
    </div>
  );
}

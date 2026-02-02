"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const facilityType = formData.get("facilityType") as string;
    const message = formData.get("message") as string;

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("demo_requests").insert({
        name,
        email,
        facility_type: facilityType,
        message: message || null,
      });

      if (insertError) throw insertError;
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(
        msg.includes("fetch") || msg.includes("Failed to fetch")
          ? "Could not connect. Check your connection and ensure Supabase is configured."
          : msg
      );
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-serif text-4xl font-bold text-teal-deep">
        Request a Demo
      </h1>
      <p className="mt-4 text-gray-600">
        Tell us about your facility and we&apos;ll get in touch to schedule a
        demo.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-teal-deep"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-teal-deep"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
          />
        </div>
        <div>
          <label
            htmlFor="facilityType"
            className="block text-sm font-medium text-teal-deep"
          >
            Facility Type
          </label>
          <select
            id="facilityType"
            name="facilityType"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
          >
            <option value="">Select...</option>
            <option value="public_pool">Public Pool</option>
            <option value="private_club">Private Club</option>
            <option value="waterpark">Waterpark</option>
            <option value="residential">Residential</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-teal-deep"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
          />
        </div>
        {status === "success" && (
          <p className="text-green-600">Thanks! We&apos;ll be in touch soon.</p>
        )}
        {status === "error" && error && (
          <p className="text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-teal-deep px-6 py-3 text-white transition hover:bg-teal-dark disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

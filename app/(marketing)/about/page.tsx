import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — SafePool",
  description: "Mission, vision, values, and team behind SafePool.",
};

const team = [
  {
    name: "Spencer Minton",
    role: "CEO",
    bio: "PhD candidate in Electrical Engineering at Auburn, Director of DCEI Research at McCrary Institute. Serial entrepreneur with experience in LIDAR, embedded systems, and critical infrastructure protection.",
  },
  {
    name: "Mack Thompson",
    role: "CTO",
    bio: "5 years as a lifeguard. Combines coding expertise with firsthand understanding of pool monitoring challenges. Building the waterproof camera + CV system.",
  },
  {
    name: "Brandon Cresap",
    role: "CFO",
    bio: "Experience in LIDAR, embedded systems, computer vision, and real-time operating systems. Former lifeguard and aquatics supervisor.",
  },
  {
    name: "Henry Vantieghem",
    role: "CMO",
    bio: "AI & ML intern focused on deep learning and cybersecurity. Built anomaly detection models and deployed at scale with AWS, Docker, Kubernetes, and FastAPI. Real-time detection and alerting pipelines.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-serif text-4xl font-bold text-teal-deep">About SafePool</h1>
      <p className="mt-4 text-lg text-gray-600">
        We make pools safer by helping lifeguards catch underwater distress
        faster.
      </p>

      <section className="mt-16">
        <h2 className="font-serif text-2xl font-semibold text-teal-deep">
          Mission
        </h2>
        <p className="mt-2 text-gray-600">
          Real-time continuous underwater monitoring with clear &quot;look
          here&quot; alerts. Built for lifeguards to fit real pool workflow and
          scanning patterns.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold text-teal-deep">
          Vision
        </h2>
        <p className="mt-2 text-gray-600">
          An &quot;extra set of underwater eyes&quot; becomes standard at every
          busy pool—like radios, rescue tubes, and AEDs.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold text-teal-deep">
          Values
        </h2>
        <ul className="mt-4 space-y-2 text-gray-600">
          <li>
            <strong className="text-teal-deep">Lifeguards first</strong> —
            Design around real scanning + rescue workflow.
          </li>
          <li>
            <strong className="text-teal-deep">Accuracy over hype</strong> —
            False alarms burn trust. We tune carefully.
          </li>
          <li>
            <strong className="text-teal-deep">Privacy by design</strong> —
            Focus on motion/pose, avoid identity/faces.
          </li>
          <li>
            <strong className="text-teal-deep">Reliability</strong> — Works in
            glare, bubbles, waves, and chaos.
          </li>
          <li>
            <strong className="text-teal-deep">Always learning</strong> —
            Improve from feedback and incident reviews.
          </li>
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-2xl font-semibold text-teal-deep">Team</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {team.map((member) => (
            <div
              key={member.name}
              className="rounded-lg border border-aqua-pale/50 bg-aqua-pale/10 p-6"
            >
              <h3 className="font-serif text-lg font-semibold text-teal-deep">
                {member.name}
              </h3>
              <p className="text-sm text-aqua-light">{member.role}</p>
              <p className="mt-3 text-gray-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

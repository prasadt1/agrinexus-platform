import Link from "next/link";
import { AgriNexusWordmark } from "@/app/components/Logo";
import { HowItWorks } from "@/app/components/HowItWorks";
import { Term } from "@/app/components/Term";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <AgriNexusWordmark />
        <div className="flex items-center gap-4">
          <Link href="/judges" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            For hackathon judges
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Sign in
          </Link>
          <Link href="/login" className="btn btn-primary">
            Try demo
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-8 pt-20 pb-12 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
          Outturn <span style={{ color: "var(--color-primary)" }}>by AgriNexus</span>
        </h1>
        <p className="text-xl md:text-2xl font-medium mb-6" style={{ color: "var(--color-text-primary)" }}>
          Proof of what your advisory program produced.
        </p>
        <p className="text-lg max-w-2xl mx-auto mb-4" style={{ color: "var(--color-text-secondary)" }}>
          AgriNexus AI delivers the advice over <Term term="nudge">WhatsApp</Term>. Outturn is the
          control plane that tracks <Term term="follow-through">follow-through</Term> and surfaces where
          it&apos;s collapsing — so partners know where to target their own field interventions.
        </p>
        <p className="text-sm max-w-2xl mx-auto mb-10" style={{ color: "var(--color-text-muted)" }}>
          In agriculture and commodity trade, &ldquo;outturn&rdquo; is the actual result after
          processing. Here, it&apos;s the actual result after advisory.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/login" className="btn btn-primary text-base px-6 py-3">
            Open demo dashboard
          </Link>
          <Link href="/judges" className="btn btn-secondary text-base px-6 py-3">
            For hackathon judges →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 pb-16 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-section">How it works</h2>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            One advisory cycle, start to finish. Tap a step or watch it play.
          </p>
        </div>
        <HowItWorks />
      </section>

      {/* Who it's for / value props */}
      <section className="px-8 py-16" style={{ background: "var(--color-page-bg)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-section text-center mb-2">Built for the people who fund advice</h2>
          <p className="text-center mb-10" style={{ color: "var(--color-text-secondary)" }}>
            NGOs, agri-input companies, and government extension programmes (such as India&apos;s{" "}
            <a
              href="https://en.wikipedia.org/wiki/Krishi_Vigyan_Kendra"
              className="underline"
              style={{ color: "var(--color-primary)" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Krishi Vigyan Kendras
            </a>
            , the district farm-science centres).
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Set up in minutes",
                body: (
                  <>
                    Create a <Term term="cohort">cohort</Term> — a district&apos;s farmers, their crops and
                    languages — and the advice engine starts watching that area&apos;s weather.
                  </>
                ),
              },
              {
                title: "Measure outcomes, not sends",
                body: (
                  <>
                    See <Term term="follow-through">follow-through</Term>, not just delivery. Replies are{" "}
                    <Term term="aggregate">rolled up</Term> per village into a number you can act on.
                  </>
                ),
              },
              {
                title: "Fund what works",
                body: "Compare districts side by side, double down on the cohorts that respond, and show funders real impact.",
              },
            ].map((item) => (
              <div key={item.title} className="card">
                <h3 className="text-card-title mb-3">{item.title}</h3>
                <p style={{ color: "var(--color-text-secondary)" }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-16 max-w-3xl mx-auto text-center">
        <h2 className="text-section mb-3">See the loop run on live data</h2>
        <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Open the demo dashboard, switch between partner organisations, and run a full advisory cycle yourself.
        </p>
        <Link href="/login" className="btn btn-primary text-base px-6 py-3">
          Open demo dashboard
        </Link>
      </section>

      <footer
        className="px-8 py-8 text-center text-sm border-t"
        style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}
      >
        Powered by AgriNexus AI · AWS AIdeas award winner ·{" "}
        <Link href="/judges" className="underline">
          For hackathon judges
        </Link>{" "}
        · Built on Amazon DynamoDB + Vercel
      </footer>
    </div>
  );
}

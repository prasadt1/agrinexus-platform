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
      <section className="px-8 pt-24 pb-16 max-w-3xl mx-auto text-center">
        <p className="text-label mb-5" style={{ color: "var(--color-primary)" }}>
          Advisory accountability · WhatsApp-native
        </p>
        <h1 className="text-display mb-5">
          Proof of what your advisory program produced.
        </h1>
        <p
          className="text-lg md:text-xl max-w-xl mx-auto mb-9"
          style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}
        >
          Farmers get a timely <Term term="nudge">WhatsApp nudge</Term> when conditions are right.
          Outturn tracks <Term term="follow-through">who acted</Term>, then shows you where
          follow-through is slipping, so field teams know exactly where to go.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-3">
          <Link href="/login" className="btn btn-primary text-base px-6 py-3">
            Open demo dashboard
          </Link>
          <a
            href="https://wa.me/4915120105731?text=Hi%20Outturn%2C%20show%20me%20the%20advisory%20demo"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-base px-6 py-3 inline-flex items-center gap-2"
            aria-label="Try the live advisory demo on WhatsApp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.8 14.16c-.24.68-1.42 1.32-1.95 1.36-.5.05-.96.24-3.23-.67-2.74-1.08-4.46-3.88-4.6-4.06-.13-.18-1.1-1.46-1.1-2.79 0-1.32.7-1.97.94-2.24a1 1 0 01.72-.34c.18 0 .36.01.51.01.17 0 .39-.06.6.46.24.56.81 1.94.88 2.08.07.14.12.31.02.49-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.57.16.27.71 1.17 1.53 1.9 1.05.93 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.81.86.27.14.45.2.51.31.07.12.07.66-.17 1.34z" />
            </svg>
            Try it on WhatsApp
          </a>
        </div>
        <p className="text-sm max-w-md mx-auto mt-7" style={{ color: "var(--color-text-muted)" }}>
          &ldquo;Outturn&rdquo; is the trade term for the actual yield after processing. Here, it&apos;s
          the actual result after advisory.
        </p>
      </section>

      {/* How it works */}
      <section className="px-8 pb-16 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-section">How it works</h2>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            From weather to proof to re-nudge — the whole loop, shown in the real product. Tap a step
            or watch it play.
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

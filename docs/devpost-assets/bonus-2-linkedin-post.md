# LinkedIn build post — "the consent seam"

> *Disclosure: I created this content for the purposes of entering the H0 Hackathon. #H0Hackathon*
>
> **DRAFT — rewrite in your own voice before posting.** ~280 words. First person, a war story.

---

A partner can enroll 500 farmers into a cohort with one CSV upload.

But here's the seam that kept me up at night during the H0 hackathon: **a farmer who never opted in must never get a WhatsApp message.** That's not a nice-to-have — it's the line between a helpful service and spam, and on WhatsApp it's a compliance problem that can get your number banned.

The hard part: "enroll" and "send" live in two different systems sharing one DynamoDB table.
- The **control plane** — the new B2B dashboard I built for H0 — writes the membership when a partner enrolls farmers.
- The **delivery engine** — our AWS AIdeas–finalist WhatsApp advisor — is what actually sends nudges.

If the dashboard just wrote "this farmer is in the cohort," the engine would happily start nudging someone who never agreed to it.

The fix was a consent state that travels with the *farmer*, not the cohort:
→ Enrollment dual-writes a profile seeded as `consent: pending`.
→ The engine's sender has a hard gate — no `granted`, no send. It asks first.
→ Consent only flips to `granted` after the farmer replies on WhatsApp.
→ A conditional write means re-enrolling a farmer can never overwrite consent they already gave.

The lesson I keep relearning: when two services share a database, the invariant — "never message without consent" — has to live in the *data* and be enforced at the *last* possible step (the sender), not assumed at the first.

The rest of the build — single-table multi-tenant, DynamoDB Streams rolling outcomes into pre-computed summaries, keyless Vercel↔AWS via OIDC (no static keys anywhere) — is in the write-up. But this seam is the one I'd want a teammate to catch in review.

Try it: https://outturn.vercel.app — or chat with the live engine on WhatsApp: https://wa.me/4915120105731

#H0Hackathon #AWS #DynamoDB #Serverless #BuildInPublic

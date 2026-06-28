# LinkedIn build post v2 - "the consent seam"

> *Disclosure: I created this content for the purposes of entering the H0 Hackathon. #H0Hackathon*
>
> **DRAFT v2 - rewrite in your own voice before posting.** First person, specific, and short enough for LinkedIn.

---

The most important line in my H0 build was not a dashboard chart.

It was this invariant: **a farmer who has not opted in must never receive a proactive WhatsApp nudge.**

For H0, I built Outturn: a Vercel control plane for the AgriNexus WhatsApp advisory engine I had already shipped. A partner can create a cohort, activate it, enroll farmers, and see whether advice actually turned into action.

That sounds simple until you hit the boundary between the two systems.

The control plane writes the B2B truth: "this phone number belongs to this partner cohort."

The delivery engine owns the field truth: "this farmer may receive WhatsApp messages."

If enrollment alone made a farmer reachable, the product would become spam. Bad architecture, bad compliance, bad trust.

The fix was to make consent part of the cross-system data contract:

- enrollment writes `PHONE#<phone>/MEMBERSHIP` for attribution
- enrollment also seeds `USER#<phone>/PROFILE` as `consent=pending`
- that profile is only created if absent, so existing consent is never overwritten
- the engine's sender has the last gate: no `granted`, no send
- consent flips only when the farmer opts in over WhatsApp

The rest of the architecture is the kind of thing I enjoy writing about: DynamoDB single-table design, GSI2 active cohorts, Streams -> `SUMMARY#` rollups, Vercel OIDC into AWS with no long-lived production key, and a separate Vercel Marketplace DynamoDB table for audit logs.

But the consent seam is the part I would want a teammate to catch in review.

When two services share a database, the invariant cannot live in a slide. It has to live in the data model and be enforced at the last possible step.

Built for #H0Hackathon.

Live demo: https://outturn.vercel.app
Engine: https://wa.me/4915120105731

#AWS #DynamoDB #Vercel #Serverless #BuildInPublic

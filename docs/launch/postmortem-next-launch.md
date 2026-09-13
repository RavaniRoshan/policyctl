# Launch-day postmortem + next-launch plan — policyctl

## What happened (Sep 12–13, 2026 launch)

- Day-end state: the post closed with essentially no vote velocity from a standing start (~2 upvotes at the 2h-remaining mark).
- Actions that did execute: PH maker launch-story comment posted; X momentum tweet posted + pinned (@RoshanAIs/status/2099012484523040894); site banner + README launch section live; full content kit in docs/launch/ (Show HN, X thread, Reddit, LinkedIn, DMs, maker comments, playbook).
- Root cause of low rank (honest): no distribution channel existed before launch — 0-engage followers on X, no Reddit karma account, no email list, launch announced to nobody. The rank was determined before the day started.

## The big opportunity: GPT-6 Astra Challenge (Sep 18)

Product Hunt officially announced (via their X account): launch on **Friday, September 18, 2026** as part of the GPT-6 Astra Challenge — **top five launches each win $10K in OpenAI API credits + a year of ChatGPT Pro for up to 2 team members.**

## Seven-day plan to win the Sep 18 slot

### Days 1–2 (Sep 13–14)
- Post Show HN Sunday 8–10am ET (`docs/launch/show-hn.md` is ready). HN feedback now = real testimonials and rule ideas by launch day.
- Post dev.to article: "policy-as-code: why prompts aren't policy" (from README content).
- Start the X/LinkedIn build-in-public cadence: 1 post/day. Every post = 1 rule, 1 screenshot, 1 story.

### Days 2–4 (Sep 15–16)
- Reddit posts (staggered): r/ClaudeAI, r/ChatGPTCoding, r/cursor (`docs/launch/reddit.md` ready). Note: the u/East_Perspective_819 account (1 karma) will not clear posting requirements — either build karma this week (comment genuinely in these subs daily) or post via the website to avoid auto-mod. Do NOT use throwaway-seeming accounts to post product links.
- Collect honest feedback threads into a "shipped since your feedback" launch-day story.

### Days 3–6 (Sep 16–17)
- Warm the audience: tell your Show HN/Reddit/dev.to commenters you're launching (again) Friday the 18th. A warm DM to 20-30 *people who already engaged with the product* is the white-hat version of the DM blast.
- Pre-schedule the Sep 18 launch on PH (it allows scheduled launches) — pick 12:01am PT or 8am PT; schedule X/LinkedIn posts for the moment it goes live.
- Ship 1-2 visible improvements from this week's feedback into the demo GIF/video.

### Day 7 (Sep 18, relaunch)
- Everything in `docs/launch/playbook.md` executes against a warm audience this time: launch comment thread seeded with testimonials, X thread the moment it's live, makers on the thread all day.
- The banner on the site auto-expires Sep 20 — move expiry to Sep 27 for the relaunch and re-point it to the new post URL when scheduled.

## Standing assets (all ready to reuse)

- `docs/launch/show-hn.md` — HN post + reply strategy
- `docs/launch/x-thread.md` — 7-tweet thread (attach demo.gif, not just links)
- `docs/launch/reddit.md` — 3 sub-specific posts
- `docs/launch/linkin-dms.md` — LinkedIn post + DM templates (for *engaged* users)
- `docs/launch/maker-comments.md` — staged maker comments
- Site PH banner component: `web/src/components/launch/PHLaunchBanner.tsx` (update `PH_URL` + `EXPIRY` constants for Sep 18)
- README launch section (update link to new post)

## Hard-won platform notes (for next time)

- opencli `browser` session automation works for PH comments + X posts. X composer: must clear editor with `getSelection().deleteFromDocument()` then `document.execCommand('insertText')` — `type` command alone leaves the Post button in disabled state (React never receives input events).
- X/PH in Brave: Shields up blocks x.com main-thread JS (page shows "ScriptLoadFailure"). Lower shields per-site before automating.
- opencli `reddit` adapter is read/comment-only — cannot create posts.
- PH `hot`/`browse` commands break on the new PH UI ("No network capture within 5s"); `today` returns only 1 row. Read the post page via `browser` session instead.

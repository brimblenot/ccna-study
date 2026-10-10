# CCNA Study Dashboard: build prompt

I'm studying for the CCNA with Jeremy's IT Lab (63 "Days"). I'd rather read than watch the videos, so I want a local study dashboard where every Day is a full written lesson that TEACHES the material, built from third-party course notes plus their diagrams.

Read this whole prompt before starting. Work in the phases below and stop after each one so I can review.

## What's already in this folder

- `content/raw/Course_Notes/`: 66 markdown note files, renamed to `Day NN - Title.md`. Days 11 and 54 have several files (`Day 11a`/`11b`, `Day 54a`/`54b`/`54c`). Don't modify these files.
- The notes contain ~880 images, but they are NOT in the repo. They're linked as `https://github.com/psaumur/CCNA/assets/...` (both `![](url)` and `<img src="">` syntax).
- `content/drive-resources.json`: the Jeremy's IT Lab Google Drive files, already mapped by Day. Each Day has `labs` (Packet Tracer `.pkt`) and `flashcards` (Anki `.apkg`), each with `title`, `viewUrl`, `downloadUrl`. Some Days have only one type and Day 14 has neither. It also has `courseFolderUrl` and `megaLabFolderUrl`.
- `.gitignore` already exists. Keep it.
- I'm on Windows. All npm scripts must be cross-platform (use tsx, no bash-only commands).

## Hard requirements

1. **No runtime AI and no API key.** YOU (Claude Code) write every lesson yourself, as files on disk. The app only reads those static files. Opening a Day must be instant with zero generation. Do not install or use the Anthropic SDK.
2. **One page per Day (1-63).** Days 11 and 54 combine all their note files into one lesson, with each part as a clearly labeled section ("Part 1: Routing Fundamentals", etc.).
3. **Teach, don't summarize.** The source notes are terse bullet notes. Each lesson should read like a good textbook chapter or a patient instructor explaining it to a beginner: build intuition first, explain WHY things work the way they do, define every term the first time it appears, use analogies where they help, walk through examples step by step (especially subnetting, binary math, and command output), and point out common mistakes and exam traps. Cover everything in the notes. Don't drop details, and don't invent topics the notes don't cover beyond brief context.
4. **Every image is in the lesson and explained.** Place each image where it belongs in the flow, and under it write an explanation of what it actually shows (for example: "This topology shows R1 connected to SW1 on G0/0..." or "In this output, notice the 'C' and 'L' codes..."). You must actually LOOK at each image with your Read tool before writing about it. Never guess from the filename or the surrounding text.
5. **In-app quiz per Day.** 8-12 CCNA-style multiple-choice questions, each with an explanation for the correct answer. Include calculation questions (subnetting, binary, wildcard masks, etc.) when the Day covers them.
6. **End-of-Day resources.** At the bottom of each lesson, a "Labs & Flashcards" section with a button for each file in that Day's `drive-resources.json` entry (open on Google Drive, plus a smaller download link). Show a short note under the buttons: `.pkt` files open in Cisco Packet Tracer and `.apkg` files open in Anki. If a Day has no files, show a single button to the main course folder instead.
7. **Design: Cisco-inspired, white and blue, networking aesthetic.**
   - Light theme only. White and very light gray-blue backgrounds, Cisco blue (#049FD9) as the primary accent, deep navy (#005073 / #0D274D) for headings and the top bar, and a small green (#6CC04A) for "correct"/success states. Use a red only for wrong quiz answers.
   - Networking motifs, used tastefully: a faint topology/node-and-link pattern in the header, a Day navigator styled like a switch port panel (each Day is a "port" whose LED lights up when visited), and monospace "terminal" styling for CLI commands and output (e.g. `R1#` prompts).
   - Clean sans-serif for body text (e.g. Inter), monospace for CLI (e.g. JetBrains Mono). Comfortable reading width (~70ch) for lesson text.
   - Use Cisco's colors only. Do NOT use the Cisco logo, wordmark, or bridge icon.

## Phase 1: Project setup and image download

- Scaffold Next.js (App Router) + TypeScript + Tailwind in this folder without disturbing `content/`.
- Write `scripts/ingest.ts` (`npm run ingest`):
  - Read every file in `content/raw/Course_Notes`. Parse day number, part letter, and title from the filename.
  - Extract every image URL in reading order.
  - Download each image to `public/notes/day-NN/<part><index>.<ext>` (detect the extension from content-type). Use ~4 concurrent downloads, skip files that already exist, retry failures twice, and log any that still fail.
  - Write `content/manifest.json`: `[{ day, title, parts: [{ part, title, file, images: [{ url, localPath }] }] }]`.
- Run it. Report how many images downloaded and list any failures.

## Phase 2: Lesson format, then Days 1-3 as a sample

- Define the lesson schema in `lib/lesson-schema.ts` (Zod) and save each lesson as `content/lessons/day-NN.json`:
  - `day`, `title`, `estimatedReadMinutes`
  - `overview`: why this topic matters and what I'll be able to do after
  - `parts`: `[{ heading, sections: [{ heading, blocks }] }]` (single-part Days have one part). A `block` is one of:
    - `{ type: "text", markdown }`
    - `{ type: "image", src, alt, explanation }`
    - `{ type: "cli", prompt, command, output?, explanation }`
    - `{ type: "callout", variant: "tip" | "examTrap" | "analogy" | "remember", markdown }`
    - `{ type: "workedExample", title, steps: [markdown] }`
  - `keyTerms`: `[{ term, definition }]`
  - `commandReference`: `[{ command, mode, purpose }]` (empty for theory-only Days)
  - `recap`: 5-8 bullet takeaways
  - `quiz`: `[{ question, options[4], answerIndex, explanation }]`
- Write `scripts/validate-lessons.ts` (`npm run validate`). It must check every lesson against the schema, confirm every image from the manifest appears exactly once in that Day's lesson, and confirm every `src` file exists.
- Write Days 1, 2 and 3 yourself following the hard requirements: read the note, view every image, then write the lesson. Run validate. Stop so I can review the writing quality before you continue.

## Phase 3: The dashboard

- **Home:** course header with the topology pattern, a "Continue where you left off" button (last visited Day, stored in localStorage), and the port-panel grid of Days 1-63 with titles. Hovering a port shows the Day title. Visited Days light up.
- **Day page** (`/day/[n]`, statically generated from the JSON with `generateStaticParams`):
  - Sticky top bar with Day number and title, plus previous/next Day buttons.
  - Sidebar table of contents for the lesson's parts and sections, highlighting the current section as I scroll.
  - Lesson content rendered from the blocks. Images are click-to-zoom with the explanation shown as a caption. CLI blocks look like a terminal with a copy button.
  - After the lesson: Key Terms, Command Reference, Recap, then the Quiz.
  - Quiz: one question at a time, instant feedback with the explanation, a score at the end, and a retry button. Keyboard shortcuts: 1-4 to answer, Enter or the right arrow for the next question.
  - Labs & Flashcards section at the very bottom (see hard requirement 6).
- Keyboard: left/right arrows move between Days when not in the quiz.
- Make sure `npm run build` passes with no errors.

## Phase 4: Write the remaining lessons

- Write Days 4-63 in order, in batches of about 5 Days. After each batch, run `npm run validate` and update `content/lessons/PROGRESS.md` with which Days are done.
- This will take more than one session. If you're running low on context or usage, finish the Day you're on, update PROGRESS.md, and tell me. When I come back and say "continue the lessons," read PROGRESS.md and pick up from the next Day.
- Don't lower the quality to go faster. Every Day gets the same depth as Days 1-3, and every image gets viewed and explained.

## General

- Write complete files, not partial snippets.
- Add a README with setup steps, how to run the app (`npm run dev`), and how to resume lesson writing.

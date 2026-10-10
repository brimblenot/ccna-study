# CCNA Study Lab

A local study dashboard for [Jeremy's IT Lab](https://www.youtube.com/@JeremysITLab) free CCNA 200-301 course (Days 1-63). Each Day is a full written lesson that explains the material. Every diagram from the course notes appears in the lesson with an explanation. Each Day also has a quiz and links to its Packet Tracer lab and Anki flashcards.

There's no runtime AI and no API key. Lessons are static JSON files in `content/lessons/`, so the app only reads files from disk.

> **What's in this repo, and what isn't.** This repo is the app only. The course notes, their images, and the written lessons are **not** included. They're built on Jeremy's IT Lab's course and on another student's notes, so they aren't ours to republish. The guide below shows you how to download the same notes and write your own lessons, so you end up with the same study lab.

## Credits and sources

- **Course:** Jeremy's IT Lab, *Free CCNA 200-301 Complete Course*, available on the [YouTube playlist](https://www.youtube.com/playlist?list=PLxbwE86jKRgMpuZuLBivzlM8s2Dk5lXBQ), the [YouTube channel](https://www.youtube.com/@JeremysITLab), and [jeremysitlab.com](https://www.jeremysitlab.com). If the course helps you, consider supporting Jeremy.
- **Labs and flashcards:** Jeremy's own [course files on Google Drive](https://drive.google.com/drive/folders/1PwK_jWqfUtOjV7gHt8ODutq9QA5cxCgi) and [Mega Lab folder](https://drive.google.com/drive/folders/1IeZTfFD-4TpPRprEZEWUGE2wwj7DwAHH). The app only links to these files. It never copies them.
- **Course notes:** [psaumur/CCNA_Course_Notes](https://github.com/psaumur/CCNA_Course_Notes), personal notes on the course written by its author. `npm run fetch-notes` downloads them straight from that repo onto your machine.

This project isn't affiliated with Cisco or Jeremy's IT Lab. It uses Cisco-inspired colors but no Cisco logos.

## Build your own copy, from scratch

You'll end up with a working app right away, then fill in the lessons over time.

### 1. Install the tools

- [Node.js](https://nodejs.org) 20 or newer (tested on Node 24, Windows 11)
- [Git](https://git-scm.com)
- [Cisco Packet Tracer](https://www.netacad.com/resources/lab-downloads) (free with a Cisco Networking Academy account) for the `.pkt` labs
- [Anki](https://apps.ankiweb.net) for the `.apkg` flashcards
- To write lessons with AI as described in step 4: [Claude Code](https://claude.com/claude-code), which needs a paid Claude plan

### 2. Get the app

```bash
git clone https://github.com/brimblenot/ccna-study.git
cd ccna-study
```

### 3. Download the notes and images, then start the app

**Windows:** double-click `start.bat`. On the first run it installs packages, downloads the notes and images, builds the app, and opens it in Chrome. After that, it starts in a couple of seconds.

**Any OS:**

```bash
npm install
npm run fetch-notes   # 66 note files -> content/raw/Course_Notes/
npm run ingest        # ~880 images -> public/notes/, writes content/manifest.json
npm run dev           # http://localhost:3000
```

Every Day page already works at this point. It shows the Day's Packet Tracer labs and Anki flashcards, and the lesson area says "Lesson coming soon" until you write that Day's lesson.

### 4. Write the lessons

Each lesson is one file, `content/lessons/day-NN.json` (for example `day-07.json`), in the format defined in [`lib/lesson-schema.ts`](lib/lesson-schema.ts). A lesson is made of sections of text, images with explanations, CLI examples, callouts and worked examples. It ends with key terms, a command reference, a recap, and an 8-12 question quiz.

**Option A: with Claude Code (how this project was made).** Open Claude Code in the `ccna-study` folder and paste:

> Read CLAUDE_CODE_PROMPT.md. The app is already built (Phases 1 and 3 are done), and the notes and images are already downloaded. Follow the hard requirements and do Phase 2's "write Days 1-3" step, then Phase 4: write the lessons in `content/lessons/`, view every image before explaining it, run `npm run validate` after each batch, and track progress in `content/lessons/PROGRESS.md`.

Review Days 1-3, then say **"continue the lessons"** to keep going. Writing all 63 Days takes many sessions. Claude stops when it runs low on context or usage, and picks up again from `PROGRESS.md`.

**Option B: by hand.** Read a Day's note in `content/raw/Course_Notes/`, then write its JSON file following `lib/lesson-schema.ts`. You can write just the Days you want, and every other Day keeps working without a lesson.

Either way, run this after writing or editing a lesson:

```bash
npm run validate
```

It checks each lesson against the schema, makes sure every image from that Day's notes appears exactly once and the image file exists, and checks that quiz answers are valid.

### 5. Keep your lessons private

`content/lessons/` is in `.gitignore`, so your lessons stay on your machine even if you push your copy to GitHub. Leave it that way unless you've written everything yourself and own the rights to it.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the app in development mode |
| `npm run build` / `npm start` | Production build and server |
| `npm run fetch-notes` | Download the 66 course notes from psaumur/CCNA_Course_Notes into `content/raw/Course_Notes/`, renamed `Day NN - Title.md`. Never overwrites existing files |
| `npm run ingest` | Parse `content/raw/Course_Notes`, download all images, write `content/manifest.json`. Safe to re-run: it skips images already downloaded |
| `npm run validate` | Check every lesson against the schema, confirm each manifest image appears exactly once, and confirm each image file exists |

## Using the app

- **Home:** "Continue where you left off" button, plus a switch-style port panel for Days 1-63. A port's LED turns green once you've opened that Day, and blue for the Day you opened last. Progress is stored in your browser's localStorage.
- **Day page:** the lesson, then Key Terms, Command Reference, Recap, Quiz, and Labs & Flashcards.
- **Keyboard:** ← / → move between Days. When the quiz is on screen, 1-4 picks an answer and Enter / → goes to the next question.
- Click any diagram to zoom.

## Project layout

```
content/
  raw/Course_Notes/      course notes from `npm run fetch-notes` (not in git)
  drive-resources.json   links to Jeremy's labs + flashcards per Day
  manifest.json          Day/image index, regenerated by `npm run ingest`
  lessons/day-NN.json    your written lessons (not in git)
  lessons/PROGRESS.md    lesson writing log (not in git)
lib/lesson-schema.ts     Zod schema for lessons
scripts/                 fetch-notes, ingest, validate
app/, components/        Next.js App Router UI
public/notes/day-NN/     downloaded images (not in git)
CLAUDE_CODE_PROMPT.md    the prompt this project was built from
start.bat                Windows one-click launcher
```

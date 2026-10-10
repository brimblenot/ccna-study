import ContinueButton from "@/components/ContinueButton";
import PortPanel from "@/components/PortPanel";
import TopologyPattern from "@/components/TopologyPattern";
import { getDaySummaries, getResources } from "@/lib/content";

export default function Home() {
  const days = getDaySummaries();
  const written = days.filter((d) => d.hasLesson).length;
  const { courseFolderUrl, megaLabFolderUrl } = getResources(1);
  const titles = Object.fromEntries(days.map((d) => [d.day, d.title]));

  return (
    <main>
      <header className="relative overflow-hidden bg-gradient-to-br from-deep via-[#0a3460] to-navy text-white">
        <TopologyPattern className="text-cisco/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="font-mono text-sm text-cisco">
            <span className="text-white/60">study-lab#</span> show course ccna-200-301
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">CCNA Study Lab</h1>
          <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">
            Written lessons for Jeremy&apos;s IT Lab, Days 1–63. Read each topic explained step by step, check
            yourself with the quiz, then open the Packet Tracer lab and Anki flashcards.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <ContinueButton titles={titles} />
            <span className="font-mono text-xs text-white/60">
              {written}/63 lessons written
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PortPanel days={days} />

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <a
            href={courseFolderUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-line bg-white px-4 py-2 font-medium text-navy hover:border-cisco hover:text-cisco-dark"
          >
            Course files on Google Drive ↗
          </a>
          <a
            href={megaLabFolderUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-line bg-white px-4 py-2 font-medium text-navy hover:border-cisco hover:text-cisco-dark"
          >
            MEGA Lab folder ↗
          </a>
        </div>
        <p className="mt-6 text-xs text-muted">
          Keyboard: on a lesson page, ← and → move between Days. In the quiz, press 1–4 to answer and Enter or → to continue.
        </p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DayTopBar from "@/components/DayTopBar";
import LessonBlocks from "@/components/LessonBlocks";
import Markdown from "@/components/Markdown";
import Quiz from "@/components/Quiz";
import Resources from "@/components/Resources";
import Toc, { type TocGroup } from "@/components/Toc";
import { getDaySummaries, getLesson, getResources, sectionId, TOTAL_DAYS } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: TOTAL_DAYS }, (_, i) => ({ n: String(i + 1) }));
}

function parseDay(n: string) {
  const day = Number(n);
  return Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS ? day : null;
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const day = parseDay((await params).n);
  const summary = day ? getDaySummaries()[day - 1] : null;
  return { title: summary ? `Day ${summary.day}: ${summary.title} · CCNA Study Lab` : "CCNA Study Lab" };
}

function SectionHeading({ id, kicker, children }: { id: string; kicker: string; children: React.ReactNode }) {
  return (
    <div id={id} className="mb-5 scroll-mt-24 border-b border-line pb-2">
      <div className="font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-cisco-dark">{kicker}</div>
      <h2 className="text-2xl font-bold tracking-tight text-deep">{children}</h2>
    </div>
  );
}

export default async function DayPage({ params }: { params: Promise<{ n: string }> }) {
  const day = parseDay((await params).n);
  if (!day) notFound();

  const summaries = getDaySummaries();
  const summary = summaries[day - 1];
  const prev = day > 1 ? summaries[day - 2] : null;
  const next = day < TOTAL_DAYS ? summaries[day] : null;
  const lesson = getLesson(day);
  const { files, courseFolderUrl } = getResources(day);
  const title = lesson?.title ?? summary.title;

  const multiPart = (lesson?.parts.length ?? 0) > 1;
  const tocGroups: TocGroup[] = lesson
    ? [
        { items: [{ id: "overview", label: "Overview" }] },
        ...lesson.parts.map((part, pi) => ({
          heading: multiPart ? part.heading : undefined,
          items: part.sections.map((s, si) => ({ id: sectionId(pi, si), label: s.heading })),
        })),
        {
          heading: "Review",
          items: [
            { id: "key-terms", label: "Key Terms" },
            ...(lesson.commandReference.length ? [{ id: "commands", label: "Command Reference" }] : []),
            { id: "recap", label: "Recap" },
            { id: "quiz", label: "Quiz" },
            { id: "resources", label: "Labs & Flashcards" },
          ],
        },
      ]
    : [];

  return (
    <>
      <DayTopBar
        day={day}
        title={title}
        prev={prev && { day: prev.day, title: prev.title }}
        next={next && { day: next.day, title: next.title }}
      />

      {!lesson ? (
        <main className="mx-auto max-w-[70ch] px-4 py-12 sm:px-6">
          <div className="rounded-xl border border-dashed border-line bg-softer p-6">
            <div className="font-mono text-xs text-muted">%LESSON-5-NOTWRITTEN</div>
            <h1 className="mt-1 text-2xl font-bold text-deep">Day {day}: {title}</h1>
            <p className="mt-3 text-muted">
              This lesson hasn&apos;t been written yet. The labs and flashcards for this Day are already available below.
            </p>
            <Link href="/" className="mt-4 inline-block text-sm font-medium text-cisco-dark underline">
              ← Back to all Days
            </Link>
          </div>
          <section className="mt-10">
            <SectionHeading id="resources" kicker="Practice">
              Labs &amp; Flashcards
            </SectionHeading>
            <Resources files={files} courseFolderUrl={courseFolderUrl} />
          </section>
        </main>
      ) : (
        <div className="mx-auto flex max-w-7xl gap-10 px-4 sm:px-6">
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto py-8 pr-2">
              <Toc groups={tocGroups} />
            </div>
          </aside>

          <main className="min-w-0 flex-1 py-8 sm:py-10">
            <div className="mx-auto max-w-[70ch]">
              <header id="overview" className="scroll-mt-24">
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
                  <span className="rounded bg-soft px-2 py-1 text-navy">Day {day} of {TOTAL_DAYS}</span>
                  <span>~{lesson.estimatedReadMinutes} min read</span>
                  <span>{lesson.quiz.length} quiz questions</span>
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-deep sm:text-4xl">{lesson.title}</h1>
                <div className="mt-6 rounded-xl border border-cisco/30 bg-[#f2fafe] p-5">
                  <div className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-cisco-dark">
                    Overview
                  </div>
                  <Markdown>{lesson.overview}</Markdown>
                </div>
              </header>

              {lesson.parts.map((part, pi) => (
                <div key={pi} className="mt-12">
                  {multiPart && (
                    <div className="mb-8 rounded-lg bg-deep px-5 py-3 text-white">
                      <div className="font-mono text-xs text-cisco">Part {pi + 1}</div>
                      <div className="text-xl font-bold">{part.heading.replace(/^Part \d+:\s*/, "")}</div>
                    </div>
                  )}
                  {part.sections.map((section, si) => (
                    <section key={si} className="mt-12 first:mt-0">
                      <h2
                        id={sectionId(pi, si)}
                        className="mb-5 scroll-mt-24 text-2xl font-bold tracking-tight text-deep"
                      >
                        {section.heading}
                      </h2>
                      <LessonBlocks blocks={section.blocks} />
                    </section>
                  ))}
                </div>
              ))}

              <section className="mt-16">
                <SectionHeading id="key-terms" kicker="Review">
                  Key Terms
                </SectionHeading>
                <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                  {lesson.keyTerms.map((t) => (
                    <div key={t.term} className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4 even:bg-softer">
                      <dt className="font-semibold text-deep">{t.term}</dt>
                      <dd className="text-[0.95rem]">
                        <Markdown tight>{t.definition}</Markdown>
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {lesson.commandReference.length > 0 && (
                <section className="mt-14">
                  <SectionHeading id="commands" kicker="Review">
                    Command Reference
                  </SectionHeading>
                  <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-soft text-deep">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Command</th>
                          <th className="px-4 py-2 font-semibold">Mode</th>
                          <th className="px-4 py-2 font-semibold">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {lesson.commandReference.map((c) => (
                          <tr key={c.command + c.mode}>
                            <td className="px-4 py-2 align-top">
                              <code className="whitespace-nowrap rounded bg-term px-2 py-0.5 font-mono text-[0.8rem] text-[#d7e6f3]">
                                {c.command}
                              </code>
                            </td>
                            <td className="px-4 py-2 align-top font-mono text-xs text-navy">{c.mode}</td>
                            <td className="px-4 py-2 align-top">{c.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <section className="mt-14">
                <SectionHeading id="recap" kicker="Review">
                  Recap
                </SectionHeading>
                <ul className="space-y-2.5">
                  {lesson.recap.map((r, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ok" />
                      <div className="min-w-0 flex-1">
                        <Markdown tight>{r}</Markdown>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-14">
                <SectionHeading id="quiz" kicker="Check yourself">
                  Quiz
                </SectionHeading>
                <Quiz questions={lesson.quiz} />
              </section>

              <section className="mt-14 mb-20">
                <SectionHeading id="resources" kicker="Practice">
                  Labs &amp; Flashcards
                </SectionHeading>
                <Resources files={files} courseFolderUrl={courseFolderUrl} />
                {next && (
                  <Link
                    href={`/day/${next.day}`}
                    className="mt-10 flex items-center justify-between rounded-xl border border-line bg-softer px-5 py-4 hover:border-cisco"
                  >
                    <span>
                      <span className="block font-mono text-xs text-muted">Next up</span>
                      <span className="font-semibold text-deep">
                        Day {next.day}: {next.title}
                      </span>
                    </span>
                    <span className="text-xl text-cisco">→</span>
                  </Link>
                )}
              </section>
            </div>
          </main>
        </div>
      )}
    </>
  );
}

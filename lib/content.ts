import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { Lesson, type Lesson as LessonType } from "./lesson-schema";

const CONTENT_DIR = path.join(process.cwd(), "content");

export const TOTAL_DAYS = 63;

export interface DaySummary {
  day: number;
  title: string;
  hasLesson: boolean;
}

export interface DriveFile {
  title: string;
  viewUrl: string;
  downloadUrl: string;
}

export interface DayResources {
  labs: DriveFile[];
  flashcards: DriveFile[];
}

interface ManifestDay {
  day: number;
  title: string;
}

interface DriveResources {
  courseFolderUrl: string;
  megaLabFolderUrl: string;
  days: Record<string, Partial<DayResources>>;
}

function readJson<T>(...segments: string[]): T {
  return JSON.parse(readFileSync(path.join(CONTENT_DIR, ...segments), "utf8")) as T;
}

function lessonPath(day: number) {
  return path.join(CONTENT_DIR, "lessons", `day-${String(day).padStart(2, "0")}.json`);
}

export function getDaySummaries(): DaySummary[] {
  const manifest = readJson<ManifestDay[]>("manifest.json");
  const titles = new Map(manifest.map((d) => [d.day, d.title]));
  return Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const day = i + 1;
    return { day, title: titles.get(day) ?? `Day ${day}`, hasLesson: existsSync(lessonPath(day)) };
  });
}

export function getLesson(day: number): LessonType | null {
  const file = lessonPath(day);
  if (!existsSync(file)) return null;
  return Lesson.parse(JSON.parse(readFileSync(file, "utf8")));
}

export function getResources(day: number): { files: DayResources; courseFolderUrl: string; megaLabFolderUrl: string } {
  const drive = readJson<DriveResources>("drive-resources.json");
  const entry = drive.days[String(day)] ?? {};
  return {
    files: { labs: entry.labs ?? [], flashcards: entry.flashcards ?? [] },
    courseFolderUrl: drive.courseFolderUrl,
    megaLabFolderUrl: drive.megaLabFolderUrl,
  };
}

/** Stable anchor id for a section, used by the TOC and scroll-spy. */
export function sectionId(partIndex: number, sectionIndex: number) {
  return `p${partIndex + 1}-s${sectionIndex + 1}`;
}

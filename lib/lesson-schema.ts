import { z } from "zod";

const markdown = z.string().min(1);

export const TextBlock = z.object({
  type: z.literal("text"),
  markdown,
});

export const ImageBlock = z.object({
  type: z.literal("image"),
  /** Web path under /public, e.g. "/notes/day-02/03.png". */
  src: z.string().regex(/^\/notes\/day-\d{2}\/[a-z]?\d{2}\.\w+$/, "src must be a /notes/day-NN/... path"),
  alt: z.string().min(1),
  /** What the image actually shows, written after looking at it. Markdown allowed. */
  explanation: markdown,
});

export const CliBlock = z.object({
  type: z.literal("cli"),
  /** Device prompt shown before the command, e.g. "R1#" or "SW1(config-if)#". */
  prompt: z.string(),
  /** One or more commands; use newlines for a sequence of commands. */
  command: z.string().min(1),
  output: z.string().optional(),
  explanation: markdown,
});

export const CalloutBlock = z.object({
  type: z.literal("callout"),
  variant: z.enum(["tip", "examTrap", "analogy", "remember"]),
  markdown,
});

export const WorkedExampleBlock = z.object({
  type: z.literal("workedExample"),
  title: z.string().min(1),
  steps: z.array(markdown).min(1),
});

export const Block = z.discriminatedUnion("type", [TextBlock, ImageBlock, CliBlock, CalloutBlock, WorkedExampleBlock]);

export const Section = z.object({
  heading: z.string().min(1),
  blocks: z.array(Block).min(1),
});

export const Part = z.object({
  heading: z.string().min(1),
  sections: z.array(Section).min(1),
});

export const QuizQuestion = z
  .object({
    question: markdown,
    options: z.array(z.string().min(1)).length(4),
    answerIndex: z.number().int().min(0).max(3),
    explanation: markdown,
  })
  .refine((q) => new Set(q.options).size === 4, { message: "quiz options must be distinct" });

export const Lesson = z.object({
  day: z.number().int().min(1).max(63),
  title: z.string().min(1),
  estimatedReadMinutes: z.number().int().positive(),
  overview: markdown,
  parts: z.array(Part).min(1),
  keyTerms: z.array(z.object({ term: z.string().min(1), definition: markdown })).min(1),
  commandReference: z.array(
    z.object({ command: z.string().min(1), mode: z.string().min(1), purpose: z.string().min(1) }),
  ),
  recap: z.array(markdown).min(5).max(8),
  quiz: z.array(QuizQuestion).min(8).max(12),
});

export type Block = z.infer<typeof Block>;
export type Section = z.infer<typeof Section>;
export type Part = z.infer<typeof Part>;
export type QuizQuestion = z.infer<typeof QuizQuestion>;
export type Lesson = z.infer<typeof Lesson>;

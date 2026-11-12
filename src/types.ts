export const SOURCES = ["Our family", "Friend", "Web"] as const;
export type IdeaSource = (typeof SOURCES)[number];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const MESS_LEVELS = ["None", "Low", "Medium", "High"] as const;
export type MessLevel = (typeof MESS_LEVELS)[number];

/** Time hint shown with each difficulty, for the "tonight" filter. */
export const DIFFICULTY_HINT: Record<Difficulty, string> = {
  Easy: "under 10 min",
  Medium: "15–30 min",
  Hard: "45 min+",
};

export type Idea = {
  id: string;
  source: IdeaSource;
  title: string;
  description: string;
  /** Day the family did it, when this idea comes from a real night. */
  date: string | null;
  year: number | null;
  difficulty: Difficulty;
  /** How long it took, in the family's own words. */
  time: string;
  supplies: string[];
  tags: string[];
  mess: MessLevel;
  cover: string;
  photos: string[];
  /** Who shared a Friend or Web idea. */
  credit?: string;
  /** Optional page for a Web idea. */
  link?: string;
};

export type Filters = {
  q: string;
  difficulty: Difficulty | "";
  year: number | "";
  tag: string;
  mess: MessLevel | "";
};

export type Store = {
  version: 1;
  favorites: string[];
  /** idea id -> YYYY-MM-DD the friend marked it done */
  done: Record<string, string>;
  notes: Record<string, string>;
  /** idea id -> supply names that are checked off */
  checks: Record<string, string[]>;
  planYear: number;
  /** First night of the plan. Nights run through December 24 of planYear. */
  planStart: string;
  /** YYYY-MM-DD -> idea id */
  nights: Record<string, string>;
};

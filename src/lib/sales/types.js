export const PHASES = [
  "opening",
  "outcome",
  "situation",
  "problem",
  "past",
  "gap",
  "commit",
  "ideal",
  "pitch",
  "objections",
  "close",
];

export const PHASE_META = {
  opening: { label: "Frame", short: "Frame", blurb: "Buy the right to ask questions." },
  outcome: { label: "Destination", short: "Dest", blurb: "What are they trying to build." },
  situation: { label: "Architecture today", short: "Arch", blurb: "What is actually running." },
  problem: { label: "Where it breaks", short: "Break", blurb: "Find the seam." },
  past: { label: "What they've tried", short: "Tried", blurb: "Workarounds and incumbents." },
  gap: { label: "Cost of the gap", short: "Cost", blurb: "What breaks first at 2x." },
  commit: { label: "Commitment", short: "Red line", redLine: true, blurb: "Willing to change the layer." },
  ideal: { label: "What good looks like", short: "Ideal", blurb: "Their criteria, their words." },
  pitch: { label: "The fabric", short: "Fabric", blurb: "Shift, fabric, product, proof." },
  objections: { label: "Objections", short: "Objs", blurb: "Answer with a distinction." },
  close: { label: "Next step", short: "Next", blurb: "A date, an owner, a decision." },
};

export const PHASE_ENTRY = {
  opening: "open",
  outcome: "desired_outcome",
  situation: "current_situation",
  problem: "is_it_holding",
  past: "what_tried",
  gap: "gap_scale",
  commit: "commit_change",
  ideal: "ideal_solution",
  pitch: "pitch_bridge",
  objections: "obj_router",
  close: "close_ask",
};

export const STATUS_META = {
  live: { label: "Live", tone: "line" },
  advanced: { label: "Advanced", tone: "ok" },
  nurture: { label: "Nurture", tone: "warn" },
  disqualified: { label: "Disqualified", tone: "mute" },
  noshow: { label: "No-show", tone: "mute" },
};

export const NOTE_FIELDS = [
  { key: "prospect", label: "Who you're talking to" },
  { key: "company", label: "Company" },
  { key: "persona", label: "Persona" },
  { key: "outcome", label: "Destination" },
  { key: "situation", label: "Architecture today" },
  { key: "stack", label: "Incumbent / stack" },
  { key: "problem", label: "Where it breaks" },
  { key: "impact", label: "What it costs" },
  { key: "whoFeels", label: "Who feels it" },
  { key: "howLong", label: "How long" },
  { key: "tried", label: "What they tried" },
  { key: "failedWhy", label: "Why it didn't hold" },
  { key: "scale", label: "Readiness score" },
  { key: "desired", label: "The other side" },
  { key: "consequence", label: "Cost of standing still" },
  { key: "whyNow", label: "Why now" },
  { key: "committed", label: "Commitment" },
  { key: "ideal", label: "Their criteria" },
  { key: "funding", label: "Funding path" },
  { key: "decision", label: "Decision process" },
  { key: "lastObjection", label: "Last concern" },
  { key: "nextStep", label: "Next step" },
];

export const emptyNotes = (prospect = "", company = "") => {
  const notes = {};
  for (const f of NOTE_FIELDS) notes[f.key] = "";
  notes.prospect = prospect;
  notes.company = company;
  return notes;
};

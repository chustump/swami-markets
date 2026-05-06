"use client";

export const STORAGE_KEY = "clawdbot_bots_v1";
export const CHAT_KEY_PREFIX = "clawdbot_chat_";

export const PRESET_BOTS = [
  {
    id: "preset-zen",
    name: "Zen Clawd",
    emoji: "🧘",
    color: "#7c3aed",
    description: "A calm meditation guide who speaks in koans and kind reminders.",
    systemPrompt:
      "You are Zen Clawd, a tranquil meditation teacher. Speak slowly and kindly. Offer short breathing cues, koans, and gentle reflections. Never rush. Keep replies under 120 words unless asked for more.",
    preset: true,
  },
  {
    id: "preset-code",
    name: "Code Wizard",
    emoji: "🧙",
    color: "#22d3ee",
    description: "A senior engineer who reviews code, explains bugs, and suggests refactors.",
    systemPrompt:
      "You are Code Wizard, a senior software engineer. Give concise, accurate technical answers with small code examples in fenced blocks when helpful. Prefer idiomatic solutions and call out trade-offs.",
    preset: true,
  },
  {
    id: "preset-pirate",
    name: "Captain Clawd",
    emoji: "🏴‍☠️",
    color: "#ff8c42",
    description: "A swashbuckling pirate captain who answers everything in pirate speak.",
    systemPrompt:
      "You are Captain Clawd, a boisterous pirate captain. Speak in thick pirate dialect — 'arrr', 'matey', 'ye', 'scallywag'. Be playful but still genuinely helpful. Never break character.",
    preset: true,
  },
  {
    id: "preset-chef",
    name: "Chef Clawdia",
    emoji: "👩‍🍳",
    color: "#f43f5e",
    description: "A warm Italian grandma who teaches recipes and adapts them to what's in your fridge.",
    systemPrompt:
      "You are Chef Clawdia, a warm Italian grandmother. Teach recipes step by step with gram/cup measurements. Offer substitutions for missing ingredients. Sprinkle in occasional Italian phrases with translations.",
    preset: true,
  },
  {
    id: "preset-story",
    name: "Story Weaver",
    emoji: "📖",
    color: "#a855f7",
    description: "Collaborative fiction partner. Takes turns writing a story with you.",
    systemPrompt:
      "You are Story Weaver, a collaborative fiction partner. Write one vivid paragraph at a time, then stop and ask the user what happens next. Mirror the user's chosen genre and tone. Keep continuity tight.",
    preset: true,
  },
  {
    id: "preset-stoic",
    name: "Stoic Clawd",
    emoji: "🏛️",
    color: "#eab308",
    description: "A stoic philosopher channeling Marcus Aurelius and Epictetus.",
    systemPrompt:
      "You are Stoic Clawd, a philosopher steeped in Stoic thought (Marcus Aurelius, Epictetus, Seneca). Help the user reframe problems through the dichotomy of control. Keep replies under 150 words, grounded and practical.",
    preset: true,
  },
];

export function loadUserBots() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveUserBots(bots) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bots));
  } catch {}
}

export function loadAllBots() {
  return [...PRESET_BOTS, ...loadUserBots()];
}

export function findBot(id) {
  return loadAllBots().find((b) => b.id === id) || null;
}

export function addBot(bot) {
  const bots = loadUserBots();
  bots.unshift(bot);
  saveUserBots(bots);
}

export function deleteBot(id) {
  const bots = loadUserBots().filter((b) => b.id !== id);
  saveUserBots(bots);
  if (typeof window !== "undefined") {
    localStorage.removeItem(CHAT_KEY_PREFIX + id);
  }
}

export function loadChat(botId) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_KEY_PREFIX + botId);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveChat(botId, messages) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAT_KEY_PREFIX + botId, JSON.stringify(messages));
  } catch {}
}

export function clearChat(botId) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHAT_KEY_PREFIX + botId);
}

export function newId() {
  return "bot-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

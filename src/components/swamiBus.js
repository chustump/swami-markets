// A tiny shared channel so any section of a page can tell the Swami what to do.
const listeners = new Set();
let state = { mood: 'calm', text: '', heroVisible: true, vision: '' };

export function swamiSay(mood, text, vision = '') {
  state = { ...state, mood, text, vision };
  listeners.forEach((fn) => fn(state));
}
export function setHeroVisible(heroVisible) {
  if (state.heroVisible === heroVisible) return;
  state = { ...state, heroVisible };
  listeners.forEach((fn) => fn(state));
}
export function subscribeSwami(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

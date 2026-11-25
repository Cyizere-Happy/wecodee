import "server-only";
import type { Viewer } from "../types";
import { seed, type SampleState, type Scenario } from "./seed";

/**
 * In-memory sample store, one copy per person and journey. It lives for the
 * lifetime of the server process and is never shared between people.
 * Replace with the production adapter when the learning backend exists.
 */
const globalStore = globalThis as unknown as { __wecodeeSample?: Map<string, SampleState> };
const states = (globalStore.__wecodeeSample ??= new Map());

export function sampleState(viewer: Viewer, scenario: Scenario): SampleState {
  const key = `${viewer.id}:${viewer.role}:${scenario}`;
  let state = states.get(key);
  if (!state) {
    state = seed(viewer, scenario);
    states.set(key, state);
  }
  return state;
}

export function resetSampleState(viewer: Viewer) {
  for (const key of states.keys()) if (key.startsWith(viewer.id + ":")) states.delete(key);
}

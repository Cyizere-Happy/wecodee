import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { requireViewer, SCENARIO_COOKIE } from "./viewer";
import { sampleState } from "./sample/store";
import type { SampleState, Scenario } from "./sample/seed";
import type { Viewer } from "./types";

/**
 * Integration boundary for workspace data.
 *
 * Pages read a `Workspace` and never touch storage directly. Only the sample
 * adapter exists today: it is clearly labelled in the UI ("Sample data") and
 * keeps changes in server memory. A production adapter should return the same
 * shape from the learning API/database and set `source` to "live".
 */
export type WorkspaceData = SampleState;
export type Workspace = {
  viewer: Viewer;
  source: "sample" | "live";
  scenario: Scenario;
  data: WorkspaceData;
};

export async function scenarioFor(): Promise<Scenario> {
  const value = (await cookies()).get(SCENARIO_COOKIE)?.value;
  return value === "new" ? "new" : "team";
}

export const loadWorkspace = cache(async (next = "/learner"): Promise<Workspace> => {
  const viewer = await requireViewer(next);
  const scenario = await scenarioFor();
  return { viewer, source: "sample", scenario, data: sampleState(viewer, scenario) };
});

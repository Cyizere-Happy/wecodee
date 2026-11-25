// Role dashboards (SRS §2.2): each role has its own route, and shared pages
// (notifications, settings) belong to the viewer's own dashboard.
import { test } from "node:test";
import assert from "node:assert/strict";
import { contextFor, homeFor, navContexts } from "../lib/workspace/nav.ts";

test("each role has its own dashboard route", () => {
  assert.equal(homeFor("learner"), "/learner");
  assert.equal(homeFor("supervisor"), "/supervisor");
  assert.equal(homeFor("admin"), "/admin");
});

test("dashboards are limited to their roles", () => {
  const roles = Object.fromEntries(navContexts.map((c) => [c.root, c.roles]));
  assert.deepEqual(roles["/learner"], ["learner"]);
  assert.deepEqual(roles["/supervisor"], ["supervisor", "admin"]);
  assert.deepEqual(roles["/admin"], ["admin"]);
});

test("a path resolves to the dashboard the viewer may use", () => {
  assert.equal(contextFor("/admin/users", "admin").root, "/admin");
  assert.equal(contextFor("/supervisor/teams", "admin").root, "/supervisor");
  assert.equal(contextFor("/learner/team", "learner").root, "/learner");
  assert.equal(contextFor("/notifications", "supervisor").root, "/supervisor");
  assert.equal(contextFor("/settings", "learner").root, "/learner");
  // Not a prefix match on similar names.
  assert.equal(contextFor("/administrator", "admin").root, "/admin");
  assert.equal(contextFor("/admin", "learner").root, "/learner");
});

test("every nav link sits inside its own dashboard or a shared page", () => {
  for (const c of navContexts) {
    for (const item of c.groups.flatMap((g) => g.items)) {
      assert.ok(item.href === c.root || item.href.startsWith(c.root + "/") || ["/notifications", "/settings"].includes(item.href), `${c.root}: ${item.href}`);
    }
  }
});

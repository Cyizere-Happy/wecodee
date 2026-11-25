import type { Role } from "./types";
import type { IconName } from "@/components/workspace/Icon";

export type NavItem = { href: string; label: string; icon: IconName; exact?: boolean; badge?: "notifications" | "reviews" };
export type NavGroup = { heading?: string; items: NavItem[] };
export type NavContext = {
  id: "learn" | "mentor" | "admin";
  label: string;
  description: string;
  root: string;
  roles: Role[];
  groups: NavGroup[];
};

export const navContexts: NavContext[] = [
  {
    id: "learn", label: "Learner", description: "Learn, build and showcase", root: "/learner", roles: ["learner"],
    groups: [
      { items: [{ href: "/learner", label: "Overview", icon: "home", exact: true }, { href: "/notifications", label: "Notifications", icon: "bell", badge: "notifications" }] },
      { heading: "Learn", items: [
        { href: "/learner/hot-topics", label: "Hot Topics", icon: "play" },
        { href: "/learner/articles", label: "Articles", icon: "book" },
        { href: "/learner/events", label: "Live events", icon: "calendar" },
        { href: "/learner/quiz", label: "Skills quiz", icon: "quiz" },
      ] },
      { heading: "Build", items: [
        { href: "/learner/team", label: "Team", icon: "users" },
        { href: "/learner/reports", label: "Daily reports", icon: "clipboard" },
        { href: "/learner/project", label: "Project", icon: "flag" },
      ] },
      { heading: "Showcase", items: [
        { href: "/learner/portfolio", label: "Portfolio", icon: "user" },
        { href: "/learner/certificates", label: "Certificates", icon: "award" },
      ] },
    ],
  },
  {
    id: "mentor", label: "Supervisor", description: "Teams you supervise", root: "/supervisor", roles: ["supervisor", "admin"],
    groups: [
      { items: [{ href: "/supervisor", label: "Overview", icon: "home", exact: true }, { href: "/notifications", label: "Notifications", icon: "bell", badge: "notifications" }] },
      { heading: "Supervise", items: [
        { href: "/supervisor/reviews", label: "Review queue", icon: "inbox", badge: "reviews" },
        { href: "/supervisor/teams", label: "Teams", icon: "users" },
      ] },
    ],
  },
  {
    id: "admin", label: "Admin", description: "Content, people and reports", root: "/admin", roles: ["admin"],
    groups: [
      { items: [{ href: "/admin", label: "Reports", icon: "chart", exact: true }, { href: "/notifications", label: "Notifications", icon: "bell", badge: "notifications" }] },
      { heading: "People", items: [
        { href: "/admin/users", label: "Users", icon: "user" },
        { href: "/admin/teams", label: "Teams & formation", icon: "users" },
        { href: "/admin/certificates", label: "Certificates", icon: "award" },
      ] },
      { heading: "Content", items: [
        { href: "/admin/hot-topics", label: "Hot Topics", icon: "play" },
        { href: "/admin/articles", label: "Articles", icon: "book" },
        { href: "/admin/quiz", label: "Quiz bank", icon: "quiz" },
        { href: "/admin/milestones", label: "Milestones", icon: "flag" },
        { href: "/admin/events", label: "Events", icon: "calendar" },
      ] },
      { heading: "Platform", items: [
        { href: "/admin/settings", label: "Platform settings", icon: "sliders" },
        { href: "/admin/audit", label: "Audit log", icon: "history" },
      ] },
    ],
  },
];

/** Each SRS role has its own dashboard. A team leader is a learner, with leader tools on the team page. */
export const ROLE_HOME: Record<Role, string> = { learner: "/learner", supervisor: "/supervisor", admin: "/admin" };

export function homeFor(role: Role) {
  return ROLE_HOME[role];
}

const within = (pathname: string, root: string) => pathname === root || pathname.startsWith(root + "/");

/** The dashboard a path belongs to. Shared pages (notifications, settings) use the viewer's own dashboard. */
export function contextFor(pathname: string, role: Role) {
  const owned = navContexts.find((c) => within(pathname, c.root) && c.roles.includes(role));
  return owned ?? navContexts.find((c) => c.root === homeFor(role))!;
}

export const accountItems: NavItem[] = [{ href: "/settings", label: "Settings", icon: "settings" }];

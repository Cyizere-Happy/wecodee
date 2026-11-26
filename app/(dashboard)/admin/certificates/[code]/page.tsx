// Admins view any certificate inside their own dashboard; the page checks ownership or the admin role.
export { default } from "../../../learner/certificates/[code]/page";

// Session-bound page: allowed to block on navigation (see the dashboard layout).
export const instant = false;

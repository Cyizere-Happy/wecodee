# WeCodee visual coverage

This audit follows the App Router routes and the shared states rendered around them. The project and review sequences follow SRS §5.1–5.4. Learning, assessment, placement, operations, and public verification follow SRS §3–6. Sample data is identified as such in the app.

| Route | User task and current friction | Visual narrative and layout | Art or interaction | Implementation |
| --- | --- | --- | --- | --- |
| `/` | Understand what building with WeCodee looks like. The chapters compete with promotional copy. | Keep the mascot-led journey and make the developer–assistant exchange visible beside it. | Existing animation and prompt deck | Implemented |
| `/login` | Return to work. The art and wording tell parallel stories. | Unlock the workspace beside the sign-in form. | Existing door animation | Implemented |
| `/signup` | Create an account and see what follows. Verification is only visible after submitting. | Show account, email confirmation and profile as a short path. | Existing workspace preparation animation | Implemented |
| `/forgot-password` | Request a recovery link. The next steps are implicit. | Connect request, inbox and password change. | Existing search-for-key animation | Implemented |
| `/reset-password` | Replace a password or recover from an expired link. | Highlight the current step in recovery and give expired links a direct route back. | Existing lock and hourglass art | Implemented |
| `/verify-email` | Open or resend a confirmation link. Form and receipt can look alike. | Connect the account to the email confirmation and sign-in stages. | Existing envelope and verified art | Implemented |
| `/workspace` | Reach the workspace for the signed-in role. | Direct routing with no intermediate screen. | Server redirect | Existing |
| `/learner` | Identify the next action and progress. Counts can read as disconnected. | Keep the state-aware next step and connect learning, placement and project progress. | Existing mascot guidance and milestone path | Implemented |
| `/learner/hot-topics` | Pick a topic or return to one. Text-first entries look alike. | Lead with large illustrated covers and concept trails, with completion and duration beside each title. | Ten topic-specific covers and progress filters | Implemented |
| `/learner/hot-topics/[id]` | Understand a concept, finish the lesson and try it. The same flow leads every topic. | Open with a topic-specific exercise, then show lesson completion and the remaining actions. | Eight milestone studios, form interaction and SQL join comparison | Implemented |
| `/learner/articles` | Find a short read or return to a saved one. List rows carry little visual meaning. | Use large illustrated covers and keep one concise line of reading metadata. | Subject-specific covers and save controls | Implemented |
| `/learner/articles/[slug]` | Apply a written concept. Examples sit apart from the prose. | Place evidence, measurable requirements, low-data choices or AI coaching beside the associated paragraphs. | Native comparisons and AI editorial art | Implemented |
| `/learner/events` | Find and register for a session. Upcoming dates are buried in labels. | Give the next session an illustrated reservation scene. Use date markers and capacity for quick comparisons. | Event-seat illustration, calendar dates and capacity meter | Implemented |
| `/learner/quiz` | Understand the quiz, answer questions and see placement. Progress and scoring are text-heavy. | Practice scenario outside the exam, question progress during it and skill thresholds after it. | Native simulation and quiz progress | Implemented |
| `/learner/team` | Understand who does what and where the project stands. Tasks and member rows are disconnected. | Connect actual role assignments and contributions to the current deliverable. Show placement or group setup when needed. | Team assembly diagram and bespoke team art | Implemented |
| `/learner/reports` | File a daily report and see what the team has done. The grid shows attendance more clearly than output. | Put today’s action beside a fourteen-working-day hours history and keep the member grid. Show where the first report will land for learners waiting for a team. | Hours bars, report grid and new empty-state art | Implemented |
| `/learner/project` | Start a team project or find the current milestone. The progress path can be detached from the next action. | Connect team setup, the active milestone and the building sequence. | Existing path and workflow rail | Implemented |
| `/learner/project/[order]` | Learn, prepare, submit or revise the current deliverable. | Distinct lessons for Problem understanding, Project proposal, Requirements (SRS), System design, Implementation, Testing, Deployment and Final presentation. Show contribution and review history beside the work. | Eight existing interactive studios and review art | Implemented |
| `/learner/portfolio` | Publish or preview evidence of work. Projects and recognition read as separate lists. | Assemble project, role and outcomes into a showcase with visibility preview. | Editorial project art and existing contribution data | Implemented |
| `/learner/certificates` | See earned and pending recognition. Eligibility is explained largely in sentences. | Show project completion and the six-of-eight contribution threshold. | Eligibility comparison and existing certificate art | Implemented |
| `/learner/certificates/[code]` | Read, print or share a certificate. The verification action is visually separate from the award. | Keep the printable certificate central with a clear validity indicator. | Existing certificate and native verification status | Implemented |
| `/supervisor` | Decide what needs attention. Totals mix queues and statuses. | Show actionable work by type and retain the oldest-first queues. | Live counts and existing mentorship workflow | Implemented |
| `/supervisor/reviews` | Open the next submission. The table does not show what happens after opening it. | Make the oldest-first queue and feedback/revision loop visible. | Workflow rail and age/status cues | Implemented |
| `/supervisor/reviews/[projectId]/[order]` | Check evidence and decide whether to approve. It is easy to lose context between iterations. | Connect submission, checklist and decision with version history. Show when the review has been sent. | Interactive decision preview, live checklist and new feedback art | Implemented |
| `/supervisor/teams` | Compare assigned teams. Status badges do not explain overall progress. | Show team status distribution and each current milestone. | Data breakdown and compact milestone meters | Implemented |
| `/supervisor/teams/[id]` | Review setup, roles and activity for a team. Reporting and progress read separately. | Show the current deliverable, team reporting timeline and latest blockers. | Existing milestone path and report grid, daily hours bars | Implemented |
| `/admin` | Understand platform health and export evidence. Many metrics have the same weight. | Compare real workspace counts for readiness, teams and engagement above the detailed reports. | Labelled bars and existing exports | Implemented |
| `/admin/users` | Manage accounts and permissions. Role relationships are hard to scan. | Keep the role access and account setup diagram beside the actual role mix. | Existing role guidance and data breakdown | Implemented |
| `/admin/teams` | Preview teams and assign supervision. Eligibility and formation rules are buried in the introduction. | Show pool, matching and supervisor assignment as a flow with actual team status. | Native workflow and distribution | Implemented |
| `/admin/hot-topics` | Find lessons that are ready or need work. Publication appears only in table cells. | Scan the publication mix and see lesson readiness in each row. | Counts and checklist marks | Implemented |
| `/admin/hot-topics/[id]` | Prepare or update a lesson. The editing form and check questions operate in separate regions. | Show the draft, check and publish sequence with readiness feedback. Includes the `/new` state. | Existing publish art and native checklist | Implemented |
| `/admin/articles` | Edit or publish an article. Status and reading scope are hard to compare. | Show draft/published mix and word-limit progress while keeping compact editing controls. | Native count bar and meters | Implemented |
| `/admin/quiz` | Maintain enough current questions at each level. Counts do not show coverage. | Compare the active bank by level, with the assessment workflow next to it. | Data distribution | Implemented |
| `/admin/milestones` | Edit the default project path. Template impact is described in a paragraph. | Show the eight deliverables as a connected sequence before the editors. | Native workflow | Implemented |
| `/admin/events` | Schedule, publish, complete or cancel sessions. Calendar order and lifecycle are hard to see. | Tie calendar markers and registration counts to actual events and show allowed workflow stages. | Date tiles and status distribution | Implemented |
| `/admin/certificates` | Find issued or revoked certificates. Status requires reading each row. | Show valid/revoked mix and when a project qualifies for issuance. | Data distribution and eligibility workflow | Implemented |
| `/admin/certificates/[code]` | Inspect a specific certificate. Issuance and revocation facts are separated. | Show the printable certificate and its status history. Keep revocation in the admin list. | Existing certificate and native status track | Implemented |
| `/admin/settings` | Understand the effect of a settings change. Inputs alone obscure dependencies. | Keep the existing rules diagram and anchor settings to their areas of impact. | Existing control art and section links | Implemented |
| `/admin/audit` | Follow changes by time and actor. Repeated timestamps obscure event order. | Keep the table and add day markers and an activity distribution. | Date tiles and grouped counts | Implemented |
| `/notifications` | Find unread activity and the action it requires. Rows are difficult to differentiate. | Distinguish unread from read and use action-specific icons and timestamps. | Unread breakdown and existing empty art | Implemented |
| `/settings` | Complete onboarding or manage account and preferences. Settings are deep and sections look alike. | Show onboarding completion and link directly to profile, readiness, preferences and password. | Status steps and native navigation | Implemented |
| `/u/[username]` | Understand the builder's projects and verify achievements. Projects, roles and proof are scattered. | Group project status and roles with links to verify existing recognition. | Native showcase and project status breakdown | Implemented |
| `/verify` | Check a certificate code. The method and possible outcomes are abstract. | Show the code-to-record check beside the existing form. | Native verification flow | Implemented |
| `/verify/[code]` | Confirm whether the certificate matches, is revoked or is absent. | Make the status and credential evidence legible at a glance, with the retry action nearby. | Native outcome track | Implemented |
| Error, not found, loading, offline, denied | Understand what interrupted the task and how to resume. | Tie each status to an actionable recovery step. Keep loading skeletons close to the layout they represent. | Existing state-specific artwork and recovery controls | Implemented |

## Asset references

- `public/brand/sheep-mark.png` anchors the sheep’s face and headphones. `public/illustrations/mascot/lessons/srs-interface.webp` and `public/posters/auth/login-still.webp` show the full outfit.
- `public/posters/ai-end.webp` and `public/Mascots_collaborating_on_code_an…_36e587cc_1080p.mp4` show the two original characters together. Claude is used only in an external AI-assisted learning context.
- Existing lesson assets cover all eight milestone stories. Existing authentication, review, publishing, and error assets are reused in their original contexts.

## New illustration assets and prompts

The built-in GPT Image tool used the source references listed below. The WebP files are in `public/illustrations/mascot/stories/`. Sizes include the alpha channel for transparent cutouts.

| Asset | Use | References in addition to `brand/sheep-mark.png` | WebP size |
| --- | --- | --- | --- |
| `team-assembly.webp` | Current team roles converge on one deliverable | `lessons/srs-interface.webp`, `learner/team.webp` | 84 KB |
| `form-label.webp` | The native label/input experiment | `lessons/srs-interface.webp` | 43 KB |
| `ai-review.webp` | The external AI debugging example in the coaching article | `posters/auth/login-still.webp`, `posters/ai-end.webp` | 48 KB |
| `portfolio-shelf.webp` | Private and public portfolio showcase | `lessons/presentation.webp`, `learner/portfolio.webp` | 66 KB |
| `report-empty.webp` | Reporting before team placement | `lessons/srs-interface.webp`, `states/waiting.webp` | 55 KB |
| `review-filed.webp` | Confirmation after saving a review decision | `lessons/srs-interface.webp`, `supervisor/decision.webp` | 48 KB |
| `data-joins.webp` | SQL topic cover and interactive row matching | `lessons/srs-interface.webp`, `lessons/architecture.webp` | 71 KB |
| `small-data.webp` | Low-data article cover and comparison | `lessons/srs-interface.webp`, `lessons/implementation.webp` | 56 KB |
| `event-seat.webp` | The next upcoming live session | `lessons/srs-interface.webp`, `learner/lesson.webp` | 76 KB |

### Shared prompt for learning and showcase illustrations

> Use case: illustration-story. Identity reference only. Preserve the exact original small WeCodee sheep: round fluffy cloud fringe, black oval eyes, pink ears, oversized red/black headphones, red varsity jacket with black and white trim, black gloves and shorts, red-white sneakers. Match reference silhouette, clean dark contour, 2D shading and proportions. Premium industrial technology objects, restrained red/ink/warm-white palette, no gradients, no text, no numbers, no lettering, no extra characters, no watermark. Asset for a compact responsive editorial composition with native HTML alongside. Keep all elements in frame with useful exterior breathing room.

### Learning and showcase scenes appended to the shared prompt

- **Team assembly**

  Wide, truly transparent illustrated cutout. Show how separate contributions become one working application. The sheep crouches and physically slides one small red interface-like module into an elegant partially assembled graphite-and-white console, with two other differently shaped functional modules already seated. Visible empty slot and the action of assembly are the focal points. Keep the sheep on the left half facing toward the assembly at right, no floating confetti, no extra widgets.
- **Form label**

  Wide, truly transparent illustrated cutout for learning about accessible HTML forms. The sheep connects a small blank pill-shaped label plaque to a blank precision input housing using one clean visible red connector, their gloved hand touching the connection. Both objects look like precise desktop technology components, no glyphs on the plaque or field. Frame the full figure and the two connected objects with the sheep at left.
- **AI review**

  The Claude reference is the only additional character allowed. Wide 3:2 editorial scene on nearly white seamless warm studio background. Exact orange pixel-art Claude from last reference with black eyes, tiny black laptop and coffee, preserving visibly pixelated edges; its style must contrast with the sheep’s premium 2D style. Show the sheep testing a corrected program on a compact monitor after reviewing the unexpected result with Claude. One small red indicator and one discrete green check on the monitor can show before/after, no text. Sheep remains the leading character, Claude stays visibly smaller and secondary. No company logos or partnership visual language.
- **Portfolio shelf**

  Wide, truly transparent editorial cutout. The small sheep places a finished red and charcoal software screen into a precise aluminum showcase with two existing pieces of evidence: a tiny abstract project thumbnail and a folded award document with a discreet seal. Communicate the specific action of curating finished work. Keep the figure and shelf proportional, no trophy, no unnecessary objects.

### Shared prompt for state illustrations

> Use case: illustration-story. Identity reference only. Preserve the exact original small WeCodee sheep: round fluffy cloud fringe, black oval eyes, pink ears, oversized red/black headphones, red varsity jacket with black and white trim, black gloves and shorts, red-white sneakers. Match reference silhouette, clean dark contour, 2D shading and proportions. Premium industrial technology objects, restrained red/ink/warm-white palette, no gradients, no text, no numbers, no lettering, no extra characters, no watermark. A compact wide editorial cutout on a truly transparent background, with complete subject and exterior breathing room. All interface labels and states will be rendered as native HTML.

### State scenes appended to the shared prompt

- **Empty report tray**

  Use as the empty state for a learner who has not yet been placed in a team. Show the sheep sliding open an empty slim hardware tray beneath a small, blank calendar grid machined into a graphite-and-ivory desktop reporting station. One red date square and empty tray show where the first report will go. Sheep handles the tray, with patient interest rather than disappointment. No warning signs, no additional props.
- **Review filed**

  Use as successful feedback after a supervisor records a review. The sheep deliberately slots a single small white review document with one red bookmark into the outbox of a precisely designed graphite-and-ivory document station. A neutral white completion light shows that the feedback has been sent. The review can be an approval or a request for changes, so avoid green approval ticks, flags or a trophy. Full figure in an open, uncluttered composition.

### Shared prompt for larger editorial illustrations

> Use case: illustration-story. Use the supplied original references for the WeCodee sheep's exact identity, clothing, proportions, 2D rendering, and red-black-white palette. Same fluffy white fringe, black oval eyes, pink ears, large red-black headphones, red varsity jacket, black gloves and shorts, red-white sneakers. Premium precise industrial objects with clear visual roles, no words, digits, lettering, logos, or watermark. Complete wide composition with truly transparent background and modest exterior breathing room. This is editorial art accompanying a native diagram, so simplify to one visually intelligible action.

### Larger editorial scenes appended to the shared prompt

- **Data joins**

  The sheep pulls a matched record tile from two separate compact, precision-machined stacks onto a shared white output tray. One stack has three circular identifier tiles; another holds two red connector tiles. Two visibly matching pairs align in the output tray, with empty space appropriate for an unmatched record. Focus on the sheep's hand and connected pieces. Side-on 3/4 angle, restrained, no extra scenery.
- **Small data**

  The sheep picks up only one small red update module and inserts it into a slim portable computer, next to a visibly larger intact stack of graphite-and-white repository modules. Show that the large stack stays put while the small change travels to the computer. Use a clean horizontal silhouette, the focused practical demonstration of a small Git update, with no disconnected visual ornaments.
- **Event seat**

  The sheep inserts a single red registration ticket into a compact wide graphite video-conference terminal with blank participant tiles. One waiting slot is now filled on the screen, visually showing a reservation becoming a seat in a live session. The sheep is visibly interacting with the slot. Use no other characters, furniture, logos, decorative confetti, or lettering.

## Browser verification

All 44 page definitions are represented above. Chromium checked 78 sample route and state combinations at 1440, 820, and 390 pixels, including both learner journeys, all eight milestone lessons, the ten built-in Hot Topics, and the public certificate outcomes.

Interaction checks covered keyboard navigation in the landing example, signup validation, the HTML and SQL demos, AI coaching, lesson filtering, the requirements walkthrough, ungraded quiz practice, live review checklist progress, a recorded sample review, and public verification. The review check restored the preview data after submission.

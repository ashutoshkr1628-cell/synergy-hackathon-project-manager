# Synergy OS — Section File Index

All source files split by section for easy reference and editing.
The master files (synergy.html, styles.css, app.js) are the live versions.

---

## HTML Sections — `sections/html/`

| File | Lines | Content |
|------|-------|---------|
| `01-head.html` | 1–12 | DOCTYPE, `<head>`, Google Fonts, CSS `<link>` tags |
| `02-sidebar.html` | 22–103 | Sidebar: logo, team status, nav menu, deadline countdown |
| `03-header.html` | 107–214 | App header bar, env mode badge, role selector, urgency banner, demo banner |
| `04-tab-dashboard.html` | 216–485 | Dashboard tab: metrics grid, badges shelf, analytics charts, VCS widget, checklist |
| `05-tab-tasks.html` | 487–553 | Task Manager tab: filters, Kanban board (4 columns) |
| `06-tab-parcel-sync.html` | 555–653 | Parcle Sync tab: sync ring, terminal logger, parcel history table |
| `07-tab-deploy-submission.html` | 655–829 | Deploy & Submission tab: env selector, deploy form, preview device, submission form |
| `08-tab-leaderboard.html` | 831–907 | Leaderboard tab: podium cards + full table |
| `09-tab-admin-console.html` | 909–1022 | Admin Console tab: pending teams, audit log, settings, fault injection |
| `10-chat-drawer.html` | 1028–1053 | Team collaboration chat drawer (slide-in panel) |
| `11-modals.html` | 1054–1226 | All modal overlays: intro, task, team edit, add member, leaderboard detail |
| `12-toast-scripts.html` | 1227–1232 | Toast hub div + `<script>` tags |

---

## CSS Sections — `sections/css/`

| File | Lines | Content |
|------|-------|---------|
| `01-variables.css` | 1–59 | CSS custom properties (dark + light theme tokens, layout constants) |
| `02-base.css` | 60–109 | Base reset, scrollbars, glowing backdrop decorations |
| `03-layout.css` | 110–210 | App container, sidebar, header, workspace layout |
| `04-notifications.css` | 191–232 | Notifications dropdown, tab panel controller |
| `05-dashboard.css` | 233–346 | Metric cards, badge shelf, analytics charts, team profile, activity timeline |
| `06-tasks.css` | 347–396 | Task filter controls, Kanban board columns, task card styles |
| `07-parcel-sync.css` | 397–474 | Parcel grid, sync ring, terminal logger, data table |
| `08-deploy.css` | 475–537 | Deploy layout, preview device mockup, submission portal |
| `09-leaderboard.css` | 538–557 | Leaderboard podium (gold/silver/bronze), list panel |
| `10-components.css` | 558–653 | Buttons, badges, modal overlay system, forms, chat drawer, toast |
| `11-animations.css` | 654–1030 | All @keyframes + v1.2 gamification + urgency animations |
| `12-env-mode.css` | 1031–1113 | Env mode badge, demo mode banner, disabled button feedback |

---

## JavaScript Sections — `sections/js/`

| File | Lines | Content |
|------|-------|---------|
| `01-state.js` | 1–80 | `DEFAULT_STATE` object, `appState` var, competitor data |
| `02-utils.js` | 81–154 | `getUUID`, `showToast`, `loadData`, `saveData`, `openModal`, `closeModal`, `awardBadge` |
| `03-standings.js` | 155–192 | `calculateStandings()` — score engine, rank calculation |
| `04-rbac.js` | 193–301 | `renderUI`, `renderNotifications`, `applyRBACRole` (Developer/Mentor/Admin) |
| `05-render-dashboard.js` | 302–474 | `renderDashboard`, `renderTeamRoster` |
| `06-render-tasks.js` | 476–548 | `renderTasks` (Kanban board with drag-and-drop) |
| `07-render-parcel.js` | 550–601 | `renderParcleSync` (sync ring, terminal, history table) |
| `08-render-deploy.js` | 602–747 | `renderDeploySubmission` (deploy form, preview device, submission status) |
| `09-render-leaderboard.js` | 748–828 | `renderLeaderboard` (podium + full table) |
| `10-chat.js` | 829–843 | `renderChatMessages`, `triggerChatReply` (AI-style auto-replies) |
| `11-theme.js` | 830–843 | `initTheme` (dark/light mode persistence) |
| `12-events.js` | 844–1507 | `setupEventListeners` — all button/form/drag-and-drop handlers |
| `13-gamification.js` | 1508–1595 | `initClock`, `initDeadlineCountdown`, `showUrgencyBanner`, `updateScoreLevel`, `updateBadgeProgress` |
| `14-admin.js` | 1596–1866 | Team registration, admin approval, audit log, `renderPendingTeams`, `approveTeam`, reject modal |
| `15-env-mode.js` | 1868–2016 | `DEMO_SNAPSHOT`, `activateDemoMode`, `deactivateDemoMode`, `activateOnlineMode`, `updateEnvModeUI` |
| `16-init.js` | 2017–2085 | `initApp`, `document.readyState` check (supports both DOMContentLoaded and document.write) |

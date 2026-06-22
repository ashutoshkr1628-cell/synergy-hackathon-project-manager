/**
 * SYNERGY - Hackathon Project Manager Core Application Logic v1.1.0
 * Implements advanced features: Real-time Collaboration Chat, SVG Analytics,
 * Gamification Badges, Staging/Production Deployments, and RBAC views.
 */

// --- Default State ---
const DEFAULT_STATE = {
  theme: "dark",
  activeRole: "developer",
  team: {
    name: "Team Alpha",
    slogan: "Building the future, one parcel at a time.",
    score: 120,
    rank: 4,
    hasDeployedStaging: false,
    hasDeployedProd: false
  },
  members: [
    { name: "Ashutosh Kumar", role: "Lead Developer" },
    { name: "Aria Chen", role: "Backend Engineer" },
    { name: "Max Kowalski", role: "UI/UX Designer" }
  ],
  tasks: [
    { id: "task-1", title: "Setup Base Project Scaffold", description: "Initialize directory structures, configure index.html viewport meta, and prepare global CSS reset scripts.", priority: "High", assignee: "Max Kowalski", category: "Design", status: "completed" },
    { id: "task-2", title: "Design Parcle Sync Architecture", description: "Establish model specifications for local storage packaging, synchronization payloads, and connection endpoints.", priority: "High", assignee: "Aria Chen", category: "Backend", status: "completed" },
    { id: "task-3", title: "Implement Kanban Board Interactivity", description: "Hook up drag-and-drop DOM listeners, card state transitions, and save updates to cache on drop actions.", priority: "Medium", assignee: "Ashutosh Kumar", category: "Frontend", status: "progress" },
    { id: "task-4", title: "Configure Enter Pro Pipeline Script", description: "Draft automation scripts simulating code bundlers, dependency installs, file compiler steps, and deployment alerts.", priority: "High", assignee: "Ashutosh Kumar", category: "Frontend", status: "todo" },
    { id: "task-5", title: "Write Documentation & Walkthrough", description: "Create implementation logs, record video explanations, and organize slide deck resources.", priority: "Low", assignee: "Max Kowalski", category: "Docs", status: "todo" }
  ],
  parcels: [
    { id: "prc-e7f8", size: "4.2 KB", type: "Full State", time: "10 mins ago", status: "Success" },
    { id: "prc-9a1b", size: "1.8 KB", type: "Task Delta", time: "1 hour ago", status: "Success" }
  ],
  deployments: [],
  submission: {
    projectTitle: "",
    tagline: "",
    githubUrl: "",
    videoUrl: "",
    deckUrl: "",
    status: "draft",
    mentorRatingUX: 8,
    mentorRatingCode: 8,
    mentorComments: ""
  },
  notifications: [
    { id: "not-1", title: "Welcome to Synergy", desc: "Start tracking your project progress, sync data by parcel and deploy demos using Enter Pro.", time: "Just now", type: "info" }
  ],
  competitors: [
    { name: "DevDynamo", score: 320, tasksDone: 10, tasksTotal: 12, syncs: 14, deployed: true, status: "submitted", members: ["Sarah (Dev)", "Liam (Design)", "Kofi (PM)"], project: "Dino-Chatbot App", tagline: "Revolutionizing user feedback with AI dinosaurs.", mentorNotes: "Innovative pitch deck. Tech stack is stable." },
    { name: "Quantum Coderz", score: 280, tasksDone: 8, tasksTotal: 11, syncs: 8, deployed: true, status: "submitted", members: ["Yuki (Dev)", "Elena (Algo)", "Omar (Dev)"], project: "Quantum Safe Ledger", tagline: "Securing block transfers with post-quantum key cryptography.", mentorNotes: "Ambitious goal, offline sync model works well." },
    { name: "Byte Busters", score: 245, tasksDone: 7, tasksTotal: 10, syncs: 10, deployed: true, status: "review", members: ["Alex (Frontend)", "Tariq (Backend)"], project: "MealByte", tagline: "Reducing food waste using peer-to-peer parcel matching.", mentorNotes: "Good MVP. Presentation deck requires cleanup." },
    { name: "Binary Bosses", score: 110, tasksDone: 3, tasksTotal: 9, syncs: 4, deployed: false, status: "draft", members: ["Chloe (Fullstack)", "Ben (Docs)"], project: "GitBoss Admin Panel", tagline: "Custom web portal interfaces for server command nodes.", mentorNotes: "Basic CRUD, needs integration of real sync models." },
    { name: "Pixel Pioneers", score: 95, tasksDone: 2, tasksTotal: 10, syncs: 3, deployed: false, status: "draft", members: ["Raj (Designer)", "Mila (Illustrator)"], project: "ArtSpace VR", tagline: "Visual gallery grids embedded directly inside sandboxes.", mentorNotes: "Outstanding styling aesthetics. Functional features are limited." }
  ],
  chatMessages: [
    { sender: "Aria Chen", text: "Hey team, welcome to our Synergy collaboration channel!", time: "16:10", type: "received" },
    { sender: "Max Kowalski", text: "I just uploaded the wireframe models to staging. Check the deploy tab!", time: "16:15", type: "received" }
  ],
  badges: {
    "fast-fixer": false,
    "sync-master": false,
    "staging-pioneer": false,
    "production-ready": false,
    "polished-pitch": false
  },
  githubRepo: { connected: false, url: "", commits: [] },
  hasUnsyncedChanges: false,
  adminDeadline: "2026-06-21T18:00",
  adminAutosync: 60,
  adminAllowLate: true,
  shouldSyncFail: false,
  shouldBuildFail: false,
  environmentMode: "online"   // "offline" | "demo" | "online"
};

let appState = {};
let taskMoveTime = null;


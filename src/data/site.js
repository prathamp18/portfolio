// ─────────────────────────────────────────────────────────────
//  All portfolio content lives here. Edit this file to update
//  the site — components read from it, nothing is hard-coded.
// ─────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (p) => `${BASE}/${p.replace(/^\//, "")}`;

export const PROFILE = {
  name: "Pratham Patel",
  first: "Pratham",
  initials: "PP",
  roles: [
    "Software Engineer",
    "AI / ML Engineer",
    "LLM Systems Builder",
    "Backend & Cloud Engineer",
  ],
  tagline:
    "Computer Science at York University (Lassonde). I build AI systems that replace hours of manual work — and the evaluation loops, context layers and infrastructure that make them reliable in production.",
  location: "Toronto, ON",
  grad: "May 2027",
  email: "patelpratham1218@gmail.com",
  github: "https://github.com/prathamp18",
  githubUser: "prathamp18",
  linkedin: "https://www.linkedin.com/in/pratham-patel18",
  resume: "Pratham_Patel_Resume.pdf",
  photo: null, // drop a photo in /public (e.g. "pratham.jpg") and put its file name here
  openTo: "Winter 2027 internships · New-grad full-time, Summer 2027",
  focus: "SWE · AI/ML · Data · Quant",
  languages: ["English", "Gujarati", "Hindi"],
};

// Impact numbers — every one is from shipped, measured work
export const STATS = [
  { value: "80", suffix: "%", label: "less QA test-authoring time with an LLM platform on AWS Bedrock" },
  { value: "90", suffix: "%", label: "intent-recognition accuracy on a Copilot-style agent" },
  { value: "40", suffix: "%", label: "faster auto-insurance quotes via an agentic chatbot" },
  { value: "200", suffix: "+", label: "regression tests automated across Guidewire systems" },
  { value: "4", suffix: "×", label: "F1 over scikit-learn baseline — logistic regression from scratch" },
  { value: "150", prefix: "<", suffix: "ms", label: "async FastAPI latency on live radar data (AeroPath)" },
];

export const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "ai", label: "AI Agents" },
  { key: "ml", label: "Machine Learning" },
  { key: "systems", label: "Backend & Algorithms" },
  { key: "fullstack", label: "Full-stack" },
];

const GH = "https://github.com/prathamp18";

/*
  `cover` picks the generative artwork on each card (see ProjectCover.js):
    llm · rag · chat · astar · fraud · tests · booking · ticker
  `arch` is the architecture pipeline drawn in the case-study view.
*/
export const PROJECTS = [
  {
    id: "detourto",
    title: "DetourTO",
    category: "ai",
    featured: true,
    where: "EECS 3311 · York University",
    date: "Fall 2026",
    metric: { value: "8", label: "design patterns · Stage 1 done" },
    tagline: "A disruption-aware TTC trip-planning agent. Ask in plain English; when a line closes, it re-plans before you reach the platform.",
    problem:
      "Transit apps plan the trip you asked for, then go quiet when a line closes — riders find out at the platform. And an LLM left to plan routes on its own will happily invent a stop that doesn't exist.",
    points: [
      "A deterministic Java planner (RAPTOR) computes real itineraries from the TTC's published GTFS schedule; an LLM agent (Claude on Amazon Bedrock, Converse API tool use) reads free-text service alerts and re-plans around closures.",
      "The agent proposes, the Java code verifies: every stop, route and time a rider sees is computed by the planner and checked by a GroundingValidator — never taken from model text.",
      "Designed around 8 GoF patterns (Facade, Observer, Command, State, Template Method, Strategy, Adapter, Decorator) with 13 feature specs and 11 sequence diagrams; JavaFX GUI + picocli CLI, JUnit 5 and KUMA agent tests planned.",
    ],
    arch: ["\"York U by 10, no streetcars\"", "TransitAgent · Claude", "Tool calls", "RAPTOR planner", "GroundingValidator", "Itinerary + live alerts"],
    stack: ["Java 21", "AWS Bedrock", "Claude", "RAPTOR", "GTFS-Realtime", "JavaFX", "SQLite", "JUnit 5"],
    repo: "https://github.com/prathamp18/EECS3311-DetourTO",
    demo: null,
    cover: "transit",
    note: "In progress · design complete",
  },
  {
    id: "aeropath",
    title: "AeroPath AI",
    category: "systems",
    featured: true,
    where: "Personal project",
    date: "2025",
    metric: { value: "−40%", label: "path computation time" },
    tagline: "Flight routing that steers around live storms — A* on a sphere, fed by NOAA and radar data.",
    problem:
      "Shortest-path routing on a globe is easy until weather moves. Routes need to avoid live storm polygons and still come back fast enough to redraw on a map.",
    points: [
      "Custom A* graph search with a Haversine great-circle heuristic; 40% faster path computation over large geospatial datasets.",
      "NOAA SIGMET polygons + Shapely collision detection for real-time airspace validation — 30% better storm avoidance.",
      "Async FastAPI backend aggregating live RainViewer radar at sub-150 ms; avionics-style React + Leaflet UI with live route overlays.",
    ],
    arch: ["NOAA SIGMET + radar", "Async FastAPI", "Shapely collision", "A* · Haversine h(n)", "React + Leaflet"],
    stack: ["Python", "FastAPI", "A*", "Shapely", "React", "Leaflet", "NOAA API"],
    repo: GH,
    demo: "#playground",
    demoLabel: "Try the A* demo",
    cover: "astar",
  },
  {
    id: "fraud",
    title: "Credit Card Fraud Detection",
    category: "ml",
    featured: false,
    where: "Personal project",
    date: "2025",
    metric: { value: "4×", label: "F1 vs. scikit-learn (0.11 → 0.45)" },
    tagline: "Logistic regression written from scratch — no ML libraries — on 284K heavily imbalanced transactions.",
    problem:
      "Fraud is 0.2% of transactions. An off-the-shelf model can hit 99.8% accuracy by predicting \"not fraud\" every time — useless.",
    points: [
      "Gradient descent, sigmoid activation and binary cross-entropy implemented by hand in NumPy.",
      "Preprocessing pipeline: stratified sampling, mean imputation, min-max and z-score scaling for stable convergence over 1,000 epochs.",
      "F1 went from 0.11 to 0.45 — a 4× improvement over the scikit-learn baseline.",
    ],
    arch: ["284K transactions", "Stratified sample", "Impute + scale", "GD · sigmoid · BCE", "Threshold + F1"],
    stack: ["Python", "NumPy", "Pandas", "Scikit-learn", "Logistic Regression"],
    repo: GH,
    demo: "#playground",
    demoLabel: "Train one live",
    cover: "fraud",
  },
  {
    id: "trading-buddy",
    title: "Trading Buddy",
    category: "fullstack",
    featured: false,
    where: "Personal project",
    date: "2024",
    metric: { value: "Live", label: "listings + market news" },
    tagline: "A stock-market platform with dynamic listings, real-time market news and community threads.",
    problem: "New investors bounce between five tabs to follow a stock. One place for quotes, news and discussion.",
    points: [
      "Dynamic stock listings and real-time market news through a Node.js / Express backend.",
      "JWT authentication across multi-page navigation.",
      "Community features designed to keep users engaged between trades.",
    ],
    arch: ["Market APIs", "Express server", "JWT auth", "JS front end"],
    stack: ["JavaScript", "Node.js", "Express", "JWT"],
    repo: GH,
    demo: null,
    cover: "ticker",
  },
];

export const SKILLS = [
  {
    group: "AI & ML",
    key: "ai",
    items: ["AWS Bedrock", "Claude", "Prompt Chaining", "RAG", "Agentic AI", "Intent Classification", "Model Evaluation", "LSTM", "TensorFlow", "Scikit-learn", "NumPy", "Pandas"],
  },
  {
    group: "Languages",
    key: "lang",
    items: ["Python", "Java", "TypeScript", "JavaScript", "C/C++", "SQL", "Bash"],
  },
  {
    group: "Frameworks",
    key: "fw",
    items: ["Spring Boot", "React", "Angular", "Node.js", "FastAPI", "Flask", "Redux", "Tailwind"],
  },
  {
    group: "Cloud & DevOps",
    key: "cloud",
    items: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "CI/CD", "Redis", "Azure DevOps", "Bitbucket"],
  },
  {
    group: "Testing & Tools",
    key: "tools",
    items: ["Karate", "Selenium", "Postman", "SoapUI", "JIRA", "Git", "Guidewire", "Power BI", "Linux"],
  },
];

export const COURSEWORK = [
  "Data Structures & Algorithms",
  "Artificial Intelligence",
  "Machine Learning",
  "Computer Vision",
  "Operating Systems",
  "Database Systems",
  "Data Mining",
  "Software Testing",
  "Web Development",
];

// Rendered as a git log — newest commit on top
export const TIMELINE = [
  {
    hash: "a7b0c26",
    branch: "main",
    kind: "Experience",
    title: "Software Engineer Intern, AI & Automation",
    org: "Aviva Canada",
    logo: "aviva.png",
    place: "Markham, ON",
    date: "Jan 2026 – Aug 2026",
    points: [
      "Cut test-authoring time 80% with an end-to-end GenAI platform on AWS Bedrock (Claude), deployed via Azure DevOps: prompt chaining, JSON-schema validation and context-grounded generation turn Jira stories into structured API and UI test cases.",
      "90% intent-recognition accuracy on a Copilot-style agent — LLM intent router + multimodal RAG over images, PDFs and docs.",
      "Cut auto-insurance quote time 40% with a full-stack agentic chatbot (Angular, TypeScript, Java, Spring Boot) validating against Guidewire in real time.",
      "Built a Karate API test framework from scratch; automated 200+ regression cases across PolicyCenter, ClaimCenter and BillingCenter, cutting cycle time 80% on Jenkins.",
    ],
    tags: ["AWS Bedrock", "RAG", "Spring Boot", "Angular", "Karate", "Jenkins"],
  },
  {
    hash: "70c3a1f",
    branch: "feature",
    kind: "Experience",
    title: "Software Engineer Intern",
    org: "TourWalk — M.U.T Services Pvt. Ltd.",
    logo: "tourwalk.png",
    place: "Remote",
    date: "May 2025 – Aug 2025",
    points: [
      "+30% reliability and throughput: optimised Node.js REST APIs with a Redis caching layer for real-time travel queries.",
      "+15% booking-flow conversion with React + Redux interfaces and leaner state management.",
      "100% security-audit pass, zero incidents: JWT auth, input validation and secure real-time services on payment and booking endpoints.",
    ],
    tags: ["Node.js", "Redis", "React", "Redux", "JWT"],
  },
  {
    hash: "1ea5e23",
    branch: "ops",
    kind: "Experience",
    title: "Unit Business Risk & Compliance Co-worker",
    org: "IKEA",
    logo: "ikea.png",
    place: "Toronto, ON",
    date: "Nov 2023 – Present",
    points: [
      "Automated 5+ compliance workflows (Excel, SharePoint, Office 365), improving audit efficiency 12%.",
      "Reduced system downtime 18% working with IT to diagnose and resolve operational issues.",
      "Power BI dashboards tracking real-time risk KPIs for senior management.",
    ],
    tags: ["Power BI", "Automation", "Risk KPIs"],
  },
  {
    hash: "7e0b2c9",
    branch: "ops",
    kind: "Leadership",
    title: "Supervisor / Team Leader",
    org: "Tim Hortons",
    logo: null,
    place: "Toronto, ON",
    date: "Sep 2022 – Nov 2023",
    points: [
      "Trained and mentored new hires; supervised shifts and kept the storefront meeting company standards.",
      "Built optimised schedules around breaks, regulations and peak demand.",
    ],
    tags: ["Leadership", "Scheduling"],
  },
  {
    hash: "c5e2022",
    branch: "main",
    kind: "Education",
    title: "B.Sc. (Honours) Computer Science",
    org: "York University — Lassonde School of Engineering",
    logo: "york.png",
    place: "Toronto, ON",
    date: "Sep 2022 – May 2027 (expected)",
    points: [
      "Lassonde Entrance Scholarship.",
      "Coursework: Data Structures & Algorithms, AI, Machine Learning, Computer Vision, Operating Systems, Database Systems, Data Mining, Software Testing.",
    ],
    tags: ["DSA", "ML", "OS", "Databases"],
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "Pratham's ability to architect an LLM-assisted Proof of Concept completely transformed how we approach our API and UI testing.",
    name: "Kashyap Patel",
    role: "Senior Manager, Software Quality Engineering",
    company: "Aviva Canada",
  },
  {
    quote:
      "Navigating a massive enterprise codebase is daunting, but his ability to break down complex architecture is exceptional.",
    name: "Nikunj Patel",
    role: "Senior Manager, Software Engineering",
    company: "Aviva Canada",
  },
];

export const LANG_COLORS = {
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  "Jupyter Notebook": "#DA5B0B",
  C: "#555555",
  "C++": "#f34b7d",
};

export const MARQUEE = [
  "Agentic AI",
  "RAG",
  "AWS Bedrock",
  "Prompt Chaining",
  "Spring Boot",
  "Distributed Systems",
  "A* Search",
  "FastAPI",
  "Kubernetes",
  "Redis",
  "React",
  "CI/CD",
  "Model Evaluation",
];

// Contact form delivery (EmailJS — same account as the previous site).
// If a send fails, the form falls back to opening the visitor's email app.
export const EMAILJS = {
  service: "service_vyf0934",
  template: "template_5pfoc59",
  publicKey: "wOLSuVSUWm-nERJjq",
};

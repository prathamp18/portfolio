# Pratham Patel — Portfolio

Personal portfolio for software engineering and AI/ML roles. Built with Next.js, Three.js (React Three Fiber) and Framer Motion.

## What's on the page

- **Boot intro** — a terminal "compiles" the portfolio, then the name decodes out of noise (once per session; click to skip)
- **Hero** — a live 3D neural network running a forward pass. Signals travel neuron-to-neuron through five layers named after the agent pipeline: prompt → route → retrieve → reason → act. Mouse-reactive.
- **Scroll background** — 4,000 particles that rebuild as you scroll: neural layers → binary search tree → RAG embedding clusters → a globe with great-circle flight routes (AeroPath)
- **⌘K / Ctrl+K command palette** — jump to any section, copy the email, open the resume, toggle the theme
- **About** — an interactive terminal (`help`, `whoami`, `neofetch`, `projects`, `open resume`, `sudo hire pratham`…) plus animated impact metrics
- **Experience** — rendered as `git log --graph`: main branch spine, side branches merging back in
- **Projects** — personal and course projects only (DetourTO, AeroPath AI, Fraud Detection, Trading Buddy) as 3D tilt cards with animated covers; each opens a case study. Internship work lives under Experience.
- **Playground** — two algorithms from the projects running live in the browser:
  - **A\*** pathfinding (from AeroPath): paint storm cells, drag the plane / destination, compare against Dijkstra
  - **Logistic regression from scratch** (from Fraud Detection): add points, train with gradient descent, watch loss / precision / recall / F1
- **Stack** — a rotating double helix of skills; hover a group to isolate its strand
- **Code review** — testimonials from Aviva managers
- **Live from GitHub** — repos fetched from the GitHub API in the visitor's browser + contribution chart
- **Contact** — form delivers through EmailJS (same account as the old site), falls back to the visitor's email app
- Light / dark mode, smooth scroll (Lenis), reduced-motion support, mobile layout, self-hosted fonts

## Edit the content

Everything lives in **`src/data/site.js`** — profile, metrics, projects (with case-study text and architecture steps), skills, experience, testimonials.

- **Add a project:** copy an entry in `PROJECTS`. `category` is `ai`, `ml`, `systems` or `fullstack`; `featured: true` makes it the wide card. `cover` picks the artwork: `transit`, `astar`, `fraud`, `ticker` (also available: `llm`, `rag`, `chat`, `tests`, `booking`). `arch` is the list of pipeline steps shown in the case study.
- **Link a repo:** set `repo` on a project to its GitHub URL (AeroPath, Fraud Detection and Trading Buddy currently point at the GitHub profile).
- **Add a photo:** put it in `public/` (e.g. `public/pratham.jpg`) and set `photo: "pratham.jpg"` in `PROFILE`.
- **Update the resume:** replace `public/Pratham_Patel_Resume.pdf`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy

The site is a static export (`output: "export"` → `out/`).

**GitHub Pages (set up already):** push to `main`. `.github/workflows/deploy.yml` builds and publishes. In the repo go to **Settings → Pages → Source: GitHub Actions** once. The base path is set from the repo name automatically (e.g. repo `me` → `prathamp18.github.io/me/`).

**Vercel:** import the repo at vercel.com → Deploy. No settings needed.

## Stack

Next.js 15 · React 19 · Three.js + @react-three/fiber · Framer Motion · Lenis · Fontsource

import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "./globals.css";
import "./components.css";

export const metadata = {
  title: "Pratham Patel — Software Engineer · AI/ML",
  description:
    "Portfolio of Pratham Patel, Computer Science at York University (Lassonde, 2027). Agentic LLM systems on AWS Bedrock, RAG, full-stack and backend engineering, A* pathfinding and ML from scratch.",
  openGraph: {
    title: "Pratham Patel — Software Engineer · AI/ML",
    description: "Software that thinks. Systems that ship.",
    type: "website",
  },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#07070b" };

// apply the saved theme before paint so there is no flash
const themeScript = `try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%2307070b'/><text x='16' y='21.5' font-family='monospace' font-weight='700' font-size='14' text-anchor='middle' fill='%23c4ff4d'>&lt;p/&gt;</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}

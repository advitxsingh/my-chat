# MyChat

A minimalist, high-performance chat interface powered by the latest Gemini models and Convex backend.

Built with Next.js, React, Tailwind CSS, KaTeX with mhchem, and the Geist typeface.

---

## Highlights

- **100% AMOLED Dark Theme**: Pure `#000000` blacks, crisp borders, and zero gray wash.
- **Geist Typography**: Modern, ultra-clean monospace and sans-serif typography.
- **Advanced Scientific & Math Formatting**:
  - **Mathematics**: Inline (`$...$`) and display (`$$...$$`) LaTeX rendered via KaTeX.
  - **Chemistry**: Full chemical equations, reaction conditions, stoichiometry, and `\ce{...}` support via KaTeX mhchem.
  - **Physics**: Proper vector notation, tensor indices, derivatives, integrals, and SI units.
  - **Code**: Fenced code blocks with language tagging and one-click copy.
- **Dynamic Gemini Models**: Automatically queries and curates latest Gemini models from the Gemini API (including `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.5-flash`, `gemini-3.1-pro-preview`, and `gemini-2.5-pro`).
- **Convex Backend**: Schemas, queries, and mutations for chats and messages ready in `convex/`, with automatic reactive local fallback.
- **Responsive**: Seamless experience across mobile phones, tablets, and desktop workstations.
- **No AI Clutter**: Pure, distraction-free interface named simply **MyChat**.

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node 26)
- npm or pnpm

### 2. Environment Variables
Create a `.env.local` file in the project root:

```bash
# Your Gemini API Key from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Convex Deployment URL
# NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 3. Run Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Convex Backend Setup

To connect to your Convex cloud deployment:

```bash
npx convex dev
```

This will link your Convex project and generate types in `convex/_generated`. Set `NEXT_PUBLIC_CONVEX_URL` in `.env.local`.

---

## Deploying to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the environment variables:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_CONVEX_URL` (if using Convex cloud)
4. Click **Deploy**.

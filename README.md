# ASR TDS

ASR is a high-performance cloaking and Traffic Distribution System (TDS). Its primary function is to route real users to affiliate offers while deceiving bots with fake Google 404 pages.

## Features

- **Keitaro-style Tracking:** Supports `/click.php`, `/click`, and `/go` endpoints.
- **Identity Persistence:** Generates unique 24-character hex Click IDs and maintains sessions via cookies.
- **Cloaking Shield:** Serves pixel-perfect Google 404 pages with GCP header spoofing (`via`, `x-rt`, `server`).
- **Advanced Filtering:** Detects bots via User-Agent, Headless Browser signatures, and Datacenter IPs.
- **Redirection:** Strips referrers using `href.li` and passes through marketing parameters (`gclid`, `fbclid`, etc.).
- **Analytics:** Records all hits, latency, and routing outcomes.

## Setup & Deployment

1. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Variables:**
   Create a `.env` file based on `.env.example`.
   \`\`\`env
   PORT=3000
   DB_PATH=asr.sqlite
   COOKIE_SECRET=your_secret_key
   NODE_ENV=production
   \`\`\`

3. **Database Seeding:**
   Run the seeding script to initialize the database and create test records.
   \`\`\`bash
   npx tsx src/db/seed.ts
   \`\`\`

4. **Start Server:**
   \`\`\`bash
   npm run start
   \`\`\`
   *(For development, use `npm run dev`)*

## Maintenance Scripts

- **Daily Summary:** `npx tsx src/scripts/summary.ts`
- **Log Cleanup:** `npx tsx src/scripts/cleanup.ts` (Deletes logs older than 30 days)

## Testing

You can test the safe page by appending `?debug=1` or `?test=1` to any tracking URL.
Example: `http://localhost:3000/click.php?debug=1`

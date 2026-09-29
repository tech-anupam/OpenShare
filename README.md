<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=700&size=40&pause=1000&color=3B82F6&center=true&vCenter=true&width=500&height=70&lines=OpenShare" alt="OpenShare" />
</p>

<p align="center">
  <strong>Anonymous file and paste sharing with client-side encryption.</strong>
</p>

<p align="center">
  <a href="https://github.com/tech-anupam/OpenShare/stargazers">
    <img src="https://img.shields.io/github/stars/tech-anupam/OpenShare?style=flat&color=3b82f6&labelColor=0a0a0a" alt="Stars" />
  </a>
  <a href="https://github.com/tech-anupam/OpenShare/network/members">
    <img src="https://img.shields.io/github/forks/tech-anupam/OpenShare?style=flat&color=22c55e&labelColor=0a0a0a" alt="Forks" />
  </a>
  <a href="https://github.com/tech-anupam/OpenShare/issues">
    <img src="https://img.shields.io/github/issues/tech-anupam/OpenShare?style=flat&color=ef4444&labelColor=0a0a0a" alt="Issues" />
  </a>
  <a href="https://github.com/tech-anupam/OpenShare/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/tech-anupam/OpenShare?style=flat&color=a855f7&labelColor=0a0a0a" alt="License" />
  </a>
  <a href="https://github.com/tech-anupam/OpenShare">
    <img src="https://img.shields.io/github/languages/top/tech-anupam/OpenShare?style=flat&color=3178c6&labelColor=0a0a0a" alt="TypeScript" />
  </a>
  <a href="https://github.com/tech-anupam/OpenShare/commits/main">
    <img src="https://img.shields.io/github/last-commit/tech-anupam/OpenShare?style=flat&color=f59e0b&labelColor=0a0a0a" alt="Last Commit" />
  </a>
</p>

---

## What is OpenShare?

OpenShare is a zero-account, anonymous file and paste sharing platform. Everything is encrypted client-side before leaving your browser. No sign-ups, no cookies, no tracking. Share a file or markdown paste, get a link, done.

---

## Features

- **File Sharing**: Drag-and-drop file uploads up to 512MB
- **Markdown & Paste**: Full Markdown editor with live preview, line counts, and raw view
- **Raw Links**: Direct plaintext endpoint (`/[id]/raw`) for markdown and code files
- **Client-Side Encryption**: AES-256-GCM encryption with PBKDF2 (100,000 iterations) via Web Crypto API
- **CDN Optimization**: ImageKit.io and wsrv.nl edge pipeline for automatic WebP/AVIF compression and video streaming
- **Public Archives**: Discover shared pastes and files with sorting (Newest, Expiring Soon, Most Viewed, Size) and type badges
- **Mock Avatars**: Deterministic squared geometric avatar icons for anonymous shares
- **Auto-Delete**: Expiry options for 1h, 6h, 24h, or 7 days with automated cleanup
- **Zero Native Dependencies**: Portable filesystem-based storage that runs on any OS without native C++ compilation
- **Smooth Theme Wave**: Dark theme default with native View Transitions API circular wave transition
- **Magnetic Particles**: Ambient cursor-reactive particle constellation background
- **Toast Notifications**: Built-in glassmorphism alerts for errors and actions
- **Mobile First**: Minimal, pill-sized floating navigation and responsive layout
- **Privacy Analytics**: Microsoft Clarity heatmaps and session analytics integration

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Pure SVG collection |
| Storage | Filesystem JSON + UploadThing |
| CDN Pipeline | ImageKit.io + wsrv.nl |
| Markdown | react-markdown + remark-gfm |
| Encryption | Web Crypto API (AES-GCM + PBKDF2) |
| Forms | Web3Forms |
| Analytics | Microsoft Clarity |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
git clone https://github.com/tech-anupam/OpenShare.git
cd OpenShare
pnpm install
```

Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:

```env
UPLOADTHING_TOKEN=your_uploadthing_token_here
STORAGE_TO_TOKEN=your_storage_to_token_here
CRON_SECRET=your_random_cron_secret_here
NEXT_PUBLIC_APP_URL=https://openshare.vercel.app
NEXT_PUBLIC_GITHUB_REPO=tech-anupam/OpenShare
NEXT_PUBLIC_IMAGEKIT_ENDPOINT=https://ik.imagekit.io/openshare
NEXT_PUBLIC_CLARITY_ID=your_clarity_project_id
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
  app/
    [id]/
      page.tsx              Share viewer with password gate and CDN delivery
      raw/route.ts          Direct plaintext markdown/code endpoint
    api/
      cron/cleanup/         Expired share cleanup endpoint
      share/                Share creation and detail verification API
      shares/public/        Public archives listing endpoint
      uploadthing/          UploadThing file router
    archives/
      page.tsx              Public explore list with search, sort, and pagination
    donate/
      page.tsx              Support page with UPI and Crypto details
    feedback/
      page.tsx              User feedback form powered by Web3Forms
    layout.tsx              Root layout with theme, toast, splash, and background
    page.tsx                Minimalist landing page with file/paste switcher
  components/
    icons.tsx               Pure SVG icon collection
    markdown-view.tsx       Markdown viewer with remark-gfm
    mock-avatar.tsx         Squared geometric avatar icon component
    navbar.tsx              Pill-shaped floating navigation bar
    paste-editor.tsx        Monospace editor with Write and Preview tabs
    password-gate.tsx       Password prompt wall for protected shares
    share-options.tsx       Compact segmented pill settings panel
    share-result.tsx        Shareable link card with one-click copy
    splash-screen.tsx       Multilingual greeting reveal animation
    stars-badge.tsx         Live GitHub star counter pill
    theme-toggle.tsx        View Transitions theme switch button
    toast.tsx               Toast notification provider and alerts
    upload-zone.tsx         Compact drag-and-drop file dropzone
    view-file.tsx           File viewer with image, video, audio, and code preview
    view-paste.tsx          Paste viewer with Rendered and Raw tabs
    webgl-background.tsx    Magnetic particle constellation background
  hooks/
    use-theme.tsx           Theme context with circular clip-path transition
  lib/
    analytics.ts            Microsoft Clarity event tracking helpers
    cdn.ts                  ImageKit and wsrv.nl optimization pipeline
    constants.ts            Application constants and greeting list
    crypto.ts               Client-side AES-GCM and PBKDF2 encryption
    db.ts                   Portable filesystem JSON storage layer
    uploadthing.ts          UploadThing React client helpers
  styles/
    globals.css             Tailwind directives, CSS variables, prose typography
```

---

## How Encryption Works

1. User specifies an optional password before sharing.
2. A cryptographic salt and initialization vector (IV) are generated in the browser via `crypto.getRandomValues`.
3. The password is run through PBKDF2 (100,000 iterations with SHA-256) to derive an AES-256-GCM encryption key.
4. The content is encrypted client-side before transmission.
5. The password never leaves the user's browser.
6. When viewed, the client decrypts the ciphertext locally using Web Crypto.

The server only stores ciphertext. Without the password, the content is cryptographically unreadable.

---

## Direct Raw Links

Pastes and uploaded code or markdown files can be consumed directly in plaintext via:

```
https://openshare.vercel.app/<id>/raw
```

Ideal for `curl`, GitHub README imports, and CLI scripts:

```bash
curl -s https://openshare.vercel.app/KxJ6A4bO/raw
```

---

## Auto Cleanup Cron

Expired shares can be purged automatically by calling `/api/cron/cleanup`:

```bash
curl -X DELETE -H "Authorization: Bearer YOUR_CRON_SECRET" https://openshare.vercel.app/api/cron/cleanup
```

For Vercel deployment, configure `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## Support and Donate

OpenShare is free and open source. If you find it useful, consider supporting the project:

### GitHub Star
Give the repository a star on GitHub: [tech-anupam/OpenShare](https://github.com/tech-anupam/OpenShare)

### UPI (India)
- **UPI ID**: `anupambuilds@fam`

### Crypto Wallets
- **Bitcoin (BTC)**: `bc1q9f5l4ryr08pqufh3p3xv57lwnsz9z9gupd8yzs`
- **Ethereum (ETH)**: `0xdf2122B4a567CA6908Bbece014492998795f694D`
- **Solana (SOL)**: `EZXYEDuqWzzEPjEtg1wzNeErXy52MBDMAhYrVs8gG2s8`

---

## Contributing

Contributions are welcome. Areas of interest for contributors:

- **Open Source Fallback Services**: Adding zero-API or open-source storage backends (e.g. self-hosted S3/MinIO, IPFS, Web3, or peer-to-peer WebRTC file streaming).
- **Free CDN Providers**: Additional public edge transformers and caching providers without requiring account setups.
- **Preview Renderers**: Expanded inline preview support for 3D files (STL/OBJ), spreadsheets (CSV), or audio waveforms.

To contribute:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License.

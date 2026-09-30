# Technical Specification & Code Architecture

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript%205-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Upstash%20Redis-00E599?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/AES--256--GCM-10B981?style=for-the-badge&logo=shield&logoColor=white" />
  <img src="https://img.shields.io/badge/UploadThing-E11D48?style=for-the-badge&logo=icloud&logoColor=white" />
</p>

---

### Architecture Flow

```mermaid
graph TD
    Client["Client Browser"] -->|PBKDF2 + AES-256-GCM| Encrypted["Ciphertext Payload"]
    Encrypted -->|Direct Upload| UT["UploadThing / S3 CDN"]
    Encrypted -->|Metadata + Expiry| Redis["Upstash Redis"]
    
    Viewer["Recipient Browser"] -->|Local WebCrypto Decrypt| Decrypted["Plaintext / Decrypted File"]
    Redis -->|Dynamic Metadata Headers| Bots["Discord / Telegram / X Embeds"]
    UT -->|Direct Media Stream| Bots
    UT -->|Content-Disposition: attachment| Download["Native File Download"]
```

---

### Encryption Pipeline

```mermaid
sequenceDiagram
    participant User as User Browser
    participant Engine as Web Crypto API
    participant Cloud as Storage & Redis

    User->>Engine: Input (File / Paste) + Password
    Engine->>Engine: crypto.getRandomValues(Salt, IV)
    Engine->>Engine: PBKDF2 (SHA-256, 100k rounds)
    Engine->>Engine: AES-256-GCM Encrypt
    Engine->>Cloud: Store Ciphertext + Salt + IV
    Note over Cloud: Server never sees plaintext or password
```

---

### API Endpoints

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `POST` | `/api/share` | Create encrypted or public share | `{ id, expires_at }` |
| `GET` | `/api/share/[id]` | Fetch metadata & public content | Share JSON |
| `POST` | `/api/share/[id]` | Unlock password-protected share | Decryption payload |
| `GET` | `/api/share/[id]/download` | Direct stream with attachment header | File Binary Stream |
| `GET` | `/[id]/raw` | Raw plaintext stream | Plaintext |
| `DELETE` | `/api/cron/cleanup` | Expiry cleanup worker | `{ deleted: count }` |

---

### Environment Configuration

```env
# Storage & Database
UPLOADTHING_TOKEN=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App & CDN
NEXT_PUBLIC_APP_URL=https://opensharee.vercel.app
NEXT_PUBLIC_IMAGEKIT_ENDPOINT=
CRON_SECRET=
```

---

### Directory Map

```
src/
├── app/
│   ├── [id]/
│   │   ├── layout.tsx         # Dynamic Discord / OG embed cards
│   │   ├── page.tsx           # Decryption gate & media viewer
│   │   └── raw/route.ts       # Raw plaintext endpoint
│   ├── api/
│   │   ├── share/             # Share CRUD & /download streaming
│   │   ├── cron/cleanup/      # Automated expiry cleanup
│   │   └── uploadthing/       # UploadThing edge router
│   ├── icon.svg               # Vector favicon & badge
│   ├── opengraph-image.tsx    # Edge-generated OG preview card
│   └── page.tsx               # Mac studio upload & paste interface
├── components/                # UI components & SVG icons
├── lib/                       # WebCrypto, CDN, DB, and constants
└── styles/                    # Global Tailwind & hardware cursor
```

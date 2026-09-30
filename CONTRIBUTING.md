# Contributing to OpenShare

Thank you for your interest in contributing to OpenShare. We welcome issues, ideas, and pull requests from everyone.

---

## Quickstart Local Development

### 1. Prerequisites
- **Node.js** 18+
- **pnpm** (recommended)

### 2. Setup
```bash
# Clone repository
git clone https://github.com/tech-anupam/OpenShare.git
cd OpenShare

# Install dependencies
pnpm install

# Copy example environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see OpenShare running locally.

---

## Pull Request Guidelines

1. **Fork the repo** and create a feature branch off `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Follow existing conventions**:
   - TypeScript in strict mode.
   - Use Tailwind CSS and native CSS variables defined in `src/styles/globals.css`.
   - Maintain documentation integrity and avoid adding unnecessary runtime dependencies.
3. **Verify build before submitting**:
   ```bash
   pnpm run build
   ```
4. **Submit a Pull Request** describing your changes and link any related issues.

---

## Roadmap & Contribution Ideas

- **Storage Adapters**: Self-hosted S3/MinIO, WebRTC peer-to-peer file transfer, IPFS.
- **Preview Renderers**: Inline viewers for 3D formats (STL/OBJ), spreadsheets (CSV), or audio waveforms.
- **Edge Improvements**: Alternate free CDN transformers and caching backends.

---

## License

By contributing to OpenShare, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

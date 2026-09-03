# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests + lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/cli/package.json  ./packages/cli/

# Install deps (workspace only — no web/server)
RUN pnpm install --frozen-lockfile --filter @policyctl/core --filter @policyctl/cli

# Copy source
COPY packages/core ./packages/core
COPY packages/cli  ./packages/cli
COPY scripts       ./scripts

# Build
RUN pnpm --filter @policyctl/core build && \
    pnpm --filter @policyctl/cli  build

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:24-alpine

LABEL org.opencontainers.image.title="policyctl"
LABEL org.opencontainers.image.description="Provider-agnostic policy runtime for coding agents"
LABEL org.opencontainers.image.url="https://policyctl-web.pages.dev"
LABEL org.opencontainers.image.source="https://github.com/RavaniRoshan/policyctl"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy built artefacts only
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/cli/dist  ./packages/cli/dist
COPY --from=builder /app/packages/cli/package.json  ./packages/cli/

# Symlink the binary so `policyctl` is on PATH
RUN ln -s /app/packages/cli/dist/cli.js /usr/local/bin/policyctl && \
    chmod +x /app/packages/cli/dist/cli.js

# Default: run the CLI
ENTRYPOINT ["node", "/app/packages/cli/dist/cli.js"]
CMD ["--help"]

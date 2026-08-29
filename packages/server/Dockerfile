FROM node:24-slim
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile=false
ENV PORT=8787
ENV POLICYCTL_DATA_DIR=/data
VOLUME ["/data"]
EXPOSE 8787
CMD ["pnpm", "--filter", "@policyctl/server", "start"]

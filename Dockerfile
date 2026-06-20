FROM node:22-alpine AS build

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN corepack enable && corepack prepare pnpm@11.2.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN printf 'allowBuilds:\n  esbuild: true\n  sharp: true\n  workerd: true\n' > pnpm-workspace.yaml \
  && pnpm install --frozen-lockfile

COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src

RUN pnpm build

FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM oven/bun:latest AS deps

WORKDIR /ethan-dapp-web

# node-gyp native addons (e.g. bufferutil) need Python + a C++ toolchain at install time
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./

ENV HUSKY=0
ENV PYTHON=/usr/bin/python3

# BuildKit secret: pass at build time, not stored in the final image.
# DOCKER_BUILDKIT=1 docker buildx build --secret id=npmrc,src=.npmrc ...
RUN --mount=type=secret,id=npmrc,target=/run/secrets/npmrc \
    cp /run/secrets/npmrc /root/.npmrc && \
    cp /run/secrets/npmrc ./.npmrc && \
    bun install --frozen-lockfile && \
    rm -f ./.npmrc /root/.npmrc

FROM oven/bun:latest

WORKDIR /ethan-dapp-web

ENV HUSKY=0

COPY package.json bun.lock ./
COPY --from=deps /ethan-dapp-web/node_modules ./node_modules
COPY . .

CMD ["bun", "start"]

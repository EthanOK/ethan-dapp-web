#!/usr/bin/env bash
#
# Build & push multi-platform Docker images tagged with the package.json
# version AND latest, then push to the registry.
#
# Usage:
#   ./scripts/docker-publish.sh                       # multi-arch build + push
#   IMAGE=0xethan/ethan-dapp-web ./scripts/docker-publish.sh
#   PLATFORMS=linux/arm64 ./scripts/docker-publish.sh  # single arch
#
# Requirements:
#   - .npmrc with a valid GitLab token (private @bric-labs packages)
#   - logged in to the registry (docker login)
#   - a buildx builder that supports multi-platform (docker-container driver)

set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE="${IMAGE:-0xethan/ethan-dapp-web}"
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64}"

# Host platform for the local --load step (no network download).
case "$(uname -m)" in
  arm64 | aarch64) HOST_PLATFORM="linux/arm64" ;;
  x86_64 | amd64) HOST_PLATFORM="linux/amd64" ;;
  *) HOST_PLATFORM="linux/amd64" ;;
esac

if [[ ! -f .npmrc ]]; then
  echo "ERROR: .npmrc not found. Private @bric-labs packages need it to install." >&2
  exit 1
fi

# Read version from package.json without extra deps.
VERSION="$(node -p "require('./package.json').version")"
if [[ -z "$VERSION" ]]; then
  echo "ERROR: could not read version from package.json" >&2
  exit 1
fi

echo "==> Image:     $IMAGE"
echo "==> Version:   $VERSION"
echo "==> Platforms: $PLATFORMS"

# Multi-platform builds require the docker-container driver; auto-create one.
if [[ "$PLATFORMS" == *","* ]]; then
  if ! docker buildx inspect multiarch >/dev/null 2>&1; then
    echo "==> Creating buildx builder 'multiarch' (docker-container)"
    docker buildx create --name multiarch --driver docker-container --bootstrap >/dev/null
  fi
  BUILDER_ARG=(--builder multiarch)
else
  BUILDER_ARG=()
fi

# Step 1: build the host architecture and --load it into the local docker
# store for testing. Uses the buildx cache so step 2 won't rebuild it.
echo "==> Building $HOST_PLATFORM locally (--load)"
DOCKER_BUILDKIT=1 docker buildx build "${BUILDER_ARG[@]}" \
  --platform "$HOST_PLATFORM" \
  --secret id=npmrc,src=.npmrc \
  -t "$IMAGE:$VERSION" \
  -t "$IMAGE:latest" \
  --load \
  .

echo "==> Local images ready:"
docker images "$IMAGE"

# Step 2: build all target platforms and push. The host arch is served from
# cache, so only the other architecture(s) are built fresh. No re-download.
echo "==> Building $PLATFORMS and pushing"
DOCKER_BUILDKIT=1 docker buildx build "${BUILDER_ARG[@]}" \
  --platform "$PLATFORMS" \
  --secret id=npmrc,src=.npmrc \
  -t "$IMAGE:$VERSION" \
  -t "$IMAGE:latest" \
  --push \
  .

echo "==> Pushed $IMAGE:$VERSION and $IMAGE:latest"

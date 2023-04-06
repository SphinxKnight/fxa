#!/bin/bash -e

TAG=$1

if [[ -z "${TAG}" ]]; then
  echo "Usage: $1 <TAG>"
  exit 1
fi

echo "Tagging with $TAG"


DIR=$(dirname "$0")
cd "$DIR"

if [[ -n "${CIRCLECI}" ]]; then
  echo "Docker logs are located in the CircleCI build artifacts"
fi

mkdir -p ../artifacts
echo "" > "../artifacts/docker-images.list"

../_scripts/build-builder.sh
../_scripts/build-fxa-mono.sh "${TAG}"

for d in ../packages/*/ ; do
  ./build.sh "$(basename "$d")" "${TAG}"
done

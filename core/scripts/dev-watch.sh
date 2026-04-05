#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_DIR}"

SERVER_PID=""

snapshot() {
  {
    if [ -f pom.xml ]; then
      stat -c '%Y %n' pom.xml
    fi

    if [ -d src/main ]; then
      find src/main -type f -printf '%T@ %p\n'
    fi
  } | sort | sha256sum | awk '{ print $1 }'
}

start_server() {
  echo "[dev-watch] Starting yebapay-core on port ${SERVER_PORT:-9999}..."
  ./mvnw -q -DskipTests spring-boot:run &
  SERVER_PID=$!
}

stop_server() {
  if [ -n "${SERVER_PID}" ] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
  SERVER_PID=""
}

cleanup() {
  stop_server
}

trap cleanup EXIT INT TERM

start_server
LAST_SNAPSHOT="$(snapshot)"

while true; do
  sleep 1

  if [ -n "${SERVER_PID}" ] && ! kill -0 "${SERVER_PID}" 2>/dev/null; then
    echo "[dev-watch] Backend process stopped. Waiting for the next source change to restart..."
    SERVER_PID=""
  fi

  CURRENT_SNAPSHOT="$(snapshot)"

  if [ "${CURRENT_SNAPSHOT}" != "${LAST_SNAPSHOT}" ]; then
    LAST_SNAPSHOT="${CURRENT_SNAPSHOT}"
    echo "[dev-watch] Change detected. Restarting backend..."
    stop_server
    start_server
  fi
done

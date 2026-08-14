#!/bin/sh
set -eu

directus_url="${DIRECTUS_URL:-http://127.0.0.1:8055}"
health_attempts="${DIRECTUS_BOOTSTRAP_HEALTH_ATTEMPTS:-60}"

node cli.js bootstrap

pm2-runtime start ecosystem.config.cjs &
server_pid=$!

stop_server() {
  kill "$server_pid" 2>/dev/null || true
  wait "$server_pid" 2>/dev/null || true
}

trap stop_server EXIT INT TERM

attempt=1
while [ "$attempt" -le "$health_attempts" ]; do
  if node -e "fetch('${directus_url}/server/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"; then
    break
  fi

  if ! kill -0 "$server_pid" 2>/dev/null; then
    echo "Directus stopped before becoming healthy." >&2
    exit 1
  fi

  attempt=$((attempt + 1))
  sleep 2
done

if [ "$attempt" -gt "$health_attempts" ]; then
  echo "Directus did not become healthy before the bootstrap timeout." >&2
  exit 1
fi

if node /directus/directus-sync-cmd/schema-present.mjs; then
  echo "Application schema already exists; bootstrap skipped."
  exit 0
else
  check_exit=$?
fi

if [ "$check_exit" -ne 10 ]; then
  echo "Unable to verify whether the application schema exists." >&2
  exit "$check_exit"
fi

directus-sync push --dump-path /directus/directus-config

node /directus/directus-sync-cmd/schema-present.mjs
echo "Directus application schema bootstrap completed."

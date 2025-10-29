#!/bin/sh

echo "Generating runtime env.js..."

cat <<EOF > /usr/share/nginx/html/env.js
window._env_ = {
  REACT_APP_BACKEND_URL: "${REACT_APP_BACKEND_URL}",
  REACT_APP_FRONTEND_URL: "${REACT_APP_FRONTEND_URL}",
  REACT_APP_GRAFANA_URL: "${REACT_APP_GRAFANA_URL}",
  REACT_APP_GRAFANA_URL2: "${REACT_APP_GRAFANA_URL2}",
  REACT_APP_HORIZON_REPORT_URL: "${REACT_APP_HORIZON_REPORT_URL}",
  REACT_APP_KEYCLOAK_URL: "${REACT_APP_KEYCLOAK_URL}"
};
EOF

echo "Starting Nginx..."
exec "$@"

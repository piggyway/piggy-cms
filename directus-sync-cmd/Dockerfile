FROM node:23-slim

RUN npm install --global directus-sync@3.4.1

WORKDIR /directus

# Accept environment as build arg
ARG ENVIRONMENT=DEV
ENV ENVIRONMENT=${ENVIRONMENT}

# Copy config files
COPY ./directus-config /tmp/directus-config
COPY ./directus-sync-cmd/directus-sync.config.js /tmp/directus-sync.config.js

# Conditionally move them to actual paths
RUN if [ "$ENVIRONMENT" != "DEV" ]; then \
      mkdir -p /directus/directus-config && \
      cp -r /tmp/directus-config /directus/directus-config && \
      cp /tmp/directus-sync.config.js /directus/directus-sync.config.js; \
    else \
      echo "Running in DEV mode - config will be mounted as volume"; \
    fi


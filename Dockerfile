# Stage 1: Install third-party extensions
FROM node:23-alpine as third-party-ext
RUN apk add python3 g++ make
WORKDIR /extensions
ADD extensions .
RUN npm install
# Move every installed Directus extension (scoped or unscoped) into the /extensions/directus folder
RUN mkdir -p ./directus
RUN cd node_modules && \
    find . -maxdepth 3 -name package.json -exec grep -l '"directus:extension"' {} + 2>/dev/null \
    | xargs -r -n1 dirname \
    | xargs -r -I{} mv {} ../directus/

# Stage 2: Directus runtime image
FROM directus/directus:11.17.4

# Install directus-sync@3.4.0 globally
# Switch to root to install global package, then switch back to node user
USER root
RUN npm install --global directus-sync@3.4.1

# Copy third-party extensions from extensions stage
COPY --from=third-party-ext /extensions/directus ./extensions

USER node

# Accept environment as build arg
ARG ENVIRONMENT=PROD
ENV ENVIRONMENT=${ENVIRONMENT}

# Create necessary directories
RUN mkdir -p /directus/uploads /directus/directus-config

# Conditionally copy config files for non-DEV environments
COPY ./directus-config /tmp/directus-config
COPY ./directus-sync-cmd/directus-sync.config.js /tmp/directus-sync.config.js
RUN cp -r /tmp/directus-config/* /directus/directus-config/ 2>/dev/null || true;
RUN cp /tmp/directus-sync.config.js /directus/directus-sync.config.js;
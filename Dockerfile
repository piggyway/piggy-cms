# Stage 1: Install third-party extensions
FROM node:23-alpine as third-party-ext
RUN apk add python3 g++ make
WORKDIR /extensions
ADD extensions .
RUN npm install
# Move all extensions that start with directus-extension- to the /extensions/directus folder
RUN mkdir -p ./directus
RUN cd node_modules && find . -maxdepth 1 -type d -name "directus-extension-*" -exec mv {} ../directus \;

# Stage 2: Directus runtime image
FROM directus/directus:latest

# Install directus-sync@3.4.0 globally
# Switch to root to install global package, then switch back to node user
USER root
RUN npm install --global directus-sync@3.4.0

# Copy third-party extensions from extensions stage
COPY --from=third-party-ext /extensions/directus ./extensions

USER node

# Accept environment as build arg
ARG ENVIRONMENT=DEV
ENV ENVIRONMENT=${ENVIRONMENT}

# Create necessary directories
RUN mkdir -p /directus/uploads /directus/directus-config

# Conditionally copy config files for non-DEV environments
COPY ./directus-config /tmp/directus-config
RUN if [ "$ENVIRONMENT" != "DEV" ]; then \
      cp -r /tmp/directus-config/* /directus/directus-config/ 2>/dev/null || true; \
    else \
      echo "Running in DEV mode - config will be mounted as volume"; \
    fi


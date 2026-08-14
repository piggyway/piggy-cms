# Install the repository's Directus extensions in an isolated build stage.
FROM node:23-alpine AS third-party-ext
RUN apk add --no-cache python3 g++ make
WORKDIR /extensions
COPY extensions .
RUN npm install
RUN mkdir -p ./directus && \
    cd node_modules && \
    find . -maxdepth 3 -name package.json -exec grep -l '"directus:extension"' {} + 2>/dev/null \
    | xargs -r -n1 dirname \
    | xargs -r -I{} mv {} ../directus/

FROM directus/directus:11.14.1

USER root
RUN npm install --global directus-sync@3.4.1

COPY --from=third-party-ext /extensions/directus ./extensions

USER node
RUN mkdir -p /directus/uploads /directus/directus-config

COPY --chown=node:node ./directus-config /directus/directus-config
COPY --chown=node:node ./directus-sync-cmd /directus/directus-sync-cmd
COPY --chown=node:node ./directus-sync-cmd/directus-sync.config.js /directus/directus-sync.config.js

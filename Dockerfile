# Stage 1: Install third-party extensions
FROM node:23-alpine AS third-party-ext
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
FROM directus/directus:12.1.1

# Copy third-party extensions from extensions stage
COPY --from=third-party-ext /extensions/directus ./extensions

USER node

# Create necessary directories
RUN mkdir -p /directus/uploads

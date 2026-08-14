const directusUrl = process.env.DIRECTUS_URL ?? "http://127.0.0.1:8055";
const email =
  process.env.DIRECTUS_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "";
const password =
  process.env.DIRECTUS_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "";
const markerCollection =
  process.env.DIRECTUS_SCHEMA_MARKER_COLLECTION ?? "product_info";

if (!email || !password) {
  console.error("Directus bootstrap administrator credentials are required.");
  process.exit(1);
}

const loginResponse = await fetch(`${directusUrl}/auth/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});

if (!loginResponse.ok) {
  console.error(`Directus bootstrap login failed: HTTP ${loginResponse.status}`);
  process.exit(1);
}

const loginBody = await loginResponse.json();
const token = loginBody?.data?.access_token;

if (!token) {
  console.error("Directus bootstrap login returned no access token.");
  process.exit(1);
}

const collectionsResponse = await fetch(`${directusUrl}/collections`, {
  headers: { authorization: `Bearer ${token}` },
});

if (!collectionsResponse.ok) {
  console.error(
    `Unable to inspect Directus collections: HTTP ${collectionsResponse.status}`,
  );
  process.exit(1);
}

const collectionsBody = await collectionsResponse.json();
const schemaExists = collectionsBody.data.some(
  (entry) => entry.collection === markerCollection,
);

process.exit(schemaExists ? 0 : 10);

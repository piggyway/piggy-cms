export default {
  debug: true,
  // Railway 部署：使用 localhost（同一容器内）
  // 本地开发：使用 DIRECTUS_URL 或 PUBLIC_URL
  // 优先级：DIRECTUS_URL > PUBLIC_URL > localhost
  directusUrl: process.env.DIRECTUS_URL || process.env.PUBLIC_URL || "http://localhost:8055",
  directusToken: process.env.DIRECTUS_ADMIN_TOKEN,
  directusEmail: process.env.DIRECTUS_ADMIN_EMAIL,
  directusPassword: process.env.DIRECTUS_ADMIN_PASSWORD,
  dumpPath: process.env.DIRECTUS_SYNC_DUMP_PATH || "/directus/directus-config",
};


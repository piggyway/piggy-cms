export default {
  debug: true,
  // 优先使用 DIRECTUS_URL，否则使用 PUBLIC_URL，最后使用默认值
  directusUrl: process.env.DIRECTUS_URL || process.env.PUBLIC_URL || "http://localhost:8055",
  directusToken: process.env.DIRECTUS_ADMIN_TOKEN,
  directusEmail: process.env.DIRECTUS_ADMIN_EMAIL,
  directusPassword: process.env.DIRECTUS_ADMIN_PASSWORD,
  dumpPath: process.env.DIRECTUS_SYNC_DUMP_PATH || "/directus/directus-config",
};


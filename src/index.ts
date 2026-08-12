/**
 * Route all traffic to a singleton Directus container.
 *
 * File storage: Cloudflare R2 via the S3-compatible driver.
 * DB + R2 secrets come from Worker secrets/bindings.
 */

import { Container, getContainer } from "@cloudflare/containers";

export interface Env {
  DIRECTUS: DurableObjectNamespace<DirectusContainer>;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_DATABASE?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_SSL?: string;
  SECRET?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  PUBLIC_URL?: string;
  LICENSE_KEY?: string;
  // R2 (S3-compatible) storage
  STORAGE_LOCATIONS?: string;
  STORAGE_R2_DRIVER?: string;
  STORAGE_R2_KEY?: string;
  STORAGE_R2_SECRET?: string;
  STORAGE_R2_BUCKET?: string;
  STORAGE_R2_REGION?: string;
  STORAGE_R2_ENDPOINT?: string;
  STORAGE_R2_FORCE_PATH_STYLE?: string;
  STORAGE_R2_ACL?: string;
  ASSETS_PUBLIC_URL?: string;
}

function required(env: Env, key: keyof Env): string {
  const value = env[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required container env: ${String(key)}`);
  }
  return value;
}

export class DirectusContainer extends Container<Env> {
  defaultPort = 8055;
  sleepAfter = "30m";
  enableInternet = true;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.envVars = {
      NODE_ENV: "production",
      WEBSOCKETS_ENABLED: "true",
      MAX_PAYLOAD_SIZE: "10000000",
      DB_CLIENT: "pg",
      DB_HOST: required(env, "DB_HOST"),
      DB_PORT: env.DB_PORT || "5432",
      DB_DATABASE: required(env, "DB_DATABASE"),
      DB_USER: required(env, "DB_USER"),
      DB_PASSWORD: required(env, "DB_PASSWORD"),
      DB_SSL: env.DB_SSL || '{"rejectUnauthorized":false}',
      SECRET: required(env, "SECRET"),
      ADMIN_EMAIL: env.ADMIN_EMAIL || "",
      ADMIN_PASSWORD: env.ADMIN_PASSWORD || "",
      PUBLIC_URL: env.PUBLIC_URL || "https://cms.piggyway.com.au",
      // Cloudflare R2 as primary storage location
      STORAGE_LOCATIONS: env.STORAGE_LOCATIONS || "r2",
      STORAGE_R2_DRIVER: env.STORAGE_R2_DRIVER || "s3",
      STORAGE_R2_KEY: required(env, "STORAGE_R2_KEY"),
      STORAGE_R2_SECRET: required(env, "STORAGE_R2_SECRET"),
      STORAGE_R2_BUCKET: env.STORAGE_R2_BUCKET || "piggy-cms-media",
      STORAGE_R2_REGION: env.STORAGE_R2_REGION || "auto",
      STORAGE_R2_ENDPOINT: required(env, "STORAGE_R2_ENDPOINT"),
      STORAGE_R2_FORCE_PATH_STYLE: env.STORAGE_R2_FORCE_PATH_STYLE || "true",
    };

    if (env.STORAGE_R2_ACL) {
      this.envVars.STORAGE_R2_ACL = env.STORAGE_R2_ACL;
    }
    if (env.LICENSE_KEY) {
      this.envVars.LICENSE_KEY = env.LICENSE_KEY;
    }
  }

  override onStart() {
    console.log("Directus container started (R2 storage)");
  }

  override onStop() {
    console.log("Directus container stopped");
  }

  override onError(error: unknown) {
    console.error("Directus container error:", error);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = getContainer(env.DIRECTUS, "main");
    return container.fetch(request);
  },
};

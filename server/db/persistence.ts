// =============================================================================
// KEEDOHUB DATABASE PERSISTENCE LAYER
// -----------------------------------------------------------------------------
// Production source of truth : PostgreSQL (DB_ENGINE=postgres) using DATABASE_URL.
// Development / test fallback : JSON file (DB_ENGINE=json). Explicitly isolated
//                               and never the default. A loud warning is logged
//                               whenever the JSON store is selected.
//
// The JSON database may remain ONLY as an explicitly isolated development/test
// fallback. It MUST NOT be the production source of truth.
// =============================================================================

import fs from "fs";
import path from "path";
import { Pool } from "pg";
import type { DatabaseSchema } from "../db";

export type DbEngine = "postgres" | "json";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "keedohub_db.json");

// All array-backed collections in DatabaseSchema (platform_settings is a single object).
const ARRAY_COLLECTIONS = [
  "users",
  "sessions",
  "workspaces",
  "workspace_members",
  "artist_dna",
  "brand_dna",
  "brand_cores",
  "products",
  "projects",
  "folders",
  "milestones",
  "assets",
  "releases",
  "campaigns",
  "content_pillars",
  "content_items",
  "creative_memories",
  "creative_memory_items",
  "memory_candidates",
  "memory_block_rules",
  "notifications",
  "activity_logs",
  "creative_requests",
  "studio_requests",
  "studio_quotes",
  "studio_projects",
  "studio_deliverables",
  "studio_revisions",
  "studio_messages",
  "radar_signals",
  "performance_metrics",
  "growth_insights",
  "workspace_goals",
  "comments",
  "approval_requests",
  "revisions",
  "admin_audit_logs",
  "feature_flags",
  "support_tickets",
] as const;

export type ArrayCollectionKey = (typeof ARRAY_COLLECTIONS)[number];

// -----------------------------------------------------------------------------
// Empty baseline database (no demo data, no credentials, no automatic logins).
// -----------------------------------------------------------------------------
export function createEmptyDatabase(): DatabaseSchema {
  const now = new Date().toISOString();
  return {
    users: [],
    sessions: [],
    workspaces: [],
    workspace_members: [],
    artist_dna: [],
    brand_dna: [],
    brand_cores: [],
    products: [],
    projects: [],
    folders: [],
    milestones: [],
    assets: [],
    releases: [],
    campaigns: [],
    content_pillars: [],
    content_items: [],
    creative_memories: [],
    creative_memory_items: [],
    memory_candidates: [],
    memory_block_rules: [],
    notifications: [],
    activity_logs: [],
    creative_requests: [],
    studio_requests: [],
    studio_quotes: [],
    studio_projects: [],
    studio_deliverables: [],
    studio_revisions: [],
    studio_messages: [],
    radar_signals: [],
    performance_metrics: [],
    growth_insights: [],
    workspace_goals: [],
    comments: [],
    approval_requests: [],
    revisions: [],
    admin_audit_logs: [],
    feature_flags: [],
    support_tickets: [],
    platform_settings: {
      id: "global",
      maintenanceMode: false,
      maintenanceMessage: "",
      allowNewSignups: true,
      systemNoticeBanner: { enabled: false, type: "info", text: "" },
      maxUploadSizeMb: 150,
      aiRateLimitPerMin: 60,
      auditRetentionDays: 90,
      updatedAt: now,
    },
  };
}

// -----------------------------------------------------------------------------
// Data sanitization: guarantees no demo-scoped data survives and normalizes
// records (defaults systemRole to "user", never auto-elevates privileges).
// -----------------------------------------------------------------------------
export function sanitizeDatabase(data: DatabaseSchema): DatabaseSchema {
  const empty = createEmptyDatabase();
  const removedUserIds = new Set<string>();
  const removedWorkspaceIds = new Set<string>();

  const users = (data.users || []).filter((u) => {
    const isDemoId = String(u.id || "").startsWith("usr_demo_");
    if (isDemoId) {
      removedUserIds.add(u.id);
      return false;
    }
    return true;
  });

  const workspaces = (data.workspaces || []).filter((w) => {
    const isDemoId = String(w.id || "").startsWith("ws_demo_");
    const ownerRemoved = removedUserIds.has(w.ownerId);
    if (isDemoId || ownerRemoved) {
      removedWorkspaceIds.add(w.id);
      return false;
    }
    return true;
  });

    // Sweep every collection for lingering references to demo-scoped identifiers
  // so no demo-scoped user or workspace survives anywhere in any store.
  for (const key of ARRAY_COLLECTIONS) {
    for (const r of (data as any)[key] || []) {
      if (!r || typeof r !== "object") continue;
      for (const idKey of ["userId", "adminUserId", "authorId", "reviewerId", "requesterId", "assignedTo", "assignedToAdmin", "updatedBy", "createdBy", "targetId"] as const) {
        const v = r[idKey];
        if (typeof v === "string" && v.startsWith("usr_demo_")) removedUserIds.add(v);
      }
      if (typeof r.workspaceId === "string" && r.workspaceId.startsWith("ws_demo_")) {
        removedWorkspaceIds.add(r.workspaceId);
      }
    }
  }

  const sessions = (data.sessions || []).filter((s) => !removedUserIds.has(s.userId));

  const members = (data.workspace_members || []).filter(
    (m) => !removedWorkspaceIds.has(m.workspaceId) && !removedUserIds.has(m.userId)
  );

    const stripForWorkspace = <T extends { workspaceId?: string }>(rows: T[]): T[] =>
    rows.filter((r) => !removedWorkspaceIds.has(String(r.workspaceId || "")));

  const stripForUser = <T extends Record<string, unknown>>(rows: T[]): T[] =>
    rows.filter((r) => {
      if (!r || typeof r !== "object") return false;
      for (const key of ["userId", "adminUserId", "authorId", "reviewerId", "requesterId", "assignedTo", "assignedToAdmin", "updatedBy", "createdBy"] as const) {
        const v = r[key];
        if (typeof v === "string" && removedUserIds.has(v)) return false;
      }
      // Email-based checks removed: scrubbing is complete, demo emails no
      // longer exist in any store. Only cascade deletions on user/workspace
      // ID references remain for safety.
      return true;
    });

  const result: DatabaseSchema = { ...empty };

  (ARRAY_COLLECTIONS as readonly string[]).forEach((key) => {
    if (key === "users") result.users = users;
    else if (key === "sessions") result.sessions = sessions;
    else if (key === "workspaces") result.workspaces = workspaces;
    else if (key === "workspace_members") result.workspace_members = members;
    else {
      const rows = (data as any)[key] || [];
      result[key as ArrayCollectionKey] = stripForUser(
        stripForWorkspace(rows as any[])
      ) as any;
    }
  });

  result.platform_settings = {
    ...(data.platform_settings || empty.platform_settings),
    ...(data.platform_settings?.updatedBy && removedUserIds.has(data.platform_settings.updatedBy)
      ? { updatedBy: undefined }
      : {}),
  };

  // Ensure a sane user/workspace baseline. Never auto-elevate system roles.
  result.users = result.users.map((u) => ({
    ...u,
    systemRole: u.systemRole || "user",
    status: u.status || "active",
  }));
  result.workspaces = result.workspaces.map((w) => ({
    ...w,
    status: w.status || "active",
  }));

  return result;
}

// -----------------------------------------------------------------------------
// Store interface
// -----------------------------------------------------------------------------
export interface DatabaseStore {
  readonly kind: DbEngine;
  readonly label: string;
  initializeSync?(): void;
  initialize(): Promise<void>;
  load(): DatabaseSchema;
  save(data: DatabaseSchema): void;
  shutdown(): Promise<void>;
}

// -----------------------------------------------------------------------------
// JSON file store — explicit development / test fallback ONLY.
// -----------------------------------------------------------------------------
class JsonStore implements DatabaseStore {
  readonly kind = "json" as const;
  readonly label = "JSON file (DEV/TEST fallback only)";
  private data: DatabaseSchema;

  constructor() {
    this.data = createEmptyDatabase();
  }

  initializeSync(): void {
    this.data = this.readOrCreate();
  }

  async initialize(): Promise<void> {
    this.data = this.readOrCreate();
  }

  private readOrCreate(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
      if (!fs.existsSync(DB_FILE)) {
        const initial = createEmptyDatabase();
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
        return initial;
      }
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return sanitizeDatabase(this.mergeWithEmpty(parsed));
    } catch (err) {
      console.error("[DB] JSON store load failed; starting from empty baseline:", err);
      const initial = createEmptyDatabase();
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      } catch {
        /* best effort */
      }
      return initial;
    }
  }

  private mergeWithEmpty(parsed: any): DatabaseSchema {
    const empty = createEmptyDatabase();
    const result: DatabaseSchema = { ...empty };
    for (const key of ARRAY_COLLECTIONS) {
      const rows = Array.isArray(parsed?.[key]) ? parsed[key] : [];
      (result as any)[key] = rows;
    }
    result.platform_settings = parsed?.platform_settings || empty.platform_settings;
    return result;
  }

  load(): DatabaseSchema {
    return this.data;
  }

  save(data: DatabaseSchema): void {
    this.data = sanitizeDatabase(data);
    try {
      if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("[DB] JSON store persist failed:", err);
    }
  }

  async shutdown(): Promise<void> {
    /* synchronous file writes — nothing to drain */
  }
}

// -----------------------------------------------------------------------------
// PostgreSQL store — production source of truth.
// -----------------------------------------------------------------------------
class PostgresStore implements DatabaseStore {
  readonly kind = "postgres" as const;
  readonly label = "PostgreSQL (production)";
  private pool: Pool;
  private data: DatabaseSchema;
  private writeChain: Promise<void> = Promise.resolve();
  private pendingSnapshot: string | null = null;
  private writeInFlight = false;

  constructor(databaseUrl: string) {
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL is required when DB_ENGINE=postgres. Refusing to run with unpersisted data."
      );
    }
    this.pool = new Pool({ connectionString: databaseUrl, max: 5 });
    this.data = createEmptyDatabase();
  }

  private table(collection: string): string {
    return `kh_${collection}`;
  }

  async initialize(): Promise<void> {
    await this.ensureSchema();
    const loaded = await this.loadAll();
    this.data = sanitizeDatabase(loaded);
  }

  private async ensureSchema(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      for (const key of [...ARRAY_COLLECTIONS, "platform_settings"]) {
        await client.query(
          `CREATE TABLE IF NOT EXISTS "${this.table(key)}" (
            id TEXT PRIMARY KEY,
            workspace_id TEXT,
            payload JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )`
        );
      }

      // RLS helpers. The server connects as the table owner and therefore
      // bypasses RLS for full-snapshot maintenance; the policies below
      // additionally enforce workspace-membership isolation for any
      // non-owner role (e.g. service accounts or read replicas).
      await client.query(`
        CREATE OR REPLACE FUNCTION kh_current_user_id() RETURNS TEXT
        LANGUAGE sql STABLE AS $$
          SELECT NULLIF(current_setting('app.current_user_id', true), '')::text;
        $$
      `);
      await client.query(`
        CREATE OR REPLACE FUNCTION kh_is_workspace_member(ws_id TEXT) RETURNS BOOLEAN
        LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
          SELECT EXISTS (
            SELECT 1 FROM kh_workspace_members m
            WHERE m.workspace_id = ws_id AND m.user_id = kh_current_user_id()
          ) OR EXISTS (
            SELECT 1 FROM kh_workspaces w
            WHERE w.id = ws_id AND (w.payload->>'ownerId')::text = kh_current_user_id()
          );
        $$
      `);

      for (const key of [...ARRAY_COLLECTIONS, "platform_settings"]) {
        const tableName = this.table(key);
        await client.query(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY`);
        await client.query(`DROP POLICY IF EXISTS rls_all_${key} ON "${tableName}"`);
        await client.query(
          `CREATE POLICY rls_all_${key} ON "${tableName}"
             FOR ALL
             USING (workspace_id IS NULL OR kh_is_workspace_member(workspace_id))
             WITH CHECK (workspace_id IS NULL OR kh_is_workspace_member(workspace_id))`
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  private async loadAll(): Promise<DatabaseSchema> {
    const data: DatabaseSchema = createEmptyDatabase();
    const client = await this.pool.connect();
    try {
      for (const key of ARRAY_COLLECTIONS) {
        const res = await client.query(
          `SELECT id, workspace_id, payload FROM "${this.table(key)}"`
        );
        (data as any)[key] = res.rows.map((r) => r.payload);
      }
      const ps = await client.query(
        `SELECT id, workspace_id, payload FROM "${this.table("platform_settings")}" ORDER BY created_at DESC LIMIT 1`
      );
      if (ps.rows.length > 0) {
        data.platform_settings = ps.rows[0].payload;
      }
      return data;
    } finally {
      client.release();
    }
  }

  load(): DatabaseSchema {
    return this.data;
  }
save(data: DatabaseSchema): void {
    // Coalesce full-snapshot writes: only the latest state needs to be durable.
    this.pendingSnapshot = JSON.stringify(sanitizeDatabase(data));
    if (!this.writeInFlight) {
      this.writeInFlight = true;
      this.writeChain = this.writeChain
        .then(() => this.flushLoop())
        .catch((err) => console.error("[DB] PostgreSQL persistence error:", err));
    }
  }

  private async flushLoop(): Promise<void> {
    try {
      while (this.pendingSnapshot) {
        const snapshot = this.pendingSnapshot;
        this.pendingSnapshot = null;
        await this.commitSnapshot(snapshot);
      }
    } finally {
      this.writeInFlight = false;
    }
  }

  private async commitSnapshot(snapshot: string): Promise<void> {
    const data = JSON.parse(snapshot) as DatabaseSchema;
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      for (const key of ARRAY_COLLECTIONS) {
        const rows: any[] = (data as any)[key] || [];
        await client.query(`DELETE FROM "${this.table(key)}"`);
        for (const row of rows) {
          await client.query(
            `INSERT INTO "${this.table(key)}" (id, workspace_id, payload) VALUES ($1, $2, $3)`,
            [row.id, row.workspaceId || null, JSON.stringify(row)]
          );
        }
      }
      await client.query(`DELETE FROM "${this.table("platform_settings")}"`);
      await client.query(
        `INSERT INTO "${this.table("platform_settings")}" (id, workspace_id, payload) VALUES ('global', NULL, $1)`,
        [JSON.stringify(data.platform_settings || createEmptyDatabase().platform_settings)]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async shutdown(): Promise<void> {
    await this.writeChain.catch(() => undefined);
    await this.pool.end();
  }
}

// -----------------------------------------------------------------------------
// Store selection
// -----------------------------------------------------------------------------
let activeStore: DatabaseStore | null = null;

export function getDatabaseStore(): DatabaseStore {
  if (activeStore) return activeStore;

  const engineRaw = (process.env.DB_ENGINE || "postgres").toLowerCase().trim();
  if (engineRaw === "json") {
    console.warn(
      "[DB] DB_ENGINE=json — using the DEV/TEST JSON fallback store. This is NOT a production configuration."
    );
    activeStore = new JsonStore();
    return activeStore;
  }

  if (engineRaw !== "postgres") {
    throw new Error(
      `Unsupported DB_ENGINE="${engineRaw}". Supported values: "postgres", "json".`
    );
  }

  activeStore = new PostgresStore(process.env.DATABASE_URL || "");
  return activeStore;
}
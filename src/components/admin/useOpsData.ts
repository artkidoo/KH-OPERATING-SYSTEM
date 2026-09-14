import React from "react";
import { api } from "../../services/api";

// Ops data source for Admin Studio Operations. Uses the REAL admin production
// endpoints — requests (creative requests) AND jobs (unified production
// lifecycle engine). Never fabricates counts.
export function useOpsData() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [requests, setRequests] = React.useState<any[]>([]);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [workspaces, setWorkspaces] = React.useState<any[]>([]);
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rr, jj, uu, ww] = await Promise.all([
        (api.production as any).list().catch((e: any) => { throw e?.message ? e : new Error("Requests load failed"); }),
        (api.production as any).jobs.list().catch(() => ({ jobs: [] })),
        (api.admin as any).getUsers({ search: "" }).catch(() => ({ users: [] })),
        (api.admin as any).getWorkspaces({ search: "" }).catch(() => ({ workspaces: [] })),
      ]);
      setRequests(rr.requests || []);
      setJobs(jj.jobs || []);
      setCustomers(((uu.users || []) as any[]).filter((u: any) => (u.systemRole || "user") === "user"));
      setWorkspaces(ww.workspaces || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load operations data. Check your session and retry.");
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => { void load(); }, [load]);
  return { loading, error, setError, requests, jobs, customers, workspaces, load };
}

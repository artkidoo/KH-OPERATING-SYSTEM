// PHASE 2 — demo seeding with realistic data (additive, real API writes).
import { api } from "../services/api";

function gradientArtwork(title: string): string {
  const c = document.createElement("canvas");
  c.width = 600; c.height = 600;
  const x = c.getContext("2d");
  if (!x) return "";
  const g = x.createLinearGradient(0, 0, 600, 600);
  g.addColorStop(0, "#17171c"); g.addColorStop(0.55, "#3d0f16"); g.addColorStop(1, "#E11D2E");
  x.fillStyle = g; x.fillRect(0, 0, 600, 600);
  x.fillStyle = "#ffffff"; x.font = "bold 72px system-ui, sans-serif";
  x.textAlign = "center"; x.fillText(title, 300, 300);
  x.font = "28px system-ui, sans-serif"; x.fillStyle = "#f5c9ce";
  x.fillText("KEEDOHUB • DEMO", 300, 350);
  return c.toDataURL("image/png");
}

export async function seedArtistDemo(wsId: string): Promise<string> {
  const proj = await api.projects.create(wsId, {
    title: "LIGHT", description: "Debut single campaign — release, artwork, social, press.",
    category: "Release", status: "in-progress", priority: "high",
    sections: ["Release Information", "Artwork", "Photos", "Social Assets", "Motion", "Press", "Copy", "Downloads"],
  } as never);
  const pid = (proj.project as { id: string }).id;
  await api.releases.create(wsId, {
    title: "LIGHT", artistName: "KAYDO", genre: "Afro-Fusion",
    releaseType: "single", releaseDate: "2026-10-24", status: "ready", projectId: pid,
  } as never);
  const art = gradientArtwork("LIGHT");
  if (art) {
    await api.assets.create(wsId, {
      name: "LIGHT — master artwork", category: "cover", url: art,
      size: art.length, mimeType: "image/png", dimensions: "600x600",
      projectId: pid, tags: ["demo", "artwork", "favorite"],
      metadata: { favorite: true, demo: true },
    } as never);
  }
  await api.creativeRequests.create(wsId, {
    title: "Social package for LIGHT", requestType: "content", serviceName: "content",
    briefDetails: "Demo request: 6-piece social rollout for the LIGHT release.",
    description: "Demo request: 6-piece social rollout for the LIGHT release.",
    projectId: pid, lifecycleStatus: "IN_PRODUCTION",
  } as never);
  return pid;
}

export async function seedBrandDemo(wsId: string, brandName: string): Promise<string> {
  const proj = await api.projects.create(wsId, {
    title: "Brand Refresh", description: "New identity rollout — logos, social, deck, documents.",
    category: "Brand", status: "in-progress", priority: "high",
    sections: ["Brief", "Brand Assets", "Social Content", "Presentations", "Documents", "Final Deliverables"],
  } as never);
  const pid = (proj.project as { id: string }).id;
  const logo = gradientArtwork(brandName.slice(0, 4).toUpperCase() || "KH");
  if (logo) {
    await api.assets.create(wsId, {
      name: `${brandName} — primary logo`, category: "brand", url: logo,
      size: logo.length, mimeType: "image/png", dimensions: "600x600",
      projectId: pid, tags: ["demo", "logo", "approved"],
      metadata: { approved: true, demo: true },
    } as never);
  }
  await api.businessDocuments.create(wsId, {
    documentType: "proposal", title: `${brandName} launch proposal`,
    status: "draft", content: { subject: "Launch", details: "Demo proposal seeded by KeedoHub." },
  });
  return pid;
}

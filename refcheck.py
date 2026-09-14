import pathlib
import sys

src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path("src")
comps = [
    "EPKBuilder",
    "MasteringSuite",
    "PresaveHub",
    "SplitsCalculator",
    "AssetStudio",
    "CreativeMemoryDashboard",
    "CreativeRadarDashboard",
    "IntelHub",
    "WorkflowHub",
    "AnalyticsView",
    "CreativeBrainSlideOver",
    "StudioAdmin",
]

for comp in comps:
    hits = set()
    for p in list(src.rglob("*.ts")) + list(src.rglob("*.tsx")):
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
            if comp in text:
                hits.add(str(p))
        except Exception:
            pass
    if hits:
        print(f"{comp} referenced in: {sorted(hits)}")
    else:
        print(f"{comp}: NO REFERENCES (safe to delete)")

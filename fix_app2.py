import pathlib, re

p = pathlib.Path("src/App.tsx")
s = p.read_text(encoding="utf-8")

changed = False

# 1) RemovedTools import (idempotent)
if 'import { RemovedTools } from "./components/RemovedTools";' not in s:
    s = s.replace(
        'import { CreativeBrainSlideOver } from "./components/CreativeBrainSlideOver";',
        'import { RemovedTools } from "./components/RemovedTools";',
    )
    changed = True
    print("Imported RemovedTools (replaced CreativeBrainSlideOver import).")
else:
    print("RemovedTools import already present.")

# 2) RemovedTools rendered after WorkspaceShell block
ws_block = (
    '        {(activeTab === "command-center" ||\n'
    '          activeTab === "workspace-hub" ||\n'
    '          activeTab === "artist-os" ||\n'
    '          activeTab === "brand-os" ||\n'
    '          activeTab === "project-console" ||\n'
    '          activeTab === "resource-vault" ||\n'
    '          activeTab === "requests" ||\n'
    '          activeTab === "membership" ||\n'
    '          activeTab === "profile") && (\n'
    '          <WorkspaceShell\n'
    '            onNotify={addNotification}\n'
    '            onNavigateTab={setActiveTab}\n'
    '            initialSection={workspaceSection}\n'
    '            onSectionChange={(sec) => setActiveTab("command-center", sec)}\n'
    '          />\n'
    '        )}'
)
insert_marker = '\n\n        {activeTab === "removed" && <RemovedTools />}'
if ws_block in s and insert_marker not in s:
    s = s.replace(ws_block, ws_block + insert_marker)
    changed = True
    print("Inserted RemovedTools after WorkspaceShell block.")
elif insert_marker in s:
    print("RemovedTools render already present after WorkspaceShell block.")
else:
    studio_comment = "/* Studio is the internal production engine."
    if studio_comment in s and insert_marker not in s:
        s = s.replace(studio_comment, insert_marker + "\n\n        " + studio_comment)
        changed = True
        print("Inserted RemovedTools before Studio comment (fallback).")
    else:
        print("WARN: could not locate insertion point for RemovedTools.")

# 3) Replace the studio tab render with RemovedTools (customer-facing DIY studio removed)
studio_block = (
    '        {activeTab === "studio" && hasAdminAccess(user?.systemRole) ? (\n'
    '          <Studio\n'
    '            onNotify={addNotification}\n'
    '            onNavigateTab={setActiveTab}\n'
    '            onNavigateWorkspaceSection={(sec) => {\n'
    '              setWorkspaceSection(sec);\n'
    '              setActiveTab("command-center");\n'
    '            }}\n'
    '            initialServiceCategory={studioServiceCategory}\n'
    '          />\n'
    '        ) : activeTab === "studio" && (\n'
    '          <WorkspaceShell\n'
    '            initialSection="requests"\n'
    '            onNotify={addNotification}\n'
    '            onNavigateTab={setActiveTab}\n'
    '          />\n'
    '        )}'
)
replacement = (
    '\n        {activeTab === "studio" && (\n'
    '          <RemovedTools />\n'
    '        )}'
)
if studio_block in s:
    s = s.replace(studio_block, replacement)
    changed = True
    print("Replaced studio tab render with RemovedTools.")
else:
    # tolerant: find the studio tab block even if whitespace differs
    m = re.search(r'\{activeTab === "studio" && hasAdminAccess\(user\?\.systemRole\).*?\n        \)\}', s, re.S)
    if m and "RemovedTools" not in m.group(0):
        s = s[:m.start()] + (
            '\n        {activeTab === "studio" && (\n'
            '          <RemovedTools />\n'
            '        )}'
        ) + s[m.end():]
        changed = True
        print("Tolerant studio block replaced with RemovedTools.")
    else:
        print("WARN: studio block already replaced or not found.")

# 4) Remove studio-admin tab render (competing admin dashboard)
studio_admin_block = (
    '        {activeTab === "studio-admin" && hasAdminAccess(user?.systemRole) && (\n'
    '          <StudioAdmin onNotify={addNotification} />\n'
    '        )}'
)
if studio_admin_block in s:
    s = s.replace(studio_admin_block, "")
    changed = True
    print("Removed studio-admin tab render.")
elif "activeTab === \"studio-admin\"" in s:
    # tolerant removal
    m = re.search(r'\{activeTab === "studio-admin" && hasAdminAccess\(user\?\.systemRole\) && \(.*?</StudioAdmin>\n        \}\}', s, re.S)
    if m:
        s = s[:m.start()] + s[m.end():]
        changed = True
        print("Tolerant studio-admin block removed.")
    else:
        print("WARN: studio-admin block not found in expected form.")
else:
    print("studio-admin tab render already absent.")

p.write_text(s, encoding="utf-8")
print("DONE App.tsx", "changed" if changed else "no-change", "lines:", len(s.splitlines()))

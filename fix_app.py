import re, pathlib

p = pathlib.Path('src/App.tsx')
s = p.read_text(encoding='utf-8')

# 1) Remove the obsolete workflow block
s = re.sub(
    r'\n\s*\{activeTab === "workflow" && \(\s*<WorkflowHub\s*\n\s*workspaceId=\{activeWorkspace\?\.id\}\s*\n\s*onNavigateTab=\{setActiveTab\}\s*\n\s*\/>\s*\)\s*\}\s*\n\s*',
    '\n',
    s, flags=re.MULTILINE)

# 2) Insert RemovedTools right after the journal block
marker = '''              />
            )}

            {(activeTab === "command-center" ||'''
if marker in s:
    s = s.replace(marker, '''              />
            )}

            {activeTab === "removed" && <RemovedTools />}

            {(activeTab === "command-center" ||''')
else:
    print('WARN: journal-block marker not found')

# 3) Remove obsolete creative-memory / creative-radar / intel-hub / analytics / collaboration blocks
for blk in [
    r'\n\s*\{activeTab === "creative-memory" && \(\s*<CreativeMemoryDashboard[^}]*?\)\s*\}\s*\n',
    r'\n\s*\{activeTab === "creative-radar" && \(\s*<CreativeRadarDashboard[^}]*?\)\s*\}\s*\n',
    r'\n\s*\{activeTab === "intel-hub" && \(\s*<IntelHub[^}]*?\)\s*\}\s*\n',
    r'\n\s*\{activeTab === "analytics" && \(\s*<AnalyticsView[^}]*?\)\s*\}\s*\n',
    r'\n\s*\{activeTab === "collaboration" && \(\s*<CollaborationHub[^}]*?\)\s*\}\s*\n',
]:
    before = len(s)
    s = re.sub(blk, '\n', s, flags=re.DOTALL)
    if len(s) != before:
        print('Removed a stale block.')

# 4) Remove the duplicate studio-admin block (AdminDashboard is the canonical admin)
before = len(s)
s = re.sub(r'\n\s*\{activeTab === "studio-admin" && hasAdminAccess\(user\?\.systemRole\) && \(\s*<StudioAdmin[^}]*?\)\s*\}\s*\n', '\n', s, flags=re.DOTALL)
if len(s) != before:
    print('Removed studio-admin duplicate block.')

p.write_text(s, encoding='utf-8')
print('App.tsx edits applied.')

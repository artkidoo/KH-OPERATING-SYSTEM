import React, { useState } from "react";
import { ActiveTab, StudioServiceCategory } from "./types";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { CreativeBrainProvider, useCreativeBrain } from "./context/CreativeBrainContext";
import { Header } from "./components/Header";
import { HeroStudioOS } from "./components/HeroStudioOS";
import { CommandCenter } from "./components/CommandCenter";
import { ArtistOS } from "./components/ArtistOS";
import { ContentEngine } from "./components/ContentEngine";
import { Studio } from "./components/Studio";
import { WorkspaceHub } from "./components/WorkspaceHub";
import { ArtistContentBrain } from "./components/ArtistContentBrain";
import { CoverStudio } from "./components/CoverStudio";
import { BrandOS } from "./components/BrandOS";
import { EPKBuilder } from "./components/EPKBuilder";
import { ProjectConsole } from "./components/ProjectConsole";
import { ResourceVault } from "./components/ResourceVault";
import { IntelHub } from "./components/IntelHub";
import { LyricsStudio } from "./components/LyricsStudio";
import { DSPPitcher } from "./components/DSPPitcher";
import { MasteringSuite } from "./components/MasteringSuite";
import { SplitsCalculator } from "./components/SplitsCalculator";
import { PresaveHub } from "./components/PresaveHub";
import { CreativeBrainConsole } from "./components/CreativeBrainConsole";
import { CreativeMemoryDashboard } from "./components/CreativeMemoryDashboard";
import { CreativeRadarDashboard } from "./components/CreativeRadarDashboard";
import { AnalyticsView } from "./components/AnalyticsView";
import { WorkflowHub } from "./components/WorkflowHub";
import { CollaborationHub } from "./components/collaboration/CollaborationHub";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { Footer } from "./components/Footer";
import { CommandPalette } from "./components/CommandPalette";
import { BriefModal } from "./components/BriefModal";
import { CreativeBrainSlideOver } from "./components/CreativeBrainSlideOver";
import { OnboardingModal } from "./components/onboarding/OnboardingModal";
import { Toast, ToastMessage } from "./components/Toast";
import { AboutPage } from "./components/pages/AboutPage";
import { VisionPage } from "./components/pages/VisionPage";
import { StoryPage } from "./components/pages/StoryPage";
import { ContactPage } from "./components/pages/ContactPage";
import { FAQPage } from "./components/pages/FAQPage";
import { HelpCenterPage } from "./components/pages/HelpCenterPage";
import { DocumentationPage } from "./components/pages/DocumentationPage";
import { ResourcesPage } from "./components/pages/ResourcesPage";
import { PrivacyPolicyPage } from "./components/pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "./components/pages/TermsOfServicePage";
import { SecurityPage } from "./components/pages/SecurityPage";
import { ForumPage } from "./components/pages/ForumPage";
import { TrendingPage } from "./components/pages/TrendingPage";
import { 
  Search, 
  BrainCircuit,
  Rocket, 
  Radio, 
  Disc3, 
  Sparkles, 
  Layers, 
  Palette, 
  HardDrive 
} from "lucide-react";

function getTabFromPath(path: string): ActiveTab {
  const normalized = path.toLowerCase().replace(/\/$/, "");
  switch (normalized) {
    case "/about":
      return "about";
    case "/vision":
      return "vision";
    case "/story":
      return "story";
    case "/contact":
      return "contact";
    case "/faq":
      return "faq";
    case "/help":
      return "help";
    case "/docs":
      return "docs";
    case "/resources":
      return "resources";
    case "/privacy":
      return "privacy";
    case "/terms":
      return "terms";
    case "/security":
      return "security";
    case "/forum":
      return "forum";
    case "/trending":
      return "trending";
    case "/workspace":
      return "command-center";
    case "/studios":
      return "studio";
    case "/creative-brain":
      return "creative-brain";
    case "/artist-os":
      return "artist-os";
    case "/brand-os":
      return "brand-os";
    case "/admin":
      return "admin";
    case "/home":
    case "":
      return "overview";
    default:
      return "overview";
  }
}

function MainAppContent() {
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    if (typeof window !== "undefined") {
      return getTabFromPath(window.location.pathname);
    }
    return "overview";
  });
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [studioServiceCategory, setStudioServiceCategory] = useState<StudioServiceCategory | undefined>();

  const { activeWorkspace, user } = useAuth();
  const { toggleBrain } = useCreativeBrain();

  // URL synchronization helper
  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // Sync with browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPath(window.location.pathname);
      setActiveTabState(tab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const addNotification = (text: string, type: "success" | "info" | "error" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[var(--bento-bg)] text-[var(--bento-text)] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[var(--accent-color)] selection:text-[var(--accent-text)] transition-colors duration-200 pb-16 sm:pb-0">
      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        setActiveTab={setActiveTab}
        openBriefModal={() => setIsBriefOpen(true)}
      />

      {/* Global Quick Brief Modal */}
      <BriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
        onNotify={addNotification}
      />

      {/* Progressive Onboarding & Activation Layer */}
      <OnboardingModal />

      {/* Creative Brain Slide-over Assistant */}
      <CreativeBrainSlideOver setActiveTab={setActiveTab} />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Sticky OS Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCommandPalette={() => setIsCommandOpen(true)}
        openBriefModal={() => setIsBriefOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <HeroStudioOS
            setActiveTab={setActiveTab}
            openBriefModal={() => setIsBriefOpen(true)}
          />
        )}

        {activeTab === "command-center" && (
          <CommandCenter
            onNavigateTab={setActiveTab}
            onOpenBriefModal={() => setIsBriefOpen(true)}
            onNotify={addNotification}
          />
        )}

        {activeTab === "workflow" && (
          <WorkflowHub
            workspaceId={activeWorkspace?.id}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "collaboration" && (
          <CollaborationHub
            workspaceId={activeWorkspace?.id || ""}
            currentUser={
              user
                ? {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    role: activeWorkspace?.role || "owner",
                  }
                : undefined
            }
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsView
            onNotify={addNotification}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "artist-os" && (
          <WorkspaceHub
            setActiveTab={setActiveTab}
            onNotify={addNotification}
            initialSubTab="artist-os"
          />
        )}

        {activeTab === "content-engine" && (
          <ContentEngine />
        )}

        {activeTab === "studio" && (
          <Studio
            onNotify={addNotification}
            onNavigateTab={setActiveTab}
            initialServiceCategory={studioServiceCategory}
          />
        )}

        {activeTab === "workspace-hub" && (
          <WorkspaceHub
            setActiveTab={setActiveTab}
            onNotify={addNotification}
          />
        )}

        {activeTab === "artist-brain" && (
          <ArtistContentBrain onNotify={addNotification} />
        )}

        {activeTab === "creative-brain" && (
          <CreativeBrainConsole setActiveTab={setActiveTab} />
        )}

        {activeTab === "creative-memory" && (
          <CreativeMemoryDashboard
            onNotify={addNotification}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "creative-radar" && (
          <CreativeRadarDashboard
            onNotify={addNotification}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === "lyrics-studio" && (
          <LyricsStudio onNotify={addNotification} />
        )}

        {activeTab === "dsp-pitcher" && (
          <DSPPitcher onNotify={addNotification} />
        )}

        {activeTab === "mastering-suite" && (
          <MasteringSuite onNotify={addNotification} />
        )}

        {activeTab === "splits-calculator" && (
          <SplitsCalculator onNotify={addNotification} />
        )}

        {activeTab === "presave-hub" && (
          <PresaveHub onNotify={addNotification} />
        )}

        {activeTab === "cover-studio" && (
          <CoverStudio onNotify={addNotification} />
        )}

        {activeTab === "brand-os" && (
          <BrandOS
            onNotify={addNotification}
            onNavigateTab={(tab) => {
              if (tab.startsWith("studio:")) {
                setStudioServiceCategory(tab.replace("studio:", "") as StudioServiceCategory);
                setActiveTab("studio");
              } else {
                setActiveTab(tab as ActiveTab);
              }
            }}
            standalone
          />
        )}

        {activeTab === "epk-builder" && (
          <EPKBuilder onNotify={addNotification} />
        )}

        {activeTab === "project-console" && (
          <ProjectConsole onNotify={addNotification} />
        )}

        {activeTab === "resource-vault" && (
          <ResourceVault onNotify={addNotification} />
        )}

        {activeTab === "intel-hub" && (
          <IntelHub onNotify={addNotification} />
        )}

        {activeTab === "admin" && (
          <AdminDashboard onBackToApp={() => setActiveTab("command-center")} />
        )}

        {activeTab === "about" && (
          <AboutPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "vision" && (
          <VisionPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "story" && (
          <StoryPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "contact" && (
          <ContactPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "faq" && (
          <FAQPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "help" && (
          <HelpCenterPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "docs" && (
          <DocumentationPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "resources" && (
          <ResourcesPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "privacy" && (
          <PrivacyPolicyPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "terms" && (
          <TermsOfServicePage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "security" && (
          <SecurityPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "forum" && (
          <ForumPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}

        {activeTab === "trending" && (
          <TrendingPage onNavigateTab={setActiveTab} openBriefModal={() => setIsBriefOpen(true)} />
        )}
      </main>

      {/* Floating in-portal assistant trigger */}
      <button
        id="floating-chat-assistant-btn"
        onClick={toggleBrain}
        className="fixed bottom-16 sm:bottom-6 left-4 sm:left-6 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent-border)] bg-theme-accent text-white shadow-lg transition-all hover:scale-105"
        title="Open KH Chat assistant"
      >
        <BrainCircuit className="h-4 w-4" />
        <span className="sr-only">KH Chat</span>
      </button>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bento-card)] border-t border-[var(--bento-border)] px-2 py-2 flex items-center justify-around backdrop-blur-xl shadow-2xl">
        <button
          onClick={() => setActiveTab("command-center")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer ${
            activeTab === "command-center" ? "text-red-500 font-bold" : "text-zinc-400"
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span className="text-[10px]">Command</span>
        </button>

        <button
          onClick={() => setActiveTab("creative-radar")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer ${
            activeTab === "creative-radar" ? "text-amber-400 font-bold" : "text-zinc-400"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span className="text-[10px]">Radar</span>
        </button>

        <button
          onClick={() => setActiveTab("workspace-hub")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer ${
            activeTab === "workspace-hub" || activeTab === "artist-os" || activeTab === "brand-os" ? "text-red-400 font-bold" : "text-zinc-400"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span className="text-[10px]">Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab("studio")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer ${
            activeTab === "studio" ? "text-pink-400 font-bold" : "text-zinc-400"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span className="text-[10px]">Studio</span>
        </button>
      </div>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        openBriefModal={() => setIsBriefOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <CreativeBrainProvider>
            <MainAppContent />
          </CreativeBrainProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

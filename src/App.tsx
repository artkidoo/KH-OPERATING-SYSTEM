import React, { useState } from "react";
import { ActiveTab } from "./types";
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
import { CreatorOS } from "./components/CreatorOS";
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
import { Footer } from "./components/Footer";
import { CommandPalette } from "./components/CommandPalette";
import { BriefModal } from "./components/BriefModal";
import { CreativeBrainSlideOver } from "./components/CreativeBrainSlideOver";
import { OnboardingModal } from "./components/onboarding/OnboardingModal";
import { Toast, ToastMessage } from "./components/Toast";
import { 
  PhoneCall, 
  Search, 
  Rocket, 
  Radio, 
  Disc3, 
  Sparkles, 
  Layers, 
  BrainCircuit, 
  Palette, 
  HardDrive 
} from "lucide-react";

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { activeWorkspace, user } = useAuth();
  const { toggleBrain } = useCreativeBrain();

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
          <ArtistOS onNavigateTab={setActiveTab} />
        )}

        {activeTab === "content-engine" && (
          <ContentEngine />
        )}

        {activeTab === "studio" && (
          <Studio onNotify={addNotification} onNavigateTab={setActiveTab} />
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
          <BrandOS onNotify={addNotification} onNavigateTab={setActiveTab} />
        )}

        {activeTab === "creator-os" && (
          <CreatorOS onNotify={addNotification} />
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
      </main>

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
          onClick={() => setActiveTab(activeWorkspace?.identityType === "artist" ? "artist-os" : "brand-os")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer ${
            activeTab === "artist-os" || activeTab === "brand-os" ? "text-red-400 font-bold" : "text-zinc-400"
          }`}
        >
          {activeWorkspace?.identityType === "artist" ? <Disc3 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          <span className="text-[10px]">{activeWorkspace?.identityType === "artist" ? "Artist" : "Brand"}</span>
        </button>

        <button
          onClick={() => toggleBrain()}
          className="flex flex-col items-center gap-1 p-1.5 rounded-xl cursor-pointer text-purple-400"
        >
          <BrainCircuit className="w-4 h-4" />
          <span className="text-[10px]">Brain</span>
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

      {/* Floating Bottom Direct Chat Trigger */}
      <div className="fixed bottom-16 sm:bottom-6 left-4 sm:left-6 z-30">
        <a
          id="floating-whatsapp-btn"
          href="https://wa.me/2348104465924?text=Hi%20Keedohub!%20I%20am%20using%20the%20Creative%20OS%20and%20want%20to%20collaborate."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30 hover:scale-105 transition-all duration-200 cursor-pointer"
          title="Chat on WhatsApp (+234-810-446-5924)"
        >
          <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-xs font-semibold tracking-tight">Chat with us</span>
        </a>
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

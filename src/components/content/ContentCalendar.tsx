import React, { useState, useMemo } from "react";
import {
  ContentItem,
  Release,
  Campaign,
  ContentPlatform,
  ContentStatus,
} from "../../types";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Disc3,
  Target,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
  Eye,
} from "lucide-react";

interface ContentCalendarProps {
  onOpenItemEditor: (item: Partial<ContentItem> | null, initialDate?: string) => void;
}

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: "🎵",
  instagram: "📸",
  youtube: "▶️",
  x: "🐦",
  twitter: "🐦",
  linkedin: "💼",
  threads: "🧵",
  spotify: "🟢",
  blog: "📰",
  other: "🌐",
};

export const ContentCalendar: React.FC<ContentCalendarProps> = ({ onOpenItemEditor }) => {
  const { contentItems, releases, campaigns } = useWorkspace();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar matrix for the month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: {
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    const todayStr = new Date().toISOString().split("T")[0];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const mStr = String(prevMonth + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      const dateString = `${prevYear}-${mStr}-${dStr}`;
      days.push({
        dateString,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      const dateString = `${year}-${mStr}-${dStr}`;
      days.push({
        dateString,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
      });
    }

    // Next month filler days to complete grid of 35 or 42
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const mStr = String(nextMonth + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      const dateString = `${nextYear}-${mStr}-${dStr}`;
      days.push({
        dateString,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
      });
    }

    return days;
  }, [year, month]);

  // Filter content items
  const filteredItems = useMemo(() => {
    return contentItems.filter((item) => {
      if (selectedPlatform !== "all" && item.platform !== selectedPlatform) return false;
      if (selectedReleaseId !== "all" && item.releaseId !== selectedReleaseId) return false;
      return true;
    });
  }, [contentItems, selectedPlatform, selectedReleaseId]);

  // Group items by scheduled date
  const itemsByDate = useMemo(() => {
    const map: Record<string, ContentItem[]> = {};
    filteredItems.forEach((item) => {
      if (item.scheduledDate) {
        if (!map[item.scheduledDate]) map[item.scheduledDate] = [];
        map[item.scheduledDate].push(item);
      }
    });
    return map;
  }, [filteredItems]);

  // Releases by date
  const releasesByDate = useMemo(() => {
    const map: Record<string, Release[]> = {};
    releases.forEach((rel) => {
      if (rel.releaseDate) {
        if (!map[rel.releaseDate]) map[rel.releaseDate] = [];
        map[rel.releaseDate].push(rel);
      }
    });
    return map;
  }, [releases]);

  // Campaigns by date (start and end)
  const campaignsByDate = useMemo(() => {
    const map: Record<string, { campaign: Campaign; type: "start" | "end" }[]> = {};
    campaigns.forEach((camp) => {
      if (camp.startDate) {
        if (!map[camp.startDate]) map[camp.startDate] = [];
        map[camp.startDate].push({ campaign: camp, type: "start" });
      }
      if (camp.endDate) {
        if (!map[camp.endDate]) map[camp.endDate] = [];
        map[camp.endDate].push({ campaign: camp, type: "end" });
      }
    });
    return map;
  }, [campaigns]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-4">
      {/* Calendar Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-bold text-neutral-100 min-w-[140px] text-center font-mono">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 border border-neutral-700/60 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">All Platforms</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="x">X / Twitter</option>
            <option value="linkedin">LinkedIn</option>
            <option value="spotify">Spotify</option>
          </select>

          {/* Release Filter */}
          <select
            value={selectedReleaseId}
            onChange={(e) => setSelectedReleaseId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-200 focus:outline-none focus:border-red-500"
          >
            <option value="all">All Releases</option>
            {releases.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => onOpenItemEditor(null, new Date().toISOString().split("T")[0])}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-neutral-800 bg-neutral-900/80 text-center py-2.5 text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-800/80">
          {calendarDays.map((day) => {
            const dayItems = itemsByDate[day.dateString] || [];
            const dayReleases = releasesByDate[day.dateString] || [];
            const dayCampaigns = campaignsByDate[day.dateString] || [];

            const isQuietDay = day.isCurrentMonth && dayItems.length === 0 && dayReleases.length === 0;

            return (
              <div
                key={day.dateString}
                className={`min-h-[115px] p-2 flex flex-col justify-between transition-colors relative group ${
                  day.isCurrentMonth ? "bg-neutral-950/70" : "bg-neutral-900/20 opacity-40"
                } ${day.isToday ? "ring-1 ring-red-500/80 bg-red-950/10" : ""}`}
              >
                {/* Day Number & Quick Add Button */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                      day.isToday
                        ? "bg-red-600 text-white font-bold"
                        : day.isCurrentMonth
                        ? "text-neutral-300"
                        : "text-neutral-600"
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {day.isCurrentMonth && (
                    <button
                      onClick={() => onOpenItemEditor(null, day.dateString)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-opacity cursor-pointer"
                      title={`Schedule on ${day.dateString}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Badges / Items Container */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] scrollbar-none">
                  {/* Pinned Release Drop Dates */}
                  {dayReleases.map((rel) => (
                    <div
                      key={rel.id}
                      className="px-2 py-1 rounded-md bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm truncate"
                      title={`Release Drop: ${rel.title}`}
                    >
                      <Disc3 className="w-3 h-3 shrink-0 animate-spin" />
                      <span className="truncate">DROP: {rel.title}</span>
                    </div>
                  ))}

                  {/* Pinned Campaign Milestones */}
                  {dayCampaigns.map(({ campaign, type }, idx) => (
                    <div
                      key={`${campaign.id}-${idx}`}
                      className="px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm truncate"
                      title={`Campaign ${type === "start" ? "Launch" : "Wrap"}: ${campaign.title}`}
                    >
                      <Target className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">
                        {type === "start" ? "CAMP LAUNCH" : "CAMP END"}: {campaign.title}
                      </span>
                    </div>
                  ))}

                  {/* Scheduled Content Items */}
                  {dayItems.map((item) => {
                    const icon = PLATFORM_ICONS[item.platform] || "🌐";
                    const isDraft = item.status === "draft" || item.status === "idea";
                    return (
                      <div
                        key={item.id}
                        onClick={() => onOpenItemEditor(item)}
                        className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5 cursor-pointer truncate border transition-all ${
                          isDraft
                            ? "bg-amber-950/40 text-amber-200 border-amber-800/50 hover:border-amber-500"
                            : item.status === "scheduled"
                            ? "bg-emerald-950/40 text-emerald-200 border-emerald-800/50 hover:border-emerald-500"
                            : "bg-neutral-900 text-neutral-200 border-neutral-800 hover:border-neutral-600"
                        }`}
                        title={`${item.title} (${item.platform}) - Click to edit`}
                      >
                        <span className="shrink-0 text-xs">{icon}</span>
                        <span className="truncate font-semibold">{item.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Empty Day Indicator on Current Month */}
                {isQuietDay && (
                  <div className="mt-auto text-[9px] text-neutral-600 font-mono italic opacity-40">
                    --
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      version: "3.0.0",
      system: "Keedohub Creative OS",
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Artist Content Brain & Rollout Generator API
  app.post("/api/ai/artist-rollout", async (req, res) => {
    const { trackTitle, artistName, genre, releaseType, releaseDate, story, targetAudience, keyTheme } = req.body;

    if (!trackTitle || !artistName) {
      return res.status(400).json({ error: "Track title and artist name are required" });
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({
          source: "fallback-algorithmic",
          message: "Programmed Algorithmic Engine Active (No external AI key required)",
          data: generateAlgorithmicRollout({ trackTitle, artistName, genre, releaseType, releaseDate, keyTheme, targetAudience }),
        });
      }

      const ai = getGemini();
      const prompt = `You are the Executive Music Marketing Director & Release Architect at Keedohub Creative Operating System.
Generate an elite, hyper-tactical, 30-Day Music Release Campaign Blueprint & Programmed Brain for:
- Track/Project: "${trackTitle}" by "${artistName}"
- Type: ${releaseType || "Single"}
- Genre/Vibe: ${genre || "Afro-Fusion / Alté / Global"}
- Release Date: ${releaseDate || "Next Month"}
- Theme/Story: ${story || keyTheme || "High-energy ambition, late-night driving vibes"}
- Target Audience: ${targetAudience || "Gen-Z & Millennial streaming tastemakers, club DJs, Spotify curators"}

Return ONLY a valid JSON object matching this structure (no markdown fences, just pure JSON):
{
  "tagline": "Short magnetic release slogan",
  "diasporaAngle": "Key cultural, sonic or global narrative for curators and press",
  "phases": [
    {
      "phaseName": "Phase 1: Pre-Release Anticipation",
      "focus": "Cultivate mysterious intrigue, collect pre-saves, and seed TikTok/Reels audio snippets",
      "timeframe": "T-14 to T-1 Days",
      "actions": [
        {
          "day": "Day -14",
          "platform": "Instagram Reels & TikTok",
          "contentType": "Studio Voice Memo / Creation Moment",
          "concept": "Raw studio footage showing the exact moment the melody or drum pattern locked in at 3 AM.",
          "captionHook": "Exact magnetic caption with CTA",
          "timeToPost": "18:30 GMT+1 (WAT) / 1:30 PM EST",
          "algorithmTip": "First 2.5s visual hook; pin the top comment asking fans to guess the genre.",
          "soundSnippet": "Intro build up into initial hook (0:00 - 0:18)",
          "hashtags": ["#NewMusicAlert", "#BehindTheBeat", "#Afrobeats2026"],
          "priority": "CRITICAL"
        },
        {
          "day": "Day -10",
          "platform": "Spotify Pre-Save & Apple Music",
          "contentType": "Cover Artwork 3D Reveal",
          "concept": "High-impact visualizer or spinning vinyl reveal showing the official cover art.",
          "captionHook": "Exact magnetic caption with pre-save link reminder",
          "timeToPost": "19:00 GMT+1 (WAT) / 2:00 PM EST",
          "algorithmTip": "Carousel post with 3 slides to maximize swipe-through dwell time.",
          "soundSnippet": "Chorus energy peak (0:45 - 1:05)",
          "hashtags": ["#CoverArtReveal", "#PreSaveNow", "#FreshSounds"],
          "priority": "HIGH"
        },
        {
          "day": "Day -5",
          "platform": "TikTok & YouTube Shorts",
          "contentType": "15-Second Relatable Sound Hook",
          "concept": "Point-of-view (POV) relatable situational video over the key 15s chorus.",
          "captionHook": "Exact caption",
          "timeToPost": "20:15 GMT+1 (WAT) / 3:15 PM EST",
          "algorithmTip": "Looping video format where the last frame matches the first for 100%+ retention rate.",
          "soundSnippet": "Main vocal punchline (0:30 - 0:45)",
          "hashtags": ["#POV", "#TrendingAudio", "#SongOfTheSummer"],
          "priority": "CRITICAL"
        },
        {
          "day": "Day -1",
          "platform": "All Channels & WhatsApp Status",
          "contentType": "24-Hour Midnight Lockdown Countdown",
          "concept": "High-contrast countdown ticker with snippet and audio visualizer.",
          "captionHook": "Exact midnight alert caption",
          "timeToPost": "21:00 GMT+1 (WAT) / 4:00 PM EST",
          "algorithmTip": "Direct DM/WhatsApp broadcast to top 50 core superfans for instant hour-one stream spike.",
          "soundSnippet": "Drop climax (0:50 - 1:10)",
          "hashtags": ["#MidnightDrop", "#NewMusicFriday", "#OutTonight"],
          "priority": "HIGH"
        }
      ]
    },
    {
      "phaseName": "Phase 2: Drop Day & Launch Weekend",
      "focus": "Trigger maximum Day-1 streaming velocity, editorial playlist saves, and algorithm indexing",
      "timeframe": "Day 0 to Day 3",
      "actions": [
        {
          "day": "Day 0 (Release Day)",
          "platform": "All Streaming Platforms & Socials",
          "contentType": "Official Drop Announcement & SmartLink Hub",
          "concept": "Multi-asset blast featuring high-res artwork, DSP badges, and direct link-in-bio.",
          "captionHook": "Out now announcement caption with streaming link",
          "timeToPost": "00:01 Midnight & 12:00 Noon Followup",
          "algorithmTip": "Reply to every single comment within the first 60 minutes to trigger algorithm push.",
          "soundSnippet": "Full Track Streaming",
          "hashtags": ["#OutNow", "#NewMusicFriday", "#StreamNow"],
          "priority": "CRITICAL"
        },
        {
          "day": "Day 1",
          "platform": "X (Twitter) & Instagram Stories",
          "contentType": "Behind-the-Lyrics Breakdown",
          "concept": "Audio note explaining the emotional meaning and lyrics of the standout line.",
          "captionHook": "Story breakdown caption",
          "timeToPost": "17:45 GMT+1 (WAT) / 12:45 PM EST",
          "algorithmTip": "Text-heavy graphic with lyric cards; ask fans which line speaks to them.",
          "soundSnippet": "Verse 2 standout lyric (1:15 - 1:35)",
          "hashtags": ["#LyricBreakdown", "#Songwriter", "#Afrobeats"],
          "priority": "HIGH"
        },
        {
          "day": "Day 3",
          "platform": "YouTube & Instagram Reels",
          "contentType": "Official Kinetic Lyric Video",
          "concept": "High-energy typography visualizer syncing lyrics to the master beat.",
          "captionHook": "Lyric visualizer live alert",
          "timeToPost": "18:00 GMT+1 (WAT) / 1:00 PM EST",
          "algorithmTip": "End screen card routing viewers to official music video or Spotify profile.",
          "soundSnippet": "Full song synchronized",
          "hashtags": ["#LyricVideo", "#Visualizer", "#OfficialAudio"],
          "priority": "HIGH"
        }
      ]
    },
    {
      "phaseName": "Phase 3: Post-Release Sustained Momentum",
      "focus": "User-generated content (UGC), DJ club packs, media press followups, and live acoustic sessions",
      "timeframe": "Day 4 to Day 30",
      "actions": [
        {
          "day": "Day 7",
          "platform": "TikTok & Instagram",
          "contentType": "Fan Reaction & UGC Repost Wave",
          "concept": "Dual-screen stitch reacting to fan vibes and top dance clips.",
          "captionHook": "Fan appreciation caption",
          "timeToPost": "19:30 GMT+1 (WAT) / 2:30 PM EST",
          "algorithmTip": "Tag creators to generate reciprocal community sharing loop.",
          "soundSnippet": "Dance hook section (0:30 - 0:50)",
          "hashtags": ["#FanReactions", "#Challenge", "#DanceVibes"],
          "priority": "HIGH"
        },
        {
          "day": "Day 14",
          "platform": "YouTube & Live Sessions",
          "contentType": "Raw Acoustic / Mic Session",
          "concept": "Intimate, one-take live acoustic performance highlighting vocal versatility.",
          "captionHook": "Acoustic rendition caption",
          "timeToPost": "18:00 GMT+1 (WAT) / 1:00 PM EST",
          "algorithmTip": "Upload in 4K resolution with high audio fidelity for YouTube discovery algorithm.",
          "soundSnippet": "Live acoustic vocal arrangement",
          "hashtags": ["#AcousticSession", "#LiveMusic", "#RawVocals"],
          "priority": "MEDIUM"
        },
        {
          "day": "Day 21",
          "platform": "Club DJs & Radio Outreach",
          "contentType": "DJ Pack & Extended Club Edit",
          "concept": "Servicing DJs, club selectors, and mix hosts with extended intro/outro stems.",
          "captionHook": "DJ promo alert",
          "timeToPost": "16:00 GMT+1 (WAT) / 11:00 AM EST",
          "algorithmTip": "Drive to Dropbox/Google Drive folder via private promo list.",
          "soundSnippet": "128 BPM Extended Club Intro",
          "hashtags": ["#DJPack", "#ClubMix", "#RadioPromo"],
          "priority": "MEDIUM"
        }
      ]
    }
  ],
  "dspPitch": {
    "pitchTitle": "${artistName} — \"${trackTitle}\" (${genre || "Afro-Fusion"} Release)",
    "genreTags": ["${genre || "Afrobeats"}", "Alté", "Contemporary R&B", "Global Sounds"],
    "moodTags": ["Energetic", "Late Night", "Confident", "Feel-Good"],
    "instruments": ["Log Drum / Amapiano Shakers", "Electric Guitar Licks", "Analog Bass", "Vocal Harmonies"],
    "editorialNote": "50-word concise, high-impact pitch highlighting diaspora playlist compatibility (e.g. African Heat, New Music Friday, Pop Rising).",
    "targetPlaylists": ["African Heat (Spotify)", "Afro-Pop Hits (Apple Music)", "Afrobeats Fresh (Audiomack)", "New Music Daily", "Global Groove"],
    "curatorAngle": "A distinctive sonic bridge combining rhythmic African percussion with sleek international melodic hooks."
  },
  "pressReleaseExcerpt": "3-paragraph formal press release statement for music blogs (The Native, Pulse, FADER, Rolling Stone Africa).",
  "contentHooks": [
    "5 punchy viral TikTok/Reels sound hooks with specific on-screen text instructions"
  ],
  "hashtags": ["#NewMusicAlert", "#AfrobeatsGlobal", "#StreamNow", "#KeedohubOS", "#SongOfTheSummer"],
  "algorithmStrategy": {
    "soundBiteRule": "Keep TikTok soundbite strictly between 12.5s and 16.5s to trigger auto-loop replays.",
    "retentionMetric": "Target >65% 3-second hook retention and >28% completion rate for algorithmic feed push.",
    "postingCadence": "1 core TikTok/Reel per day between 18:00 and 21:00 local time during Launch Week.",
    "smartLinkTactic": "Use unified pre-save hub to prevent bounce rate from broken DSP destination links."
  },
  "releaseChecklist": [
    { "id": "chk-1", "task": "Submit Track to Distributor (Min 14 Days Ahead for DSP Pitching)", "category": "METADATA", "deadline": "T-14 Days", "completed": true },
    { "id": "chk-2", "task": "Master Artwork 3000x3000px 300DPI RGB Specification", "category": "CREATIVE", "deadline": "T-12 Days", "completed": true },
    { "id": "chk-3", "task": "Submit Spotify for Artists Editorial Pitch with Story Narrative", "category": "EDITORIAL", "deadline": "T-10 Days", "completed": false },
    { "id": "chk-4", "task": "Verify Producer & Songwriter Split Sheets (100% Signed)", "category": "METADATA", "deadline": "T-7 Days", "completed": true },
    { "id": "chk-5", "task": "Generate 9:16 Vertical Video Teaser & Promo Cards", "category": "CREATIVE", "deadline": "T-5 Days", "completed": false },
    { "id": "chk-6", "task": "Activate Smart Pre-Save Link & Sync Fan SMS/Email Capture", "category": "PROMO", "deadline": "T-3 Days", "completed": true },
    { "id": "chk-7", "task": "Upload Spotify Canvas 9:16 Loop (3-8 seconds)", "category": "CREATIVE", "deadline": "T-2 Days", "completed": false },
    { "id": "chk-8", "task": "Prepare WhatsApp VIP Superfan & DJ Promo Broadcast Stems", "category": "PROMO", "deadline": "T-1 Day", "completed": false }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);
      return res.json({
        source: "gemini-ai",
        data: parsed,
      });
    } catch (err: any) {
      console.warn("AI generation failed, falling back to algorithmic engine:", err.message);
      return res.json({
        source: "fallback-algorithmic",
        data: generateAlgorithmicRollout({ trackTitle, artistName, genre, releaseType, releaseDate, keyTheme, targetAudience }),
      });
    }
  });

  // Brand Strategy Architect API
  app.post("/api/ai/brand-strategy", async (req, res) => {
    const { brandName, industry, targetAudience, brandVibe, primaryGoal } = req.body;

    if (!brandName) {
      return res.status(400).json({ error: "Brand name is required" });
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          source: "fallback-algorithmic",
          data: generateAlgorithmicBrandStrategy({ brandName, industry, brandVibe, primaryGoal }),
        });
      }

      const ai = getGemini();
      const prompt = `You are a Senior Brand Strategist and Creative Director at Keedohub Studio.
Craft a comprehensive, high-tier Brand Architecture & Visual Operating System for:
- Brand Name: "${brandName}"
- Industry: ${industry || "Creative Tech & Lifestyle"}
- Aesthetic Vibe: ${brandVibe || "Modern, Premium, Bold"}
- Target Audience: ${targetAudience || "Discerning creators, tech founders, and modern consumers"}
- Primary Goal: ${primaryGoal || "Global Market Authority & High Conversion"}

Return ONLY a JSON object (no markdown formatting, valid JSON):
{
  "brandTagline": "Memorable 3-5 word slogan",
  "brandArchetype": "e.g., The Creator / The Ruler / The Magician",
  "voiceAndTone": {
    "traits": ["Audacious", "Precision-engineered", "Direct", "Refined"],
    "doSay": ["We engineer the future.", "Engineered for impact."],
    "dontSay": ["Cheap generic buzzwords", "Supercharge your business"]
  },
  "colorPalette": [
    { "name": "Primary Crimson", "hex": "#9B1B1B", "role": "Dominant brand power & hero accents" },
    { "name": "Obsidian Dark", "hex": "#0A0A0C", "role": "Deep grounding backdrop" },
    { "name": "Studio Gold", "hex": "#F5A623", "role": "Warm badge & highlight energy" },
    { "name": "Pure White", "hex": "#FFFFFF", "role": "High-contrast headline clarity" },
    { "name": "Muted Slate", "hex": "#8C8C9A", "role": "Subtle metadata & wireframes" }
  ],
  "typographyPairing": {
    "heading": "Space Grotesk (Bold, 700)",
    "body": "Plus Jakarta Sans (Medium, 400-600)",
    "monospace": "JetBrains Mono (Technical data, stamps)"
  },
  "marketPositioningStatement": "2-sentence razor-sharp positioning statement.",
  "launchSprint": [
    { "day": "Day 1-3", "task": "Lock core mark, typography guidelines, and vector design tokens" },
    { "day": "Day 4-7", "task": "Design responsive high-converting landing page & social identity suite" },
    { "day": "Day 8-10", "task": "Produce brand motion sizzle reel and press release kit" },
    { "day": "Day 11-14", "task": "Execute multi-channel launch across social, newsletter, and press syndication" }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ source: "gemini-ai", data: parsed });
    } catch (err: any) {
      console.warn("Brand AI failed, fallback:", err.message);
      return res.json({
        source: "fallback-algorithmic",
        data: generateAlgorithmicBrandStrategy({ brandName, industry, brandVibe, primaryGoal }),
      });
    }
  });

  // EPK Bio Generator API
  app.post("/api/ai/epk-bio", async (req, res) => {
    const { artistName, genre, hometown, influences, achievements, vibe } = req.body;

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          source: "fallback",
          bioShort: `${artistName} is a visionary ${genre || "contemporary"} artist originating from ${hometown || "Lagos, Nigeria"}, blending rhythmic dexterity with global sonic appeal. Known for electrifying storytelling and distinctive aesthetics, ${artistName} represents the vanguard of modern sound.`,
          bioFull: `Hailing from the creative pulse of ${hometown || "Lagos, Nigeria"}, ${artistName} has established a distinct sonic identity at the intersection of ${genre || "Afrobeats, Alté, and Contemporary Fusion"}. Drawing inspiration from ${influences || "pioneering African rhythms and modern global production"}, ${artistName} crafts immersive musical experiences that bridge cultural heritage with forward-looking ambition.\n\nWith over ${achievements || "hundreds of thousands of organic streams and co-signs across international tastemakers"}, ${artistName} continues to push sonic frontiers under the Keedohub Creative OS ecosystem.`,
          soundBites: [
            `"A sonic trailblazer carving an authentic path in modern ${genre || "music"}."`,
            `"Unapologetic artistry backed by world-class production and visual world-building."`
          ]
        });
      }

      const ai = getGemini();
      const prompt = `Write an official Music EPK Artist Bio for:
Artist: "${artistName}"
Genre: ${genre}
Hometown/Origin: ${hometown || "Lagos, Nigeria"}
Influences: ${influences || "Afro-fusion, Soul, Modern Hip Hop"}
Key Milestones: ${achievements || "Recent viral single, 500k+ streams, international tour"}
Vibe: ${vibe || "Electrifying, Sophisticated, Authentic"}

Return JSON format:
{
  "bioShort": "50-word quick pitch for playlist curators and event bookers",
  "bioFull": "180-word executive industry bio for festival organizers, labels and journalists",
  "soundBites": ["2 punchy press quote headlines"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      return res.json({ source: "gemini-ai", data: JSON.parse(response.text || "{}") });
    } catch (err: any) {
      return res.json({
        source: "fallback",
        data: {
          bioShort: `${artistName} is a genre-bending ${genre || "recording"} artist whose energetic presence and sonic depth captivate international audiences.`,
          bioFull: `Born with an undeniable ear for melody, ${artistName} brings a refreshing perspective to ${genre || "global music"}. With seamless crossover appeal and high-concept visuals, ${artistName} commands listener attention from first beat to final bar.`,
          soundBites: [`"A monumental talent redefining modern sound."`]
        }
      });
    }
  });

  // AI Lyrics & Cadence Studio API
  app.post("/api/ai/lyrics-assistant", async (req, res) => {
    const { title, artist, genre, mood, promptTheme, section } = req.body;

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          source: "fallback",
          data: generateFallbackLyrics(title, artist, genre, section || "verse")
        });
      }

      const ai = getGemini();
      const prompt = `You are an elite multi-platinum songwriter, topliner, and lyric architect at Keedohub Studio specializing in Afrobeats, Hip-Hop, Drill, R&B, and Global Pop.
Create world-class lyrics and timestamped lines for:
- Track Title: "${title || "Untitled Master"}"
- Artist: "${artist || "Lead Artist"}"
- Genre: ${genre || "Afro-Fusion / Contemporary"}
- Target Mood / Theme: ${mood || promptTheme || "Confidence, late night romance, ambition"}
- Target Section: ${section || "full-song"}

Return ONLY a valid JSON object matching this schema:
{
  "title": "${title || "Untitled Master"}",
  "bpm": 110,
  "keyTheme": "Core emotional narrative",
  "rhymeScheme": "e.g. AABB / ABAB with multi-syllable rhyme breakdown",
  "lines": [
    { "timeMs": 2000, "timeFormatted": "00:02.00", "text": "Catchy intro melody chant", "section": "intro" },
    { "timeMs": 6000, "timeFormatted": "00:06.00", "text": "First lyrical bar with internal rhyme", "section": "verse" },
    { "timeMs": 10000, "timeFormatted": "00:10.00", "text": "Second lyrical bar advancing the story", "section": "verse" },
    { "timeMs": 14000, "timeFormatted": "00:14.00", "text": "Pre-chorus tension building bar", "section": "pre-chorus" },
    { "timeMs": 18000, "timeFormatted": "00:18.00", "text": "Explosive memorable chorus hook line", "section": "chorus" },
    { "timeMs": 22000, "timeFormatted": "00:22.00", "text": "Secondary repeating melodic hook line", "section": "chorus" },
    { "timeMs": 26000, "timeFormatted": "00:26.00", "text": "Vocal signature outro phrase", "section": "outro" }
  ],
  "hookVariations": [
    "Alternative hook concept 1",
    "Alternative hook concept 2"
  ],
  "syllableCadenceTip": "Pro tip on pocket rhythm and vocal delivery."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.8 }
      });

      return res.json({ source: "gemini-ai", data: JSON.parse(response.text || "{}") });
    } catch (err: any) {
      console.warn("AI lyrics generation error:", err.message);
      return res.json({
        source: "fallback",
        data: generateFallbackLyrics(title, artist, genre, section || "verse")
      });
    }
  });

  // AI DSP Editorial Pitch Generator & Scorer API
  app.post("/api/ai/dsp-pitch", async (req, res) => {
    const { trackTitle, artistName, featuredArtists, primaryGenre, subGenres, moods, instruments, culturalStory, marketingBudgetUSD, preSaveCount } = req.body;

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          source: "fallback",
          data: generateFallbackDSPPitch(trackTitle, artistName, primaryGenre, culturalStory)
        });
      }

      const ai = getGemini();
      const prompt = `You are a Senior Editorial Playlist Curator and Music DSP Strategist (ex-Spotify / Apple Music Editorial Team).
Generate an ultra-high-converting, data-backed editorial pitch for:
- Track: "${trackTitle}" by ${artistName} ${featuredArtists ? `(feat. ${featuredArtists})` : ""}
- Genre: ${primaryGenre} (Sub-genres: ${(subGenres || []).join(", ")})
- Moods: ${(moods || []).join(", ")}
- Instruments: ${(instruments || []).join(", ")}
- Cultural / Diaspora Narrative: ${culturalStory || "Breakout African crossover record"}
- Marketing Commitment: $${marketingBudgetUSD || 500} USD ad spend, ${preSaveCount || 250}+ verified pre-saves.

Curators discard 95% of pitches because they are too long, vague, or lack marketing proof.
Provide:
1. "dspPitchShort": Exactly 50-70 words formatted specifically for the Spotify for Artists pitch form (Highlighting sound, target playlists like African Heat / RapCaviar, instruments, and exact marketing budget).
2. "pressPitchFull": 150-word editorial press release note for journalists (The Native, FADER, Billboard Africa).
3. "curatorDMEmail": A direct, high-impact 3-paragraph cold email for indie playlist curators.
4. "pitchScore": An integer score (80 to 98) evaluating pitch competitiveness.
5. "scoreBreakdown": 4 bullet points explaining why this pitch converts curators.

Return ONLY a valid JSON object matching this schema:
{
  "dspPitchShort": "...",
  "pressPitchFull": "...",
  "curatorDMEmail": "...",
  "pitchScore": 94,
  "scoreBreakdown": ["...", "...", "...", "..."],
  "targetPlaylists": ["African Heat", "Afro Pop Hits", "New Music Friday", "Chilled R&B"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.7 }
      });

      return res.json({ source: "gemini-ai", data: JSON.parse(response.text || "{}") });
    } catch (err: any) {
      console.warn("AI DSP pitch error:", err.message);
      return res.json({
        source: "fallback",
        data: generateFallbackDSPPitch(trackTitle, artistName, primaryGenre, culturalStory)
      });
    }
  });

  // AI Audio Mastering Critique & Loudness Engine API
  app.post("/api/ai/audio-critique", async (req, res) => {
    const { trackName, genre, lufs, truePeak, dynamicRange, stereoWidth } = req.body;

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          source: "fallback",
          data: generateFallbackAudioCritique(trackName, genre, lufs, truePeak)
        });
      }

      const ai = getGemini();
      const prompt = `You are a Grammy-winning Chief Mastering Engineer at Keedohub Sound Labs.
Analyze these technical acoustic metrics for:
- Track: "${trackName}" (${genre || "Afro-Fusion / Modern"})
- Integrated Loudness: ${lufs} LUFS (Target: -14.0 LUFS Spotify, -16.0 Apple)
- True Peak: ${truePeak} dBTP (Target: < -1.0 dBTP to avoid inter-sample clipping)
- Dynamic Range: ${dynamicRange} DR
- Stereo Width: ${stereoWidth}%

Provide an executive mastering health report in JSON:
{
  "masteringGrade": "A / B+ / C",
  "overallVerdict": "1-sentence executive summary",
  "dspStatus": {
    "spotify": "OPTIMAL / TOO_LOUD / TOO_QUIET",
    "appleMusic": "OPTIMAL / TOO_LOUD / TOO_QUIET",
    "youtube": "OPTIMAL / TOO_LOUD / TOO_QUIET",
    "clubDJ": "OPTIMAL / TOO_LOUD / TOO_QUIET"
  },
  "acousticCritiques": [
    { "band": "Sub & Low-End (20-100Hz)", "status": "Tight / Muddy / Weak", "fix": "Specific fix tip" },
    { "band": "Low Mids (250-500Hz)", "status": "Clean / Boxy", "fix": "Specific fix tip" },
    { "band": "Presence & Air (6k-20kHz)", "status": "Silky / Harsh", "fix": "Specific fix tip" }
  ],
  "actionableSteps": [
    "Step 1 to achieve radio-ready loudness",
    "Step 2 for inter-sample peak protection",
    "Step 3 for mono subwoofer translation"
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.6 }
      });

      return res.json({ source: "gemini-ai", data: JSON.parse(response.text || "{}") });
    } catch (err: any) {
      console.warn("AI Audio critique error:", err.message);
      return res.json({
        source: "fallback",
        data: generateFallbackAudioCritique(trackName, genre, lufs, truePeak)
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Keedohub Creative OS server running on http://0.0.0.0:${PORT}`);
  });
}

// Built-in Algorithmic Rollout Generator (Guaranteed zero-failure human-designed templates)
function generateAlgorithmicRollout(input: any) {
  const { trackTitle, artistName, genre, releaseType, releaseDate, keyTheme, targetAudience } = input;
  return {
    tagline: `Experience "${trackTitle}" — The Next Defining Era of ${artistName}`,
    diasporaAngle: `A high-octane sonic journey rooted in ${genre || "Afro-Fusion"} engineered for global radio, heavy club rotations, and flagship DSP editorial playlists.`,
    phases: [
      {
        phaseName: "Phase 1: Pre-Release Anticipation",
        focus: "Cultivate mysterious intrigue, collect verified pre-saves, and seed viral TikTok/Reels audio snippets",
        timeframe: "T-14 to T-1 Days",
        actions: [
          {
            day: "Day -14",
            platform: "Instagram Reels & TikTok",
            contentType: "Studio Voice Memo / Creation Moment",
            concept: "Raw studio footage showing the exact moment the melody or drum pattern locked in at 3 AM.",
            captionHook: `When the melody hit at 3 AM... "${trackTitle}" drops ${releaseDate || "soon"}. Pre-save link in bio! 🔥`,
            timeToPost: "18:30 GMT+1 (WAT) / 1:30 PM EST",
            algorithmTip: "First 2.5s visual hook; pin the top comment asking fans to guess the release date for algorithmic dwell time.",
            soundSnippet: "Intro build-up into initial hook (0:00 - 0:18)",
            hashtags: ["#NewMusicAlert", "#BehindTheBeat", "#StudioSession", "#Afrobeats2026"],
            priority: "CRITICAL",
          },
          {
            day: "Day -10",
            platform: "Spotify Pre-Save & Apple Music",
            contentType: "Official 3D Cover Artwork Reveal",
            concept: "High-impact visualizer reveal showing the official cover art with verified Keedohub studio seal.",
            captionHook: `Official Cover Art for "${trackTitle}". Designed with @Keedohub. Tag 3 people who need this sound!`,
            timeToPost: "19:00 GMT+1 (WAT) / 2:00 PM EST",
            algorithmTip: "Carousel post with 3 slides to maximize swipe-through time and share-to-story triggers.",
            soundSnippet: "Chorus energy peak (0:45 - 1:05)",
            hashtags: ["#CoverArtReveal", "#PreSaveNow", "#FreshMusic", "#KeedohubOS"],
            priority: "HIGH",
          },
          {
            day: "Day -5",
            platform: "TikTok & YouTube Shorts",
            contentType: "15-Second Relatable Sound Hook",
            concept: "Point-of-view (POV) relatable situational video over the key 15s chorus section.",
            captionHook: `Use this sound if you're stepping into your winning era this month 🚀 #NewMusic #${artistName.replace(/\s+/g, '')}`,
            timeToPost: "20:15 GMT+1 (WAT) / 3:15 PM EST",
            algorithmTip: "Looping video format where the last frame matches the first for 100%+ retention rate.",
            soundSnippet: "Main vocal punchline (0:30 - 0:45)",
            hashtags: ["#POV", "#TrendingAudio", "#SongOfTheSummer", "#ViralSound"],
            priority: "CRITICAL",
          },
          {
            day: "Day -1",
            platform: "All Channels & WhatsApp Broadcast",
            contentType: "24-Hour Midnight Lockdown Countdown",
            concept: "Dark aesthetic visualizer loop with countdown timer ticker and direct streaming smart link.",
            captionHook: `Midnight tonight. The world receives "${trackTitle}". Are your headphones ready? 🎧⚡`,
            timeToPost: "21:00 GMT+1 (WAT) / 4:00 PM EST",
            algorithmTip: "Direct DM/WhatsApp broadcast to top 50 core superfans for instant hour-one stream spike.",
            soundSnippet: "Drop climax (0:50 - 1:10)",
            hashtags: ["#MidnightDrop", "#NewMusicFriday", "#OutTonight", "#StreamNow"],
            priority: "HIGH",
          },
        ],
      },
      {
        phaseName: "Phase 2: Drop Day & Launch Weekend",
        focus: "Ignite immediate streaming velocity, fan re-shares, and DSP playlist placement triggers",
        timeframe: "Day 0 to Day 3",
        actions: [
          {
            day: "Day 0 (Release Day)",
            platform: "All Streaming Platforms & Socials",
            contentType: "Official Release Broadcast & SmartLink",
            concept: "Multi-slide carousel with high-res artwork, direct SmartLink, and DSP streaming badges.",
            captionHook: `OUT NOW EVERYWHERE! "${trackTitle}" is officially yours. Stream loud, share worldwide. Link in bio! 🌍✨`,
            timeToPost: "00:01 Midnight & 12:00 Noon Followup",
            algorithmTip: "Reply to every single comment within the first 60 minutes to trigger algorithm push.",
            soundSnippet: "Full Track Streaming",
            hashtags: ["#OutNow", "#NewMusicFriday", "#StreamNow", "#GlobalSounds"],
            priority: "CRITICAL",
          },
          {
            day: "Day 1",
            platform: "Twitter / X & Instagram Stories",
            contentType: "Behind-the-Lyrics Deep Dive",
            concept: "Short voice note + lyric breakdown graphic explaining the inspiration behind the standout line.",
            captionHook: `The story behind "${trackTitle}": Why this record means everything to me right now.`,
            timeToPost: "17:45 GMT+1 (WAT) / 12:45 PM EST",
            algorithmTip: "Text-heavy graphic with lyric cards; ask fans which line speaks to them.",
            soundSnippet: "Verse 2 standout lyric (1:15 - 1:35)",
            hashtags: ["#LyricBreakdown", "#Songwriter", "#Afrobeats"],
            priority: "HIGH",
          },
          {
            day: "Day 3",
            platform: "YouTube & Instagram",
            contentType: "Official Kinetic Motion Lyric Video",
            concept: "Kinetic typography motion video produced by Keedohub Motion Studio.",
            captionHook: `Full official visualizer for "${trackTitle}" is live on YouTube. Watch and tell me your favorite lyric 👇`,
            timeToPost: "18:00 GMT+1 (WAT) / 1:00 PM EST",
            algorithmTip: "End screen card routing viewers to official Spotify profile and YouTube playlist.",
            soundSnippet: "Full song synchronized",
            hashtags: ["#LyricVideo", "#Visualizer", "#OfficialAudio"],
            priority: "HIGH",
          },
        ],
      },
      {
        phaseName: "Phase 3: Post-Release Sustained Momentum",
        focus: "User-generated content (UGC), DJ club promotion, press followups, and live acoustic re-imaginations",
        timeframe: "Day 4 to Day 30",
        actions: [
          {
            day: "Day 7",
            platform: "TikTok / Reels",
            contentType: "Fan Challenge / UGC Showcase",
            concept: "Reposting top fan dance/vibe clips using the official sound with artist reactions.",
            captionHook: `The energy on "${trackTitle}" is insane! Keep tagging me, reposting the best ones all week! 🔥`,
            timeToPost: "19:30 GMT+1 (WAT) / 2:30 PM EST",
            algorithmTip: "Tag creators to generate reciprocal community sharing loop.",
            soundSnippet: "Dance hook section (0:30 - 0:50)",
            hashtags: ["#FanReactions", "#Challenge", "#DanceVibes"],
            priority: "HIGH",
          },
          {
            day: "Day 14",
            platform: "YouTube & Instagram",
            contentType: "Raw Acoustic / Mic Session",
            concept: "Stripped-down live acoustic vocal rendition in a minimal studio setup.",
            captionHook: `Stripped down version of "${trackTitle}". Nothing but raw emotion.`,
            timeToPost: "18:00 GMT+1 (WAT) / 1:00 PM EST",
            algorithmTip: "Upload in 4K resolution with high audio fidelity for YouTube discovery algorithm.",
            soundSnippet: "Live acoustic vocal arrangement",
            hashtags: ["#AcousticSession", "#LiveMusic", "#RawVocals"],
            priority: "MEDIUM",
          },
          {
            day: "Day 21",
            platform: "DJs & Radio Outreach",
            contentType: "Club Pack & Extended Mix Drop",
            concept: "Servicing radio DJs, club selectors, and mix hosts with extended intro/outro DJ edits.",
            captionHook: `DJs! The extended club pack for "${trackTitle}" is now live in the promo vault. Link in bio for WAV stems.`,
            timeToPost: "16:00 GMT+1 (WAT) / 11:00 AM EST",
            algorithmTip: "Drive to Dropbox/Google Drive folder via private promo list.",
            soundSnippet: "128 BPM Extended Club Intro",
            hashtags: ["#DJPack", "#ClubMix", "#RadioPromo"],
            priority: "MEDIUM",
          },
        ],
      },
    ],
    dspPitch: {
      pitchTitle: `${artistName} — "${trackTitle}" (${genre || "Afro-Fusion"} Release)`,
      genreTags: [genre || "Afrobeats", "Contemporary R&B", "Global Sounds"],
      moodTags: ["Energetic", "Late Night", "Confident", "Feel-Good"],
      instruments: ["Log Drum / Amapiano Shakers", "Electric Guitar Licks", "Analog Bass", "Vocal Harmonies"],
      editorialNote: `"${trackTitle}" is an infectious, club-ready release blending dynamic percussion with anthemic vocal hooks. Ideal for flagship playlists like African Heat, New Music Friday, and Global Waves.`,
      targetPlaylists: ["African Heat (Spotify)", "Afro-Pop Hits (Apple Music)", "Afrobeats Fresh (Audiomack)", "New Music Daily", "Global Groove"],
      curatorAngle: "A distinctive sonic bridge combining rhythmic African percussion with sleek international melodic hooks.",
    },
    pressReleaseExcerpt: `FOR IMMEDIATE RELEASE: Multi-talented artist ${artistName} has officially unveiled their latest masterpiece, "${trackTitle}". Crafted with high-grade sonic engineering and backed by the Keedohub Creative Operating System, the record delivers an unmatched blend of rhythm, emotion, and global appeal. Now available on all major streaming services worldwide.`,
    contentHooks: [
      `"POV: You found the song that's going to define your entire 2026 summer."`,
      `"Tell me this chorus doesn't give you goosebumps on the first listen..."`,
      `"When you told your producer to make something timeless, and he cooked this:"`,
      `"Don't skip if you need a new anthem for your daily morning gym drive."`,
      `"Rating my new single '${trackTitle}' from 1 to 10... be brutally honest!"`,
    ],
    hashtags: ["#NewMusicAlert", "#AfrobeatsGlobal", "#StreamNow", "#KeedohubOS", "#SongOfTheSummer"],
    algorithmStrategy: {
      soundBiteRule: "Keep TikTok soundbite strictly between 12.5s and 16.5s to trigger auto-loop replays.",
      retentionMetric: "Target >65% 3-second hook retention and >28% completion rate for algorithmic feed push.",
      postingCadence: "1 core TikTok/Reel per day between 18:00 and 21:00 local time during Launch Week.",
      smartLinkTactic: "Use unified pre-save hub to prevent bounce rate from broken DSP destination links.",
    },
    releaseChecklist: [
      { id: "chk-1", task: "Submit Track to Distributor (Min 14 Days Ahead for DSP Pitching)", category: "METADATA", deadline: "T-14 Days", completed: true },
      { id: "chk-2", task: "Master Artwork 3000x3000px 300DPI RGB Specification", category: "CREATIVE", deadline: "T-12 Days", completed: true },
      { id: "chk-3", task: "Submit Spotify for Artists Editorial Pitch with Story Narrative", category: "EDITORIAL", deadline: "T-10 Days", completed: false },
      { id: "chk-4", task: "Verify Producer & Songwriter Split Sheets (100% Signed)", category: "METADATA", deadline: "T-7 Days", completed: true },
      { id: "chk-5", task: "Generate 9:16 Vertical Video Teaser & Promo Cards", category: "CREATIVE", deadline: "T-5 Days", completed: false },
      { id: "chk-6", task: "Activate Smart Pre-Save Link & Sync Fan SMS/Email Capture", category: "PROMO", deadline: "T-3 Days", completed: true },
      { id: "chk-7", task: "Upload Spotify Canvas 9:16 Loop (3-8 seconds)", category: "CREATIVE", deadline: "T-2 Days", completed: false },
      { id: "chk-8", task: "Prepare WhatsApp VIP Superfan & DJ Promo Broadcast Stems", category: "PROMO", deadline: "T-1 Day", completed: false },
    ],
  };
}

function generateAlgorithmicBrandStrategy(input: any) {
  const { brandName, industry, brandVibe, primaryGoal } = input;
  return {
    brandTagline: `${brandName} — Engineered for Visionaries`,
    brandArchetype: "The Creator & Ruler (Pioneering, Precise, Commanding)",
    voiceAndTone: {
      traits: ["Bold & Unapologetic", "Meticulously Crafted", "Modern Authority", "Action-Oriented"],
      doSay: ["Engineered for maximum cultural impact.", "Crafted with architectural precision."],
      dontSay: ["We do all kinds of stuff.", "Cheap and easy solutions."],
    },
    colorPalette: [
      { name: "Keedohub Crimson", hex: "#9B1B1B", role: "Primary brand mark & high-energy action triggers" },
      { name: "Carbon Obsidian", hex: "#0A0A0C", role: "Dominant dark foundation and canvas" },
      { name: "Solar Amber", hex: "#F5A623", role: "Badges, verifications, and warm accent glows" },
      { name: "Crisp Pure White", hex: "#FFFFFF", role: "Primary heading typography & contrast" },
      { name: "Technical Gray", hex: "#7E7E8E", role: "Monospace metadata, borders, and subtext" },
    ],
    typographyPairing: {
      heading: "Space Grotesk (Bold, 700)",
      body: "Plus Jakarta Sans (Regular & Semi-Bold, 400-600)",
      monospace: "JetBrains Mono (Code, metadata stamps, pricing)",
    },
    marketPositioningStatement: `${brandName} is the premier brand ecosystem in the ${industry || "modern creative"} space, delivering uncompromising design architecture and streamlined systems for high-growth leaders.`,
    launchSprint: [
      { day: "Day 1 - 3", task: "Finalize master vector monogram, primary wordmark, and tokenized styleguide." },
      { day: "Day 4 - 7", task: "Build and deploy responsive flagship web app with optimized mobile UI." },
      { day: "Day 8 - 10", task: "Generate full commercial marketing suite: social kit, motion openers, pitch deck." },
      { day: "Day 11 - 14", task: "Execute synchronized digital rollout and client onboarding pipeline activation." },
    ],
  };
}

function generateFallbackLyrics(title: string, artist: string, genre: string, section: string) {
  return {
    title: title || "Midnight in Victoria Island",
    bpm: 112,
    keyTheme: "Late-night drive, Lagos hustle, infectious rhythmic confidence",
    rhymeScheme: "AABB / Multi-syllable pocket bounce",
    lines: [
      { timeMs: 2500, timeFormatted: "00:02.50", text: "Cruising down Ahmadu Bello in the midnight rain", section: "intro" },
      { timeMs: 6200, timeFormatted: "00:06.20", text: "Log drum rolling, taking away my pain", section: "verse" },
      { timeMs: 9800, timeFormatted: "00:09.80", text: "Girl I see you shining through the tinted glass", section: "verse" },
      { timeMs: 13400, timeFormatted: "00:13.40", text: "They said our momentum wouldn't last", section: "verse" },
      { timeMs: 17100, timeFormatted: "00:17.10", text: "Tell me what you want, tell me what you need", section: "pre-chorus" },
      { timeMs: 20500, timeFormatted: "00:20.50", text: "We planting seeds in this Lagos concrete", section: "pre-chorus" },
      { timeMs: 24200, timeFormatted: "00:24.20", text: `Midnight in Victoria, ${artist || "we"} own the sound!`, section: "chorus" },
      { timeMs: 28000, timeFormatted: "00:28.00", text: "Hands in the air when the rhythm hits the ground", section: "chorus" },
      { timeMs: 31800, timeFormatted: "00:31.80", text: "Keedohub master, crank it to the sky", section: "hook" },
      { timeMs: 35500, timeFormatted: "00:35.50", text: "Born to elevate, we were made to fly", section: "outro" }
    ],
    hookVariations: [
      "Victoria Island lights glowing in my eyes, we never say goodbye",
      "From the mainland to the island, turn the volume up, no silence"
    ],
    syllableCadenceTip: "Keep the vocal pocket on the off-beat 16th notes to lock with the log drum."
  };
}

function generateFallbackDSPPitch(trackTitle: string, artistName: string, primaryGenre: string, culturalStory: string) {
  return {
    dspPitchShort: `"${trackTitle}" by ${artistName} is a high-octane ${primaryGenre || "Afro-Fusion"} anthem driven by live log drums and infectious melodies. With $1,500 dedicated digital ad spend, 450+ verified pre-saves, and support from top West African club DJs, it is tailored for African Heat, Afro Pop Hits, and New Music Friday.`,
    pressPitchFull: `Rising recording artist ${artistName} has unveiled their defining single "${trackTitle}". Produced with meticulous precision and backed by the Keedohub Creative OS ecosystem, the track captures the pulse of modern African diaspora youth culture. Combining dynamic rhythm with pristine vocal delivery, this record is poised for heavy rotation across global dancefloors and radio airwaves.`,
    curatorDMEmail: `Subject: Track Pitch for Playlists: "${trackTitle}" by ${artistName} (${primaryGenre || "Afro-Fusion"})\n\nHi Curator Team,\n\nHope you're having a great week! I'm submitting "${trackTitle}" by ${artistName} for your consideration on your premier playlist.\n\nThe track is an energetic ${primaryGenre || "Afro-Fusion"} record built on infectious syncopated percussion and anthemic hooks. We're backing this drop with a comprehensive TikTok campaign, verified pre-save velocity, and radio play across Lagos and London.\n\nListen to the 30s preview here: [SmartLink] — Would love your feedback and playlist addition!\n\nBest,\n${artistName} & Keedohub Talent Team`,
    pitchScore: 94,
    scoreBreakdown: [
      "Optimal 65-word length matches Spotify for Artists review guidelines.",
      "Clear genre tags and instrument identifiers for algorithmic indexing.",
      "Includes concrete marketing spend proof and pre-save traction.",
      "Identifies exact target flagship editorial playlists."
    ],
    targetPlaylists: ["African Heat", "Afro Pop Hits", "New Music Friday", "Chilled R&B", "Naija 100"]
  };
}

function generateFallbackAudioCritique(trackName: string, genre: string, lufs: number, truePeak: number) {
  const isLoud = (lufs || -14) > -12;
  const isQuiet = (lufs || -14) < -16;
  const isClipping = (truePeak || -0.8) > -0.5;

  return {
    masteringGrade: isClipping ? "B-" : (isLoud ? "A-" : "A"),
    overallVerdict: isClipping
      ? `Inter-sample true peak is exceeding safe headroom (${truePeak} dBTP). Reduce final limiter ceiling to -1.0 dBTP.`
      : `Mastering levels are well-balanced at ${lufs} LUFS with solid transient definition for ${genre || "global streaming"}.`,
    dspStatus: {
      spotify: isLoud ? "TOO_LOUD" : (isQuiet ? "TOO_QUIET" : "OPTIMAL"),
      appleMusic: (lufs || -14) > -15 ? "TOO_LOUD" : "OPTIMAL",
      youtube: isQuiet ? "TOO_QUIET" : "OPTIMAL",
      clubDJ: (lufs || -14) > -10 ? "OPTIMAL" : "TOO_QUIET"
    },
    acousticCritiques: [
      { band: "Sub & Low-End (20-100Hz)", status: "Tight & Punchy", fix: "High-pass sub below 28Hz to gain 1.5dB of clean master headroom." },
      { band: "Low Mids (250-500Hz)", status: "Clean", fix: "Dip -1dB around 320Hz to eliminate subtle vocal boxiness." },
      { band: "Presence & Air (6k-20kHz)", status: "Silky", fix: "Use a gentle dynamic high shelf at 12kHz to maintain smooth sparkle without sibilance." }
    ],
    actionableSteps: [
      "Set your True Peak Limiter ceiling strictly to -1.0 dBTP to prevent DSP lossy compression distortion (MP3/AAC transcoding).",
      "Check your mix in pure mono to verify that the kick drum and lead vocal retain 100% center punch.",
      "Target -14.0 LUFS for Spotify and YouTube to avoid heavy automatic normalization attenuation."
    ]
  };
}

startServer();

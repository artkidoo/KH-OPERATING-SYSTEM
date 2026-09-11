// PHASE 2 — release builder draft model (additive).
export interface ReleaseBuilderDraft {
  // Step 1: Artist
  artistName: string;
  profileImage: string;
  bio: string;
  genre: string;
  socialLinks: string[];
  streamingProfiles: string;
  website: string;

  // Step 2: Release
  releaseType: "single" | "ep" | "album";
  releaseTitle: string;
  releaseDate: string;
  trackGenre: string;
  trackInfo: string;
  credits: string;
  isrc: string;
  upc: string;

  // Step 3: Story
  story: string;
  meaning: string;
  inspiration: string;
  lyrics: string;
  mood: string;
  keyMessage: string;
  artistNotes: string;

  // Step 4: Links
  streaming: {
    spotify: string;
    apple: string;
    audiomack: string;
    youtube: string;
    presave: string;
    website: string;
    other: string;
  };

  // Step 5: Visual Identity
  photos: string[];
  artwork: string;
  visualDirection: string;
  palette: string;
  typography: string;
  styleReferences: string;
}

export function emptyReleaseDraft(): ReleaseBuilderDraft {
  return {
    artistName: "",
    profileImage: "",
    bio: "",
    genre: "Afro-Fusion",
    socialLinks: [""],
    streamingProfiles: "",
    website: "",

    releaseType: "single",
    releaseTitle: "",
    releaseDate: "",
    trackGenre: "Afro-Fusion",
    trackInfo: "",
    credits: "",
    isrc: "",
    upc: "",

    story: "",
    meaning: "",
    inspiration: "",
    lyrics: "",
    mood: "Cinematic / Uplifting",
    keyMessage: "",
    artistNotes: "",

    streaming: {
      spotify: "",
      apple: "",
      audiomack: "",
      youtube: "",
      presave: "",
      website: "",
      other: "",
    },

    photos: [],
    artwork: "",
    visualDirection: "Editorial Minimalist with high-contrast amber accents",
    palette: "cinematic-dark",
    typography: "Space Grotesk + Plus Jakarta Sans",
    styleReferences: "Modern Lagos nightscape, warm film tone, golden hour street photography",
  };
}

export function demoReleaseDraft(): ReleaseBuilderDraft {
  return {
    artistName: "KAYDO",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    bio: "Lagos-born storyteller and vocalist blending street poetry, acoustic soul, and global Afro-fusion melodies.",
    genre: "Afro-Fusion",
    socialLinks: ["https://instagram.com/kaydomusic", "https://tiktok.com/@kaydo_official"],
    streamingProfiles: "Spotify: KAYDO | Apple Music: KAYDO",
    website: "https://keedohub.com/kaydo",

    releaseType: "single",
    releaseTitle: "LIGHT",
    releaseDate: "2026-10-24",
    trackGenre: "Afro-Fusion / Soul",
    trackInfo: "1. LIGHT — 02:58 (Key: C# Minor, 104 BPM)",
    credits: "Produced by Keedo | Written by Kaydo & Sarah O. | Mixed & Mastered at KeedoHub Studios",
    isrc: "NG-KH1-26-00142",
    upc: "198293849102",

    story: "A record composed during midnight sessions in Victoria Island, capturing the silent resolve of dreamers waiting for morning dawn.",
    meaning: "Light represents spiritual clarity and resilience after an emotional dry season.",
    inspiration: "Lagos Atlantic breeze, late-night transit horns, and nostalgic 70s Highlife guitar chords.",
    lyrics: "[Intro: Ambient Rhodes & Rain]\nYeah, yeah...\nSun will rise, even when the clouds are heavy...\n\n[Verse 1]\nCity lights fading, I can see the morning sky\nCarried all the weight, but I never asked why\nTell my mother that her boy is gonna shine\nEvery dark night got a sunrise in line...\n\n[Chorus]\nWe are the light, we are the light in the dark\nSmall spark burning deep in the heart\nNo shadow can silence the song that we start\nOh, we are the light...\n\n[Outro]\nLight in the morning...\nKeedo on the track.",
    mood: "Cinematic, Triumphant, Soulful, Hopeful",
    keyMessage: "Hope is stubborn; the light always breaks through the darkest hour.",
    artistNotes: "Feature DSP banner targeting New Music Friday and Afro Indie playlists. Clean visualizer loop needed for Spotify Canvas.",

    streaming: {
      spotify: "https://open.spotify.com/artist/kaydo",
      apple: "https://music.apple.com/artist/kaydo",
      audiomack: "https://audiomack.com/kaydo",
      youtube: "https://youtube.com/@kaydomusic",
      presave: "https://keedohub.com/r/light-presave",
      website: "https://kaydomusic.com",
      other: "https://tiktok.com/music/light",
    },

    photos: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    ],
    artwork: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    visualDirection: "Cinematic warm amber dawn against Lagos urban silhouettes. Editorial serif titling with technical release badge metadata.",
    palette: "cinematic-dark",
    typography: "Space Grotesk (Display) + Plus Jakarta Sans (Body)",
    styleReferences: "Burna Boy 'African Giant' typography, Tems late-night mood, Kodak Vision3 500T 35mm warmth.",
  };
}

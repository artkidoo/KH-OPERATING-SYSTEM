import { jsPDF } from "jspdf";
import { EPKData } from "../types";

export interface EPKExportOptions {
  theme?: "dark" | "light";
  includeMetrics?: boolean;
  includeBio?: boolean;
  includeTracks?: boolean;
  includePressQuotes?: boolean;
  includeContact?: boolean;
  watermark?: boolean;
  docTitle?: string;
}

export const generateEPKPdf = async (
  epk: EPKData,
  options: EPKExportOptions = {}
): Promise<jsPDF> => {
  const {
    theme = "dark",
    includeMetrics = true,
    includeBio = true,
    includeTracks = true,
    includePressQuotes = true,
    includeContact = true,
    watermark = true,
    docTitle = "ELECTRONIC PRESS KIT & DOSSIER"
  } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Theme palettes
  const isDark = theme === "dark";
  const bgMain = isDark ? [13, 13, 16] : [248, 249, 250]; // #0D0D10 vs #F8F9FA
  const cardBg = isDark ? [24, 24, 28] : [255, 255, 255]; // #18181C vs #FFFFFF
  const cardBorder = isDark ? [45, 45, 52] : [226, 232, 240]; // #2D2D34 vs #E2E8F0
  const textPrimary = isDark ? [255, 255, 255] : [15, 23, 42];
  const textSecondary = isDark ? [161, 161, 170] : [100, 116, 139];
  const accentPrimary = isDark ? [249, 115, 22] : [234, 88, 12]; // Flame Orange (#F97316)
  const accentLight = isDark ? [40, 24, 18] : [254, 242, 238];

  let currentY = margin;

  const drawPageBackground = () => {
    doc.setFillColor(bgMain[0], bgMain[1], bgMain[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Decorative top accent bar
    doc.setFillColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
    doc.rect(0, 0, pageWidth, 2.5, "F");

    // Subtle background mesh watermark
    if (watermark) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.setTextColor(
        isDark ? 20 : 240,
        isDark ? 20 : 240,
        isDark ? 24 : 245
      );
      doc.text("KEEDOHUB VERIFIED ARTIST", pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: 45,
      });
    }
  };

  const drawFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    doc.text(
      `KEEDOHUB CREATIVE OS • ${epk.artistName.toUpperCase()} OFFICIAL DOSSIER • CONFIDENTIAL`,
      margin,
      footerY
    );
    doc.text(`PAGE ${pageNum} OF ${totalPages}`, pageWidth - margin, footerY, {
      align: "right",
    });
  };

  // Helper for check overflow and create new page
  const checkPageOverflow = (neededHeight: number): boolean => {
    if (currentY + neededHeight > pageHeight - 16) {
      doc.addPage();
      drawPageBackground();
      currentY = margin + 6;
      return true;
    }
    return false;
  };

  // Start Page 1
  drawPageBackground();

  // ==========================================
  // 1. HEADER SECTION & MONOGRAM
  // ==========================================
  const headerHeight = 36;
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, headerHeight, 3.5, 3.5, "FD");

  // Monogram box
  const monogramSize = 22;
  doc.setFillColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
  doc.roundedRect(margin + 6, currentY + 7, monogramSize, monogramSize, 2.5, 2.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  const initials = (epk.artistName || "KH").slice(0, 2).toUpperCase();
  doc.text(initials, margin + 6 + monogramSize / 2, currentY + 7 + 15, {
    align: "center",
  });

  // Artist Title & Meta
  const titleX = margin + monogramSize + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
  doc.text(epk.artistName.toUpperCase(), titleX, currentY + 13);

  // Badge pill next to title
  const nameWidth = doc.getTextWidth(epk.artistName.toUpperCase());
  doc.setFillColor(accentLight[0], accentLight[1], accentLight[2]);
  doc.setDrawColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(titleX + nameWidth + 3, currentY + 8.5, 30, 5.5, 1.2, 1.2, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
  doc.text("VERIFIED EPK", titleX + nameWidth + 18, currentY + 12.3, {
    align: "center",
  });

  // Subtitle / Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
  const genreMeta = `${epk.genre || "Contemporary Music"}  •  ${epk.hometown || "Global"}  •  ${docTitle}`;
  doc.text(genreMeta, titleX, currentY + 20);

  // Tagline
  if (epk.tagline) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
    doc.text(`"${epk.tagline}"`, titleX, currentY + 26.5);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    doc.text(`Official Intelligence Dossier  •  Issued: ${currentDate}`, titleX, currentY + 26.5);
  }

  currentY += headerHeight + 5;

  // ==========================================
  // 2. PERFORMANCE & STREAMING METRICS
  // ==========================================
  if (includeMetrics) {
    const metricCardHeight = 18;
    const cardGap = 3;
    const cardW = (contentWidth - cardGap * 3) / 4;

    const metricsData = [
      { label: "MONTHLY LISTENERS", value: epk.monthlyListeners || "120K+", color: textPrimary },
      { label: "TOTAL STREAMS", value: epk.totalStreams || "2.4M+", color: accentPrimary },
      { label: "INSTAGRAM REACH", value: epk.instagramFollowers || "48K+", color: textPrimary },
      { label: "TIKTOK AUDIENCE", value: epk.tiktokFollowers || "165K+", color: accentPrimary },
    ];

    metricsData.forEach((m, idx) => {
      const cardX = margin + idx * (cardW + cardGap);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(cardX, currentY, cardW, metricCardHeight, 2.5, 2.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
      doc.text(m.label, cardX + cardW / 2, currentY + 6, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(m.color[0], m.color[1], m.color[2]);
      doc.text(m.value, cardX + cardW / 2, currentY + 13.5, { align: "center" });
    });

    currentY += metricCardHeight + 5;
  }

  // ==========================================
  // 3. ARTIST BIOGRAPHY & NARRATIVE
  // ==========================================
  if (includeBio && (epk.bioFull || epk.bioShort)) {
    const bioText = epk.bioFull || epk.bioShort;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const splitBio = doc.splitTextToSize(bioText, contentWidth - 12);
    const bioCardHeight = splitBio.length * 4.2 + 16;

    checkPageOverflow(bioCardHeight);

    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, bioCardHeight, 3, 3, "FD");

    // Section Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
    doc.text("OFFICIAL BIOGRAPHY & ARTIST NARRATIVE", margin + 6, currentY + 7);

    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.2);
    doc.line(margin + 6, currentY + 9.5, margin + contentWidth - 6, currentY + 9.5);

    // Bio Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.text(splitBio, margin + 6, currentY + 15, { lineHeightFactor: 1.35 });

    currentY += bioCardHeight + 5;
  }

  // ==========================================
  // 4. FLAGSHIP TRACKS & MASTER RECORDINGS
  // ==========================================
  if (includeTracks && epk.keyTracks && epk.keyTracks.length > 0) {
    const trackRowH = 8.5;
    const headerH = 10;
    const tableH = headerH + epk.keyTracks.length * trackRowH + 4;

    checkPageOverflow(tableH);

    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, tableH, 3, 3, "FD");

    // Section Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.text("FLAGSHIP SINGLES & MASTER CATALOG", margin + 6, currentY + 7);

    // Table Header Line
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.2);
    doc.line(margin + 6, currentY + 9.5, margin + contentWidth - 6, currentY + 9.5);

    let rowY = currentY + 15;
    epk.keyTracks.forEach((trk, idx) => {
      // Index badge
      doc.setFillColor(accentLight[0], accentLight[1], accentLight[2]);
      doc.roundedRect(margin + 6, rowY - 4, 6, 6, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
      doc.text(`${idx + 1}`, margin + 9, rowY + 0.2, { align: "center" });

      // Track Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
      doc.text(trk.title, margin + 15, rowY);

      // Duration & DSP
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
      const trkDetails = `${trk.duration}  •  ${trk.dsp || "Spotify / Apple Music"}`;
      doc.text(trkDetails, margin + 90, rowY);

      // Stream Count & Badge
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
      doc.text(`${trk.streams} streams`, margin + contentWidth - 25, rowY, { align: "right" });

      // Status Pill
      doc.setFillColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.roundedRect(margin + contentWidth - 20, rowY - 3.8, 14, 5, 1, 1, "F");
      doc.setFontSize(5.5);
      doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
      doc.text("MASTER", margin + contentWidth - 13, rowY - 0.3, { align: "center" });

      rowY += trackRowH;
    });

    currentY += tableH + 5;
  }

  // ==========================================
  // 5. PRESS HIGHLIGHTS & CRITICAL ACCLAIM
  // ==========================================
  if (includePressQuotes && epk.pressQuotes && epk.pressQuotes.length > 0) {
    const quoteBoxH = 22;
    const cardGap = 3;
    const numQuotes = epk.pressQuotes.length;
    const quoteColW = numQuotes > 1 ? (contentWidth - cardGap) / 2 : contentWidth;
    const neededQuotesH = quoteBoxH + 10;

    checkPageOverflow(neededQuotesH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
    doc.text("PRESS HIGHLIGHTS & CRITICAL ACCLAIM", margin, currentY + 3);
    currentY += 6;

    epk.pressQuotes.slice(0, 2).forEach((q, idx) => {
      const qX = margin + idx * (quoteColW + cardGap);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(qX, currentY, quoteColW, quoteBoxH, 2.5, 2.5, "FD");

      // Quote text
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
      const quoteLines = doc.splitTextToSize(`"${q.quote}"`, quoteColW - 10);
      doc.text(quoteLines.slice(0, 2), qX + 5, currentY + 7);

      // Source Tag
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
      doc.text(`— ${q.source.toUpperCase()}`, qX + 5, currentY + quoteBoxH - 4);
    });

    currentY += quoteBoxH + 5;
  }

  // ==========================================
  // 6. BOOKING, MANAGEMENT & OFFICIAL CONTACT
  // ==========================================
  if (includeContact) {
    const contactH = 20;
    checkPageOverflow(contactH + 5);

    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, contactH, 2.5, 2.5, "FD");

    // Left: Booking
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.text("LIVE BOOKING & COMMERCIAL INQUIRIES", margin + 6, currentY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(accentPrimary[0], accentPrimary[1], accentPrimary[2]);
    doc.text(epk.bookingEmail || "booking@keedohub.com", margin + 6, currentY + 13.5);

    // Right: Management
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(textPrimary[0], textPrimary[1], textPrimary[2]);
    doc.text("OFFICIAL REPRESENTATION & MANAGEMENT", margin + contentWidth - 6, currentY + 7, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textSecondary[0], textSecondary[1], textSecondary[2]);
    doc.text(epk.management || "Keedohub Talent Agency / Sovereign Records", margin + contentWidth - 6, currentY + 13.5, {
      align: "right",
    });

    currentY += contactH + 4;
  }

  // Total pages and footers
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  return doc;
};

export const downloadEPKPdf = async (
  epk: EPKData,
  options: EPKExportOptions = {}
): Promise<void> => {
  const doc = await generateEPKPdf(epk, options);
  const cleanName = (epk.artistName || "Artist")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  const filename = `${cleanName}-official-epk-dossier.pdf`;
  doc.save(filename);
};

export const getEPKPdfBlobUrl = async (
  epk: EPKData,
  options: EPKExportOptions = {}
): Promise<{ url: string; cleanup: () => void }> => {
  const doc = await generateEPKPdf(epk, options);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  return {
    url,
    cleanup: () => URL.revokeObjectURL(url),
  };
};

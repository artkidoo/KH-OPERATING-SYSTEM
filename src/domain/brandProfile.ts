// Brand profile completion — shared by Home + Kits + guard rails.
export interface BrandProfileSignals {
  hasName: boolean; hasIndustry: boolean; hasContact: boolean;
  hasPrimaryColor: boolean; hasLogo: boolean; hasTypography: boolean;
  hasVoice: boolean; hasOfferOrDoc: boolean;
}
export function brandProfileCompletion(s: BrandProfileSignals): { pct: number; done: number; total: number; missing: string[] } {
  const entries: [string, boolean][] = [
    ["Business name", s.hasName], ["Industry", s.hasIndustry],
    ["Contact info", s.hasContact], ["Primary colour", s.hasPrimaryColor],
    ["Logo", s.hasLogo], ["Typography", s.hasTypography],
    ["Brand voice", s.hasVoice], ["Offer or document", s.hasOfferOrDoc],
  ];
  const done = entries.filter((e) => e[1]).length;
  return { pct: Math.round((done / entries.length) * 100), done, total: entries.length, missing: entries.filter((e) => !e[1]).map((e) => e[0]) };
}

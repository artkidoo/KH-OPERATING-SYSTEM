export interface BrandCreativeService { id: string; name: string; desc: string; req: string; items: string[]; }
export interface BrandCreativeCategory { id: string; name: string; tag: string; services: BrandCreativeService[]; }
export const BRAND_CREATIVE_CATALOGUE: BrandCreativeCategory[] = [
 { id:'identity', name:'Identity', tag:'Who the brand is', services: [
  { id:'logo', name:'Logo', desc:'Primary logo mark from Brand DNA.', req:'brand_identity', items:['Primary logo','Variants','Clearspace'] },
  { id:'brand-identity', name:'Brand Identity', desc:'Full identity system.', req:'brand_identity', items:['Identity system','Colour tokens','Type pairing'] },
  { id:'brand-guidelines', name:'Brand Guidelines', desc:'Rules for consistent use.', req:'brand_identity', items:['Guidelines PDF','Do/dont sheet'] } ] },
 { id:'social', name:'Social', tag:'Look professional on every feed', services: [
  { id:'social-media-kit', name:'Social Media Kit', desc:'Complete social starter pack.', req:'social_content_pack', items:['Profile assets','Post templates','Story frames'] },
  { id:'social-templates', name:'Social Templates', desc:'Reusable brand templates.', req:'social_content_pack', items:['1:1','4:5','9:16'] },
  { id:'social-graphics', name:'Social Graphics', desc:'Launch graphics.', req:'social_content_pack', items:['Launch graphics','Announcement cards'] },
  { id:'profile-assets', name:'Profile Assets', desc:'Avatars and covers.', req:'social_content_pack', items:['Avatar set','Cover images'] } ] },
 { id:'marketing', name:'Marketing', tag:'Promote without losing the brand', services: [
  { id:'marketing-materials', name:'Marketing Materials', desc:'Flyers and brochures.', req:'marketing_materials', items:['Flyers','Brochures','Promo sheets'] },
  { id:'campaign-graphics', name:'Campaign Graphics', desc:'Creative deliverables only, not campaign management.', req:'marketing_materials', items:['Key visual','Adaptations'] },
  { id:'promotional-graphics', name:'Promotional Graphics', desc:'Sales and event graphics.', req:'marketing_materials', items:['Promo graphics','Offer cards'] },
  { id:'product-graphics', name:'Product Graphics', desc:'Product cards and sheets.', req:'marketing_materials', items:['Product cards','Feature sheets'] } ] },
 { id:'motion', name:'Motion', tag:'Bring the brand to life', services: [
  { id:'motion-graphics', name:'Motion Graphics', desc:'Branded motion loops.', req:'motion_visualizer', items:['Motion loops','Captions'] },
  { id:'logo-animation', name:'Logo Animation', desc:'Logo sting for intros.', req:'motion_visualizer', items:['Logo sting','Loop'] },
  { id:'social-motion', name:'Social Motion', desc:'9:16 vertical motion.', req:'motion_visualizer', items:['9:16 cuts'] } ] },
 { id:'digital', name:'Digital', tag:'The brand online', services: [
  { id:'website-design', name:'Website Design', desc:'Web direction from Brand DNA.', req:'digital_brand', items:['Homepage','Style system'] },
  { id:'app-design', name:'App Design', desc:'App screens in brand language.', req:'digital_brand', items:['Key screens','Notes'] },
  { id:'ui-ux', name:'UI/UX', desc:'Interface polish with tokens.', req:'digital_brand', items:['UI notes','Tokens'] } ] },
 { id:'presentation', name:'Presentation', tag:'Decks that close', services: [
  { id:'company-presentation', name:'Company Presentation', desc:'Master company deck.', req:'presentation', items:['Editable deck','Cover slides'] },
  { id:'pitch-deck', name:'Pitch Deck', desc:'Concise pitch narrative.', req:'presentation', items:['Editable pitch deck'] },
  { id:'investor-deck', name:'Investor Deck', desc:'Investor-grade visuals.', req:'presentation', items:['Editable investor deck'] },
  { id:'sales-deck', name:'Sales Deck', desc:'Sales conversation deck.', req:'presentation', items:['Editable sales deck'] } ] },
 { id:'print', name:'Print', tag:'Real-world materials', services: [
  { id:'letterhead', name:'Letterhead', desc:'Branded letterhead.', req:'business_documents', items:['Letterhead PDF'] },
  { id:'business-cards', name:'Business Cards', desc:'Contact cards.', req:'business_documents', items:['Card print file'] },
  { id:'brochures', name:'Brochures', desc:'Brand brochures.', req:'marketing_materials', items:['Brochure layout'] },
  { id:'flyers', name:'Flyers', desc:'Promo flyers.', req:'marketing_materials', items:['Flyer file'] },
  { id:'other-branded', name:'Other branded materials', desc:'Anything else to look ready.', req:'custom_request', items:['Custom asset'] } ] },
];

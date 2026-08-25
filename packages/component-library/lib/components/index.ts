// Auto-register all 9 sections into Section Registry
import { registerSection } from '../registry/registry';
import {
  Carousel,
  CAROUSEL_CATEGORY,
  CAROUSEL_COMPONENT_ID,
  CAROUSEL_DESCRIPTION,
  CAROUSEL_DISPLAY_NAME,
  carouselSchema,
  defaultCarouselActions,
  defaultCarouselProps,
  defaultCarouselStyle,
  generateCarouselInstance,
} from './Carousel';
import {
  Contact,
  CONTACT_CATEGORY,
  CONTACT_COMPONENT_ID,
  CONTACT_DESCRIPTION,
  CONTACT_DISPLAY_NAME,
  contactSchema,
  defaultContactActions,
  defaultContactProps,
  defaultContactStyle,
  generateContactInstance,
} from './Contact';
import {
  defaultFAQActions,
  defaultFAQProps,
  defaultFAQStyle,
  FAQ,
  FAQ_CATEGORY,
  FAQ_COMPONENT_ID,
  FAQ_DESCRIPTION,
  FAQ_DISPLAY_NAME,
  faqSchema,
  generateFAQInstance,
} from './FAQ';
import {
  defaultFeaturesActions,
  defaultFeaturesProps,
  defaultFeaturesStyle,
  Features,
  FEATURES_CATEGORY,
  FEATURES_COMPONENT_ID,
  FEATURES_DESCRIPTION,
  FEATURES_DISPLAY_NAME,
  featuresSchema,
  generateFeaturesInstance,
} from './Features';
import {
  defaultFooterActions,
  defaultFooterProps,
  defaultFooterStyle,
  Footer,
  FOOTER_CATEGORY,
  FOOTER_COMPONENT_ID,
  FOOTER_DESCRIPTION,
  FOOTER_DISPLAY_NAME,
  footerSchema,
  generateFooterInstance,
} from './Footer';
import {
  defaultHeaderActions,
  defaultHeaderProps,
  defaultHeaderStyle,
  generateHeaderInstance,
  Header,
  HEADER_CATEGORY,
  HEADER_COMPONENT_ID,
  HEADER_DESCRIPTION,
  HEADER_DISPLAY_NAME,
  headerSchema,
} from './Header';
import {
  defaultHeroActions,
  defaultHeroProps,
  defaultHeroStyle,
  generateHeroInstance,
  Hero,
  HERO_CATEGORY,
  HERO_COMPONENT_ID,
  HERO_DESCRIPTION,
  HERO_DISPLAY_NAME,
  heroSchema,
} from './Hero';
import {
  defaultPricingActions,
  defaultPricingProps,
  defaultPricingStyle,
  generatePricingInstance,
  Pricing,
  PRICING_CATEGORY,
  PRICING_COMPONENT_ID,
  PRICING_DESCRIPTION,
  PRICING_DISPLAY_NAME,
  pricingSchema,
} from './Pricing';
import {
  defaultTestimonialsActions,
  defaultTestimonialsProps,
  defaultTestimonialsStyle,
  generateTestimonialsInstance,
  Testimonials,
  TESTIMONIALS_CATEGORY,
  TESTIMONIALS_COMPONENT_ID,
  TESTIMONIALS_DESCRIPTION,
  TESTIMONIALS_DISPLAY_NAME,
  testimonialsSchema,
} from './Testimonials';

// Export all individual component modules
export * from './Header';
export * from './Hero';
export * from './Features';
export * from './Carousel';
export * from './Pricing';
export * from './Testimonials';
export * from './FAQ';
export * from './Contact';
export * from './Footer';

export function initializeSectionRegistry(): void {
  registerSection({
    id: HEADER_COMPONENT_ID,
    componentId: HEADER_COMPONENT_ID,
    name: HEADER_COMPONENT_ID,
    displayName: HEADER_DISPLAY_NAME,
    category: HEADER_CATEGORY,
    description: HEADER_DESCRIPTION,
    version: '1.0.0',
    tags: ['header', 'nav', 'navigation', 'menu', 'brand'],
    component: Header,
    schema: headerSchema,
    defaultProps: defaultHeaderProps,
    defaultStyle: defaultHeaderStyle,
    defaultActions: defaultHeaderActions,
    generator: generateHeaderInstance,
  });

  registerSection({
    id: HERO_COMPONENT_ID,
    componentId: HERO_COMPONENT_ID,
    name: HERO_COMPONENT_ID,
    displayName: HERO_DISPLAY_NAME,
    category: HERO_CATEGORY,
    description: HERO_DESCRIPTION,
    version: '1.0.0',
    tags: ['hero', 'landing', 'headline', 'intro', 'cta'],
    component: Hero,
    schema: heroSchema,
    defaultProps: defaultHeroProps,
    defaultStyle: defaultHeroStyle,
    defaultActions: defaultHeroActions,
    generator: generateHeroInstance,
  });

  registerSection({
    id: FEATURES_COMPONENT_ID,
    componentId: FEATURES_COMPONENT_ID,
    name: FEATURES_COMPONENT_ID,
    displayName: FEATURES_DISPLAY_NAME,
    category: FEATURES_CATEGORY,
    description: FEATURES_DESCRIPTION,
    version: '1.0.0',
    tags: ['features', 'cards', 'grid', 'services', 'benefits'],
    component: Features,
    schema: featuresSchema,
    defaultProps: defaultFeaturesProps,
    defaultStyle: defaultFeaturesStyle,
    defaultActions: defaultFeaturesActions,
    generator: generateFeaturesInstance,
  });

  registerSection({
    id: CAROUSEL_COMPONENT_ID,
    componentId: CAROUSEL_COMPONENT_ID,
    name: CAROUSEL_COMPONENT_ID,
    displayName: CAROUSEL_DISPLAY_NAME,
    category: CAROUSEL_CATEGORY,
    description: CAROUSEL_DESCRIPTION,
    version: '1.0.0',
    tags: ['carousel', 'slider', 'media', 'showcase', 'gallery'],
    component: Carousel,
    schema: carouselSchema,
    defaultProps: defaultCarouselProps,
    defaultStyle: defaultCarouselStyle,
    defaultActions: defaultCarouselActions,
    generator: generateCarouselInstance,
  });

  registerSection({
    id: PRICING_COMPONENT_ID,
    componentId: PRICING_COMPONENT_ID,
    name: PRICING_COMPONENT_ID,
    displayName: PRICING_DISPLAY_NAME,
    category: PRICING_CATEGORY,
    description: PRICING_DESCRIPTION,
    version: '1.0.0',
    tags: ['pricing', 'plans', 'tiers', 'subscription', 'billing'],
    component: Pricing,
    schema: pricingSchema,
    defaultProps: defaultPricingProps,
    defaultStyle: defaultPricingStyle,
    defaultActions: defaultPricingActions,
    generator: generatePricingInstance,
  });

  registerSection({
    id: TESTIMONIALS_COMPONENT_ID,
    componentId: TESTIMONIALS_COMPONENT_ID,
    name: TESTIMONIALS_COMPONENT_ID,
    displayName: TESTIMONIALS_DISPLAY_NAME,
    category: TESTIMONIALS_CATEGORY,
    description: TESTIMONIALS_DESCRIPTION,
    version: '1.0.0',
    tags: ['testimonials', 'reviews', 'quotes', 'social-proof', 'rating'],
    component: Testimonials,
    schema: testimonialsSchema,
    defaultProps: defaultTestimonialsProps,
    defaultStyle: defaultTestimonialsStyle,
    defaultActions: defaultTestimonialsActions,
    generator: generateTestimonialsInstance,
  });

  registerSection({
    id: FAQ_COMPONENT_ID,
    componentId: FAQ_COMPONENT_ID,
    name: FAQ_COMPONENT_ID,
    displayName: FAQ_DISPLAY_NAME,
    category: FAQ_CATEGORY,
    description: FAQ_DESCRIPTION,
    version: '1.0.0',
    tags: ['faq', 'accordion', 'questions', 'answers', 'help'],
    component: FAQ,
    schema: faqSchema,
    defaultProps: defaultFAQProps,
    defaultStyle: defaultFAQStyle,
    defaultActions: defaultFAQActions,
    generator: generateFAQInstance,
  });

  registerSection({
    id: CONTACT_COMPONENT_ID,
    componentId: CONTACT_COMPONENT_ID,
    name: CONTACT_COMPONENT_ID,
    displayName: CONTACT_DISPLAY_NAME,
    category: CONTACT_CATEGORY,
    description: CONTACT_DESCRIPTION,
    version: '1.0.0',
    tags: ['contact', 'form', 'inquiry', 'support', 'leads'],
    component: Contact,
    schema: contactSchema,
    defaultProps: defaultContactProps,
    defaultStyle: defaultContactStyle,
    defaultActions: defaultContactActions,
    generator: generateContactInstance,
  });

  registerSection({
    id: FOOTER_COMPONENT_ID,
    componentId: FOOTER_COMPONENT_ID,
    name: FOOTER_COMPONENT_ID,
    displayName: FOOTER_DISPLAY_NAME,
    category: FOOTER_CATEGORY,
    description: FOOTER_DESCRIPTION,
    version: '1.0.0',
    tags: ['footer', 'navigation', 'copyright', 'social', 'newsletter'],
    component: Footer,
    schema: footerSchema,
    defaultProps: defaultFooterProps,
    defaultStyle: defaultFooterStyle,
    defaultActions: defaultFooterActions,
    generator: generateFooterInstance,
  });
}

// Automatically initialize default registry
initializeSectionRegistry();

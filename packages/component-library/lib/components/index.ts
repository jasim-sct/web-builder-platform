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
  generateContactInstance,
} from './Contact';
import {
  defaultFAQActions,
  defaultFAQProps,
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


import {
  InvitationHero,
  INVITATIONHERO_CATEGORY,
  INVITATIONHERO_COMPONENT_ID,
  INVITATIONHERO_DESCRIPTION,
  INVITATIONHERO_DISPLAY_NAME,
  invitationheroSchema,
  defaultInvitationHeroActions,
  defaultInvitationHeroProps,
  generateInvitationHeroInstance,
} from './InvitationHero';
export * from './InvitationHero';

import {
  InvitationCover,
  INVITATIONCOVER_CATEGORY,
  INVITATIONCOVER_COMPONENT_ID,
  INVITATIONCOVER_DESCRIPTION,
  INVITATIONCOVER_DISPLAY_NAME,
  invitationcoverSchema,
  defaultInvitationCoverActions,
  defaultInvitationCoverProps,
  generateInvitationCoverInstance,
} from './InvitationCover';
export * from './InvitationCover';

import {
  EventIntroduction,
  EVENTINTRODUCTION_CATEGORY,
  EVENTINTRODUCTION_COMPONENT_ID,
  EVENTINTRODUCTION_DESCRIPTION,
  EVENTINTRODUCTION_DISPLAY_NAME,
  eventintroductionSchema,
  defaultEventIntroductionActions,
  defaultEventIntroductionProps,
  generateEventIntroductionInstance,
} from './EventIntroduction';
export * from './EventIntroduction';

import {
  EventDetails,
  EVENTDETAILS_CATEGORY,
  EVENTDETAILS_COMPONENT_ID,
  EVENTDETAILS_DESCRIPTION,
  EVENTDETAILS_DISPLAY_NAME,
  eventdetailsSchema,
  defaultEventDetailsActions,
  defaultEventDetailsProps,
  generateEventDetailsInstance,
} from './EventDetails';
export * from './EventDetails';

import {
  Countdown,
  COUNTDOWN_CATEGORY,
  COUNTDOWN_COMPONENT_ID,
  COUNTDOWN_DESCRIPTION,
  COUNTDOWN_DISPLAY_NAME,
  countdownSchema,
  defaultCountdownActions,
  defaultCountdownProps,
  generateCountdownInstance,
} from './Countdown';
export * from './Countdown';

import {
  CoupleHosts,
  COUPLEHOSTS_CATEGORY,
  COUPLEHOSTS_COMPONENT_ID,
  COUPLEHOSTS_DESCRIPTION,
  COUPLEHOSTS_DISPLAY_NAME,
  couplehostsSchema,
  defaultCoupleHostsActions,
  defaultCoupleHostsProps,
  generateCoupleHostsInstance,
} from './CoupleHosts';
export * from './CoupleHosts';

import {
  OurStory,
  OURSTORY_CATEGORY,
  OURSTORY_COMPONENT_ID,
  OURSTORY_DESCRIPTION,
  OURSTORY_DISPLAY_NAME,
  ourstorySchema,
  defaultOurStoryActions,
  defaultOurStoryProps,
  generateOurStoryInstance,
} from './OurStory';
export * from './OurStory';

import {
  StoryTimeline,
  STORYTIMELINE_CATEGORY,
  STORYTIMELINE_COMPONENT_ID,
  STORYTIMELINE_DESCRIPTION,
  STORYTIMELINE_DISPLAY_NAME,
  storytimelineSchema,
  defaultStoryTimelineActions,
  defaultStoryTimelineProps,
  generateStoryTimelineInstance,
} from './StoryTimeline';
export * from './StoryTimeline';

import {
  EventSchedule,
  EVENTSCHEDULE_CATEGORY,
  EVENTSCHEDULE_COMPONENT_ID,
  EVENTSCHEDULE_DESCRIPTION,
  EVENTSCHEDULE_DISPLAY_NAME,
  eventscheduleSchema,
  defaultEventScheduleActions,
  defaultEventScheduleProps,
  generateEventScheduleInstance,
} from './EventSchedule';
export * from './EventSchedule';

import {
  Ceremony,
  CEREMONY_CATEGORY,
  CEREMONY_COMPONENT_ID,
  CEREMONY_DESCRIPTION,
  CEREMONY_DISPLAY_NAME,
  ceremonySchema,
  defaultCeremonyActions,
  defaultCeremonyProps,
  generateCeremonyInstance,
} from './Ceremony';
export * from './Ceremony';

import {
  Reception,
  RECEPTION_CATEGORY,
  RECEPTION_COMPONENT_ID,
  RECEPTION_DESCRIPTION,
  RECEPTION_DISPLAY_NAME,
  receptionSchema,
  defaultReceptionActions,
  defaultReceptionProps,
  generateReceptionInstance,
} from './Reception';
export * from './Reception';

import {
  VenueShowcase,
  VENUESHOWCASE_CATEGORY,
  VENUESHOWCASE_COMPONENT_ID,
  VENUESHOWCASE_DESCRIPTION,
  VENUESHOWCASE_DISPLAY_NAME,
  venueshowcaseSchema,
  defaultVenueShowcaseActions,
  defaultVenueShowcaseProps,
  generateVenueShowcaseInstance,
} from './VenueShowcase';
export * from './VenueShowcase';

import {
  VenueInformation,
  VENUEINFORMATION_CATEGORY,
  VENUEINFORMATION_COMPONENT_ID,
  VENUEINFORMATION_DESCRIPTION,
  VENUEINFORMATION_DISPLAY_NAME,
  venueinformationSchema,
  defaultVenueInformationActions,
  defaultVenueInformationProps,
  generateVenueInformationInstance,
} from './VenueInformation';
export * from './VenueInformation';

import {
  InteractiveMap,
  INTERACTIVEMAP_CATEGORY,
  INTERACTIVEMAP_COMPONENT_ID,
  INTERACTIVEMAP_DESCRIPTION,
  INTERACTIVEMAP_DISPLAY_NAME,
  interactivemapSchema,
  defaultInteractiveMapActions,
  defaultInteractiveMapProps,
  generateInteractiveMapInstance,
} from './InteractiveMap';
export * from './InteractiveMap';

import {
  Gallery,
  GALLERY_CATEGORY,
  GALLERY_COMPONENT_ID,
  GALLERY_DESCRIPTION,
  GALLERY_DISPLAY_NAME,
  gallerySchema,
  defaultGalleryActions,
  defaultGalleryProps,
  generateGalleryInstance,
} from './Gallery';
export * from './Gallery';

import {
  FeaturedMemories,
  FEATUREDMEMORIES_CATEGORY,
  FEATUREDMEMORIES_COMPONENT_ID,
  FEATUREDMEMORIES_DESCRIPTION,
  FEATUREDMEMORIES_DISPLAY_NAME,
  featuredmemoriesSchema,
  defaultFeaturedMemoriesActions,
  defaultFeaturedMemoriesProps,
  generateFeaturedMemoriesInstance,
} from './FeaturedMemories';
export * from './FeaturedMemories';

import {
  QuoteMessage,
  QUOTEMESSAGE_CATEGORY,
  QUOTEMESSAGE_COMPONENT_ID,
  QUOTEMESSAGE_DESCRIPTION,
  QUOTEMESSAGE_DISPLAY_NAME,
  quotemessageSchema,
  defaultQuoteMessageActions,
  defaultQuoteMessageProps,
  generateQuoteMessageInstance,
} from './QuoteMessage';
export * from './QuoteMessage';

import {
  FamilySpecialPeople,
  FAMILYSPECIALPEOPLE_CATEGORY,
  FAMILYSPECIALPEOPLE_COMPONENT_ID,
  FAMILYSPECIALPEOPLE_DESCRIPTION,
  FAMILYSPECIALPEOPLE_DISPLAY_NAME,
  familyspecialpeopleSchema,
  defaultFamilySpecialPeopleActions,
  defaultFamilySpecialPeopleProps,
  generateFamilySpecialPeopleInstance,
} from './FamilySpecialPeople';
export * from './FamilySpecialPeople';

import {
  WeddingPartyTeam,
  WEDDINGPARTYTEAM_CATEGORY,
  WEDDINGPARTYTEAM_COMPONENT_ID,
  WEDDINGPARTYTEAM_DESCRIPTION,
  WEDDINGPARTYTEAM_DISPLAY_NAME,
  weddingpartyteamSchema,
  defaultWeddingPartyTeamActions,
  defaultWeddingPartyTeamProps,
  generateWeddingPartyTeamInstance,
} from './WeddingPartyTeam';
export * from './WeddingPartyTeam';

import {
  DressCode,
  DRESSCODE_CATEGORY,
  DRESSCODE_COMPONENT_ID,
  DRESSCODE_DESCRIPTION,
  DRESSCODE_DISPLAY_NAME,
  dresscodeSchema,
  defaultDressCodeActions,
  defaultDressCodeProps,
  generateDressCodeInstance,
} from './DressCode';
export * from './DressCode';

import {
  TravelInformation,
  TRAVELINFORMATION_CATEGORY,
  TRAVELINFORMATION_COMPONENT_ID,
  TRAVELINFORMATION_DESCRIPTION,
  TRAVELINFORMATION_DISPLAY_NAME,
  travelinformationSchema,
  defaultTravelInformationActions,
  defaultTravelInformationProps,
  generateTravelInformationInstance,
} from './TravelInformation';
export * from './TravelInformation';

import {
  Accommodation,
  ACCOMMODATION_CATEGORY,
  ACCOMMODATION_COMPONENT_ID,
  ACCOMMODATION_DESCRIPTION,
  ACCOMMODATION_DISPLAY_NAME,
  accommodationSchema,
  defaultAccommodationActions,
  defaultAccommodationProps,
  generateAccommodationInstance,
} from './Accommodation';
export * from './Accommodation';

import {
  ThingsToKnow,
  THINGSTOKNOW_CATEGORY,
  THINGSTOKNOW_COMPONENT_ID,
  THINGSTOKNOW_DESCRIPTION,
  THINGSTOKNOW_DISPLAY_NAME,
  thingstoknowSchema,
  defaultThingsToKnowActions,
  defaultThingsToKnowProps,
  generateThingsToKnowInstance,
} from './ThingsToKnow';
export * from './ThingsToKnow';

import {
  InvitationFAQ,
  INVITATIONFAQ_CATEGORY,
  INVITATIONFAQ_COMPONENT_ID,
  INVITATIONFAQ_DESCRIPTION,
  INVITATIONFAQ_DISPLAY_NAME,
  invitationfaqSchema,
  defaultInvitationFAQActions,
  defaultInvitationFAQProps,
  generateInvitationFAQInstance,
} from './InvitationFAQ';
export * from './InvitationFAQ';

import {
  RSVP,
  RSVP_CATEGORY,
  RSVP_COMPONENT_ID,
  RSVP_DESCRIPTION,
  RSVP_DISPLAY_NAME,
  rsvpSchema,
  defaultRSVPActions,
  defaultRSVPProps,
  generateRSVPInstance,
} from './RSVP';
export * from './RSVP';

import {
  GiftRegistry,
  GIFTREGISTRY_CATEGORY,
  GIFTREGISTRY_COMPONENT_ID,
  GIFTREGISTRY_DESCRIPTION,
  GIFTREGISTRY_DISPLAY_NAME,
  giftregistrySchema,
  defaultGiftRegistryActions,
  defaultGiftRegistryProps,
  generateGiftRegistryInstance,
} from './GiftRegistry';
export * from './GiftRegistry';

import {
  ContactQuestions,
  CONTACTQUESTIONS_CATEGORY,
  CONTACTQUESTIONS_COMPONENT_ID,
  CONTACTQUESTIONS_DESCRIPTION,
  CONTACTQUESTIONS_DISPLAY_NAME,
  contactquestionsSchema,
  defaultContactQuestionsActions,
  defaultContactQuestionsProps,
  generateContactQuestionsInstance,
} from './ContactQuestions';
export * from './ContactQuestions';

import {
  EventPolicies,
  EVENTPOLICIES_CATEGORY,
  EVENTPOLICIES_COMPONENT_ID,
  EVENTPOLICIES_DESCRIPTION,
  EVENTPOLICIES_DISPLAY_NAME,
  eventpoliciesSchema,
  defaultEventPoliciesActions,
  defaultEventPoliciesProps,
  generateEventPoliciesInstance,
} from './EventPolicies';
export * from './EventPolicies';

import {
  ThankYouClosing,
  THANKYOUCLOSING_CATEGORY,
  THANKYOUCLOSING_COMPONENT_ID,
  THANKYOUCLOSING_DESCRIPTION,
  THANKYOUCLOSING_DISPLAY_NAME,
  thankyouclosingSchema,
  defaultThankYouClosingActions,
  defaultThankYouClosingProps,
  generateThankYouClosingInstance,
} from './ThankYouClosing';
export * from './ThankYouClosing';

import {
  InvitationFooter,
  INVITATIONFOOTER_CATEGORY,
  INVITATIONFOOTER_COMPONENT_ID,
  INVITATIONFOOTER_DESCRIPTION,
  INVITATIONFOOTER_DISPLAY_NAME,
  invitationfooterSchema,
  defaultInvitationFooterActions,
  defaultInvitationFooterProps,
  generateInvitationFooterInstance,
} from './InvitationFooter';
export * from './InvitationFooter';

export function initializeSectionRegistry(): void {

  registerSection({
    id: INVITATIONHERO_COMPONENT_ID,
    componentId: INVITATIONHERO_COMPONENT_ID,
    name: INVITATIONHERO_COMPONENT_ID,
    displayName: INVITATIONHERO_DISPLAY_NAME,
    category: INVITATIONHERO_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: INVITATIONHERO_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'invitationhero'],
    component: InvitationHero,
    schema: invitationheroSchema,
    defaultProps: defaultInvitationHeroProps,
    defaultActions: defaultInvitationHeroActions,
    generator: generateInvitationHeroInstance,
  });

  registerSection({
    id: INVITATIONCOVER_COMPONENT_ID,
    componentId: INVITATIONCOVER_COMPONENT_ID,
    name: INVITATIONCOVER_COMPONENT_ID,
    displayName: INVITATIONCOVER_DISPLAY_NAME,
    category: INVITATIONCOVER_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: INVITATIONCOVER_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'invitationcover'],
    component: InvitationCover,
    schema: invitationcoverSchema,
    defaultProps: defaultInvitationCoverProps,
    defaultActions: defaultInvitationCoverActions,
    generator: generateInvitationCoverInstance,
  });

  registerSection({
    id: EVENTINTRODUCTION_COMPONENT_ID,
    componentId: EVENTINTRODUCTION_COMPONENT_ID,
    name: EVENTINTRODUCTION_COMPONENT_ID,
    displayName: EVENTINTRODUCTION_DISPLAY_NAME,
    category: EVENTINTRODUCTION_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: EVENTINTRODUCTION_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'eventintroduction'],
    component: EventIntroduction,
    schema: eventintroductionSchema,
    defaultProps: defaultEventIntroductionProps,
    defaultActions: defaultEventIntroductionActions,
    generator: generateEventIntroductionInstance,
  });

  registerSection({
    id: EVENTDETAILS_COMPONENT_ID,
    componentId: EVENTDETAILS_COMPONENT_ID,
    name: EVENTDETAILS_COMPONENT_ID,
    displayName: EVENTDETAILS_DISPLAY_NAME,
    category: EVENTDETAILS_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: EVENTDETAILS_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'eventdetails'],
    component: EventDetails,
    schema: eventdetailsSchema,
    defaultProps: defaultEventDetailsProps,
    defaultActions: defaultEventDetailsActions,
    generator: generateEventDetailsInstance,
  });

  registerSection({
    id: COUNTDOWN_COMPONENT_ID,
    componentId: COUNTDOWN_COMPONENT_ID,
    name: COUNTDOWN_COMPONENT_ID,
    displayName: COUNTDOWN_DISPLAY_NAME,
    category: COUNTDOWN_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: COUNTDOWN_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'countdown'],
    component: Countdown,
    schema: countdownSchema,
    defaultProps: defaultCountdownProps,
    defaultActions: defaultCountdownActions,
    generator: generateCountdownInstance,
  });

  registerSection({
    id: COUPLEHOSTS_COMPONENT_ID,
    componentId: COUPLEHOSTS_COMPONENT_ID,
    name: COUPLEHOSTS_COMPONENT_ID,
    displayName: COUPLEHOSTS_DISPLAY_NAME,
    category: COUPLEHOSTS_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: COUPLEHOSTS_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'couplehosts'],
    component: CoupleHosts,
    schema: couplehostsSchema,
    defaultProps: defaultCoupleHostsProps,
    defaultActions: defaultCoupleHostsActions,
    generator: generateCoupleHostsInstance,
  });

  registerSection({
    id: OURSTORY_COMPONENT_ID,
    componentId: OURSTORY_COMPONENT_ID,
    name: OURSTORY_COMPONENT_ID,
    displayName: OURSTORY_DISPLAY_NAME,
    category: OURSTORY_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: OURSTORY_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'ourstory'],
    component: OurStory,
    schema: ourstorySchema,
    defaultProps: defaultOurStoryProps,
    defaultActions: defaultOurStoryActions,
    generator: generateOurStoryInstance,
  });

  registerSection({
    id: STORYTIMELINE_COMPONENT_ID,
    componentId: STORYTIMELINE_COMPONENT_ID,
    name: STORYTIMELINE_COMPONENT_ID,
    displayName: STORYTIMELINE_DISPLAY_NAME,
    category: STORYTIMELINE_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: STORYTIMELINE_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'storytimeline'],
    component: StoryTimeline,
    schema: storytimelineSchema,
    defaultProps: defaultStoryTimelineProps,
    defaultActions: defaultStoryTimelineActions,
    generator: generateStoryTimelineInstance,
  });

  registerSection({
    id: EVENTSCHEDULE_COMPONENT_ID,
    componentId: EVENTSCHEDULE_COMPONENT_ID,
    name: EVENTSCHEDULE_COMPONENT_ID,
    displayName: EVENTSCHEDULE_DISPLAY_NAME,
    category: EVENTSCHEDULE_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: EVENTSCHEDULE_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'eventschedule'],
    component: EventSchedule,
    schema: eventscheduleSchema,
    defaultProps: defaultEventScheduleProps,
    defaultActions: defaultEventScheduleActions,
    generator: generateEventScheduleInstance,
  });

  registerSection({
    id: CEREMONY_COMPONENT_ID,
    componentId: CEREMONY_COMPONENT_ID,
    name: CEREMONY_COMPONENT_ID,
    displayName: CEREMONY_DISPLAY_NAME,
    category: CEREMONY_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: CEREMONY_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'ceremony'],
    component: Ceremony,
    schema: ceremonySchema,
    defaultProps: defaultCeremonyProps,
    defaultActions: defaultCeremonyActions,
    generator: generateCeremonyInstance,
  });

  registerSection({
    id: RECEPTION_COMPONENT_ID,
    componentId: RECEPTION_COMPONENT_ID,
    name: RECEPTION_COMPONENT_ID,
    displayName: RECEPTION_DISPLAY_NAME,
    category: RECEPTION_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: RECEPTION_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'reception'],
    component: Reception,
    schema: receptionSchema,
    defaultProps: defaultReceptionProps,
    defaultActions: defaultReceptionActions,
    generator: generateReceptionInstance,
  });

  registerSection({
    id: VENUESHOWCASE_COMPONENT_ID,
    componentId: VENUESHOWCASE_COMPONENT_ID,
    name: VENUESHOWCASE_COMPONENT_ID,
    displayName: VENUESHOWCASE_DISPLAY_NAME,
    category: VENUESHOWCASE_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: VENUESHOWCASE_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'venueshowcase'],
    component: VenueShowcase,
    schema: venueshowcaseSchema,
    defaultProps: defaultVenueShowcaseProps,
    defaultActions: defaultVenueShowcaseActions,
    generator: generateVenueShowcaseInstance,
  });

  registerSection({
    id: VENUEINFORMATION_COMPONENT_ID,
    componentId: VENUEINFORMATION_COMPONENT_ID,
    name: VENUEINFORMATION_COMPONENT_ID,
    displayName: VENUEINFORMATION_DISPLAY_NAME,
    category: VENUEINFORMATION_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: VENUEINFORMATION_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'venueinformation'],
    component: VenueInformation,
    schema: venueinformationSchema,
    defaultProps: defaultVenueInformationProps,
    defaultActions: defaultVenueInformationActions,
    generator: generateVenueInformationInstance,
  });

  registerSection({
    id: INTERACTIVEMAP_COMPONENT_ID,
    componentId: INTERACTIVEMAP_COMPONENT_ID,
    name: INTERACTIVEMAP_COMPONENT_ID,
    displayName: INTERACTIVEMAP_DISPLAY_NAME,
    category: INTERACTIVEMAP_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: INTERACTIVEMAP_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'interactivemap'],
    component: InteractiveMap,
    schema: interactivemapSchema,
    defaultProps: defaultInteractiveMapProps,
    defaultActions: defaultInteractiveMapActions,
    generator: generateInteractiveMapInstance,
  });

  registerSection({
    id: GALLERY_COMPONENT_ID,
    componentId: GALLERY_COMPONENT_ID,
    name: GALLERY_COMPONENT_ID,
    displayName: GALLERY_DISPLAY_NAME,
    category: GALLERY_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: GALLERY_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'gallery'],
    component: Gallery,
    schema: gallerySchema,
    defaultProps: defaultGalleryProps,
    defaultActions: defaultGalleryActions,
    generator: generateGalleryInstance,
  });

  registerSection({
    id: FEATUREDMEMORIES_COMPONENT_ID,
    componentId: FEATUREDMEMORIES_COMPONENT_ID,
    name: FEATUREDMEMORIES_COMPONENT_ID,
    displayName: FEATUREDMEMORIES_DISPLAY_NAME,
    category: FEATUREDMEMORIES_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: FEATUREDMEMORIES_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'featuredmemories'],
    component: FeaturedMemories,
    schema: featuredmemoriesSchema,
    defaultProps: defaultFeaturedMemoriesProps,
    defaultActions: defaultFeaturedMemoriesActions,
    generator: generateFeaturedMemoriesInstance,
  });

  registerSection({
    id: QUOTEMESSAGE_COMPONENT_ID,
    componentId: QUOTEMESSAGE_COMPONENT_ID,
    name: QUOTEMESSAGE_COMPONENT_ID,
    displayName: QUOTEMESSAGE_DISPLAY_NAME,
    category: QUOTEMESSAGE_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: QUOTEMESSAGE_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'quotemessage'],
    component: QuoteMessage,
    schema: quotemessageSchema,
    defaultProps: defaultQuoteMessageProps,
    defaultActions: defaultQuoteMessageActions,
    generator: generateQuoteMessageInstance,
  });

  registerSection({
    id: FAMILYSPECIALPEOPLE_COMPONENT_ID,
    componentId: FAMILYSPECIALPEOPLE_COMPONENT_ID,
    name: FAMILYSPECIALPEOPLE_COMPONENT_ID,
    displayName: FAMILYSPECIALPEOPLE_DISPLAY_NAME,
    category: FAMILYSPECIALPEOPLE_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: FAMILYSPECIALPEOPLE_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'familyspecialpeople'],
    component: FamilySpecialPeople,
    schema: familyspecialpeopleSchema,
    defaultProps: defaultFamilySpecialPeopleProps,
    defaultActions: defaultFamilySpecialPeopleActions,
    generator: generateFamilySpecialPeopleInstance,
  });

  registerSection({
    id: WEDDINGPARTYTEAM_COMPONENT_ID,
    componentId: WEDDINGPARTYTEAM_COMPONENT_ID,
    name: WEDDINGPARTYTEAM_COMPONENT_ID,
    displayName: WEDDINGPARTYTEAM_DISPLAY_NAME,
    category: WEDDINGPARTYTEAM_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: WEDDINGPARTYTEAM_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'weddingpartyteam'],
    component: WeddingPartyTeam,
    schema: weddingpartyteamSchema,
    defaultProps: defaultWeddingPartyTeamProps,
    defaultActions: defaultWeddingPartyTeamActions,
    generator: generateWeddingPartyTeamInstance,
  });

  registerSection({
    id: DRESSCODE_COMPONENT_ID,
    componentId: DRESSCODE_COMPONENT_ID,
    name: DRESSCODE_COMPONENT_ID,
    displayName: DRESSCODE_DISPLAY_NAME,
    category: DRESSCODE_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: DRESSCODE_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'dresscode'],
    component: DressCode,
    schema: dresscodeSchema,
    defaultProps: defaultDressCodeProps,
    defaultActions: defaultDressCodeActions,
    generator: generateDressCodeInstance,
  });

  registerSection({
    id: TRAVELINFORMATION_COMPONENT_ID,
    componentId: TRAVELINFORMATION_COMPONENT_ID,
    name: TRAVELINFORMATION_COMPONENT_ID,
    displayName: TRAVELINFORMATION_DISPLAY_NAME,
    category: TRAVELINFORMATION_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: TRAVELINFORMATION_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'travelinformation'],
    component: TravelInformation,
    schema: travelinformationSchema,
    defaultProps: defaultTravelInformationProps,
    defaultActions: defaultTravelInformationActions,
    generator: generateTravelInformationInstance,
  });

  registerSection({
    id: ACCOMMODATION_COMPONENT_ID,
    componentId: ACCOMMODATION_COMPONENT_ID,
    name: ACCOMMODATION_COMPONENT_ID,
    displayName: ACCOMMODATION_DISPLAY_NAME,
    category: ACCOMMODATION_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: ACCOMMODATION_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'accommodation'],
    component: Accommodation,
    schema: accommodationSchema,
    defaultProps: defaultAccommodationProps,
    defaultActions: defaultAccommodationActions,
    generator: generateAccommodationInstance,
  });

  registerSection({
    id: THINGSTOKNOW_COMPONENT_ID,
    componentId: THINGSTOKNOW_COMPONENT_ID,
    name: THINGSTOKNOW_COMPONENT_ID,
    displayName: THINGSTOKNOW_DISPLAY_NAME,
    category: THINGSTOKNOW_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: THINGSTOKNOW_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'thingstoknow'],
    component: ThingsToKnow,
    schema: thingstoknowSchema,
    defaultProps: defaultThingsToKnowProps,
    defaultActions: defaultThingsToKnowActions,
    generator: generateThingsToKnowInstance,
  });

  registerSection({
    id: INVITATIONFAQ_COMPONENT_ID,
    componentId: INVITATIONFAQ_COMPONENT_ID,
    name: INVITATIONFAQ_COMPONENT_ID,
    displayName: INVITATIONFAQ_DISPLAY_NAME,
    category: INVITATIONFAQ_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: INVITATIONFAQ_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'invitationfaq'],
    component: InvitationFAQ,
    schema: invitationfaqSchema,
    defaultProps: defaultInvitationFAQProps,
    defaultActions: defaultInvitationFAQActions,
    generator: generateInvitationFAQInstance,
  });

  registerSection({
    id: RSVP_COMPONENT_ID,
    componentId: RSVP_COMPONENT_ID,
    name: RSVP_COMPONENT_ID,
    displayName: RSVP_DISPLAY_NAME,
    category: RSVP_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: RSVP_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'rsvp'],
    component: RSVP,
    schema: rsvpSchema,
    defaultProps: defaultRSVPProps,
    defaultActions: defaultRSVPActions,
    generator: generateRSVPInstance,
  });

  registerSection({
    id: GIFTREGISTRY_COMPONENT_ID,
    componentId: GIFTREGISTRY_COMPONENT_ID,
    name: GIFTREGISTRY_COMPONENT_ID,
    displayName: GIFTREGISTRY_DISPLAY_NAME,
    category: GIFTREGISTRY_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: GIFTREGISTRY_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'giftregistry'],
    component: GiftRegistry,
    schema: giftregistrySchema,
    defaultProps: defaultGiftRegistryProps,
    defaultActions: defaultGiftRegistryActions,
    generator: generateGiftRegistryInstance,
  });

  registerSection({
    id: CONTACTQUESTIONS_COMPONENT_ID,
    componentId: CONTACTQUESTIONS_COMPONENT_ID,
    name: CONTACTQUESTIONS_COMPONENT_ID,
    displayName: CONTACTQUESTIONS_DISPLAY_NAME,
    category: CONTACTQUESTIONS_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: CONTACTQUESTIONS_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'contactquestions'],
    component: ContactQuestions,
    schema: contactquestionsSchema,
    defaultProps: defaultContactQuestionsProps,
    defaultActions: defaultContactQuestionsActions,
    generator: generateContactQuestionsInstance,
  });

  registerSection({
    id: EVENTPOLICIES_COMPONENT_ID,
    componentId: EVENTPOLICIES_COMPONENT_ID,
    name: EVENTPOLICIES_COMPONENT_ID,
    displayName: EVENTPOLICIES_DISPLAY_NAME,
    category: EVENTPOLICIES_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: EVENTPOLICIES_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'eventpolicies'],
    component: EventPolicies,
    schema: eventpoliciesSchema,
    defaultProps: defaultEventPoliciesProps,
    defaultActions: defaultEventPoliciesActions,
    generator: generateEventPoliciesInstance,
  });

  registerSection({
    id: THANKYOUCLOSING_COMPONENT_ID,
    componentId: THANKYOUCLOSING_COMPONENT_ID,
    name: THANKYOUCLOSING_COMPONENT_ID,
    displayName: THANKYOUCLOSING_DISPLAY_NAME,
    category: THANKYOUCLOSING_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: THANKYOUCLOSING_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'thankyouclosing'],
    component: ThankYouClosing,
    schema: thankyouclosingSchema,
    defaultProps: defaultThankYouClosingProps,
    defaultActions: defaultThankYouClosingActions,
    generator: generateThankYouClosingInstance,
  });

  registerSection({
    id: INVITATIONFOOTER_COMPONENT_ID,
    componentId: INVITATIONFOOTER_COMPONENT_ID,
    name: INVITATIONFOOTER_COMPONENT_ID,
    displayName: INVITATIONFOOTER_DISPLAY_NAME,
    category: INVITATIONFOOTER_CATEGORY as any, // category: [COMPONENT]_CATEGORY,
    description: INVITATIONFOOTER_DESCRIPTION,
    version: '1.0.0',
    tags: ['invitation', 'invitationfooter'],
    component: InvitationFooter,
    schema: invitationfooterSchema,
    defaultProps: defaultInvitationFooterProps,
    defaultActions: defaultInvitationFooterActions,
    generator: generateInvitationFooterInstance,
  });

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
    defaultActions: defaultFooterActions,
    generator: generateFooterInstance,
  });
}

// Automatically initialize default registry
initializeSectionRegistry();

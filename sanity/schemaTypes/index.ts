import { type SchemaTypeDefinition } from 'sanity';

import { planStep } from './objects/planStep';
import { seo } from './objects/seo';
import { blockContent } from './objects/blockContent';
import { testimonial } from './objects/testimonial';
import { statHighlight } from './objects/statHighlight';
import { service } from './documents/service';
import { city } from './documents/city';
import { serviceCity } from './documents/serviceCity';
import { project } from './documents/project';
import { market } from './documents/market';
import { post } from './documents/post';
import { teamMember } from './documents/teamMember';
import { landingPage } from './documents/landingPage';
import { tradePartnerService } from './documents/tradePartnerService';
import { sitewideSettings } from './documents/sitewideSettings';
import { homepage } from './documents/homepage';

export const schemaTypes: SchemaTypeDefinition[] = [
  // objects
  planStep,
  seo,
  blockContent,
  testimonial,
  statHighlight,
  // documents
  sitewideSettings,
  homepage,
  service,
  city,
  serviceCity,
  project,
  market,
  post,
  teamMember,
  landingPage,
  tradePartnerService,
];

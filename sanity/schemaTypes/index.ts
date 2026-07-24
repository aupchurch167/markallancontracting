import { type SchemaTypeDefinition } from 'sanity';

import { planStep } from './objects/planStep';
import { seo } from './objects/seo';
import { service } from './documents/service';
import { city } from './documents/city';
import { serviceCity } from './documents/serviceCity';
import { project } from './documents/project';
import { market } from './documents/market';
import { post } from './documents/post';
import { landingPage } from './documents/landingPage';
import { tradePartnerService } from './documents/tradePartnerService';
import { sitewideSettings } from './documents/sitewideSettings';

export const schemaTypes: SchemaTypeDefinition[] = [
  // objects
  planStep,
  seo,
  // documents
  sitewideSettings,
  service,
  city,
  serviceCity,
  project,
  market,
  post,
  landingPage,
  tradePartnerService,
];

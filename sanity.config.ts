'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemaTypes';
import { apiVersion, dataset, projectId } from './sanity/env';

/**
 * Embedded Studio config, mounted at /studio. projectId is empty until the
 * Sanity project is provisioned (open item) — the Studio route guards on that.
 *
 * The desk is organized into task-oriented groups (Blog, Projects, Team,
 * Markets, Locations, Campaign) rather than a flat type list.
 */
export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('⚙ Sitewide Settings')
              .child(
                S.document()
                  .schemaType('sitewideSettings')
                  .documentId('sitewideSettings'),
              ),
            S.divider(),

            S.listItem()
              .title('Blog')
              .child(
                S.list()
                  .title('Blog')
                  .items([
                    S.documentTypeListItem('post').title('Posts'),
                    S.documentTypeListItem('teamMember').title('Team / Authors'),
                  ]),
              ),
            S.documentTypeListItem('project').title('Projects'),
            S.documentTypeListItem('teamMember').title('Team'),

            S.divider(),

            S.listItem()
              .title('Services & Types')
              .child(
                S.list()
                  .title('Services & Types')
                  .items([
                    S.documentTypeListItem('service').title('Project Types'),
                    S.documentTypeListItem('market').title('Markets (Who We Work For)'),
                  ]),
              ),
            S.listItem()
              .title('Locations & Matrix')
              .child(
                S.list()
                  .title('Locations & Matrix')
                  .items([
                    S.documentTypeListItem('city').title('Cities'),
                    S.documentTypeListItem('serviceCity').title('Service × City pages'),
                  ]),
              ),

            S.divider(),

            S.documentTypeListItem('landingPage').title('Campaign Landing Pages'),
            S.documentTypeListItem('tradePartnerService').title('Trade Partners (gated)'),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});

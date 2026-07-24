'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemaTypes';
import { apiVersion, dataset, projectId } from './sanity/env';

/**
 * Embedded Studio config, mounted at /studio. projectId is empty until the
 * Sanity project is provisioned (open item) — the Studio route guards on that.
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
              .title('Sitewide Settings')
              .child(
                S.document()
                  .schemaType('sitewideSettings')
                  .documentId('sitewideSettings'),
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== 'sitewideSettings',
            ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});

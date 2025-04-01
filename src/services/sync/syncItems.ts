/*
 * Contains the logic for syncing items with Webflow.
 *
 * Purpose: Encapsulates the syncing logic to keep it separate from other parts of the app.
 * What to Add: Functions for comparing existing and new items, and calling Webflow operations to sync them.
 * Why It's Here: Provides a dedicated place for handling the syncing process.
 */

import { Effect } from 'effect';
import { fetchExisting } from '../webflow/fetch';
import {
  createItemWithRetry,
  updateItemWithRetry,
} from '../webflow/operations';
import { RecordsSchema } from '../webflow/types';
import { SyncResult } from './types';

export const syncWebflowItems = (
  collectionId: string,
  newItems: RecordsSchema[]
) =>
  Effect.gen(function* (_) {
    // Fetch all existing records
    const existingItems = yield* _(fetchExisting(collectionId));

    // Create a map of existing items by custom-id for faster lookup
    const existingItemsMap = new Map(
      existingItems
        .filter((item) => item.fieldData['customid']) // Filter out items without custom-id
        .map((item) => [item.fieldData['customid'], item])
    );

    const result: SyncResult = {
      itemIds: [],
      created: 0,
      updated: 0,
      errors: [],
    };

    // Map and compare records
    for (const newItem of newItems) {
      const existingItem = existingItemsMap.get(newItem['customid']);

      try {
        if (!existingItem) {
          // Create if doesn't exist
          const created = yield* _(createItemWithRetry(collectionId, newItem));
          if (created && created.id) {
            result.itemIds.push(created.id);
            result.created++;
          } else {
            result.errors.push({
              customId: newItem['customid'],
              while: 'creating',
            });
          }
        } else if (existingItem.id) {
          // Update if exists
          const updated = yield* _(
            updateItemWithRetry(collectionId, existingItem.id, newItem)
          );
          if (updated) {
            result.itemIds.push(existingItem.id);
            result.updated++;
          } else {
            result.errors.push({
              customId: newItem['customid'],
              while: 'updating',
            });
          }
        }
      } catch (error) {
        console.error(
          `Error processing item with custom-id ${newItem['customid']}:`,
          error
        );
      }
    }

    return result;
  });

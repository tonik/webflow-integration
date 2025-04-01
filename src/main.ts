/*
 * Main entry point of the application.
 *
 * Purpose: Provides a single starting point for the application.
 * What to Add: High-level application logic, such as initializing services and running the main program.
 * Why It's Here: Acts as the central hub for orchestrating the app's functionality.
 */

import '../config/environment';

import { Effect } from 'effect';

import { newTransformedItems } from './constants/items';
import { syncWebflowItems } from './services/sync/syncItems';

const main = async () => {
  try {
    const collectionId = process.env.COLLECTION_ID ?? null;
    if (!collectionId) throw new Error('Collection ID is required');

    const result = await Effect.runPromise(
      syncWebflowItems(collectionId, newTransformedItems)
    );

    console.log(`Sync completed:
      Created: ${result.created}
      Updated: ${result.updated}
      Errors: ${result.errors.length} => ${JSON.stringify(
      result.errors,
      null,
      2
    )}
      Total IDs collected: ${result.itemIds.length}
    `);

    return result;
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
};

void main();

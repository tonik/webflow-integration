/*
 * Main entry point of the application.
 *
 * Purpose: Provides a single starting point for the application.
 * What to Add: High-level application logic, such as initializing services and running the main program.
 * Why It's Here: Acts as the central hub for orchestrating the app's functionality.
 */

import '../config/environment';

import { Effect } from 'effect';

import { collectionId } from './constants/collection';
import { newTransformedItems } from './constants/items';
import { syncWebflowItems } from './services/sync/syncItems';
import { SyncResult } from './services/sync/types';

const main = async () => {
  try {
    const program = syncWebflowItems(collectionId, newTransformedItems);

    const result: SyncResult = await Effect.runPromise(program);

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

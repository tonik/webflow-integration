/*
 * Contains logic for fetching data from Webflow.
 *
 * Purpose: Separates fetching logic from other Webflow operations for better modularity.
 * What to Add: Functions for retrieving existing items, collections, or other data from Webflow.
 * Why It's Here: Provides a dedicated place for handling data retrieval from Webflow.
 */

import { Effect, Schedule } from 'effect';
import { WebflowError } from 'webflow-api';
import { TooManyRequestsError } from 'webflow-api/api';
import { webflow } from './client';
import { WebflowCollectionItem } from './types';

const handleFetchError = Effect.catchAll(
  (error: WebflowError) =>
    error instanceof TooManyRequestsError
      ? Effect.fail(error) // Let this error be caught by retry
      : Effect.sync(() => {
          console.error('Webflow operation failed:', error); // Log the error details
          throw new Error(`Webflow operation failed: ${error.message}`); // Throw the error with more context
        }) // Throw other errors instead of continuing
);

export const fetchExisting = (collectionId: string) => {
  // Function to fetch a single page with error handling and retry
  const fetchPage = (offset: number) =>
    Effect.tryPromise(() =>
      webflow.collections.items.listItems(collectionId, {
        limit: 100,
        offset,
      })
    ).pipe(
      handleFetchError,
      Effect.retry(
        Schedule.exponential('10 seconds').pipe(
          Schedule.compose(Schedule.recurs(10))
        )
      )
    );

  // Function to process items
  const processItems = (items: WebflowCollectionItem[]) =>
    Effect.try(() =>
      items.map((i) => ({
        ...i,
        fieldData: i.fieldData,
      }))
    );

  // Initial fetch to get total count
  return fetchPage(0).pipe(
    Effect.flatMap((firstResponse) => {
      if (!firstResponse) return Effect.succeed([]); // Handle null response from error

      const buffer: WebflowCollectionItem[] = [];
      const maxItems = firstResponse.pagination?.total ?? 0;
      // Process first page
      return processItems(firstResponse.items as WebflowCollectionItem[]).pipe(
        Effect.flatMap((firstPageItems) => {
          buffer.push(...firstPageItems);

          // Create array of remaining page fetches
          const remainingFetches = [];
          for (let offset = 100; offset < maxItems; offset += 100) {
            remainingFetches.push(
              fetchPage(offset).pipe(
                Effect.flatMap((response) => {
                  if (!response) return Effect.succeed([]); // Handle null response from error
                  return processItems(
                    response.items as WebflowCollectionItem[]
                  );
                })
              )
            );
          }

          // Run all remaining fetches
          return Effect.forEach(remainingFetches, (effect) => effect, {
            concurrency: 1,
          }).pipe(
            Effect.map((remainingItems) => {
              remainingItems.forEach((items) => buffer.push(...items));
              return buffer;
            })
          );
        })
      );
    })
  );
};

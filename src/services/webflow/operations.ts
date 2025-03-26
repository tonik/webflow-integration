/*
 * Handles Webflow operations like creating, updating, and publishing items.
 *
 * Purpose: Groups all Webflow-related operations in one place for better organization.
 * What to Add: Functions for performing Webflow API operations with retry logic.
 * Why It's Here: Provides a centralized place for managing Webflow operations.
 */

import { Effect, Schedule } from 'effect';
import { Webflow, WebflowError } from 'webflow-api';
import { TooManyRequestsError } from 'webflow-api/api';
import { webflow } from './client';

// Common error handling helper
const handleWebflowError = Effect.catchAll((error: WebflowError) =>
  error instanceof TooManyRequestsError
    ? Effect.fail(error) // Let this error be caught by retry
    : Effect.sync(() => {
        console.error('Webflow operation failed:', error);
        return null; // Allow other operations to continue
      })
);

// Update operation
const updateWebflowItem = (
  collectionId: string,
  itemId: string,
  data: Webflow.CollectionItemFieldData
) =>
  Effect.tryPromise(() =>
    webflow.collections.items.updateItem(collectionId, itemId, {
      id: itemId,
      fieldData: data,
    })
  ).pipe(handleWebflowError);

export const updateItemWithRetry = (
  collectionId: string,
  itemId: string,
  data: Webflow.CollectionItemFieldData
) =>
  updateWebflowItem(collectionId, itemId, data).pipe(
    Effect.retry(
      Schedule.exponential('10 seconds').pipe(
        Schedule.compose(Schedule.recurs(10))
      )
    )
  );

// Create operation
const createWebflowItem = (
  collectionId: string,
  data: Webflow.CollectionItemFieldData
) =>
  Effect.tryPromise(
    async () =>
      await webflow.collections.items.createItem(collectionId, {
        fieldData: data,
        id: '',
      })
  ).pipe(handleWebflowError);

export const createItemWithRetry = (
  collectionId: string,
  data: Webflow.CollectionItemFieldData
) =>
  createWebflowItem(collectionId, data).pipe(
    Effect.retry(
      Schedule.exponential('10 seconds').pipe(
        Schedule.compose(Schedule.recurs(10))
      )
    )
  );

// Publish operation
const publishWebflowItem = (collectionId: string, itemId: string[]) =>
  Effect.tryPromise(() =>
    webflow.collections.items.publishItem(collectionId, { itemIds: itemId })
  ).pipe(handleWebflowError);

export const publishItemWithRetry = (collectionId: string, itemId: string[]) =>
  publishWebflowItem(collectionId, itemId).pipe(
    Effect.retry(
      Schedule.exponential('10 seconds').pipe(
        Schedule.compose(Schedule.recurs(10))
      )
    )
  );

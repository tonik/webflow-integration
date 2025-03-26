/*
 * Defines types related to syncing logic.
 *
 * Purpose: Provides type safety and clarity when working with syncing logic.
 * What to Add: Add interfaces or type definitions for syncing inputs, outputs, and errors.
 * Why It's Here: Ensures consistent and clear typing for syncing-related data.
 */

import { WebflowCollectionItem } from '../webflow/types';

export interface SinkInput<TNewData extends { customid: string }> {
  existing: WebflowCollectionItem[];
  newData: TNewData[];
}

export interface SyncResult {
  itemIds: string[];
  created: number;
  updated: number;
  errors: { customId: string; while: 'creating' | 'updating' }[];
}

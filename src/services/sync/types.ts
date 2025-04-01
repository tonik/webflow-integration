/*
 * Defines types related to syncing logic.
 *
 * Purpose: Provides type safety and clarity when working with syncing logic.
 * What to Add: Add interfaces or type definitions for syncing inputs, outputs, and errors.
 * Why It's Here: Ensures consistent and clear typing for syncing-related data.
 */

export interface SyncResult {
  itemIds: string[];
  created: number;
  updated: number;
  errors: { customId: string; while: 'creating' | 'updating' }[];
}

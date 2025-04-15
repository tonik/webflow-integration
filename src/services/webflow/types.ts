/*
 * Defines types related to the Webflow API.
 *
 * Purpose: Provides type safety and clarity when working with Webflow data.
 * What to Add: Add interfaces or type definitions for Webflow-specific data structures.
 * Why It's Here: Ensures consistent and clear typing for Webflow-related data.
 */

import { CollectionItem } from 'webflow-api/api';

export interface WebflowCollectionItem extends CollectionItem {
  fieldData: CollectionItem['fieldData'] & { customid: string };
}

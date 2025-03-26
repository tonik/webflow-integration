/*
 * Initializes and exports the Webflow API client.
 *
 * Purpose: Centralizes Webflow client initialization for reuse across the app.
 * What to Add: Logic for setting up the Webflow client, including authentication.
 * Why It's Here: Ensures consistent and reusable access to the Webflow API.
 */

import { WebflowClient } from 'webflow-api';

export const webflow = new WebflowClient({
  accessToken: process.env.WEBFLOW_API_KEY ?? '',
});

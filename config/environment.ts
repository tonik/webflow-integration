/*
 * Handles environment variable setup using dotenv.
 *
 * Purpose: Centralizes environment configuration to ensure the app has access to required variables.
 * What to Add: Logic for loading and validating environment variables.
 * Why It's Here: Keeps sensitive data out of the source code and allows easy configuration for different environments.
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

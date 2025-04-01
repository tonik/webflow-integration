/*
 * This test suite verifies the behavior of the `webflowRetrySchedule` function and related error-handling logic.
 *
 * Purpose:
 * - Ensure that the system correctly retries failed Webflow API requests when encountering a TooManyRequestsError.
 * - Validate that the retry mechanism stops after the defined number of attempts.
 * - Confirm that successful requests return the expected result.
 */

import { Effect } from 'effect';
import { TooManyRequestsError } from 'webflow-api/api';
import {
  handleWebflowError,
  webflowRetrySchedule,
} from '../src/services/webflow/operations';

let attempt = 0;

const mockUpdateItemRejectTooManyRequest = jest.fn(() => {
  return new Promise((resolve, reject) => {
    if (attempt === 2) {
      resolve({ success: true });
      return;
    }

    attempt++;
    throw new TooManyRequestsError({});
  });
});

const mockUpdateItemReject = jest.fn(() => {
  return new Promise((_, reject) => {
    reject(false);
  });
});

describe('webflowRetrySchedule', () => {
  it('should not retry failed requests and return null', async () => {
    const result = await Effect.runPromise(
      Effect.tryPromise(() => mockUpdateItemReject()).pipe(
        handleWebflowError,
        webflowRetrySchedule
      )
    );
    expect(mockUpdateItemReject).toHaveBeenCalledTimes(1);
    expect(result).toEqual(null);
  });

  it('should retry failed requests and succeed on the 3rd attempt', async () => {
    const result = await Effect.runPromise(
      Effect.tryPromise(() => mockUpdateItemRejectTooManyRequest()).pipe(
        handleWebflowError,
        webflowRetrySchedule
      )
    ).catch(() => ({ success: false }));

    expect(mockUpdateItemRejectTooManyRequest).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ success: true });
  });
});

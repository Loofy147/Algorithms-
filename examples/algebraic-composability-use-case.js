import { z } from 'zod';
import { ComposableOperation, composeWithTransaction } from '../src/algebraic-composability/ComposableOperation.js';
import { logger } from '../src/logger.js';
import { TransactionError } from '../src/errors.js';

/**
 * Use Case: Production-Ready Financial Transaction Saga
 *
 * This example demonstrates a more realistic, production-ready implementation
 * of the Saga pattern for a multi-step financial transaction.
 *
 * Key professional practices demonstrated:
 * 1. Asynchronous Operations: All steps simulate async work (e.g., API calls).
 * 2. Idempotency: Rollback operations are designed to be idempotent. For example,
 *    refunding a user checks if the refund has already been applied.
 * 3. Structured Logging: The saga logs key state transitions for observability.
 * 4. Custom Error Handling: The main process catches specific `TransactionError`
 *    types to reliably determine the final state of the system.
 */
async function productionSaga() {
  logger.info('--- Production-Ready Saga Use Case ---');

  // --- Mock Database & Services ---
  const accounts = { 'user:1': { balance: 1000, refundedTransactions: new Set() } };
  const hotelBookings = { 'hotel:A': { confirmed: new Set() } };
  logger.info({ initialState: { accounts, hotelBookings } }, 'System state initialized');

  // --- Helper for simulating async API calls ---
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // --- Operation Definitions ---

  const DebitUser = new ComposableOperation(
    'DebitUser',
    async (input) => {
      await delay(50); // Simulate network latency
      logger.info({ userId: input.userId, amount: input.amount }, 'Processing debit');
      if (accounts[input.userId].balance < input.amount) {
        throw new Error('Insufficient funds');
      }
      accounts[input.userId].balance -= input.amount;
      return { ...input, debitTxId: `deb-${Date.now()}` };
    },
    z.object({ userId: z.string(), amount: z.number().positive(), txId: z.string() }),
    z.object({ debitTxId: z.string() }).passthrough(),
    async (output, input) => {
      // Idempotent Rollback: Only refund if this txId hasn't been refunded before.
      if (!accounts[input.userId].refundedTransactions.has(input.txId)) {
        logger.warn({ userId: input.userId, amount: input.amount }, 'Rolling back debit (refunding user)');
        await delay(50);
        accounts[input.userId].balance += input.amount;
        accounts[input.userId].refundedTransactions.add(input.txId);
      } else {
        logger.info({ userId: input.userId }, 'Debit rollback already processed, skipping.');
      }
    }
  );

  const BookHotel = new ComposableOperation(
    'BookHotel',
    async (input) => {
      logger.info({ hotelId: input.hotelId, txId: input.txId }, 'Booking hotel');
      await delay(100);
      if (input.hotelId === 'hotel:B') {
        throw new Error('Hotel booking system is offline');
      }
      hotelBookings[input.hotelId].confirmed.add(input.txId);
      return { ...input, bookingConfirmation: `conf-${Date.now()}` };
    },
    z.object({ hotelId: z.string(), txId: z.string() }).passthrough(),
    z.object({ bookingConfirmation: z.string() }).passthrough(),
    async (output, input) => {
      logger.warn({ hotelId: input.hotelId, txId: input.txId }, 'Rolling back hotel booking (canceling)');
      await delay(50);
      hotelBookings[input.hotelId].confirmed.delete(input.txId);
    }
  );

  const tripBookingSaga = composeWithTransaction(DebitUser, BookHotel);

  // --- Scenario: Failed Transaction with Professional Handling ---
  logger.info('--- Running Scenario: Failed Booking with Rollback ---');
  const transactionId = `tx-${Date.now()}`;
  try {
    const failedInput = { userId: 'user:1', hotelId: 'hotel:B', amount: 300, txId: transactionId };
    await tripBookingSaga(failedInput);
  } catch (e) {
    if (e instanceof TransactionError) {
      logger.fatal({ finalState: { accounts, hotelBookings }, cause: e.cause }, 'Saga failed and rollback failed. Manual intervention required.');
    } else {
      logger.info({ finalState: { accounts, hotelBookings } }, 'Saga failed but was successfully rolled back.');
    }
  }
}

productionSaga();

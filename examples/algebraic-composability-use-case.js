import { z } from 'zod';
import { ComposableOperation, composeWithTransaction } from '../src/algebraic-composability/ComposableOperation.js';

/**
 * Use Case: Financial Transaction Saga
 *
 * In a distributed system, performing a multi-step financial transaction (like
 * booking a trip) requires atomicity. If one step fails, all previous steps
 * must be rolled back. This is often implemented using a "Saga" pattern.
 *
 * Algebraic composability allows us to define each step of the transaction
 * as a `ComposableOperation` with a defined schema and a `rollback` function.
 * The `composeWithTransaction` function then acts as the Saga orchestrator,
 * ensuring that the entire operation is either fully completed or fully rolled back.
 */
function financialTransactionSaga() {
  console.log('--- Algebraic Composability Use Case: Financial Transaction Saga ---');

  // --- Mock Database ---
  const accounts = { 'user:1': { balance: 1000 }, 'hotel:A': { balance: 5000 } };
  const bookings = {};
  console.log('Initial State:', { accounts, bookings });

  // --- Operation Definitions ---

  const DebitUser = new ComposableOperation(
    'DebitUser',
    (input) => {
      accounts[input.userId].balance -= input.amount;
      return { ...input, debitSuccess: true };
    },
    z.object({ userId: z.string(), amount: z.number() }),
    z.object({ userId: z.string(), amount: z.number(), debitSuccess: z.boolean() }),
    (output, input) => {
      console.log(`ROLLBACK: Reverting debit for ${input.userId}`);
      accounts[input.userId].balance += input.amount;
    }
  );

  const CreditHotel = new ComposableOperation(
    'CreditHotel',
    (input) => {
      // Simulate a failure
      if (input.hotelId === 'hotel:B') {
        throw new Error('Hotel booking system offline');
      }
      accounts[input.hotelId].balance += input.amount;
      return { ...input, creditSuccess: true };
    },
    z.object({ hotelId: z.string(), amount: z.number() }).passthrough(),
    z.object({ creditSuccess: z.boolean() }).passthrough(),
    (output, input) => {
      console.log(`ROLLBACK: Reverting credit for ${input.hotelId}`);
      accounts[input.hotelId].balance -= input.amount;
    }
  );

  const CreateBooking = new ComposableOperation(
    'CreateBooking',
    (input) => {
        bookings[input.bookingId] = { userId: input.userId, hotelId: input.hotelId, status: 'CONFIRMED' };
        return { ...input, bookingSuccess: true };
    },
    z.object({ bookingId: z.string(), userId: z.string(), hotelId: z.string() }).passthrough(),
    z.object({ bookingSuccess: z.boolean() }).passthrough(),
    (output, input) => {
        console.log(`ROLLBACK: Deleting booking ${input.bookingId}`);
        delete bookings[input.bookingId];
    }
  );

  const tripBookingSaga = composeWithTransaction(DebitUser, CreditHotel, CreateBooking);

  // --- Scenario 1: Successful Transaction ---
  console.log('\n--- Running Scenario 1: Successful Booking ---');
  try {
    const successfulInput = { userId: 'user:1', hotelId: 'hotel:A', amount: 200, bookingId: 'booking:xyz' };
    tripBookingSaga(successfulInput);
    console.log('Final State (Success):', { accounts, bookings });
  } catch (e) {
    console.error('Scenario 1 failed unexpectedly:', e.message);
  }

  // --- Scenario 2: Failed Transaction with Rollback ---
  console.log('\n--- Running Scenario 2: Failed Booking (hotel offline) ---');
  try {
    const failedInput = { userId: 'user:1', hotelId: 'hotel:B', amount: 300, bookingId: 'booking:abc' };
    tripBookingSaga(failedInput);
  } catch (e) {
    console.error('Scenario 2 caught expected error:', e.message);
    console.log('Final State (After Rollback):', { accounts, bookings });
  }

  console.log('\nConclusion: The transactional composition ensured that the failed booking was fully rolled back, leaving the system in a consistent state.');
}

financialTransactionSaga();

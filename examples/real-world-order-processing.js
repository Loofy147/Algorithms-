/**
 * Real-World Example: E-Commerce Order Processing Saga
 *
 * Problem: Processing an e-commerce order involves multiple steps that must all
 * succeed or fail together. For example:
 *   1. Charge the customer's credit card.
 *   2. Update the product inventory.
 *   3. Send a confirmation email.
 *
 * If any of these steps fail (e.g., the email service is down), the entire
 * transaction must be rolled back to leave the system in a consistent state. You
 * cannot leave the customer charged for an order they never received a
 * confirmation for. A simple try/catch block is not enough to handle complex
 * rollback logic (e.g., refunding a credit card).
 *
 * Solution: The Saga pattern, implemented here with `composeWithTransaction`,
 * orchestrates this workflow. Each step is an operation with a corresponding
 * "compensating action" (rollback). If any operation fails, the framework
 * automatically executes the compensating actions for all previously completed
 * operations in reverse order.
 */

import { ComposableOperation, composeWithTransaction } from '../src/algebraic-composability/ComposableOperation.js';
import { z } from 'zod';

// --- Define the initial state of our system ---
const initialState = {
  customer: { id: 'cust_123', balance: 150 },
  product: { id: 'prod_abc', inventory: 10 },
  order: { id: null, status: 'pending' },
  emailSent: false,
};

const stateSchema = z.object({
    customer: z.object({ id: z.string(), balance: z.number() }),
    product: z.object({ id: z.string(), inventory: z.number() }),
    order: z.object({ id: z.string().nullable(), status: z.string() }),
    emailSent: z.boolean(),
});

const ORDER_COST = 50;

// --- 1. Define each step as a ComposableOperation ---

// Step 1: Charge the credit card
const chargeCard = new ComposableOperation(
  'chargeCard',
  (state) => {
    console.log(`[Step 1] Charging customer ${state.customer.id} for $${ORDER_COST}...`);
    if (state.customer.balance < ORDER_COST) {
      throw new Error('Insufficient funds');
    }
    return { ...state, customer: { ...state.customer, balance: state.customer.balance - ORDER_COST } };
  },
  stateSchema,
  stateSchema,
  // Compensating Action: Refund the customer
  (outputState, originalInputState) => {
    console.log(`[ROLLBACK 1] Refunding customer ${originalInputState.customer.id}...`);
    return { ...outputState, customer: originalInputState.customer };
  }
);

// Step 2: Update inventory
const updateInventory = new ComposableOperation(
  'updateInventory',
  (state) => {
    console.log(`[Step 2] Updating inventory for product ${state.product.id}...`);
    if (state.product.inventory <= 0) {
      throw new Error('Out of stock');
    }
    return { ...state, product: { ...state.product, inventory: state.product.inventory - 1 } };
  },
  stateSchema,
  stateSchema,
  // Compensating Action: Restore inventory
  (outputState, originalInputState) => {
    console.log(`[ROLLBACK 2] Restoring inventory for product ${originalInputState.product.id}...`);
    return { ...outputState, product: originalInputState.product };
  }
);

// Step 3: Send confirmation email (this one will fail)
const sendConfirmationEmail = new ComposableOperation(
  'sendConfirmationEmail',
  (state) => {
    console.log('[Step 3] Sending confirmation email...');
    // Simulate a failure in the email service
    throw new Error('Email service is down');
    // Unreachable code:
    // return { ...state, emailSent: true };
  },
  stateSchema,
  stateSchema,
  // Compensating Action: None needed, as the action never completed
  () => {
    console.log('[ROLLBACK 3] No action needed for failed email.');
  }
);


// --- 2. Compose the operations into a single transaction ---
const processOrder = composeWithTransaction(
  chargeCard,
  updateInventory,
  sendConfirmationEmail
);

// --- 3. Execute the transaction and observe the rollback ---
async function run() {
  console.log('--- Attempting to process an order ---');
  console.log('Initial State:', initialState);
  console.log('\nStarting transaction...');

  try {
    await processOrder(initialState);
  } catch (error) {
    console.error(`\nTransaction failed as expected: ${error.message}`);
    // The state object passed to the transaction is not mutated directly,
    // but the compensating actions modify a new state object that is
    // returned inside the TransactionError. We can inspect it here.
    const finalState = error.finalState;
    console.log('\n--- Rollback complete ---');
    console.log('Final State:', finalState);

    if (JSON.stringify(initialState) === JSON.stringify(finalState)) {
      console.log('\n✅ System state has been successfully restored to its original condition.');
    } else {
      console.log('\n❌ System state is inconsistent!');
    }
  }
}

run();

import { logger } from '../logger.js';

/**
 * IncrementalView demonstrates the "Database: IVM & Stream Processing" pattern
 * from docs/PRECOMPUTATION_LOGIC.json.
 *
 * Instead of re-calculating results from scratch (O(N)), it maintains a stateful
 * projection by applying small delta updates (O(1)) as events arrive.
 */
export default class IncrementalView {
  /**
   * @param {any} initialState - The starting state of the view.
   * @param {function} reducer - A function (state, event) => newState.
   */
  constructor(initialState = {}, reducer) {
    this.state = initialState;
    this.reducer = reducer;
    this.eventCount = 0;
  }

  /**
   * Applies an event to the view and updates the state.
   * @param {object} event - The event to process.
   */
  onEvent(event) {
    this.eventCount++;
    try {
      const newState = this.reducer(this.state, event);
      this.state = newState;
      logger.debug({ eventType: event.type, eventCount: this.eventCount }, 'IncrementalView updated');
    } catch (error) {
      logger.error({ error, event }, 'IncrementalView failed to process event');
    }
  }

  /**
   * Returns a snapshot of the current pre-computed state.
   */
  getSnapshot() {
    return this.state;
  }

  /**
   * Resets the view to initial state.
   */
  reset(initialState = {}) {
    this.state = initialState;
    this.eventCount = 0;
  }
}

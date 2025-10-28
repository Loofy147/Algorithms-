/**
 * @file SimulatedCarbonIntensityAPI.js
 * @description A simulated carbon intensity API that provides a time-series of carbon intensity data.
 */

/**
 * A class that provides a simulated time-series of carbon intensity data.
 * The data is generated using a sine wave to simulate the daily fluctuations in carbon intensity.
 */
export class SimulatedCarbonIntensityAPI {
  /**
   * @param {string} region - The region for which to provide carbon intensity data.
   */
  constructor(region) {
    this.region = region;
  }

  /**
   * Returns the carbon intensity for the current time.
   * @returns {number} The carbon intensity in gCO2eq/kWh.
   */
  getCarbonIntensity() {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    // A simple sine wave to simulate daily fluctuations in carbon intensity.
    // The intensity is lowest at midday and highest at midnight.
    const intensity = 100 * Math.sin((Math.PI / 12) * (hours - 6)) + 300;
    return intensity;
  }
}

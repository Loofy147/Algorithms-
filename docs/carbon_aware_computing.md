# Carbon-Aware Computing

## Theoretical Background

Carbon-Aware Computing is an extension of Resource-Aware Computing that specifically considers the carbon intensity of the electricity used to power computational tasks. The core idea is to "do more when the electricity is greener, and less when it is not." This is achieved by shifting computational tasks in time or location to coincide with periods of low carbon intensity.

Key concepts in Carbon-Aware Computing include:

- **Carbon Intensity**: A measure of the carbon emissions per unit of electricity, typically expressed in grams of carbon dioxide equivalent per kilowatt-hour (gCO2eq/kWh).
- **Time-Shifting**: Delaying or advancing the execution of a computational task to a time when the carbon intensity of the grid is lower.
- **Location-Shifting**: Moving a computational task to a different geographical location where the carbon intensity of the grid is lower.

## Key Research

- **Carbon-aware computing - the white paper - Microsoft Source**: [https://news.microsoft.com/wp-content/uploads/prod/sites/418/2023/01/carbon_aware_computing_whitepaper.pdf](https://news.microsoft.com/wp-content/uploads/prod/sites/418/2023/01/carbon_aware_computing_whitepaper.pdf)
- **A guide to carbon-aware computing | Insights & Sustainability | Climatiq**: [https://www.climatiq.io/blog/a-guide-to-carbon-aware-computing](https://www.climatiq.io/blog/a-guide-to-carbon-aware-computing)
- **Carbon Awareness | Learn Green Software**: [https://learn.greensoftware.foundation/carbon-awareness/](https://learn.greensoftware.foundation/carbon-awareness/)

## Implementation Details

This project will extend the `ResourceAwareScheduler` to include carbon-awareness. This will involve:

- **Simulated Carbon Intensity API**: A new component that will provide a simulated time-series of carbon intensity data for different regions. This will allow the scheduler to make decisions based on the carbon intensity of the grid.
- **Updated Scheduler**: The `ResourceAwareScheduler` will be updated to take carbon intensity into account when making scheduling decisions. It will be able to prioritize tasks during periods of low carbon intensity, and delay or defer tasks during periods of high carbon intensity.

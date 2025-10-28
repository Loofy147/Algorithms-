# Propensity Score Matching

## Theoretical Background

Propensity Score Matching (PSM) is a statistical technique used to estimate the causal effect of a treatment or intervention from observational data. In an observational study, the assignment of subjects to treatment and control groups is not randomized, which can lead to biased estimates of the treatment effect. PSM attempts to correct for this bias by matching subjects in the treatment group with subjects in the control group who have a similar probability of receiving the treatment.

The key steps in Propensity Score Matching are:

1.  **Propensity Score Estimation**: A logistic regression model is used to estimate the probability of each subject receiving the treatment, based on a set of observed covariates. This probability is known as the propensity score.
2.  **Matching**: Subjects in the treatment group are matched with subjects in the control group who have a similar propensity score.
3.  **Treatment Effect Estimation**: The difference in outcomes between the matched treatment and control groups is used to estimate the average treatment effect.

## Key Research

- **Propensity Score Matching: A Gentle Introduction**: [https://www.jmp.com/en_us/statistics-knowledge-portal/effect-of-an-intervention/propensity-score-matching.html](https://www.jmp.com/en_us/statistics-knowledge-portal/effect-of-an-intervention/propensity-score-matching.html)
- **An Introduction to Propensity Score Matching**: [https://www.publichealth.columbia.edu/research/population-health-methods/propensity-score-matching](https://www.publichealth.columbia.edu/research/population-health-methods/propensity-score-matching)
- **Propensity Score Matching in R**: [https://www.r-bloggers.com/2021/08/propensity-score-matching-in-r/](https://www.r-bloggers.com/2021/08/propensity-score-matching-in-r/)

## Implementation Details

This project will add a `PropensityScoreMatcher` to the `causal-reasoning` toolkit. This will involve:

- **`PropensityScoreMatcher`**: A class that will take a dataset, a treatment variable, an outcome variable, and a set of covariates. It will then perform the following steps:
    -   Train a logistic regression model to estimate the propensity scores.
    -   Use a nearest-neighbor algorithm to match treated and control subjects based on their propensity scores.
    -   Calculate the Average Treatment Effect on the Treated (ATT) by comparing the outcomes of the matched groups.

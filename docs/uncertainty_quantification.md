# Uncertainty Quantification

## Theoretical Background

Uncertainty Quantification (UQ) is the science of quantitatively estimating the doubt in a model's prediction. All models are imperfect representations of reality, and UQ provides a framework for understanding and communicating the degree to which a model's output can be trusted.

There are two main types of uncertainty:

1.  **Aleatoric Uncertainty**: This is the inherent randomness or noise in a system. It is irreducible, meaning that even with a perfect model, we cannot eliminate this uncertainty.

2.  **Epistemic Uncertainty**: This is the uncertainty that arises from a lack of knowledge. It can be reduced by collecting more data or by improving the model.

UQ is particularly important in machine learning, where models are often trained on limited data and may be used to make predictions in situations that were not seen during training.

## Key Research

- **Uncover This Tech Term: Uncertainty Quantification for Deep Learning**: [https://pmc.ncbi.nlm.nih.gov/articles/PMC10973738/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10973738/)
- **Uncertainty Quantification | IBM**: [https://www.ibm.com/think/topics/uncertainty-quantification](https://www.ibm.com/think/topics/uncertainty-quantification)
- **Uncertainty Quantification of Machine Learning Model Performance via Anomaly-Based Dataset Dissimilarity Measures**: [https://www.mdpi.com/2079-9292/13/5/939](https://www.mdpi.com/2079-9292/13/5/939)
- **Uncertainty Quantification for Machine Learning - OSTI**: [https://www.osti.gov/servlets/purl/1733262](https://www.osti.gov/servlets/purl/1733262)

## Implementation Details

This project implements a `ProbabilisticCounter` to demonstrate Uncertainty Quantification. This is a simple counter that tracks a series of boolean outcomes (successes and failures) and provides a confidence interval for the true proportion of successes.

The confidence interval is calculated using the **Wilson score interval**, which is a statistical method for estimating the confidence interval of a binomial proportion. This is a more robust method than simply using a normal approximation, especially when the number of trials is small or the proportion is close to 0 or 1.

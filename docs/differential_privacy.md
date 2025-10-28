# Differential Privacy

## Theoretical Background

Differential Privacy is a mathematically rigorous framework for quantifying the privacy leakage of an algorithm. It provides a strong guarantee that the output of an analysis will not be significantly affected by the presence or absence of any single individual in the dataset. This is achieved by adding a carefully calibrated amount of noise to the results of queries.

The key concepts in Differential Privacy include:

- **Privacy Budget (epsilon)**: A parameter that controls the trade-off between privacy and accuracy. A smaller epsilon provides more privacy but less accuracy, and vice versa.
- **Sensitivity**: A measure of how much the output of a query can change if a single individual's data is changed.
- **Noise Mechanism**: A mechanism for adding noise to the results of a query. A common example is the **Laplace mechanism**, which adds noise drawn from a Laplace distribution.

## Key Research

- **Differential privacy - Wikipedia**: [https://en.wikipedia.org/wiki/Differential_privacy](https://en.wikipedia.org/wiki/Differential_privacy)
- **Differential Privacy for Databases - Now Publishers**: [https://www.nowpublishers.com/article/DownloadSummary/DBS-066](https://www.nowpublishers.com/article/DownloadSummary/DBS-066)
- **Towards Practical Differential Privacy for SQL Queries - VLDB Endowment**: [https://www.vldb.org/pvldb/vol11/p526-johnson.pdf](https://www.vldb.org/pvldb/vol11/p526-johnson.pdf)

## Implementation Details

This project will introduce a `DifferentiallyPrivateQuery` wrapper to the `adversarial-first` toolkit. This will involve:

- **`DifferentiallyPrivateQuery`**: A class that will take a query function, a sensitivity value, and a privacy budget (epsilon). It will then execute the query and add an appropriate amount of noise to the result using the Laplace mechanism. This will allow for the execution of queries against a dataset while preserving the privacy of the individuals within it.

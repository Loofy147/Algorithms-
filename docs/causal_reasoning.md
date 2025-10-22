# Causal Reasoning

## Theoretical Background

Causal Reasoning is the process of identifying and understanding the cause-and-effect relationships in a system. It is a fundamental aspect of human intelligence, and it is becoming increasingly important in artificial intelligence, especially in fields like explainable AI (XAI) and algorithmic fairness.

A key concept in this area is **Simpson's Paradox**. This is a phenomenon in probability and statistics in which a trend appears in several different groups of data but disappears or reverses when these groups are combined. This paradox highlights the importance of identifying and controlling for confounding variables when trying to understand causal relationships.

## Key Research

- **Quantum Causality: Resolving Simpson's Paradox with D⁢O-Calculus**: [https://arxiv.org/html/2509.00744v1](https://arxiv.org/html/2509.00744v1)

## Implementation Details

This project implements a `CausalAnalyzer` to demonstrate Causal Reasoning. This tool can analyze a dataset to detect Simpson's Paradox.

The `CausalAnalyzer` takes a dataset and the names of an independent variable, a dependent variable, and a confounding variable. It then calculates the overall trend between the independent and dependent variables, and also the trends within each subgroup defined by the confounding variable. If the trend within the subgroups is different from the overall trend, it indicates that Simpson's Paradox may be present.

# Transactional Composability

## Theoretical Background

Transactional Composability is a technique for ensuring that a sequence of operations either all succeed or all fail, as a single atomic unit. This is a critical concept in distributed systems, where a single business process may involve multiple services, each with its own database.

A common pattern for implementing transactional composability in distributed systems is the **Saga pattern**. A saga is a sequence of local transactions, where each transaction updates the state of a single service and then triggers the next transaction in the sequence. If a transaction fails, the saga executes a series of compensating transactions to undo the changes made by the preceding transactions.

## Key Research

- **Saga Design Pattern - Azure Architecture Center | Microsoft Learn**: [https://learn.microsoft.com/en-us/azure/architecture/patterns/saga](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga)
- **Saga patterns - AWS Prescriptive Guidance**: [https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga.html](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga.html)
- **Mastering Saga patterns for distributed transactions in microservices - Temporal**: [https://temporal.io/blog/mastering-saga-patterns-for-distributed-transactions-in-microservices](https://temporal.io/blog/mastering-saga-patterns-for-distributed-transactions-in-microservices)

## Implementation Details

This project will enhance the `algebraic-composability` principle by adding transactional capabilities. This will involve:

- **Updated `ComposableOperation`**: The `ComposableOperation` class will be updated to include an optional `rollback` function. This function will be responsible for undoing the effects of the `operation` function.
- **`composeWithTransaction`**: A new utility function that will take a sequence of `ComposableOperation`s and return a new function that represents their composition as a single transaction. If any of the operations in the sequence fail, the `composeWithTransaction` function will automatically call the `rollback` function of any operations that have already completed.

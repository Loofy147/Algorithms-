# Algebraic Composability

## Theoretical Background

Algebraic Composability is a principle of software design that focuses on creating components that can be combined in provably correct ways. The "algebraic" part of the name comes from the fact that these compositions often follow mathematical laws, such as associativity and identity.

This principle is heavily influenced by **Category Theory**, a branch of mathematics that provides a formal framework for describing structures and relationships. In Category Theory, a category consists of objects and morphisms (arrows) between them. In software, objects can be thought of as types, and morphisms as functions.

The key idea is that if we can define the inputs and outputs of our components in a sufficiently rigorous way, we can then reason about the correctness of their composition.

## Key Research

- **A Brief Introduction to Category Theory for Systems and Software Engineers**: [https://www.omg.org/maths/September-2024-Mathsig-Presentation-to-the-AI-PTF.pdf](https://www.omg.org/maths/September-2024-Mathsig-Presentation-to-the-AI-PTF.pdf)
- **An introduction to Category Theory for Software Engineers**: [https://www.cs.toronto.edu/~sme/presentations/cat101.pdf](https://www.cs.toronto.edu/~sme/presentations/cat101.pdf)
- **Industrial Applications of Software Synthesis via Category Theory**: [https://cspages.ucalgary.ca/~robin/class/617/Healy_Barker.pdf](https://cspages.ucalgary.ca/~robin/class/617/Healy_Barker.pdf)

## Implementation Details

This project implements two components to demonstrate Algebraic Composability:

- **`ComposableOperation`**: A class that represents an operation with a defined input and output schema. The schemas are defined using the `zod` library, which allows for rich, declarative validation of data structures.

- **`compose`**: A utility function that takes a sequence of `ComposableOperation`s and returns a new function that represents their composition. The `compose` function checks that the output schema of one operation is compatible with the input schema of the next, ensuring that the composition is valid.

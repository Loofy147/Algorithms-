# Resource-Aware Computing

## Theoretical Background

Resource-Aware Computing is a computational model that considers not just time, but also a wide range of other resources, such as energy, memory, and network bandwidth. The goal is to optimize for a combination of these resources, rather than just one. This is a form of multi-objective optimization, where the aim is to find a set of solutions that represent the best possible trade-offs between the different objectives.

A key concept in this area is **Pareto optimality**. A solution is Pareto optimal if it is impossible to improve one objective without making at least one other objective worse. The set of all Pareto optimal solutions is known as the Pareto frontier.

## Key Research

- **Multi-objective production scheduling optimization strategy based on fuzzy mathematics theory**: [https://pmc.ncbi.nlm.nih.gov/articles/PMC12244544/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12244544/)
- **Multi-Objective Optimization Techniques in Cloud Task Scheduling: A Systematic Literature Review**: [https://www.researchgate.net/publication/388062201_Multi-Objective_Optimization_Techniques_in_Cloud_Task_Scheduling_A_Systematic_Literature_Review](https://www.researchgate.net/publication/388062201_Multi-Objective_Optimization_Techniques_in_Cloud_Task_Scheduling_A_Systematic_Literature_Review)
- **MULTI-OBJECTIVE OPTIMIZATION IN PROJECT SCHEDULING: BALANCING TIME, COST, AND QUALITY**: [https://www.researchgate.net/publication/390212770_MULTI-OBJECTIVE_OPTIMIZATION_IN_PROJECT_SCHEDULING_BALANCING_TIME_COST_AND_QUALITY_IN_MULTI-FAMILY_CONSTRUCTION_Present_methodologies_that_optimize_project_schedules_while_considering_trade-offs_betwe](https://www.researchgate.net/publication/390212770_MULTI-OBJECTIVE_OPTIMIZATION_IN_PROJECT_SCHEDULING_BALANCING_TIME_COST_AND_QUALITY_IN_MULTI-FAMILY_CONSTRUCTION_Present_methodologies_that_optimize_project_schedules_while_considering_trade-offs_betwe)

## Implementation Details

This project implements two components to demonstrate Resource-Aware Computing:

- **`ResourceAwareScheduler`**: A scheduler that takes a set of tasks, each with a defined cost in terms of CPU, energy, memory, and bandwidth. It then uses a greedy algorithm to find a schedule that maximizes the value of the completed tasks while staying within the resource budgets.

- **`DVFSController`**: A controller for Dynamic Voltage and Frequency Scaling (DVFS), a technique used to optimize energy consumption in modern processors. The controller can select the optimal CPU frequency to either meet a deadline with the minimum energy, or to maximize performance within a given energy budget.

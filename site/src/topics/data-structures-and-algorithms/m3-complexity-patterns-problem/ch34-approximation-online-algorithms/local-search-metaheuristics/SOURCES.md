# Sources

## Local search (optimization) (Wikipedia)

URL: https://en.wikipedia.org/wiki/Local_search_(optimization)
Version: fetched 2026-11-05

> In computer science, local search is a heuristic method for solving computationally hard optimization problems.

> Local search algorithms move from solution to solution in the space of candidate solutions (the search space) by applying local changes, until a solution deemed optimal is found or a time bound is elapsed.

> A local search algorithm starts from a candidate solution and then iteratively moves to a neighboring solution

> When no improving neighbors are present, local search is stuck at a locally optimal point.

## 2-opt (Wikipedia)

URL: https://en.wikipedia.org/wiki/2-opt
Version: fetched 2026-11-05

> In optimization, 2-opt is a simple local search algorithm for solving the traveling salesman problem.

> The 2-opt algorithm was first proposed by Croes in 1958,

> the basic move had already been suggested by Flood

> The main idea behind it is to take a route that crosses over itself and reorder it so that it does not.

> Since a 2-opt operation involves removing 2 edges and adding 2 different edges we can subtract and add the distances of only those edges.

## Simulated annealing (Wikipedia)

URL: https://en.wikipedia.org/wiki/Simulated_annealing
Version: fetched 2026-11-05

> In the formulation of the method by Kirkpatrick et al., the acceptance probability function P(e, e', T) was defined as 1 if e' < e, and \exp(-(e'-e)/T) otherwise.

> In the original description of simulated annealing, the probability P(e,enew,T) was equal to 1 when enew<e—i.e., the procedure always moved downhill when it found a way to do so, irrespective of the temperature.

> Kirkpatrick, Gelatt and Vecchi (1983), and Cerny (1985).

> In 1983, this approach was used by Kirkpatrick, Gelatt Jr., and Vecchi

> for a solution of the traveling salesman problem. They also proposed its current name, simulated annealing.

## Genetic algorithm (Wikipedia)

URL: https://en.wikipedia.org/wiki/Genetic_algorithm
Version: fetched 2026-11-05

> A genetic algorithm (GA) is a metaheuristic inspired by the process of natural selection that belongs to the larger class of evolutionary algorithms (EA) in computer science and operations research.

> Genetic algorithms are commonly used to generate high-quality solutions to optimization and search problems via biologically inspired operators such as selection, crossover, and mutation.

> In a genetic algorithm, a population of candidate solutions (called individuals, creatures, organisms, or phenotypes) to an optimization problem is evolved toward better solutions.

> During each successive generation, a portion of the existing population is selected to reproduce for a new generation. Individual solutions are selected through a fitness-based process, where fitter solutions (as measured by a fitness function) are typically more likely to be selected.

> The next step is to generate a second generation population of solutions from those selected, through a combination of genetic operators: crossover (also called recombination), and mutation.

## 61.1. Query Handling as a Complex Optimization Problem (PostgreSQL 18 Documentation)

URL: https://www.postgresql.org/docs/current/geqo-intro.html
Version: fetched 2026-11-05

> Among all relational operators the most difficult one to process and optimize is the join.

> The number of possible query plans grows exponentially with the number of joins in the query.

## 61.2. Genetic Algorithms (PostgreSQL 18 Documentation)

URL: https://www.postgresql.org/docs/current/geqo-intro2.html
Version: fetched 2026-11-05

> The genetic algorithm (GA) is a heuristic optimization method which operates through randomized search.

> The set of possible solutions for the optimization problem is considered as a population of individuals.

> The degree of adaptation of an individual to its environment is specified by its fitness.

> Through simulation of the evolutionary operations recombination, mutation, and selection new generations of search points are found that show a higher average fitness than their ancestors.

## 61.3. Genetic Query Optimization (GEQO) in PostgreSQL (PostgreSQL 18 Documentation)

URL: https://www.postgresql.org/docs/current/geqo-pg-intro.html
Version: fetched 2026-11-05

> The GEQO module approaches the query optimization problem as though it were the well-known traveling salesman problem (TSP).

> Possible query plans are encoded as integer strings.

> Each string represents the join order from one relation of the query to the next.

> is encoded by the integer string '4-1-3-2', which means, first join relation '4' and '1', then '3', and then '2', where 1, 2, 3, 4 are relation IDs within the PostgreSQL optimizer.

> Usage of a steady state GA (replacement of the least fit individuals in a population, not whole-generational replacement) allows fast convergence towards improved query plans.

> Usage of edge recombination crossover which is especially suited to keep edge losses low for the solution of the TSP by means of a GA

> Mutation as genetic operator is deprecated so that no repair mechanisms are needed to generate legal TSP tours.

> At a more basic level, it is not clear that solving query optimization with a GA algorithm designed for TSP is appropriate. In the TSP case, the cost associated with any substring (partial tour) is independent of the rest of the tour, but this is certainly not true for query optimization.

## 19.7.3. Genetic Query Optimizer (PostgreSQL 18 Documentation, "Query Planning")

URL: https://www.postgresql.org/docs/current/runtime-config-query.html
Version: fetched 2026-11-05

> Use genetic query optimization to plan queries with at least this many FROM items involved. (Note that a FULL OUTER JOIN construct counts as only one FROM item.) The default is 12. For simpler queries it is usually best to use the regular, exhaustive-search planner, but for queries with many tables the exhaustive search takes too long, often longer than the penalty of executing a suboptimal plan.

> Controls the trade-off between planning time and query plan quality in GEQO. This variable must be an integer in the range from 1 to 10. The default value is five.

> geqo_effort doesn't actually do anything directly; it is only used to compute the default values for the other variables that influence GEQO behavior

> Controls the selection bias used by GEQO. The selection bias is the selective pressure within the population. Values can be from 1.50 to 2.00; the latter is the default.

> Controls the initial value of the random number generator used by GEQO to select random paths through the join order search space. The value can range from zero (the default) to one.

## 19.7.4. Other Planner Options (PostgreSQL 18 Documentation, "Query Planning")

URL: https://www.postgresql.org/docs/current/runtime-config-query.html
Version: fetched 2026-11-05

> The planner will merge sub-queries into upper queries if the resulting FROM list would have no more than this many items. Smaller values reduce planning time but might yield inferior query plans. The default is eight.

> By default, this variable is set the same as from_collapse_limit, which is appropriate for most uses.

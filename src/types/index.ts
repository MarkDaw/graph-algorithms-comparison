export interface Node {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface Edge {
  from: string;
  to: string;
  weight: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface PathStep {
  currentNode: string;
  visitedNodes: Set<string>;
  previousNodes: Map<string, string | null>;
  path: string[];
  isComplete: boolean;
}

export type AlgorithmType = 'dijkstra' | 'astar' | 'bfs' | 'dfs';

export interface AlgorithmResult {
  path: string[];
  steps: PathStep[];
  visitedNodes: Set<string>;
}

export interface Algorithm {
    execute(graph: Graph, startNode: string, endNode: string): AlgorithmResult;
}
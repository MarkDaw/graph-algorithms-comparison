import type { Graph, PathStep, AlgorithmResult } from '../types/index.js';

export interface AlgorithmConfig {
  startNode: string;
  endNode: string;
  graph: Graph;
}

export interface AlgorithmFunction {
  (config: AlgorithmConfig): AlgorithmResult;
}

export interface StepByStepAlgorithm {
  init: (config: AlgorithmConfig) => void;
  step: () => PathStep | null;
  reset: () => void;
  isComplete: () => boolean;
}

export type HeuristicFunction = (nodeId: string, targetId: string, graph: Graph) => number;
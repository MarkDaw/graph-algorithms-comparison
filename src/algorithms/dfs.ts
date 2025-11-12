import type { PathStep, AlgorithmResult } from '../types/index.js';
import type { AlgorithmConfig } from './types.js';

export const dfs = (config: AlgorithmConfig): AlgorithmResult => {
  const { startNode, endNode, graph } = config;
  const steps: PathStep[] = [];
  const previousNodes = new Map<string, string | null>();
  const visitedNodes = new Set<string>();
  const stack: string[] = [startNode];
  
  // Initialize
  graph.nodes.forEach(node => {
    previousNodes.set(node.id, null);
  });
  
  // Create adjacency list
  const adjacencyList = new Map<string, string[]>();
  graph.nodes.forEach(node => adjacencyList.set(node.id, []));
  
  graph.edges.forEach(edge => {
    adjacencyList.get(edge.from)?.push(edge.to);
    adjacencyList.get(edge.to)?.push(edge.from);
  });
  
  while (stack.length > 0) {
    const currentNode = stack.pop()!;
    
    if (visitedNodes.has(currentNode)) continue;
    
    visitedNodes.add(currentNode);
    
    // Record step (DFS doesn't calculate distances to all nodes)
    steps.push({
      currentNode,
      visitedNodes: new Set(visitedNodes),
      distances: new Map(), // DFS doesn't track distances
      previousNodes: new Map(previousNodes),
      path: reconstructPath(previousNodes, startNode, currentNode),
      isComplete: currentNode === endNode,
    });
    
    if (currentNode === endNode) break;
    
    // Process neighbors (in reverse to maintain left-to-right exploration when popping)
    const neighbors = adjacencyList.get(currentNode) || [];
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighborId = neighbors[i];
      if (!visitedNodes.has(neighborId) && !previousNodes.has(neighborId)) {
        // Set parent only if not already set (first path wins in DFS)
        previousNodes.set(neighborId, currentNode);
        stack.push(neighborId);
      }
    }
  }
  
  const finalPath = reconstructPath(previousNodes, startNode, endNode);
  
  // Calculate actual weighted distance of the path found (not guaranteed to be optimal)
  let pathDistance = 0;
  if (finalPath.length > 1) {
    for (let i = 0; i < finalPath.length - 1; i++) {
      const edge = graph.edges.find(e => 
        (e.from === finalPath[i] && e.to === finalPath[i + 1]) ||
        (e.to === finalPath[i] && e.from === finalPath[i + 1])
      );
      if (edge) {
        pathDistance += edge.weight;
      }
    }
  }
  
  return {
    path: finalPath,
    distance: finalPath.length > 0 ? pathDistance : Infinity,
    steps,
    visitedNodes,
  };
};

const reconstructPath = (
  previousNodes: Map<string, string | null>,
  startNode: string,
  endNode: string
): string[] => {
  const path: string[] = [];
  let current: string | null = endNode;
  
  while (current !== null) {
    path.unshift(current);
    if (current === startNode) break;
    current = previousNodes.get(current) || null;
  }
  
  return path[0] === startNode ? path : [];
};

export class DFSStepByStep {
  private config: AlgorithmConfig | null = null;
  private previousNodes = new Map<string, string | null>();
  private visitedNodes = new Set<string>();
  private adjacencyList = new Map<string, string[]>();
  private stack: string[] = [];
  private complete = false;
  
  init(config: AlgorithmConfig): void {
    this.config = config;
    this.previousNodes.clear();
    this.visitedNodes.clear();
    this.adjacencyList.clear();
    this.stack = [];
    this.complete = false;
    
    const { startNode, graph } = config;
    
    // Initialize
    graph.nodes.forEach(node => {
      this.previousNodes.set(node.id, null);
      this.adjacencyList.set(node.id, []);
    });
    
    graph.edges.forEach(edge => {
      this.adjacencyList.get(edge.from)?.push(edge.to);
      this.adjacencyList.get(edge.to)?.push(edge.from);
    });
    
    this.stack.push(startNode);
  }
  
  step(): PathStep | null {
    if (!this.config || this.complete || this.stack.length === 0) {
      return null;
    }
    
    const { startNode, endNode } = this.config;
    
    const currentNode = this.stack.pop()!;
    
    // Skip if already visited
    if (this.visitedNodes.has(currentNode)) {
      return this.step(); // Recursive call to get next unvisited node
    }
    
    this.visitedNodes.add(currentNode);
    
    const pathStep: PathStep = {
      currentNode,
      visitedNodes: new Set(this.visitedNodes),
      distances: new Map(), // DFS doesn't track distances
      previousNodes: new Map(this.previousNodes),
      path: reconstructPath(this.previousNodes, startNode, currentNode),
      isComplete: currentNode === endNode,
    };
    
    if (currentNode === endNode) {
      this.complete = true;
      return pathStep;
    }
    
    // Process neighbors
    const neighbors = this.adjacencyList.get(currentNode) || [];
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighborId = neighbors[i];
      if (!this.visitedNodes.has(neighborId) && this.previousNodes.get(neighborId) === null) {
        this.previousNodes.set(neighborId, currentNode);
        this.stack.push(neighborId);
      }
    }
    
    return pathStep;
  }
  
  reset(): void {
    this.config = null;
    this.previousNodes.clear();
    this.visitedNodes.clear();
    this.adjacencyList.clear();
    this.stack = [];
    this.complete = false;
  }
  
  isComplete(): boolean {
    return this.complete;
  }
}
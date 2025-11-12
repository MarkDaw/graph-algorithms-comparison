import type { PathStep, AlgorithmResult } from '../types/index.js';
import type { AlgorithmConfig } from './types.js';

export const bfs = (config: AlgorithmConfig): AlgorithmResult => {
  const { startNode, endNode, graph } = config;
  const steps: PathStep[] = [];
  const previousNodes = new Map<string, string | null>();
  const visitedNodes = new Set<string>();
  const queue: string[] = [startNode];
  
  // Initialize
  graph.nodes.forEach(node => {
    previousNodes.set(node.id, null);
  });
  
  visitedNodes.add(startNode);
  
  // Create adjacency list
  const adjacencyList = new Map<string, string[]>();
  graph.nodes.forEach(node => adjacencyList.set(node.id, []));
  
  graph.edges.forEach(edge => {
    adjacencyList.get(edge.from)?.push(edge.to);
    adjacencyList.get(edge.to)?.push(edge.from);
  });
  
  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    
    // Record step
    steps.push({
      currentNode,
      visitedNodes: new Set(visitedNodes),
      previousNodes: new Map(previousNodes),
      path: reconstructPath(previousNodes, startNode, currentNode),
      isComplete: currentNode === endNode,
    });
    
    if (currentNode === endNode) break;
    
    // Process neighbors
    const neighbors = adjacencyList.get(currentNode) || [];
    neighbors.forEach(neighborId => {
      if (!visitedNodes.has(neighborId)) {
        visitedNodes.add(neighborId);
        previousNodes.set(neighborId, currentNode);
        queue.push(neighborId);
      }
    });
  }
  
  const finalPath = reconstructPath(previousNodes, startNode, endNode);
  
  return {
    path: finalPath,
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

export class BFSStepByStep {
  private config: AlgorithmConfig | null = null;
  private previousNodes = new Map<string, string | null>();
  private visitedNodes = new Set<string>();
  private adjacencyList = new Map<string, string[]>();
  private queue: string[] = [];
  private complete = false;
  
  init(config: AlgorithmConfig): void {
    this.config = config;
    this.previousNodes.clear();
    this.visitedNodes.clear();
    this.adjacencyList.clear();
    this.queue = [];
    this.complete = false;
    
    const { startNode, graph } = config;
    
    graph.nodes.forEach(node => {
      this.previousNodes.set(node.id, null);
      this.adjacencyList.set(node.id, []);
    });
    
    graph.edges.forEach(edge => {
      this.adjacencyList.get(edge.from)?.push(edge.to);
      this.adjacencyList.get(edge.to)?.push(edge.from);
    });
    
    this.visitedNodes.add(startNode);
    this.queue.push(startNode);
  }
  
  step(): PathStep | null {
    if (!this.config || this.complete || this.queue.length === 0) {
      return null;
    }
    
    const { startNode, endNode } = this.config;
    
    const currentNode = this.queue.shift()!;
    
    const pathStep: PathStep = {
      currentNode,
      visitedNodes: new Set(this.visitedNodes),
      previousNodes: new Map(this.previousNodes),
      path: reconstructPath(this.previousNodes, startNode, currentNode),
      isComplete: currentNode === endNode,
    };
    
    if (currentNode === endNode) {
      this.complete = true;
      return pathStep;
    }
    
    const neighbors = this.adjacencyList.get(currentNode) || [];
    neighbors.forEach(neighborId => {
      if (!this.visitedNodes.has(neighborId)) {
        this.visitedNodes.add(neighborId);
        this.previousNodes.set(neighborId, currentNode);
        this.queue.push(neighborId);
      }
    });
    
    return pathStep;
  }
  
  reset(): void {
    this.config = null;
    this.previousNodes.clear();
    this.visitedNodes.clear();
    this.adjacencyList.clear();
    this.queue = [];
    this.complete = false;
  }
  
  isComplete(): boolean {
    return this.complete;
  }
}
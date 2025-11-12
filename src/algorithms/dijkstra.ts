import type { PathStep, AlgorithmResult } from '../types/index.js';
import type { AlgorithmConfig } from './types.js';
import { MinHeap } from '../utils/MinHeap.js';

export const dijkstra = (config: AlgorithmConfig): AlgorithmResult => {
  const { startNode, endNode, graph } = config;
  const steps: PathStep[] = [];
  const distances = new Map<string, number>();
  const previousNodes = new Map<string, string | null>();
  const visitedNodes = new Set<string>();
  
  // Initialize distances (internal use only, not exposed)
  graph.nodes.forEach(node => {
    distances.set(node.id, node.id === startNode ? 0 : Infinity);
    previousNodes.set(node.id, null);
  });
  
  // Create adjacency list
  const adjacencyList = new Map<string, { node: string; weight: number }[]>();
  graph.nodes.forEach(node => adjacencyList.set(node.id, []));
  
  graph.edges.forEach(edge => {
    adjacencyList.get(edge.from)?.push({ node: edge.to, weight: edge.weight });
    adjacencyList.get(edge.to)?.push({ node: edge.from, weight: edge.weight });
  });
  
  // Priority queue (min-heap) with [distance, nodeId]
  const pq = new MinHeap<string>();
  pq.push(0, startNode);
  
  while (!pq.isEmpty()) {
    const current = pq.pop();
    if (!current) break;
    
    const { priority: currentDistance, data: currentNode } = current;
    
    // Skip if already visited
    if (visitedNodes.has(currentNode)) continue;
    
    // Mark as visited
    visitedNodes.add(currentNode);
    
    // Record step
    steps.push({
      currentNode,
      visitedNodes: new Set(visitedNodes),
      previousNodes: new Map(previousNodes),
      path: reconstructPath(previousNodes, startNode, currentNode),
      isComplete: currentNode === endNode,
    });
    
    // If we reached the end node, we're done
    if (currentNode === endNode) break;
    
    // Skip if this is an outdated entry (we found a better path already)
    if (currentDistance > distances.get(currentNode)!) continue;
    
    // Update distances to neighbors
    const neighbors = adjacencyList.get(currentNode) || [];
    neighbors.forEach(({ node: neighborId, weight }) => {
      if (!visitedNodes.has(neighborId)) {
        const newDistance = distances.get(currentNode)! + weight;
        const oldDistance = distances.get(neighborId)!;
        
        if (newDistance < oldDistance) {
          distances.set(neighborId, newDistance);
          previousNodes.set(neighborId, currentNode);
          pq.push(newDistance, neighborId);
        }
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

export class DijkstraStepByStep {
  private config: AlgorithmConfig | null = null;
  private distances = new Map<string, number>();
  private previousNodes = new Map<string, string | null>();
  private visitedNodes = new Set<string>();
  private adjacencyList = new Map<string, { node: string; weight: number }[]>();
  private pq = new MinHeap<string>();
  private complete = false;
  
  init(config: AlgorithmConfig): void {
    this.config = config;
    this.distances.clear();
    this.previousNodes.clear();
    this.visitedNodes.clear();
    this.adjacencyList.clear();
    this.pq = new MinHeap<string>();
    this.complete = false;
    
    const { startNode, graph } = config;
    
    // Initialize
    graph.nodes.forEach(node => {
      this.distances.set(node.id, node.id === startNode ? 0 : Infinity);
      this.previousNodes.set(node.id, null);
      this.adjacencyList.set(node.id, []);
    });
    
    graph.edges.forEach(edge => {
      this.adjacencyList.get(edge.from)?.push({ node: edge.to, weight: edge.weight });
      this.adjacencyList.get(edge.to)?.push({ node: edge.from, weight: edge.weight });
    });
    
    this.pq.push(0, startNode);
  }
  
  step(): PathStep | null {
    if (!this.config || this.complete || this.pq.isEmpty()) {
      return null;
    }
    
    const { startNode, endNode } = this.config;
    
    const current = this.pq.pop();
    if (!current) {
      this.complete = true;
      return null;
    }
    
    const { priority: currentDistance, data: currentNode } = current;
    
    if (this.visitedNodes.has(currentNode)) {
      return this.step();
    }
    
    if (currentDistance > this.distances.get(currentNode)!) {
      return this.step();
    }
    
    this.visitedNodes.add(currentNode);
    
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
    neighbors.forEach(({ node: neighborId, weight }) => {
      if (!this.visitedNodes.has(neighborId)) {
        const newDistance = this.distances.get(currentNode)! + weight;
        const oldDistance = this.distances.get(neighborId)!;
        
        if (newDistance < oldDistance) {
          this.distances.set(neighborId, newDistance);
          this.previousNodes.set(neighborId, currentNode);
          this.pq.push(newDistance, neighborId);
        }
      }
    });
    
    return pathStep;
  }
  
  reset(): void {
    this.config = null;
    this.distances.clear();
    this.previousNodes.clear();
    this.visitedNodes.clear();
    this.adjacencyList.clear();
    this.pq = new MinHeap<string>();
    this.complete = false;
  }
  
  isComplete(): boolean {
    return this.complete;
  }
}
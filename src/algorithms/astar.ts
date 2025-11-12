import type { PathStep, AlgorithmResult, Graph } from '../types/index.js';
import type { AlgorithmConfig } from './types.js';
import { MinHeap } from '../utils/MinHeap.js';

export const astar = (config: AlgorithmConfig): AlgorithmResult => {
  const { startNode, endNode, graph } = config;
  const steps: PathStep[] = [];
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const previousNodes = new Map<string, string | null>();
  const visitedNodes = new Set<string>();
  
  // Initialize scores (internal use only)
  graph.nodes.forEach(node => {
    gScore.set(node.id, node.id === startNode ? 0 : Infinity);
    fScore.set(node.id, node.id === startNode ? heuristic(node.id, endNode, graph) : Infinity);
    previousNodes.set(node.id, null);
  });
  
  // Create adjacency list with weights
  const adjacencyList = new Map<string, { node: string; weight: number }[]>();
  graph.nodes.forEach(node => adjacencyList.set(node.id, []));
  
  graph.edges.forEach(edge => {
    adjacencyList.get(edge.from)?.push({ node: edge.to, weight: edge.weight });
    adjacencyList.get(edge.to)?.push({ node: edge.from, weight: edge.weight });
  });
  
  // Priority queue (min-heap) ordered by fScore
  const openSet = new MinHeap<string>();
  openSet.push(fScore.get(startNode)!, startNode);
  
  while (!openSet.isEmpty()) {
    const current = openSet.pop();
    if (!current) break;
    
    const { priority: currentF, data: currentNode } = current;
    
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
    
    // Skip if this is an outdated entry
    if (currentF > fScore.get(currentNode)!) continue;
    
    // Process neighbors
    const neighbors = adjacencyList.get(currentNode) || [];
    neighbors.forEach(({ node: neighborId, weight }) => {
      if (!visitedNodes.has(neighborId)) {
        const tentativeG = gScore.get(currentNode)! + weight;
        
        if (tentativeG < gScore.get(neighborId)!) {
          previousNodes.set(neighborId, currentNode);
          gScore.set(neighborId, tentativeG);
          
          const h = heuristic(neighborId, endNode, graph);
          const newF = tentativeG + h;
          fScore.set(neighborId, newF);
          
          openSet.push(newF, neighborId);
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

const heuristic = (nodeId: string, targetId: string, graph: Graph): number => {
  const node = graph.nodes.find(n => n.id === nodeId);
  const target = graph.nodes.find(n => n.id === targetId);
  
  if (!node || !target) return 0;
  
  const dx = node.x - target.x;
  const dy = node.y - target.y;
  
  return Math.sqrt(dx * dx + dy * dy) / 20;
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

export class AStarStepByStep {
  private config: AlgorithmConfig | null = null;
  private gScore = new Map<string, number>();
  private fScore = new Map<string, number>();
  private previousNodes = new Map<string, string | null>();
  private visitedNodes = new Set<string>();
  private adjacencyList = new Map<string, { node: string; weight: number }[]>();
  private openSet = new MinHeap<string>();
  private complete = false;
  
  init(config: AlgorithmConfig): void {
    this.config = config;
    this.gScore.clear();
    this.fScore.clear();
    this.previousNodes.clear();
    this.visitedNodes.clear();
    this.adjacencyList.clear();
    this.openSet = new MinHeap<string>();
    this.complete = false;
    
    const { startNode, endNode, graph } = config;
    
    graph.nodes.forEach(node => {
      this.gScore.set(node.id, node.id === startNode ? 0 : Infinity);
      this.fScore.set(node.id, node.id === startNode ? heuristic(node.id, endNode, graph) : Infinity);
      this.previousNodes.set(node.id, null);
      this.adjacencyList.set(node.id, []);
    });
    
    graph.edges.forEach(edge => {
      this.adjacencyList.get(edge.from)?.push({ node: edge.to, weight: edge.weight });
      this.adjacencyList.get(edge.to)?.push({ node: edge.from, weight: edge.weight });
    });
    
    this.openSet.push(this.fScore.get(startNode)!, startNode);
  }
  
  step(): PathStep | null {
    if (!this.config || this.complete || this.openSet.isEmpty()) {
      return null;
    }
    
    const { startNode, endNode } = this.config;
    
    const current = this.openSet.pop();
    if (!current) {
      this.complete = true;
      return null;
    }
    
    const { priority: currentF, data: currentNode } = current;
    
    if (this.visitedNodes.has(currentNode)) {
      return this.step();
    }
    
    if (currentF > this.fScore.get(currentNode)!) {
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
        const tentativeG = this.gScore.get(currentNode)! + weight;
        
        if (tentativeG < this.gScore.get(neighborId)!) {
          this.previousNodes.set(neighborId, currentNode);
          this.gScore.set(neighborId, tentativeG);
          
          const h = heuristic(neighborId, endNode, this.config!.graph);
          const newF = tentativeG + h;
          this.fScore.set(neighborId, newF);
          
          this.openSet.push(newF, neighborId);
        }
      }
    });
    
    return pathStep;
  }
  
  reset(): void {
    this.config = null;
    this.gScore.clear();
    this.fScore.clear();
    this.previousNodes.clear();
    this.visitedNodes.clear();
    this.adjacencyList.clear();
    this.openSet = new MinHeap<string>();
    this.complete = false;
  }
  
  isComplete(): boolean {
    return this.complete;
  }
}
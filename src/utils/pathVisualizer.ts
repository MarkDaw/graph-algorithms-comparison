import type { PathStep, Graph } from '../types/index.js';

export const animatePath = (
  steps: PathStep[],
  currentStepIndex: number,
  onUpdate: (step: PathStep) => void
): void => {
  if (currentStepIndex >= 0 && currentStepIndex < steps.length) {
    onUpdate(steps[currentStepIndex]);
  }
};

export const getPathLength = (path: string[], graph: Graph): number => {
  let totalDistance = 0;
  
  for (let i = 0; i < path.length - 1; i++) {
    const edge = graph.edges.find(
      e => (e.from === path[i] && e.to === path[i + 1]) ||
           (e.to === path[i] && e.from === path[i + 1])
    );
    
    if (edge) {
      totalDistance += edge.weight;
    }
  }
  
  return totalDistance;
};

export const highlightPath = (
  ctx: CanvasRenderingContext2D,
  path: string[],
  graph: Graph,
  color: string = '#4CAF50'
): void => {
  if (path.length < 2) return;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  
  for (let i = 0; i < path.length - 1; i++) {
    const fromNode = graph.nodes.find(n => n.id === path[i]);
    const toNode = graph.nodes.find(n => n.id === path[i + 1]);
    
    if (!fromNode || !toNode) continue;
    
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.stroke();
  }
};

export function visualizePath(path: string[]) {
  const highlightedNodes = new Set(path);
  const highlightedEdges: [string, string][] = [];

  for (let i = 0; i < path.length - 1; i++) {
    highlightedEdges.push([path[i], path[i + 1]]);
  }

  return { highlightedNodes, highlightedEdges };
}

export function clearVisualization() {
  return { highlightedNodes: new Set<string>(), highlightedEdges: [] as [string, string][] };
}
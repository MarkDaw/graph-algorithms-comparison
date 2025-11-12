import type { Graph, Node, Edge } from '../types';

export const generateRandomGraph = (nodeCount: number, edgeDensity: number = 0.3): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Generate nodes with cloud-like distribution using force-directed layout
  const width = 750;
  const height = 550;
  const minDistance = 60; // Minimum distance between nodes
  const maxAttempts = 100;
  
  for (let i = 0; i < nodeCount; i++) {
    let x = 0;
    let y = 0;
    let attempts = 0;
    let validPosition = false;
    
    while (!validPosition && attempts < maxAttempts) {
      // Use Gaussian distribution for more natural clustering
      x = gaussianRandom(width / 2, width / 4);
      y = gaussianRandom(height / 2, height / 4);
      
      // Ensure within bounds with padding
      x = Math.max(50, Math.min(width - 50, x));
      y = Math.max(50, Math.min(height - 50, y));
      
      // Check distance from other nodes
      validPosition = nodes.every(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance >= minDistance;
      });
      
      attempts++;
    }
    
    // If we couldn't find a valid position, use fallback
    if (!validPosition) {
      x = 50 + Math.random() * (width - 100);
      y = 50 + Math.random() * (height - 100);
    }
    
    nodes.push({
      id: `node-${i}`,
      x,
      y,
      label: `${i}`,
    });
  }
  
  // Generate edges with spatial awareness (prefer closer nodes)
  const spatialEdges: Edge[] = [];
  
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Probability decreases with distance
      const normalizedDistance = distance / Math.sqrt(width * width + height * height);
      const probability = edgeDensity * (1 - normalizedDistance * 0.7);
      
      if (Math.random() < probability) {
        const weight = Math.floor(distance / 20) + 1; // Weight based on distance
        spatialEdges.push({
          from: `node-${i}`,
          to: `node-${j}`,
          weight: Math.min(weight, 20),
        });
      }
    }
  }
  
  edges.push(...spatialEdges);
  
  // Ensure graph is connected
  ensureConnected(nodes, edges);
  
  return { nodes, edges };
};

// Gaussian (normal) distribution random number generator
const gaussianRandom = (mean: number, stdDev: number): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
};

const ensureConnected = (nodes: Node[], edges: Edge[]): void => {
  if (nodes.length === 0) return;
  
  const visited = new Set<string>();
  const queue: string[] = [nodes[0].id];
  visited.add(nodes[0].id);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    edges.forEach(edge => {
      if (edge.from === current && !visited.has(edge.to)) {
        visited.add(edge.to);
        queue.push(edge.to);
      } else if (edge.to === current && !visited.has(edge.from)) {
        visited.add(edge.from);
        queue.push(edge.from);
      }
    });
  }
  
  // Connect unvisited nodes to nearest visited node
  const unvisitedNodes: Node[] = nodes.filter(node => !visited.has(node.id));
  
  unvisitedNodes.forEach((node) => {
    let nearestNode: Node | null = null;
    let minDistance = Infinity;

    
    nodes.forEach((otherNode) => {
      if (visited.has(otherNode.id)) {
        const dx = node.x - otherNode.x;
        const dy = node.y - otherNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestNode = otherNode;
        }
      }
    });
    
    if (nearestNode) {
      const weight = Math.floor(minDistance / 20) + 1;
      edges.push({
        from: node.id,
        to: nearestNode.id,
        weight: Math.min(weight, 20),
      });
      visited.add(node.id);
    }
  });
};

export const generateGridGraph = (rows: number, cols: number): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const cellWidth = 750 / cols;
  const cellHeight = 550 / rows;
  
  // Generate nodes in grid
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      nodes.push({
        id: `node-${i}-${j}`,
        x: j * cellWidth + cellWidth / 2 + 50,
        y: i * cellHeight + cellHeight / 2 + 50,
        label: `${i},${j}`,
      });
    }
  }
  
  // Generate edges (connect adjacent nodes)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const currentId = `node-${i}-${j}`;
      
      // Connect to right neighbor
      if (j < cols - 1) {
        edges.push({
          from: currentId,
          to: `node-${i}-${j + 1}`,
          weight: Math.floor(Math.random() * 10) + 1,
        });
      }
      
      // Connect to bottom neighbor
      if (i < rows - 1) {
        edges.push({
          from: currentId,
          to: `node-${i + 1}-${j}`,
          weight: Math.floor(Math.random() * 10) + 1,
        });
      }
    }
  }
  
  return { nodes, edges };
};
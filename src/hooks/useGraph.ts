import { useState, useEffect } from 'react';
import { Graph, Node, Edge } from '../types';

const useGraph = () => {
    const [graph, setGraph] = useState<Graph | null>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const initializeGraph = (nodes: Node[], edges: Edge[]) => {
        setNodes(nodes);
        setEdges(edges);
        setGraph({ nodes, edges });
    };

    const updateGraph = (newNodes: Node[], newEdges: Edge[]) => {
        setNodes(newNodes);
        setEdges(newEdges);
        setGraph({ nodes: newNodes, edges: newEdges });
    };

    const resetGraph = () => {
        setNodes([]);
        setEdges([]);
        setGraph(null);
    };

    useEffect(() => {
        // Optional: Add any side effects related to graph changes here
    }, [graph]);

    return {
        graph,
        nodes,
        edges,
        initializeGraph,
        updateGraph,
        resetGraph,
    };
};

export default useGraph;
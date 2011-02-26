package eu.morfeoproject.fast.catalogue.planner;

import java.util.LinkedList;
import java.util.List;

public class AllSimplePaths<V> {
	
    private LinkedList<V> path;  // the path
    private Graph<V> graph;

    public AllSimplePaths(Graph<V> graph) {
        this.graph = graph;
    }

    public List<LinkedList<V>> findAllPaths(V s, V t) {
    	LinkedList<LinkedList<V>> allPaths = new LinkedList<LinkedList<V>>();
    	path = new LinkedList<V>();
    	findAllPaths(allPaths, s, t);
    	return allPaths;
    }
    
    @SuppressWarnings("unchecked")
	private void findAllPaths(List<LinkedList<V>> allPaths, V s, V t) {
        // add node s to current path
        path.addLast(s);

        // found path from s to t
        if (s.equals(t)) {
        	LinkedList<V> newPath = new LinkedList<V>();
        	newPath.addAll(path);
        	allPaths.add(newPath);
        }

        // consider all neighbors that would continue path without repeating a node
        else {
            List<V> neighbors = graph.neighbors(s);
            for (V n : neighbors) {
                if (!path.contains(n)) findAllPaths(allPaths, n, t);
            }
        }

        // done exploring from node, so remove from path
        path.removeLast();
    }

}
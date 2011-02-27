/**
 * Copyright (c) 20O08-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
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
    	breadthFirst(allPaths, s, t);
    	return allPaths;
    }
    
    @SuppressWarnings("unchecked")
	private void breadthFirst(List<LinkedList<V>> allPaths, V node1, V node2) {
        // add node1 to current path
        path.addLast(node1);

        // found path from node1 to node2
        if (node1.equals(node2)) {
        	LinkedList<V> newPath = new LinkedList<V>();
        	newPath.addAll(path);
        	allPaths.add(newPath);
        }

        // consider all neighbors that would continue path without repeating a node
        else {
            List<V> adjacent = graph.adjacentNodes(node1);
            for (V adj : adjacent) {
                if (!path.contains(adj)) breadthFirst(allPaths, adj, node2);
            }
        }

        // done exploring from node, so remove from path
        path.removeLast();
    }
    
}
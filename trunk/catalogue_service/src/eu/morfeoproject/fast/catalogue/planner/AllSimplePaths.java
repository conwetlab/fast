/**
 * Copyright (c) 2008-2011, FAST Consortium
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
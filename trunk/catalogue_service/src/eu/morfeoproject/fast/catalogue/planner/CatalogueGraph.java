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

import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class CatalogueGraph implements Graph<URI> {

	private Catalogue catalogue;
	private URI PLANNER_GRAPH;
	private URI SATISFIED_BY;
	
	public CatalogueGraph(Catalogue catalogue) {
		this.catalogue = catalogue;
		PLANNER_GRAPH = new URIImpl(catalogue.getServerURL()+"/planner");
		SATISFIED_BY = new URIImpl(FGO.NS_FGO + "SatisfiedBy");
	}

	@Override
    public void addEdge(URI node1, URI node2) {
    	catalogue.getTripleStore().addStatement(PLANNER_GRAPH, node2, SATISFIED_BY, node1);
    }
    
	@Override
    public void addTwoWayVertex(URI node1, URI node2) {
        addEdge(node1, node2);
        addEdge(node2, node1);
    }

	@Override
    public void removeEdge(URI node1, URI node2) {
    	catalogue.getTripleStore().removeStatements(PLANNER_GRAPH, node1, SATISFIED_BY, node2);
    }

	@Override
    public LinkedList<URI> adjacentNodes(URI node) {
    	LinkedList<URI> adjacent = new LinkedList<URI>();
    	ClosableIterator<Statement> cIt = catalogue.getTripleStore().findStatements(PLANNER_GRAPH, node, SATISFIED_BY, Variable.ANY);
    	while (cIt.hasNext()) {
    		adjacent.add(cIt.next().getObject().asURI());
    	}
    	cIt.close();
    	return adjacent;
    }

	@Override
	public void removeNode(URI node) {
		catalogue.getTripleStore().removeStatements(PLANNER_GRAPH, node, SATISFIED_BY, Variable.ANY);
		catalogue.getTripleStore().removeStatements(PLANNER_GRAPH, Variable.ANY, SATISFIED_BY, node);
	}
	
	@Override
	public void clear() {
		catalogue.getTripleStore().removeStatements(PLANNER_GRAPH, Variable.ANY, Variable.ANY, Variable.ANY);
	}

}

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

import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class CatalogueGraph implements Graph<URI> {

	private Catalogue catalogue;
	private final static URI PLANNER_GRAPH = new URIImpl("urn:planner");
	private final static URI SATISFIED_BY = new URIImpl("urn:satisfied_by");
	
	public CatalogueGraph(Catalogue catalogue) {
		this.catalogue = catalogue;
	}

    public void addEdge(URI from, URI to) {
    	catalogue.getTripleStore().addStatement(PLANNER_GRAPH, to, SATISFIED_BY, from);
    }
    
    public void removeEdge(URI from, URI to) {
    	catalogue.getTripleStore().removeStatements(PLANNER_GRAPH, from, SATISFIED_BY, to);
    }

    public List<URI> neighbors(URI uri) {
    	LinkedList<URI> neighbors = new LinkedList<URI>();
    	ClosableIterator<Statement> cIt = catalogue.getTripleStore().findStatements(PLANNER_GRAPH, uri, SATISFIED_BY, Variable.ANY);
    	while (cIt.hasNext()) {
    		neighbors.add(cIt.next().getObject().asURI());
    	}
    	cIt.close();
    	return neighbors;
    }

	@Override
	public void addNode(URI node) {
		// NOT NEEDED
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

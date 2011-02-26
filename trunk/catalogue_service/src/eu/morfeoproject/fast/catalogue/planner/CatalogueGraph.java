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

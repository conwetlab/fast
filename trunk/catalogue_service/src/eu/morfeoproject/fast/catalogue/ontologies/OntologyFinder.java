package eu.morfeoproject.fast.catalogue.ontologies;

import org.ontoware.rdf2go.model.node.URI;

public interface OntologyFinder {

	/**
	 * Finds an ontology URI for a given URI such a Class, Property or anything
	 * related to such an ontology.
	 * @param uri the URI we want to find out its ontology
	 * @return the ontology URI
	 */
	public URI find(URI uri);
	
}

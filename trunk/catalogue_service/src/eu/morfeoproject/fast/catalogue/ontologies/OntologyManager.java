package eu.morfeoproject.fast.catalogue.ontologies;

import java.util.LinkedList;
import java.util.List;

import org.ontoware.rdf2go.model.node.URI;

public class OntologyManager {

	private LinkedList<URI> ontologies = new LinkedList<URI>();

	public OntologyManager() {}
	
	public OntologyManager(List<URI> ontologies) {
		this.ontologies.addAll(ontologies);
	}
	
	public boolean add(URI uri) {
		if (contains(uri)) return false;
		return ontologies.add(uri);
	}
	
	public boolean remove(URI uri) {
		return ontologies.remove(uri);
	}
	
	public boolean contains(URI uri) {
		return ontologies.contains(uri);
	}
	
	public LinkedList<URI> list() {
		LinkedList<URI> list = new LinkedList<URI>();
		list.addAll(ontologies);
		return list;
	}
	
	public void clear() {
		ontologies.clear();
	}
	
	public boolean isDefinedBy(URI someUri, URI ontologyURI) {
		return someUri.toString().startsWith(ontologyURI.toString());
	}
	
}

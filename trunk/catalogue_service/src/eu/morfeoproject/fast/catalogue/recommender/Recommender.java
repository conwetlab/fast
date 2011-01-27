package eu.morfeoproject.fast.catalogue.recommender;

import java.util.List;

import org.ontoware.rdf2go.model.node.URI;

public interface Recommender {
	
	public void rebuild();
	public List<URI> getSuggestionList(List<URI> uriList);

}

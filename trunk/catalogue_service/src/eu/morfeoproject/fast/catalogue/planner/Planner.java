package eu.morfeoproject.fast.catalogue.planner;

import java.util.List;

import org.ontoware.rdf2go.model.node.URI;

public interface Planner {

	public boolean add(URI from, URI to);	
	public void remove(URI uri);
	public List<Plan> searchPlans(URI from, URI to);
	public void clear();

}

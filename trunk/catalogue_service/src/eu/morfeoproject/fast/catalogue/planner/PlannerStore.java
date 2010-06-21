package eu.morfeoproject.fast.catalogue.planner;

import java.util.List;

import org.ontoware.rdf2go.model.node.URI;

public interface PlannerStore {

	public boolean add(Plan plan);	
	public boolean add(URI from, URI to);
	public void removeFrom(URI uri);
	public void removeTo(URI uri);
	public List<URI> getFrom(URI uri);
	public List<URI> getTo(URI uri);
	public void clear();
	public boolean isEmpty();

}

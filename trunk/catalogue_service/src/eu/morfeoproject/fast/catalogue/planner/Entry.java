package eu.morfeoproject.fast.catalogue.planner;

import org.ontoware.rdf2go.model.node.URI;

public class Entry {
	
	private URI from;
	private URI to;
	
	public Entry(URI from, URI to) {
		this.from = from;
		this.to = to;
	}
	
	public URI getFrom() {
		return from;
	}
	
	public void setFrom(URI from) {
		this.from = from;
	}
	
	public URI getTo() {
		return to;
	}
	
	public void setTo(URI to) {
		this.to = to;
	}
	
	@Override
	public String toString() {
		return this.from + " -> " + this.to;
	}
}
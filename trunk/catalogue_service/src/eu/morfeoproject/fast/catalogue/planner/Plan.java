package eu.morfeoproject.fast.catalogue.planner;

import java.util.LinkedList;
import java.util.List;

import org.ontoware.rdf2go.model.node.URI;

public class Plan {
	
	private List<URI> uriList = new LinkedList<URI>();
	
	public List<URI> getUriList() {
		return uriList;
	}
	
	public List<URI> getUriList(List<URI> toExclude) {
		LinkedList<URI> newList = new LinkedList<URI>();
		for (URI uri : uriList)
			if (!toExclude.contains(uri))
				newList.add(uri);
		return newList;
	}
	
	public void setUriList(List<URI> uriList) {
		this.uriList = uriList;
	}
	
	// doesn't make a new copy of the URIs
	public Plan copy() {
		Plan newPlan = new Plan();
		for (URI uri : getUriList())
			newPlan.getUriList().add(uri);
		return newPlan;
	}
	
	public void merge(Plan other) {
		for (URI uri : other.getUriList()) {
			// inserts elements from 2nd list avoiding duplicates
			if (!this.getUriList().contains(uri)) {
				this.getUriList().add(uri);
			}
		}
	}
	
	public String toString() {
		StringBuffer sb = new StringBuffer();
		for (URI uri : getUriList())
			sb.append(uri+" -> ");
		sb.delete(sb.length()-4, sb.length()-1);
		return sb.toString();
	}
	
}

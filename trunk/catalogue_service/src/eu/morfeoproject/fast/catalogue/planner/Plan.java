package eu.morfeoproject.fast.catalogue.planner;

import java.util.ArrayList;

import org.ontoware.rdf2go.model.node.URI;

public class Plan {
	
	private ArrayList<URI> uriList = new ArrayList<URI>();
	
	public ArrayList<URI> getUriList() {
		return uriList;
	}
	
	// doesn't make a new copy of the URIs
	public Plan copy() {
		Plan newPlan = new Plan();
		for (URI uri : getUriList())
			newPlan.getUriList().add(uri);
		return newPlan;
	}
	
	public String toString() {
		StringBuffer sb = new StringBuffer();
		for (URI uri : getUriList())
			sb.append(uri+" -> ");
		sb.delete(sb.length()-4, sb.length()-1);
		return sb.toString();
	}

}

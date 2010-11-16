package eu.morfeoproject.fast.catalogue.planner;

import java.util.ArrayList;
import java.util.List;

import org.ontoware.rdf2go.model.node.URI;

public class Plan {
	
	private ArrayList<URI> uriList = new ArrayList<URI>();
	
	public ArrayList<URI> getUriList() {
		return uriList;
	}
	
	public ArrayList<URI> getUriList(List<URI> toExclude) {
		ArrayList<URI> newList = new ArrayList<URI>();
		for (URI uri : uriList)
			if (!toExclude.contains(uri))
				newList.add(uri);
		return newList;
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

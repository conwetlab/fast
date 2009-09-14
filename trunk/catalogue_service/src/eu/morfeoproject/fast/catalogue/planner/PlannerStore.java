package eu.morfeoproject.fast.catalogue.planner;

import java.util.ArrayList;
import java.util.List;

import org.ontoware.rdf2go.model.node.URI;

public class PlannerStore {

	private class Entry {
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
	}
	
	private List<Entry> data;
	
	public PlannerStore() {
		data = new ArrayList<Entry>();
	}
	
	public boolean add(Plan plan) {
		boolean added = true;
		for (int i = 0; i < plan.getUriList().size() - 1; i++)
			added = added || add(plan.getUriList().get(i), plan.getUriList().get(i+1));
		return added;
	}
	
	public boolean add(URI from, URI to) {
		if (from.equals(to))
			return false;
		if (contains(from, to))
			return false;
		return data.add(new Entry(from, to));
	}
	
	private boolean contains(URI from, URI to) {
		List<URI> toUris = getFrom(from);
		for (URI toUri : toUris)
			if (toUri.equals(to))
				return true;
		return false;
	}
	
	public void removeFrom(URI uri) {
		ArrayList<Entry> newData = new ArrayList<Entry>();
		for (Entry entry : this.data)
			if (!entry.getFrom().equals(uri))
				newData.add(entry);
		this.data = newData;
	}
	
	public void removeTo(URI uri) {
		ArrayList<Entry> newData = new ArrayList<Entry>();
		for (Entry entry : this.data)
			if (!entry.getTo().equals(uri))
				newData.add(entry);
		this.data = newData;
	}
	
	public List<URI> getFrom(URI uri) {
		ArrayList<URI> list = new ArrayList<URI>();
		for (Entry entry : this.data)
			if (entry.getFrom().equals(uri))
				list.add(entry.getTo());
		return list;
	}
	
	public List<URI> getTo(URI uri) {
		ArrayList<URI> list = new ArrayList<URI>();
		for (Entry entry : this.data)
			if (entry.getTo().equals(uri))
				list.add(entry.getFrom());
		return list;
	}
	
	
	
	
	
	public void dump() {
		System.out.println("Dumping planner...");
		for (Entry entry : data)
			System.out.println(entry.getFrom()+" => "+entry.getTo());
		System.out.println("..................");
	}
}

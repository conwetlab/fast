package eu.morfeoproject.fast.catalogue.planner;

import java.util.ArrayList;
import java.util.List;

import org.ontoware.rdf2go.model.node.URI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MemoryPlannerStore implements PlannerStore {

	final Logger logger = LoggerFactory.getLogger(MemoryPlannerStore.class);

	private List<Entry> data;
	
	public MemoryPlannerStore() {
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
	
	public void clear() {
		this.data.clear();
	}
	
	public boolean isEmpty() {
		return data.isEmpty();
	}
	
}

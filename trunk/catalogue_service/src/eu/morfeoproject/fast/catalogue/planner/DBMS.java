package eu.morfeoproject.fast.catalogue.planner;

import java.util.ArrayList;
import java.util.List;

import org.ontoware.rdf2go.model.node.URI;

public class DBMS {

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
	
	public DBMS() {
		data = new ArrayList<Entry>();
	}
	
	public boolean add(URI from, URI to) {
		return data.add(new Entry(from, to));
	}
	
	public void removeFrom(URI uri) {
		ArrayList<Entry> newData = new ArrayList<Entry>();
		for (Entry entry : this.data)
			if (!entry.getFrom().equals(uri))
				newData.add(entry);
	}
	
	public void removeTo(URI uri) {
		ArrayList<Entry> newData = new ArrayList<Entry>();
		for (Entry entry : this.data)
			if (!entry.getTo().equals(uri))
				newData.add(entry);
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
	
}

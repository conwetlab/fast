package eu.morfeoproject.fast.catalogue.model;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class Trigger implements Comparable<Trigger> {

	private URI uri;
	private Screen screen;
	private URI bbFrom;
	private String nameFrom;
	private URI bbTo;
	private String actionTo;

	public Trigger(Screen screen) {
		super();
		this.screen = screen;
	}
	
	public Trigger(Screen screen, URI uri) {
		this(screen);
		this.uri = uri;
	}
	
	public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

	public Screen getScreen() {
		return screen;
	}

	public void setScreen(Screen screen) {
		this.screen = screen;
	}

	public URI getBBFrom() {
		return bbFrom;
	}

	public void setBBFrom(URI bbFrom) {
		this.bbFrom = bbFrom;
	}

	public String getNameFrom() {
		return nameFrom;
	}

	public void setNameFrom(String nameFrom) {
		this.nameFrom = nameFrom;
	}

	public URI getBBTo() {
		return bbTo;
	}

	public void setBBTo(URI bbTo) {
		this.bbTo = bbTo;
	}

	public String getActionTo() {
		return actionTo;
	}

	public void setActionTo(String actionTo) {
		this.actionTo = actionTo;
	}

	@Override
	public boolean equals(Object other) {
		return other instanceof Trigger ? compareTo((Trigger) other) == 0 : false;
	}

	@Override
	public int compareTo(Trigger other) {
	    final int BEFORE = -1;
	    final int EQUAL = 0;
	    final int AFTER = 1;
	    
	    //this optimization is usually worthwhile, and can always be added
	    if (this == other) return EQUAL;

	    int comparison = EQUAL;
		if (this.uri == null && other.getUri() != null) return AFTER;
		if (this.uri != null && other.getUri() == null) return BEFORE;
		if (this.uri != null && other.getUri() != null) {
			comparison = this.uri.compareTo(other.getUri());
			if (comparison != EQUAL) return comparison;
		}	
//		if (this.screen == null && other.getScreen() != null) return AFTER;
//		if (this.screen != null && other.getScreen() == null) return BEFORE;
//		if (this.screen != null && other.getScreen() != null) {
//			comparison = this.screen.compareTo(other.getScreen());
//			if (comparison != EQUAL) return comparison;
//		}
		if (this.bbFrom == null && other.getBBFrom() != null) return AFTER;
		if (this.bbFrom != null && other.getBBFrom() == null) return BEFORE;
		if (this.bbFrom != null && other.getBBFrom() != null) {
			comparison = this.bbFrom.compareTo(other.getBBFrom());
			if (comparison != EQUAL) return comparison;
		}		
		if (this.nameFrom == null && other.getNameFrom() != null) return AFTER;
		if (this.nameFrom != null && other.getNameFrom() == null) return BEFORE;
		if (this.nameFrom != null && other.getNameFrom() != null) {
			comparison = this.nameFrom.compareTo(other.getNameFrom());
			if (comparison != EQUAL) return comparison;
		}
		if (this.bbTo == null && other.getBBTo() != null) return AFTER;
		if (this.bbTo != null && other.getBBTo() == null) return BEFORE;
		if (this.bbTo != null && other.getBBTo() != null) {
			comparison = this.bbTo.compareTo(other.getBBTo());
			if (comparison != EQUAL) return comparison;
		}		
		if (this.actionTo == null && other.getActionTo() != null) return AFTER;
		if (this.actionTo != null && other.getActionTo() == null) return BEFORE;
		if (this.actionTo != null && other.getActionTo() != null) {
			comparison = this.actionTo.compareTo(other.getActionTo());
			if (comparison != EQUAL) return comparison;
		}	
		
		return EQUAL;
	}

	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		JSONObject jsonFrom = new JSONObject();
		JSONObject jsonTo = new JSONObject();
		jsonFrom.put("buildingblock", this.bbFrom);
		jsonFrom.put("name", this.nameFrom);
		jsonTo.put("buildingblock", this.bbTo);
		jsonTo.put("action", this.actionTo);
		json.put("from", jsonFrom);
		json.put("to", jsonTo);
		return json;
	}

	public Model toRDF2GoModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		model.setNamespace("fgo", FGO.NS_FGO.toString());
		
		URI from = model.createURI((bbFrom == null ? screen.getUri() : bbFrom) + "/triggers/" + nameFrom);
		URI to = model.createURI((bbTo == null ? screen.getUri() : bbTo) + "/actions/" + actionTo);
		
		model.addStatement(uri, RDF.type, FGO.Trigger);
		model.addStatement(uri, FGO.from, from);
		model.addStatement(uri, FGO.to, to);
		
		return model;
	}
	
	@Override
	public String toString() {
		URI from = new URIImpl((bbFrom == null ? screen.getUri() : bbFrom) + "/triggers/" + nameFrom);
		URI to = new URIImpl((bbTo == null ? screen.getUri() : bbTo) + "/actions/" + actionTo);
		return from + " -> " + to;
	}

	public Trigger clone(Screen screen, URI uri) {
		Trigger trigger = new Trigger(screen, uri);
		trigger.setBBFrom(bbFrom);
		trigger.setNameFrom(nameFrom);
		trigger.setBBTo(bbTo);
		trigger.setActionTo(actionTo);
		return trigger;
	}

}
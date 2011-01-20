package eu.morfeoproject.fast.catalogue.model;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class Pipe implements Comparable<Pipe> {

	private URI uri;
	private URI screenURI;
	private URI bbFrom;
	private String conditionFrom;
	private URI bbTo;
	private String actionTo;
	private String conditionTo;

	public Pipe(URI screenURI) {
		super();
		this.screenURI = screenURI;
	}
	
	public Pipe(URI screenURI, URI uri) {
		this(screenURI);
		this.uri = uri;
	}
	
	public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

	public URI getScreenUri() {
		return screenURI;
	}

	public void setScreenUri(URI screenURI) {
		this.screenURI = screenURI;
	}

	public URI getBBFrom() {
		return bbFrom;
	}

	public void setBBFrom(URI bbFrom) {
		this.bbFrom = bbFrom;
	}

	public String getConditionFrom() {
		return conditionFrom;
	}

	public void setConditionFrom(String conditionFrom) {
		this.conditionFrom = conditionFrom;
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

	public String getConditionTo() {
		return conditionTo;
	}

	public void setConditionTo(String conditionTo) {
		this.conditionTo = conditionTo;
	}

	@Override
	public boolean equals(Object other) {
		return other instanceof Pipe ? compareTo((Pipe) other) == 0 : false;
	}
	
	@Override
	public int compareTo(Pipe other) {
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
		if (this.bbFrom == null && other.getBBFrom() != null) return AFTER;
		if (this.bbFrom != null && other.getBBFrom() == null) return BEFORE;
		if (this.bbFrom != null && other.getBBFrom() != null) {
			comparison = this.bbFrom.compareTo(other.getBBFrom());
			if (comparison != EQUAL) return comparison;
		}		
		if (this.conditionFrom == null && other.getConditionFrom() != null) return AFTER;
		if (this.conditionFrom != null && other.getConditionFrom() == null) return BEFORE;
		if (this.conditionFrom != null && other.getConditionFrom() != null) {
			comparison = this.conditionFrom.compareTo(other.getConditionFrom());
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
		if (this.conditionTo == null && other.getConditionTo() != null) return AFTER;
		if (this.conditionTo != null && other.getConditionTo() == null) return BEFORE;
		if (this.conditionTo != null && other.getConditionTo() != null) {
			comparison = this.conditionTo.compareTo(other.getConditionTo());
			if (comparison != EQUAL) return comparison;
		}
		
		return EQUAL;
	}
		
	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		JSONObject jsonFrom = new JSONObject();
		jsonFrom.put("buildingblock", this.bbFrom == null ? JSONObject.NULL : this.bbFrom);
		jsonFrom.put("condition", this.conditionFrom == null ? JSONObject.NULL : this.conditionFrom);
		json.put("from", jsonFrom);
		JSONObject jsonTo = new JSONObject();
		jsonTo.put("buildingblock", this.bbTo == null ? JSONObject.NULL : this.bbTo);
		jsonTo.put("condition", this.conditionTo == null ? JSONObject.NULL : this.conditionTo);
		jsonTo.put("action", this.actionTo == null ? JSONObject.NULL : this.actionTo);
		json.put("to", jsonTo);
		return json;
	}
	
	public Model toRDF2GoModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		model.setNamespace("fgo", FGO.NS_FGO.toString());
		
//		if (this.bbFrom == null || this.conditionFrom == null ||
//				this.bbTo == null || this.conditionTo == null) {
//			return model;
//		}
		
		URI from = model.createURI(bbFrom == null ? 
				screenURI + "/preconditions/" + conditionFrom : 
					bbFrom + "/postconditions/" + conditionFrom);
		URI to = model.createURI(bbTo == null ? 
				screenURI + "/postconditions/" + conditionTo : 
					bbTo + "/actions/" + actionTo + "/preconditions/" + conditionTo);
		
		model.addStatement(uri, RDF.type, FGO.Pipe);
		model.addStatement(uri, FGO.from, from);
		model.addStatement(uri, FGO.to, to);
		
		return model;
	}
	
	@Override
	public String toString() {
		URI from = new URIImpl(bbFrom == null ? 
				screenURI + "/preconditions/" + conditionFrom : 
					bbFrom + "/postconditions/" + conditionFrom);
		URI to = new URIImpl(bbTo == null ? 
				screenURI + "/postconditions/" + conditionTo : 
					bbTo + "/actions/" + actionTo + "/preconditions/" + conditionTo);
		return from + " -> " + to;
	}

	public Pipe clone(URI screenURI, URI uri) {
		Pipe pipe = new Pipe(screenURI, uri);
		pipe.setBBFrom(bbFrom);
		pipe.setConditionFrom(conditionFrom);
		pipe.setBBTo(bbTo);
		pipe.setActionTo(actionTo);
		pipe.setConditionTo(conditionTo);
		return pipe;
	}
	
}
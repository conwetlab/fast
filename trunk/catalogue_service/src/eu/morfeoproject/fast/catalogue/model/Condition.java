package eu.morfeoproject.fast.catalogue.model;

import java.util.HashMap;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;

public class Condition {
	
	private URI uri;
	private String patternString;
	private boolean positive;
	private Map<String, String> labels;
	private String id;
	
	public Condition() {
		super();
		this.positive = true; // by default a Condition will be positive
	}
    
	public Condition(URI uri) {
		this();
		this.uri = uri;
	}
    
	public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

	public String getPatternString() {
		return patternString;
	}
	
	public void setPatternString(String patternString) {
		this.patternString = patternString;
	}
	
	public boolean isPositive() {
		return positive;
	}

	public void setPositive(boolean positive) {
		this.positive = positive;
	}

	public Map<String, String> getLabels() {
		if (labels == null)
			labels = new HashMap<String, String>();
		return labels;
	}

	public void setLabels(Map<String, String> labels) {
		this.labels = labels;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	@Override
	public String toString() {
		return patternString;
	}
	
	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		if (getPatternString() == null)
			json.put("pattern", JSONObject.NULL);
		else
			json.put("pattern", getPatternString());
		json.put("positive", isPositive());
		if (getLabels() == null || getLabels().isEmpty())
			json.put("label", JSONObject.NULL);
		else {
			JSONObject jsonLabels = new JSONObject();
			for (String key : getLabels().keySet())
				jsonLabels.put(key, getLabels().get(key));
			json.put("label", jsonLabels);
		}
		if (getId() != null) // optional
			json.put("id", getId());
		return json;
	}
	
}

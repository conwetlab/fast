package eu.morfeoproject.fast.catalogue.buildingblocks;

import java.util.HashMap;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;

public class Condition {
	
	private String patternString;
	private boolean positive;
	private Map<String, String> labels;
	private String id;
	
	public Condition() {
		super();
		this.positive = true; // by default a Condition will be positive
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

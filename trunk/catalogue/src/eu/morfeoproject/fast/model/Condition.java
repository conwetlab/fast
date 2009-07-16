package eu.morfeoproject.fast.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.vocabulary.RDFS;

import eu.morfeoproject.fast.vocabulary.DC;
import eu.morfeoproject.fast.vocabulary.FGO;

public class Condition {
	
	private String patternString;
	private List<Statement> pattern;
	private String scope;
	private Map<String, String> labels;
	
	public String getPatternString() {
		return patternString;
	}
	
	public void setPatternString(String patternString) {
		this.patternString = patternString;
	}
	
	public List<Statement> getPattern() {
		if (pattern == null)
			pattern = new ArrayList<Statement>();
		return pattern;
	}

	public void setPattern(List<Statement> pattern) {
		this.pattern = pattern;
	}
	
	
	public String getScope() {
		return scope;
	}

	public void setScope(String scope) {
		this.scope = scope;
	}

	public Map<String, String> getLabels() {
		if (labels == null)
			labels = new HashMap<String, String>();
		return labels;
	}

	public void setLabels(Map<String, String> labels) {
		this.labels = labels;
	}
	
	public String toString() {
		return patternString;
	}
	
	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		try {
			if (getPatternString() == null)
				json.put("pattern", JSONObject.NULL);
			else
				json.put("pattern", getPatternString());
			if (getScope() == null)
				json.put("scope", JSONObject.NULL);
			else
				json.put("scope", getScope());
			if (getLabels() == null || getLabels().isEmpty())
				json.put("label", JSONObject.NULL);
			else {
				JSONObject jsonLabels = new JSONObject();
				for (String key : getLabels().keySet())
					jsonLabels.put(key, getLabels().get(key));
				json.put("label", jsonLabels);
			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json;
	}
	
}

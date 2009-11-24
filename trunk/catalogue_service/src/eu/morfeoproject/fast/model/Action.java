package eu.morfeoproject.fast.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;

public class Action {

	private String name;
	private List<Condition> preconditions;
	private Map<String, URI> uses;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<Condition> getPreconditions() {
		if (preconditions == null)
			preconditions = new ArrayList<Condition>();
		return preconditions;
	}

	public void setPreconditions(List<Condition> preconditions) {
		this.preconditions = preconditions;
	}

	
	public Map<String, URI> getUses() {
		if (uses == null)
			uses = new HashMap<String, URI>();
		return uses;
	}

	public void setUses(Map<String, URI> uses) {
		this.uses = uses;
	}

	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		if (getName() == null)
			json.put("name", JSONObject.NULL);
		else
			json.put("name", getName());
		JSONArray preArray = new JSONArray();
		for (Condition condition : getPreconditions())
			preArray.put(condition.toJSON());
		json.put("preconditions", preArray);
		// uses
		JSONArray usesArray = new JSONArray();
		for (String key : getUses().keySet()) {
			JSONObject jsonUse = new JSONObject();
			jsonUse.put("id", key);
			jsonUse.put("uri", getUses().get(key));
			usesArray.put(jsonUse);
		}
		json.put("uses", usesArray);
		return json;
	}

}

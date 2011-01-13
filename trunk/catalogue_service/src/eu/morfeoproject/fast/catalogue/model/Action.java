package eu.morfeoproject.fast.catalogue.model;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;

public class Action {

	private URI uri;
	private String name;
	private List<Condition> preconditions;
	private List<URI> uses;
	
	public Action() {
		super();
		this.preconditions = new ArrayList<Condition>();
		this.uses = new ArrayList<URI>();
	}

	public Action(URI uri) {
		this();
		this.uri = uri;
	}

	public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<Condition> getPreconditions() {
		return preconditions;
	}

	public void setPreconditions(List<Condition> preconditions) {
		this.preconditions = preconditions;
	}

	
	public List<URI> getUses() {
		return uses;
	}

	public void setUses(List<URI> uses) {
		this.uses = uses;
	}

	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		json.put("name", getName() == null ? JSONObject.NULL : getName());
		// preconditions
		JSONArray preArray = new JSONArray();
		for (Condition condition : getPreconditions()) {
			preArray.put(condition.toJSON());
		}
		json.put("preconditions", preArray);
		// uses
		JSONArray usesArray = new JSONArray();
		for (URI useUri : getUses()) {
			usesArray.put(useUri);
		}
		json.put("uses", usesArray);
		return json;
	}

}
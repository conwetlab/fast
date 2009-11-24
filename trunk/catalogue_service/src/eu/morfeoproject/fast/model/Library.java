package eu.morfeoproject.fast.model;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;

public class Library {

	private String language;
	private URI source;
	
	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public URI getSource() {
		return source;
	}

	public void setSource(URI source) {
		this.source = source;
	}

	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		if (getLanguage() == null)
			json.put("language", JSONObject.NULL);
		else
			json.put("language", getLanguage());
		if (getSource() == null)
			json.put("source", JSONObject.NULL);
		else
			json.put("source", getSource().toString());
		return json;
	}

}

package eu.morfeoproject.fast.model;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;

public class DomainContext {
	private List<String> tags;
	private URI user;
	
	public List<String> getTags() {
		if (tags == null)
			tags = new ArrayList<String>();
		return tags;
	}

	public void setTags(List<String> tags) {
		this.tags = tags;
	}

	public URI getUser() {
		return user;
	}

	public void setUser(URI user) {
		this.user = user;
	}
	
	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		try {
			JSONArray tags = new JSONArray();
			for (String tag : getTags())
				tags.put(tag);
			json.put("tags", tags);
			if (getUser() == null)
				json.put("user", JSONObject.NULL);
			else
				json.put("user", getUser().toString());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json;
	}
}
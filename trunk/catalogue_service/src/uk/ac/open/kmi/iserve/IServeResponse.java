package uk.ac.open.kmi.iserve;

import java.util.Collection;
import java.util.HashMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class IServeResponse {

	HashMap<String, Object> data;
	
	public IServeResponse() {
		this.data = new HashMap<String, Object>();
	}

	public Object get(String key) {
		return this.data.get(key);
	}
	
	public Collection getCollection(String key) {
		return (Collection) this.data.get(key);
	}
	
	public void put(String key, Object value) {
		this.data.put(key, value);
	}
	
	public String toString() {
		StringBuilder builder = new StringBuilder();
		for (String key : this.data.keySet()) {
			builder.append(key+"="+this.data.get(key)+", ");
		}
		builder.deleteCharAt(builder.length() - 1);
		builder.deleteCharAt(builder.length() - 1);
		return builder.toString();
	}
	
	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		for (String key : this.data.keySet()) {
			Object value = this.data.get(key);
			if (value instanceof Collection<?>) {
				json.put(key, new JSONArray((Collection<?>) value));
			} else {
				json.put(key, value);
			}
		}
		return json;
	}
	
}

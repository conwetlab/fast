package uk.ac.open.kmi.iserve;

import java.util.HashMap;

public class IServeResponse {

	HashMap<String, Object> data;
	
	public IServeResponse() {
		this.data = new HashMap<String, Object>();
	}

	public Object get(String key) {
		return this.data.get(key);
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
	
}

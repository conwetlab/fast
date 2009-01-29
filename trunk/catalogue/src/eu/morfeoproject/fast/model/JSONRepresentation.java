package eu.morfeoproject.fast.model;

import org.json.JSONObject;

public class JSONRepresentation extends Representation {
	
	@Override
	public String toString() {
		return new JSONObject(o).toString();
	}
	
}

package eu.morfeoproject.fast.catalogue.model;

import org.json.JSONException;
import org.json.JSONObject;

public class Pipe {

	private String idBBFrom;
	private String idConditionFrom;
	private String idBBTo;
	private String idConditionTo;
	private String idActionTo;

	public String getIdBBFrom() {
		return idBBFrom;
	}

	public void setIdBBFrom(String idBBFrom) {
		this.idBBFrom = idBBFrom;
	}

	public String getIdConditionFrom() {
		return idConditionFrom;
	}

	public void setIdConditionFrom(String idConditionFrom) {
		this.idConditionFrom = idConditionFrom;
	}

	public String getIdBBTo() {
		return idBBTo;
	}

	public void setIdBBTo(String idBBTo) {
		this.idBBTo = idBBTo;
	}

	public String getIdConditionTo() {
		return idConditionTo;
	}

	public void setIdConditionTo(String idConditionTo) {
		this.idConditionTo = idConditionTo;
	}

	public String getIdActionTo() {
		return idActionTo;
	}

	public void setIdActionTo(String idActionTo) {
		this.idActionTo = idActionTo;
	}

	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		JSONObject jsonFrom = new JSONObject();
		JSONObject jsonTo = new JSONObject();
		jsonFrom.put("buildingblock", idBBFrom == null ? JSONObject.NULL : idBBFrom);
		jsonFrom.put("condition", idConditionFrom == null ? JSONObject.NULL : idConditionFrom);
		jsonTo.put("buildingblock", idBBTo == null ? JSONObject.NULL : idBBTo);
		jsonTo.put("condition", idConditionTo == null ? JSONObject.NULL : idConditionTo);
		jsonTo.put("action", idActionTo == null ? JSONObject.NULL : idActionTo);
		json.put("from", jsonFrom);
		json.put("to", jsonTo);
		return json;
	}

}

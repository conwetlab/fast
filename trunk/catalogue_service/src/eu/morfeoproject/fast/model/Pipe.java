package eu.morfeoproject.fast.model;

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

	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		JSONObject jsonFrom = new JSONObject();
		JSONObject jsonTo = new JSONObject();
		try {
			jsonFrom.put("buildingblock", idBBFrom);
			jsonFrom.put("condition", idConditionFrom);
			jsonTo.put("buildingblock", idBBTo);
			jsonTo.put("condition", idConditionTo);
			jsonTo.put("action", idActionTo);
			json.put("from", jsonFrom);
			json.put("to", jsonTo);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json;
	}

}

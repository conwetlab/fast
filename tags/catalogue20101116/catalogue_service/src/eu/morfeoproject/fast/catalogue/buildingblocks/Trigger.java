package eu.morfeoproject.fast.catalogue.buildingblocks;

import org.json.JSONException;
import org.json.JSONObject;

public class Trigger {

	private String idBBFrom;
	private String nameFrom;
	private String idBBTo;
	private String idActionTo;

	public String getIdBBFrom() {
		return idBBFrom;
	}

	public void setIdBBFrom(String idBBFrom) {
		this.idBBFrom = idBBFrom;
	}

	public String getNameFrom() {
		return nameFrom;
	}

	public void setNameFrom(String nameFrom) {
		this.nameFrom = nameFrom;
	}

	public String getIdBBTo() {
		return idBBTo;
	}

	public void setIdBBTo(String idBBTo) {
		this.idBBTo = idBBTo;
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
		jsonFrom.put("buildingblock", idBBFrom);
		jsonFrom.put("name", nameFrom);
		jsonTo.put("buildingblock", idBBTo);
		jsonTo.put("action", idActionTo);
		json.put("from", jsonFrom);
		json.put("to", jsonTo);
		return json;
	}

}

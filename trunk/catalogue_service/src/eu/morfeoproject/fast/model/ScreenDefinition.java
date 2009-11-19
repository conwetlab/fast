package eu.morfeoproject.fast.model;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;

public class ScreenDefinition {

	private Map<String, URI> buildingBlocks;
	private List<Pipe> pipes;
	private List<Trigger> triggers;
	
	public Map<String, URI> getBuildingBlocks() {
		if (buildingBlocks == null)
			buildingBlocks = new HashMap<String, URI>();
		return buildingBlocks;
	}

	public void setBuildingBlocks(Map<String, URI> buildingBlocks) {
		this.buildingBlocks = buildingBlocks;
	}

	public List<Pipe> getPipes() {
		if (pipes == null)
			pipes = new LinkedList<Pipe>();
		return pipes;
	}

	public void setPipes(List<Pipe> pipes) {
		this.pipes = pipes;
	}
	
	public List<Trigger> getTriggers() {
		if (triggers == null)
			triggers = new LinkedList<Trigger>();
		return triggers;
	}

	public void setTrigger(List<Trigger> triggers) {
		this.triggers = triggers;
	}
	
	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		try {
			// building blocks
			JSONArray bbArray = new JSONArray();
			for (String id : getBuildingBlocks().keySet()) {
				JSONObject bb = new JSONObject();
				bb.put("id", id);
				bb.put("uri", getBuildingBlocks().get(id));
				bbArray.put(bb);
			}
			json.put("buildingblocks", bbArray);
			// pipes
			JSONArray pipeArray = new JSONArray();
			for (Pipe pipe : getPipes()) {
				JSONObject jsonPipe = new JSONObject();
				JSONObject pipeFrom = new JSONObject();
				JSONObject pipeTo = new JSONObject();
				pipeFrom.put("buildingblock", pipe.getIdBBFrom());
				pipeFrom.put("condition", pipe.getIdConditionFrom());
				pipeTo.put("buildingblock", pipe.getIdBBTo());
				pipeTo.put("condition", pipe.getIdConditionTo());
				pipeTo.put("action", pipe.getIdActionTo());
				jsonPipe.put("from", pipeFrom);
				jsonPipe.put("to", pipeTo);
				pipeArray.put(jsonPipe);
			}
			json.put("pipes", pipeArray);
			// triggers
			JSONArray triggerArray = new JSONArray();
			for (Trigger trigger : getTriggers()) {
				JSONObject jsonTr = new JSONObject();
				JSONObject trFrom = new JSONObject();
				JSONObject trTo = new JSONObject();
				trFrom.put("buildingblock", trigger.getIdBBFrom());
				trFrom.put("name", trigger.getNameFrom());
				trTo.put("buildingblock", trigger.getIdBBTo());
				trTo.put("action", trigger.getIdActionTo());
				jsonTr.put("from", trFrom);
				jsonTr.put("to", trTo);
				pipeArray.put(jsonTr);
			}
			json.put("triggers", triggerArray);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json;
	}

}

/**
 * Copyright (c) 2008-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
package eu.morfeoproject.fast.catalogue.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;

public class Action {

	private URI uri;
	private String name;
	private List<Condition> preconditions;
	private Map<String, URI> uses;
	
	public Action() {
		super();
		this.preconditions = new ArrayList<Condition>();
		this.uses = new HashMap<String, URI>();
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

	
	public Map<String, URI> getUses() {
		return uses;
	}

	public void setUses(Map<String, URI> uses) {
		this.uses = uses;
	}

	//FIXME compare if everything an action contains, is equal to the other action
	@Override
	public boolean equals(Object other) {
		Action action = (Action) other;
		return action.getName().equals(this.name)
			&& action.getUri().equals(this.uri)
			&& action.getPreconditions().size() == this.preconditions.size()
			&& action.getUses().size() == this.uses.size();
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
		for (String id : getUses().keySet()) {
			JSONObject useObject = new JSONObject();
			useObject.put("id", id);
			useObject.put("uri", getUses().get(id));
			usesArray.put(useObject);
		}
		json.put("uses", usesArray);
		return json;
	}

}
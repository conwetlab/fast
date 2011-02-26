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

import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class Screen extends WithConditions {
	
    private URI code;
	private List<URI> buildingBlocks;
	private List<Pipe> pipes;
	private List<Trigger> triggers;
	
	public Screen(URI uri) {
		super(uri);
		this.buildingBlocks = new LinkedList<URI>();
		this.pipes = new LinkedList<Pipe>();
		this.triggers = new LinkedList<Trigger>();
	}
	
	public URI getCode() {
		return code;
	}

	public void setCode(URI code) {
		this.code = code;
	}

	public List<URI> getBuildingBlocks() {
		return buildingBlocks;
	}

	public void setBuildingBlocks(List<URI> buildingBlocks) {
		this.buildingBlocks = buildingBlocks;
	}

	public List<Pipe> getPipes() {
		return pipes;
	}

	public void setPipes(List<Pipe> pipes) {
		this.pipes = pipes;
	}
	
	public List<Trigger> getTriggers() {
		return triggers;
	}

	public void setTriggers(List<Trigger> triggers) {
		this.triggers = triggers;
	}

	/**
	 * Transforms a Screen to a JSON object (key: value)
	 * @return a JSON object containing all info about the screen
	 * @throws JSONException 
	 */
	@Override
	public JSONObject toJSON() throws JSONException {
		JSONObject json = super.toJSON();
		
		// a screen can be defined by its code, or a set of building blocks, pipes and 
		// triggers; but not both
		if (getCode() != null) {
			json.put("code", getCode().toString());
		} else {
			JSONObject definition = new JSONObject();

			// building blocks
			JSONArray bbArray = new JSONArray();
			for (URI uri : getBuildingBlocks()) bbArray.put(uri);
			definition.put("buildingblocks", bbArray);
			
			// pipes
			JSONArray pipeArray = new JSONArray();
			for (Pipe pipe : getPipes()) pipeArray.put(pipe.toJSON());
			definition.put("pipes", pipeArray);
			
			// triggers
			JSONArray triggerArray = new JSONArray();
			for (Trigger trigger : getTriggers()) triggerArray.put(trigger.toJSON());
			definition.put("triggers", triggerArray);

			json.put("definition", definition);
		}
		return json;
	}
	
	@Override
	public Model toRDF2GoModel() {
		Model model = super.toRDF2GoModel();
		
		URI screenUri = getUri();
		
		model.addStatement(screenUri, RDF.type, FGO.Screen);
		
		/* 
		 * 'code' and 'definition' define the behaviour of the building block.
		 * only one of them should be declared, but it's up to the application
		 * to decide whether code or the definition will be used, here both
		 * elements are supported and retrieved.
		 */
		
		//--- CODE ---//
		if (getCode() != null) {
			model.addStatement(screenUri, FGO.hasCode, this.getCode());
		}
		
		//--- DEFINITION ---//
		// building blocks
		for (URI uri : getBuildingBlocks()) {
			model.addStatement(screenUri, FGO.contains, uri);
		}
		// pipes
		for (Pipe pipe : getPipes()) {
			URI pUri = pipe.getUri();
			if (pUri == null) {
				pUri = model.createURI(screenUri+"/pipes/"+UUID.randomUUID().toString());
				pipe.setUri(pUri);
			}
			model.addStatement(screenUri, FGO.contains, pUri);
			model.addModel(pipe.toRDF2GoModel());
		}
		// triggers
		for (Trigger trigger : getTriggers()) {
			URI tUri = trigger.getUri();
			if (tUri == null) {
				tUri = model.createURI(screenUri+"/triggers/"+UUID.randomUUID().toString());
				trigger.setUri(tUri);
			}
			model.addStatement(screenUri, FGO.contains, tUri);
			model.addModel(trigger.toRDF2GoModel());
		}
		
		return model;
	}

}
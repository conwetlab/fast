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
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class ScreenFlow extends WithConditions {
	
	private List<URI> buildingBlockList;
	
	public ScreenFlow(URI uri) {
		super(uri);
	}

	public List<URI> getBuildingBlocks() {
		if (buildingBlockList == null)
			buildingBlockList = new ArrayList<URI>();
		return buildingBlockList;
	}

	public void setBuildingBlockList(List<URI> resources) {
		this.buildingBlockList = resources;
	}
	
	public JSONObject toJSON() throws JSONException {
		JSONObject json = super.toJSON();
		JSONArray list = new JSONArray();
		for (URI r : getBuildingBlocks())
			list.put(r);
		json.put("contains", list);
		return json;
	}
	
	public Model toRDF2GoModel() {
		Model model = super.toRDF2GoModel();		
		
		URI sfUri = this.getUri();
		model.addStatement(sfUri, RDF.type, FGO.ScreenFlow);
		for (URI r : this.getBuildingBlocks())
			model.addStatement(sfUri, FGO.contains, r);
		
		return model;
	}

}

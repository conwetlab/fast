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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.ontoware.rdf2go.vocabulary.XSD;

import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public abstract class WithConditions extends BuildingBlock {

	private List<Condition> preconditions;
	private List<Condition> postconditions;

	protected WithConditions(URI uri) {
		super(uri);
		this.preconditions = new LinkedList<Condition>();
		this.postconditions = new LinkedList<Condition>();
	}

	public List<Condition> getPreconditions() {
		return preconditions;
	}

	public void setPreconditions(List<Condition> preconditions) {
		this.preconditions = preconditions;
	}

	public List<Condition> getPostconditions() {
		return postconditions;
	}

	public void setPostconditions(List<Condition> postconditions) {
		this.postconditions = postconditions;
	}
	
	@Override
	public JSONObject toJSON() throws JSONException {
		JSONObject json = super.toJSON();

		JSONArray preconditions = new JSONArray();
		for (Condition condition : getPreconditions()) {
			preconditions.put(condition.toJSON());
		}
		json.put("preconditions", preconditions);
	
		JSONArray postconditions = new JSONArray();
		for (Condition condition : getPostconditions()) {
			postconditions.put(condition.toJSON());
		}
		json.put("postconditions", postconditions);

		return json;
	}
	
	@Override
	public Model toRDF2GoModel() {
		Model model = super.toRDF2GoModel();

		URI bbUri = this.getUri();
		for (Condition con : getPreconditions()) {
			URI conUri = con.getUri();
			// FIXME: is ok to do this here? rethink!!!
			if (conUri == null) {
				conUri = model.createURI(bbUri + "/preconditions/" + con.getId());
				con.setUri(conUri);
			}
			model.addStatement(bbUri, FGO.hasPreCondition, con.getUri());
			model.addStatement(con.getUri(), FGO.hasPatternString, model.createDatatypeLiteral(con.getPatternString(), XSD._string));
			model.addStatement(con.getUri(), FGO.isPositive, model.createDatatypeLiteral(new Boolean(con.isPositive()).toString(), XSD._boolean));
			for (String key : con.getLabels().keySet()) {
				model.addStatement(con.getUri(), RDFS.label, model.createLanguageTagLiteral(con.getLabels().get(key), key));
			}
		}
		for (Condition con : getPostconditions()) {
			URI conUri = con.getUri();
			// FIXME: is ok to do this here? rethink!!!
			if (conUri == null) {
				conUri = model.createURI(bbUri + "/preconditions/" + con.getId());
				con.setUri(conUri);
			}
			model.addStatement(bbUri, FGO.hasPostCondition, con.getUri());
			model.addStatement(con.getUri(), FGO.hasPatternString, model.createDatatypeLiteral(con.getPatternString(), XSD._string));
			model.addStatement(con.getUri(), FGO.isPositive, model.createDatatypeLiteral(new Boolean(con.isPositive()).toString(), XSD._boolean));
			for (String key : con.getLabels().keySet()) {
				model.addStatement(con.getUri(), RDFS.label, model.createLanguageTagLiteral(con.getLabels().get(key), key));
			}
		}
		
		return model;
	}

}
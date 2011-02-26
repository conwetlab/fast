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

import org.commontag.CTag;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.ontoware.rdf2go.vocabulary.XSD;

import eu.morfeoproject.fast.catalogue.vocabulary.CTAG;
import eu.morfeoproject.fast.catalogue.vocabulary.DC;

public class Concept {
	
	private URI uri;
	private URI subClassOf;
	private Map<String, String> labels;
	private Map<String, String> descriptions;
    private List<CTag> tags;
    private List<Property> attributes;
	
	public Concept() {
		this(null);
	}
	
	public Concept(URI uri) {
		super();
		this.uri = uri;
		this.labels = new HashMap<String, String>();
		this.descriptions = new HashMap<String, String>();
		this.tags = new ArrayList<CTag>();
		this.attributes = new ArrayList<Property>();
	}
	
    public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

    public URI getSubClassOf() {
		return subClassOf;
	}

	public void setSubClassOf(URI subClassOf) {
		this.subClassOf = subClassOf;
	}

	public Map<String, String> getLabels() {
		return labels;
	}

	public void setLabels(Map<String, String> labels) {
		this.labels = labels;
	}

	public Map<String, String> getDescriptions() {
		return descriptions;
	}

	public void setDescriptions(Map<String, String> descriptions) {
		this.descriptions = descriptions;
	}
	
	public List<CTag> getTags() {
		return tags;
	}

	public void setTags(List<CTag> tags) {
		this.tags = tags;
	}
	
	public List<Property> getAttributes() {
		return attributes;
	}

	public void setAttributes(List<Property> attributes) {
		this.attributes = attributes;
	}

	/**
	 * Compare if two resources have the same URI
	 * @param r the resource to compare with
	 * @return true if their URIs are the same
	 */
	public boolean equals(BuildingBlock r) {
		return r.getUri().equals(getUri());
	}
	
	/**
	 * Returns the URI of the resource
	 * @return string representation of the URI
	 */
	@Override
	public String toString() {
		return getUri().toString();
	}
	
	/**
	 * Transforms a Resource to a JSON object (key: value)
	 * @return a JSON object containing all info about the resource
	 */
	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();

		if (getUri() == null)
			json.put("uri", JSONObject.NULL);
		else
			json.put("uri", getUri().toString());
		if (getSubClassOf() != null)
			json.put("subClassOf", getSubClassOf().toString());
		if (getLabels() == null)
			json.put("label", JSONObject.NULL);
		else if (!getLabels().isEmpty()) {
			JSONObject jsonLabels = new JSONObject();
			for (String key : getLabels().keySet())
				jsonLabels.put(key, getLabels().get(key));
			json.put("label", jsonLabels);
		}
		if (getDescriptions() == null)
			json.put("description", JSONObject.NULL);
		else if (!getDescriptions().isEmpty()) {
			JSONObject jsonDescriptions = new JSONObject();
			for (String key : getDescriptions().keySet())
				jsonDescriptions.put(key, getDescriptions().get(key));
			json.put("description", jsonDescriptions);
		}
		if (getTags() == null)
			json.put("tags", JSONObject.NULL);
		else {
			JSONArray jsonTags = new JSONArray();
			for (CTag tag : getTags())
				jsonTags.put(tag.toJSON());
			json.put("tags", jsonTags);
		}
		if (getAttributes() == null)
			json.put("attributes", JSONObject.NULL);
		else {
			JSONArray jsonAttributes = new JSONArray();
			for (Property att : getAttributes())
				jsonAttributes.put(att.toJSON());
			json.put("attributes", jsonAttributes);
		}

		return json;
	}
	
	public Model toRDF2GoModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		model.setNamespace("dc", DC.NS_DC.toString());
		model.setNamespace("ctag", CTAG.NS_CTAG.toString());
		
		URI cUri = this.getUri();
		model.addStatement(cUri, RDF.type, RDFS.Class);
		if (this.getSubClassOf() != null)
			model.addStatement(cUri, RDFS.subClassOf, this.getSubClassOf());
		for (String key : this.getLabels().keySet())
			model.addStatement(cUri, RDFS.label, model.createLanguageTagLiteral(this.getLabels().get(key), key));
		for (String key : this.getDescriptions().keySet())
			model.addStatement(cUri, DC.description, model.createLanguageTagLiteral(this.getDescriptions().get(key), key));
		for (CTag tag : this.getTags()) {
			BlankNode bnTag = model.createBlankNode();
			model.addStatement(cUri, CTAG.tagged, bnTag);
			model.addStatement(bnTag, RDF.type, CTAG.Tag);
			if (tag.getMeans() != null)
				model.addStatement(bnTag, CTAG.means, tag.getMeans());
			for (String lang : tag.getLabels().keySet())
				model.addStatement(bnTag, CTAG.label, model.createLanguageTagLiteral(tag.getLabels().get(lang), lang));
			if (tag.getTaggingDate() != null)
				model.addStatement(bnTag, CTAG.taggingDate, model.createDatatypeLiteral(tag.getTaggingDate().toString(), XSD._date));
		}
		for (Property att : this.getAttributes()) {
			model.addModel(att.toRDF2GoModel());
		}
		
		return model;
	}

}
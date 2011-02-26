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

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;

public class Property {
	
	private URI uri;
	private URI subPropertyOf;
	private URI type;
	private Concept concept;
	
	public Property() {
		this(null, null, null);
	}
	
	public Property(URI uri, URI type, Concept concept) {
		super();
		this.uri = uri;
		this.type = type;
		this.concept = concept;
	}
	
    public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

    public URI getSubPropertyOf() {
		return subPropertyOf;
	}

	public void setSubPropertyOf(URI subPropertyOf) {
		this.subPropertyOf = subPropertyOf;
	}

    public URI getType() {
		return type;
	}

	public void setType(URI type) {
		this.type = type;
	}

    public Concept getConcept() {
		return concept;
	}

	public void setConcept(Concept concept) {
		this.concept = concept;
	}
	
	/**
	 * Compare if two resources have the same URI
	 * @param o the resource to compare with
	 * @return true if their URIs are the same
	 */
	@Override
	public boolean equals(Object o) {
		return ((Property) o).getUri().equals(getUri());
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

		json.put("uri", getUri() == null ? JSONObject.NULL : getUri().toString());
		if (this.getType() != null)
			json.put("type", getType().toString());
		if (getSubPropertyOf() != null)
			json.put("subPropertyOf", getSubPropertyOf().toString());

		return json;
	}
	
	public Model toRDF2GoModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		
		URI uri = this.getUri();
		model.addStatement(uri, RDF.type, RDF.Property);
		if (this.getType() != null)
			model.addStatement(uri, RDFS.domain, this.getType());
		model.addStatement(uri, RDFS.range, this.getConcept().getUri());
		if (this.getSubPropertyOf() != null)
			model.addStatement(uri, RDFS.subPropertyOf, this.getSubPropertyOf());
		
		return model;
	}

}
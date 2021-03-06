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
import org.ontoware.rdf2go.model.node.URI;

public class PropertyValue {
	
	private URI uri;
	private String type;
	private String lang;
	private URI datatype;
	private String value;

	public PropertyValue(URI uri, String type, String value) {
		this(uri, type, value, null, null);
	}
	
	public PropertyValue(URI uri, String type, String value, String lang, URI datatype) {
		this.uri = uri;
		this.type = type;
		this.value = value;
		this.lang = lang;
		this.datatype = datatype;
	}
	
	public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getLang() {
		return lang;
	}

	public void setLang(String lang) {
		this.lang = lang;
	}

	public URI getDatatype() {
		return datatype;
	}

	public void setDatatype(URI datatype) {
		this.datatype = datatype;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	/**
	 * Compare if two resources have the same URI
	 * @param o the resource to compare with
	 * @return true if their URIs are the same
	 */
	@Override
	public boolean equals(Object o) {
		if (o == null) return false;
		PropertyValue av = (PropertyValue) o;
		return this.getUri().equals(av.getUri()) 
				&& this.getUri().equals(av.getValue());
	}
	
	@Override
	public String toString() {
		return this.getUri().toString() + " [type: " + this.getValue().toString() + "]";
	}
	
	/**
	 * Transforms a Resource to a JSON object (key: value)
	 * @return a JSON object containing all info about the resource
	 */
	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();

		json.put("uri", this.getUri() == null ? JSONObject.NULL : this.getUri().toString());
		json.put("type", this.getType() == null ? JSONObject.NULL : this.getType());
		if (this.getLang() != null) json.put("lang", this.getLang());
		if (this.getDatatype() != null) json.put("datatype", this.getDatatype());
		json.put("value", this.getValue() == null ? JSONObject.NULL : this.getValue());

		return json;
	}
	
}
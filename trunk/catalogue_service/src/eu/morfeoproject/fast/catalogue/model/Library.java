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

public class Library {

	private String language;
	private URI source;
	
	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public URI getSource() {
		return source;
	}

	public void setSource(URI source) {
		this.source = source;
	}
	
	@Override
	public boolean equals(Object other) {
		Library library = (Library) other;
		return library.getLanguage().equals(this.language)
			&& library.getSource().equals(this.source);
	}

	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		if (getLanguage() == null)
			json.put("language", JSONObject.NULL);
		else
			json.put("language", getLanguage());
		if (getSource() == null)
			json.put("source", JSONObject.NULL);
		else
			json.put("source", getSource().toString());
		return json;
	}

}

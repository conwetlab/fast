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
package eu.morfeoproject.fast.catalogue.builder;

import java.io.IOException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.vocabulary.XSD;

import eu.morfeoproject.fast.catalogue.BadFormatException;
import eu.morfeoproject.fast.catalogue.model.Sample;
import eu.morfeoproject.fast.catalogue.model.factory.BuildingBlockFactory;

public class SampleJSONBuilder {

	protected static final Log log = LogFactory.getLog(SampleJSONBuilder.class);

	public static Sample buildSample(JSONObject json) throws JSONException, IOException, BadFormatException {
		Sample sample = BuildingBlockFactory.createSample();
		parseSample(sample, json);
		return sample;
	}
	
	public static Sample buildSample(JSONObject json, URI uri) throws JSONException, IOException, BadFormatException {
		Sample sample = BuildingBlockFactory.createSample(uri);
		parseSample(sample, json);
		return sample;
	}
	
	private static Sample parseSample(Sample sample, JSONObject json) throws JSONException, IOException, BadFormatException {
		if (!json.has("type")) return null;
		sample.setType(new URIImpl(json.getString("type")));
		if (json.has("properties")) {
			JSONArray jsonProps = json.getJSONArray("properties");
			for (int idx = 0; idx < jsonProps.length(); idx++) {
				JSONObject o = jsonProps.getJSONObject(idx);
				URI uri = new URIImpl(o.get("uri").toString());
				String type = o.getString("type");
				if (!type.equals("uri") && !type.equals("literal"))
					throw new BadFormatException("Type must be: 'uri' or 'literal'");
				
				String lang = o.optString("lang", null);
				String datatype = o.optString("datatype", null);
				URI dtURI = datatype == null ? null : new URIImpl(XSD.XSD_NS+datatype);
				String value = o.getString("value");
				sample.addPropertyValue(uri, type, value, lang, dtURI);
			}
		}
		return sample;
	}

}

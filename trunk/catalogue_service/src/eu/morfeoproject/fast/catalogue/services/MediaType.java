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
package eu.morfeoproject.fast.catalogue.services;

public class MediaType {

	public static final String APPLICATION_JSON = "application/json";
	
	public static final String TEXT_HTML = "text/html";
	
	public static final String APPLICATION_XML = "application/xml";
	
	public static final String APPLICATION_XHTML_XML = "application/xhtml+xml";
	
	/* RDFXML: XML serialization of RDF */
	public static final String APPLICATION_RDF_XML = "application/rdf+xml";
	
	/* turtle: textual serialization of RDF */
	//public static final String APPLICATION_TURTLE = "text/turtle";
	// it should be text/turtle, but rdf2go expects application/x-turtle
	public static final String APPLICATION_TURTLE = "application/x-turtle";
	
	/* n3: extension of turtle language expressing a superset of RDF */
	public static final String TEXT_N3 = "text/rdf+n3";

	public static String forExtension(String extension) {
		if (extension == null)
			return null;
		if (extension.equalsIgnoreCase("html"))
			return MediaType.TEXT_HTML;
		else if (extension.equalsIgnoreCase("json"))
			return MediaType.APPLICATION_JSON;
		else if (extension.equalsIgnoreCase("rdf"))
			return MediaType.APPLICATION_RDF_XML;
		else if (extension.equalsIgnoreCase("ttl") || extension.equalsIgnoreCase("turtle"))
			return MediaType.APPLICATION_TURTLE;
		return null;
	}

	public static String getExtension(String mimeType) {
		if (mimeType == null)
			return null;
		if (mimeType.equals(MediaType.TEXT_HTML) ||
				mimeType.equals(MediaType.APPLICATION_XHTML_XML) ||
				mimeType.equals(MediaType.APPLICATION_XML)) {
			return "html";
		} else if (mimeType.equals(MediaType.APPLICATION_JSON)) {
			return "json";
		} else if (mimeType.equals(MediaType.APPLICATION_TURTLE)) {
			return "ttl";
		} else if (mimeType.equals(MediaType.TEXT_N3)) {
			return "n3";
		} else if (mimeType.equals(MediaType.APPLICATION_RDF_XML)) {
			return "rdf";
		}
		return null;
	}
	
}

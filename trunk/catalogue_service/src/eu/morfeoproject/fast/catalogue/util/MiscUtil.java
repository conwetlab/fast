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
package eu.morfeoproject.fast.catalogue.util;

import java.net.MalformedURLException;
import java.net.URL;

import org.ontoware.rdf2go.model.node.impl.URIImpl;

public class MiscUtil {

	public static org.ontoware.rdf2go.model.node.URI URLtoRDF2GoURI(java.net.URL url) {
		return new URIImpl(url.toString());
	}
	
	public static org.ontoware.rdf2go.model.node.URI javaURItoRDF2GoURI(java.net.URI uri) {
		return new URIImpl(uri.toString());
	}

	public static java.net.URL RDF2GoURItoURL(org.ontoware.rdf2go.model.node.URI uri) {
		try {
			return new URL(uri.toString());
		} catch (MalformedURLException e) {
			return null;
		}
	}
	
}

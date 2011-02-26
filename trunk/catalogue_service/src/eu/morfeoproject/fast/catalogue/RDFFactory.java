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
package eu.morfeoproject.fast.catalogue;

import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.URI;

public interface RDFFactory {
	boolean isBlankNode(Object o);
	boolean isDatatypeLiteral(Object o);
	boolean isLanguageTagLiteral(Object o);
	boolean isLiteral(Object o);
	boolean isResource(Object o);
	boolean isURI(Object o);
	URI createURI(String s);
    Node createLiteral(String s);
    Node createLanguageTagLiteral(String s, String lang);
    Node createDatatypeLiteral(String s, URI uriType);
    Resource createResource(URI uri);
}

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

import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.URI;

public class MyRDFFactory implements RDFFactory {

	private Model factory;
	
	public MyRDFFactory() {
		this.factory = RDF2Go.getModelFactory().createModel();
		this.factory.open();
	}
	
	@Override
	public void finalize() {
		this.factory.close();
	}
	
	public boolean isBlankNode(Object o) {
		try {
			((Node) o).asBlankNode();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isDatatypeLiteral(Object o) {
		try {
			((Node) o).asDatatypeLiteral();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}
	
	public boolean isLanguageTagLiteral(Object o) {
		try {
			((Node) o).asLanguageTagLiteral();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isLiteral(Object o) {
		try {
			((Node) o).asLiteral();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isResource(Object o) {
		try {
			((Node) o).asResource();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isURI(Object o) {
		try {
			((Node) o).asURI();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}
	
	@Override
	public URI createURI(String s) {
		return this.factory.createURI(s);
	}
	
	@Override
	public Node createLiteral(String s) {
		return this.factory.createPlainLiteral(s);
	}

	@Override
	public Node createLanguageTagLiteral(String s, String lang) {
		return this.factory.createLanguageTagLiteral(s, lang);
	}

	@Override
	public Node createDatatypeLiteral(String s, URI uriType) {
		return this.factory.createDatatypeLiteral(s, uriType);
	}

	@Override
	public Resource createResource(URI uri) {
		// TODO Auto-generated method stub
		return null;
	}

}

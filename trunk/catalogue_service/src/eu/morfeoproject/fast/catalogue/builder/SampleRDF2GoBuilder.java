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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.DatatypeLiteral;
import org.ontoware.rdf2go.model.node.LanguageTagLiteral;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.MyRDFFactory;
import eu.morfeoproject.fast.catalogue.RDFFactory;
import eu.morfeoproject.fast.catalogue.model.Sample;
import eu.morfeoproject.fast.catalogue.model.factory.BuildingBlockFactory;

public class SampleRDF2GoBuilder {

	protected static final Log log = LogFactory.getLog(SampleRDF2GoBuilder.class);

	protected static final RDFFactory factory = new MyRDFFactory();

	public static Sample buildSample(Model model) {
		return retrieveSample(model);
	}
	
	private static Sample retrieveSample(Model model) {
		// extract the URI and its Class
		ClosableIterator<Statement> cIt = model.findStatements(Variable.ANY, RDF.type, Variable.ANY);
		URI uri = null, type = null;
		try {
			Statement stmt = cIt.next();
			uri = stmt.getSubject().asURI();
			type = stmt.getObject().asURI();
		} catch (Exception e) {
			return null;
		} finally {
			cIt.close();
		}
		
		// fill the information about the sample
		Sample sample = BuildingBlockFactory.createSample();
		sample.setUri(uri);
		sample.setType(type);
		
		// finding properties and their values
		cIt = model.findStatements(uri, Variable.ANY, Variable.ANY);
		for ( ; cIt.hasNext(); ) {
			Statement st = cIt.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			
			// discard the statement "sample rdf:type <someUri>"
			// property value don't support blank nodes, only basic literals or URIs
			if (predicate.equals(RDF.type) || factory.isBlankNode(object)) continue;
			
			if (factory.isURI(object)) {
				sample.addPropertyValue(predicate, "uri", object.asURI().toString());
			} else if (factory.isDatatypeLiteral(object)) {
				DatatypeLiteral dtLiteral = (DatatypeLiteral) object;
				sample.addPropertyValue(predicate, "literal", dtLiteral.getValue(), null, dtLiteral.getDatatype());
			} else if (factory.isLanguageTagLiteral(object)) {
				LanguageTagLiteral langLiteral = (LanguageTagLiteral) object;
				sample.addPropertyValue(predicate, "literal", langLiteral.getValue(), langLiteral.getLanguageTag(), null);
			}
		}
		cIt.close();
		
		return sample;
	}

}
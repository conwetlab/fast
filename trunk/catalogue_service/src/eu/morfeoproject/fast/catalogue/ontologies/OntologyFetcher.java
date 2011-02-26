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
package eu.morfeoproject.fast.catalogue.ontologies;

import java.io.InputStream;
import java.net.URL;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.HttpResponse;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.vocabulary.OWL;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies.Ontology;
import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies.PublicOntology;
import eu.morfeoproject.fast.catalogue.util.URLInputSource;

public class OntologyFetcher {

	private static final Log log = LogFactory.getLog(OntologyFetcher.class);

	private static final Syntax[] syntaxList = { Syntax.Ntriples, Syntax.RdfXml, Syntax.Turtle };
	
	public static Ontology fetch(URL url) {
		if (log.isInfoEnabled()) log.info("fetching "+url+"...");
		for (Syntax syntax : syntaxList) {
			try {
				URLInputSource source = new URLInputSource(url, syntax.getMimeType());
				HttpResponse response = source.getHttpResponse();
				String contentType = response.getFirstHeader("Content-Type").getValue();
				if (contentType.startsWith(syntax.getMimeType())) {
					InputStream in = response.getEntity().getContent();
					if (in != null) {
						URI oUri = getOntologyUri(in, syntax);
						if (oUri != null) {
							return new PublicOntology(oUri, url.toString(), syntax, false);
						}
					}
				}
			} catch (Exception e) {
				e.printStackTrace();
				log.error("Error while fetching " + url + "[Accept: " + syntax.getMimeType() + "]");
			}
		}
		return null;
	}

	private static URI getOntologyUri(InputStream in, Syntax syntax) {
		try {
			Model model = RDF2Go.getModelFactory().createModel();
			model.open();
			model.readFrom(in, syntax);
			ClosableIterator<Statement> cIt = model.findStatements(Variable.ANY, RDF.type, OWL.Ontology);
			URI oUri = cIt.hasNext() ? cIt.next().getSubject().asURI() : null;
			cIt.close();
			model.close();
			return oUri;
		} catch (Exception e) {
			log.error(e.getLocalizedMessage(), e);
		}
		return null;
	}
}

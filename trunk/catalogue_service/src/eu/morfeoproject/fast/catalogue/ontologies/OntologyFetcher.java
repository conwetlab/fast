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

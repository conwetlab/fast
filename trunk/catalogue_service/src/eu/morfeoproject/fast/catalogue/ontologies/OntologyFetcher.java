package eu.morfeoproject.fast.catalogue.ontologies;

import java.io.InputStream;
import java.net.URL;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ontoware.rdf2go.model.Syntax;

import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies.Ontology;
import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies.PublicOntology;
import eu.morfeoproject.fast.catalogue.util.URLInputSource;
import eu.morfeoproject.fast.catalogue.util.MiscUtil;

public class OntologyFetcher {

	private static final Log log = LogFactory.getLog(OntologyFetcher.class);

	private static final Syntax[] syntaxList = { Syntax.Ntriples, Syntax.RdfXml, Syntax.Turtle };
	
	public static Ontology fetch(URL url) {
		for (Syntax syntax : syntaxList) {
			try {
				InputStream in = (new URLInputSource(url, syntax.getMimeType())).getInputStream();
				if (in != null) return new PublicOntology(MiscUtil.URLtoRDF2GoURI(url), in, syntax);
			} catch (Exception e) {
				log.error("Error while fetching " + url + "[Accept: " + syntax.getMimeType() + "]");
			}
		}
		return null;
	}
	
}

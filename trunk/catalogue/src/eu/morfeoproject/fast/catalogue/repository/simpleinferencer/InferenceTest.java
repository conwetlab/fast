package eu.morfeoproject.fast.catalogue.repository.simpleinferencer;

import java.io.File;

import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.Catalogue;


public class InferenceTest {
	
	public static void main(String [] args) throws Exception {
		new InferenceTest().run();
	}
	
	public void run() throws Exception {
		Catalogue catalogue = new Catalogue(new File("ismael"));
		URI c1 = catalogue.getOrCreateClass("clase1");
		URI c2 = catalogue.getOrCreateClass("clase2", c1);
//		catalogue.getTripleStore().addStatement(new URIImpl("urn:knud"), RDF.type, c1);
		catalogue.dumpStatements();
		catalogue.close();
	}
	
}

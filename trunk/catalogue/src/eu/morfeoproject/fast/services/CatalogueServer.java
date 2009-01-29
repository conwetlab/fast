package eu.morfeoproject.fast.services;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.restlet.Application;
import org.restlet.Component;
import org.restlet.Restlet;
import org.restlet.Router;
import org.restlet.data.Protocol;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.vocabulary.FCO;

/**
 * 
 * @author irivera
 */
public class CatalogueServer extends Application {
	
	static Logger logger = Logger.getLogger(SearchRestlet.class);

	public static Restlet tagRestlet;
	public static Restlet screenRestlet;
	public static Restlet searchRestlet;
	public static Catalogue catalogue;

	static {
		try {
			catalogue = new Catalogue();
			catalogue.open();
			tagRestlet = new TagRestlet();
			screenRestlet = new ScreenRestlet(catalogue);
			searchRestlet = new SearchRestlet(catalogue);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void main(String [] args) throws Exception {
		int port = Integer.parseInt(args[0]);
		
		// Set up a simple configuration that logs on the console.
		BasicConfigurator.configure();

		URI projectClass = catalogue.getOrCreateClass("Project");
		URI researchClass = catalogue.getOrCreateClass("ResearchProject", projectClass);
		URI swClass = catalogue.getOrCreateClass("SemanticWebProject", researchClass);
		URI generalClass = catalogue.getOrCreateClass("GeneralProject", projectClass);
		URI userClass = catalogue.getOrCreateClass("User");
		URI carClass = catalogue.getOrCreateClass("Car");

		Component component = new Component();
		component.getServers().add(Protocol.HTTP, port);

		CatalogueServer catalogueService = new CatalogueServer();
		component.getDefaultHost().attach("", catalogueService);
		component.start();
		logger.info("Catalogue server listening on port "+port);
	}

	@Override
	public Restlet createRoot() {
		Router router = new Router(getContext());
		router.attach("/tag/{action}", tagRestlet);
		router.attach("/screens", screenRestlet);
		router.attach("/screens/{id}", screenRestlet);
		router.attach("/search/{action}", searchRestlet);
		return router;
	}

}
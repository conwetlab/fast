package eu.morfeoproject.fast.restserver;

import java.io.File;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.restlet.Application;
import org.restlet.Component;
import org.restlet.Restlet;
import org.restlet.Router;
import org.restlet.data.Protocol;

import eu.morfeoproject.fast.catalogue.Catalogue;

/**
 * 
 * @author irivera
 */
public class CatalogueServer extends Application {
	
	static Logger logger = Logger.getLogger(SearchRestlet.class);

	private Restlet screenRestlet;
	private Restlet screenFlowRestlet;
	private Restlet searchRestlet;
	private Restlet checkRestlet;
	private Restlet metadataRestlet;
	private Restlet searchCheckRestlet;
	
	private Catalogue catalogue;
	
	private Component component;
	private File dir;
	
	public CatalogueServer(int port, File dir) {
		// Set up a configuration for the logger.
		BasicConfigurator.configure();

		this.dir = dir;
		this.component = new Component();
		component.getServers().add(Protocol.HTTP, port);
		component.getDefaultHost().attach("", this);
	}

	/**
	 * Starts the server, creates the REST services for every offered service and
	 * open a new session in the catalogue repository.
	 * @throws Exception
	 */
	public void startServer(boolean recursive) throws Exception {
		catalogue = new Catalogue(dir);
		screenRestlet = new ScreenRestlet(catalogue);
		screenFlowRestlet = new ScreenFlowRestlet(catalogue);
		searchRestlet = new SearchRestlet(catalogue, recursive);
		checkRestlet = new CheckRestlet(catalogue);
		metadataRestlet = new MetadataRestlet(catalogue);
		searchCheckRestlet = new SearchCheckRestlet(catalogue, recursive);

		// start the restlet server
		component.start();
	}
	
	/**
	 * Stops the server and close the instance of the catalogue repository
	 * @throws Exception
	 */
	public void stopServer() throws Exception {
		component.stop();
		catalogue.close();
	}

	/**
	 * Routes are individual rules that map matching URLs to specific controllers and actions.
	 * This method creates the routes for every Restlet in the server
	 */
	@Override
	public Restlet createRoot() {
		Router router = new Router(getContext());
		router.attach("/screens", screenRestlet);
		router.attach("/screens/{id}", screenRestlet);
		router.attach("/screenflows", screenFlowRestlet);
		router.attach("/screenflows/{id}", screenFlowRestlet);
		router.attach("/find", searchRestlet);
		router.attach("/check", checkRestlet);
		router.attach("/getmetadata", metadataRestlet);
		router.attach("/findcheck", searchCheckRestlet);
		return router;
	}

	//TODO delete, only for debugging
	public void dump() {
//		catalogue.dump();
		catalogue.dumpStatements();
	}
	
}
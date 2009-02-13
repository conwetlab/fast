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

	public void startServer() throws Exception {
		catalogue = new Catalogue(dir);
		catalogue.open();
		screenRestlet = new ScreenRestlet(catalogue);
		screenFlowRestlet = new ScreenFlowRestlet(catalogue);
		searchRestlet = new SearchRestlet(catalogue);
		checkRestlet = new CheckRestlet(catalogue);
		metadataRestlet = new MetadataRestlet(catalogue);

		// start the restlet server
		component.start();
	}
	
	public void stopServer() throws Exception {
		component.stop();
		catalogue.close();
	}

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
		return router;
	}

	
	// to run from the console
	// parameters:
	//  - port
	//  - repository directory
	public static void main(String [] args) throws Exception {
		int port = Integer.parseInt(args[0]);
		File dir = new File(args[1]);
		
		CatalogueServer server = new CatalogueServer(port, dir);
		server.startServer();
		logger.info("Catalogue server listening on port "+port);
	}
	
}
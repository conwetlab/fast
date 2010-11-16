package eu.morfeoproject.fast.catalogue;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CatalogueAccessPoint {

	final static Logger logger = LoggerFactory.getLogger(CatalogueAccessPoint.class);

	private static Catalogue catalogue;
	
	public static Catalogue getCatalogue() throws IOException {
		return getCatalogue(null);
	}
	
	public static Catalogue getCatalogue(String environment) throws IOException {
		if (catalogue == null) {
			InputStream inStream = CatalogueAccessPoint.class.getClassLoader().getResourceAsStream("repository.properties"); 
			String storageDir = null;
			String indexes = null;
			String sesameServer = null;
			String repositoryID = null;
			String serverURL = null;
			if (inStream == null) {
				throw new IOException("Configuration file repository.properties not found.");
			} else {
				Properties properties = new Properties();
				properties.load(inStream);
				environment = environment == null ? "default" : environment;
				storageDir = properties.getProperty(environment+"-storageDir");
				indexes = properties.getProperty(environment+"-indexes");
				sesameServer = properties.getProperty(environment+"-sesameServer");
				repositoryID = properties.getProperty(environment+"-repositoryID");
				serverURL = properties.getProperty(environment+"-serverURL");
			}
			if (sesameServer != null && repositoryID != null && serverURL != null) {
				catalogue = new Catalogue(new URIImpl(serverURL), sesameServer, repositoryID, environment);
			} else if (storageDir != null) {
				catalogue = new Catalogue(new URIImpl(serverURL), new File(storageDir), indexes, environment);
			} else {
				throw new IOException("Configuration file repository.properties is incorrect.");
			}
		}
		return catalogue;
	}

	protected void finalize() throws Throwable {
		if (catalogue != null) catalogue.close();
	}

}

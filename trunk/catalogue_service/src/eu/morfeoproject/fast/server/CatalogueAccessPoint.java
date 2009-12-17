package eu.morfeoproject.fast.server;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class CatalogueAccessPoint {

	final static Logger logger = LoggerFactory.getLogger(CatalogueAccessPoint.class);

	private static final String defaultStorageDir = "C:\\fast\\catalogue\\repository";
	
	private static Catalogue catalogue;
	
	public static Catalogue getCatalogue() throws IOException {
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
				storageDir = properties.getProperty("storageDir", defaultStorageDir);
				indexes = properties.getProperty("indexes");
				sesameServer = properties.getProperty("sesameServer");
				repositoryID = properties.getProperty("repositoryID");
				serverURL = properties.getProperty("serverURL");
			}
			if (sesameServer != null && repositoryID != null && serverURL != null) {
				catalogue = new Catalogue(new URIImpl(serverURL), sesameServer, repositoryID);
			} else if (storageDir != null) {
				catalogue = new Catalogue(new URIImpl(serverURL), new File(storageDir), indexes);
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

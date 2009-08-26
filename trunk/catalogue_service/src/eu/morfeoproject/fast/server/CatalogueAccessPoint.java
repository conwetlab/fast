package eu.morfeoproject.fast.server;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class CatalogueAccessPoint {

	private static final String defaultStorageDir = "C:\\fast\\catalogue\\repository";
	
	private static Catalogue catalogue;
	
	public static Catalogue getCatalogue() throws IOException {
		if (catalogue == null) {
			InputStream inStream = CatalogueAccessPoint.class.getClassLoader().getResourceAsStream("repository.properties"); 
			String storageDir = null;
			String indexes = null;
			if (inStream == null) {
				throw new IOException("Configuration file repository.properties not found.");
			} else {
				Properties properties = new Properties();
				properties.load(inStream);
				storageDir = properties.getProperty("storageDir", defaultStorageDir);
				indexes = properties.getProperty("indexes");
			}
			catalogue = new Catalogue(new File(storageDir), indexes);
		}
		return catalogue;
	}

	protected void finalize() throws Throwable {
		if (catalogue != null) catalogue.close();
	}

}

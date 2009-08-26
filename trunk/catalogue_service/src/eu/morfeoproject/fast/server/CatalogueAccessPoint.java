package eu.morfeoproject.fast.server;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class CatalogueAccessPoint {

	private static final String defaultStorageDir = "C:\\fast\\repository";
	
	private static Catalogue catalogue;
	
	public static Catalogue getCatalogue() throws IOException {
		if (catalogue == null) {
			System.out.println(CatalogueAccessPoint.class.getClassLoader().toString());
			InputStream inStream = CatalogueAccessPoint.class.getClassLoader().getResourceAsStream("META-INF/repository.properties"); 
			String storageDir = null;
			if (inStream == null) {
				throw new IOException("Configuration file repository.properties not found in META-INF directory.");
			} else {
				Properties properties = new Properties();
				properties.load(inStream);
				storageDir = properties.getProperty("storageDir", defaultStorageDir);
			}
			catalogue = new Catalogue(new File(storageDir));
		}
		return catalogue;
	}

	protected void finalize() throws Throwable {
		if (catalogue != null) catalogue.close();
	}

}

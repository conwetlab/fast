package eu.morfeoproject.fast.server;

import java.io.File;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class CatalogueAccessPoint {

	private static Catalogue catalogue;
	
	public static Catalogue getCatalogue() {
//		InputStream inputStream = this.getClass().getClassLoader().getResourceAsStream("META-INF/system.properties"); 
		if (catalogue == null)
			catalogue = new Catalogue(new File("prueba2"));
		return catalogue;
	}

	protected void finalize() throws Throwable {
		if (catalogue != null) catalogue.close();
	}

}

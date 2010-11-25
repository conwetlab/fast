package eu.morfeoproject.fast.catalogue.util;

import java.net.MalformedURLException;
import java.net.URL;

import org.ontoware.rdf2go.model.node.impl.URIImpl;

public class MiscUtil {

	public static org.ontoware.rdf2go.model.node.URI URLtoRDF2GoURI(java.net.URL url) {
		return new URIImpl(url.toString());
	}
	
	public static org.ontoware.rdf2go.model.node.URI javaURItoRDF2GoURI(java.net.URI uri) {
		return new URIImpl(uri.toString());
	}

	public static java.net.URL RDF2GoURItoURL(org.ontoware.rdf2go.model.node.URI uri) {
		try {
			return new URL(uri.toString());
		} catch (MalformedURLException e) {
			return null;
		}
	}
	
}

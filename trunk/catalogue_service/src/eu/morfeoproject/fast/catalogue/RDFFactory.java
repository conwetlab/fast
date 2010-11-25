package eu.morfeoproject.fast.catalogue;

import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.URI;

public interface RDFFactory {
	boolean isBlankNode(Object o);
	boolean isDatatypeLiteral(Object o);
	boolean isLanguageTagLiteral(Object o);
	boolean isLiteral(Object o);
	boolean isResource(Object o);
	boolean isURI(Object o);
	URI createURI(String s);
    Node createLiteral(String s);
    Node createLanguageTagLiteral(String s, String lang);
    Node createDatatypeLiteral(String s, URI uriType);
    Resource createResource(URI uri);
}

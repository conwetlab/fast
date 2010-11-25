package eu.morfeoproject.fast.catalogue;

import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.URI;

public class MyRDFFactory implements RDFFactory {

	private Model factory;
	
	public MyRDFFactory() {
		this.factory = RDF2Go.getModelFactory().createModel();
		this.factory.open();
	}
	
	@Override
	public void finalize() {
		this.factory.close();
	}
	
	public boolean isBlankNode(Object o) {
		try {
			((Node) o).asBlankNode();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isDatatypeLiteral(Object o) {
		try {
			((Node) o).asDatatypeLiteral();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}
	
	public boolean isLanguageTagLiteral(Object o) {
		try {
			((Node) o).asLanguageTagLiteral();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isLiteral(Object o) {
		try {
			((Node) o).asLiteral();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isResource(Object o) {
		try {
			((Node) o).asResource();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isURI(Object o) {
		try {
			((Node) o).asURI();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}
	
	@Override
	public URI createURI(String s) {
		return this.factory.createURI(s);
	}
	
	@Override
	public Node createLiteral(String s) {
		return this.factory.createPlainLiteral(s);
	}

	@Override
	public Node createLanguageTagLiteral(String s, String lang) {
		return this.factory.createLanguageTagLiteral(s, lang);
	}

	@Override
	public Node createDatatypeLiteral(String s, URI uriType) {
		return this.factory.createDatatypeLiteral(s, uriType);
	}

	@Override
	public Resource createResource(URI uri) {
		// TODO Auto-generated method stub
		return null;
	}

}

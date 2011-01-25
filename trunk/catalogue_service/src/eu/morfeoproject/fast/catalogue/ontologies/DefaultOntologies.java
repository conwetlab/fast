package eu.morfeoproject.fast.catalogue.ontologies;

import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;

import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.OntologyInvalidException;

/**
 * Get the default ontologies as inputstreams
 * @author Ismael Rivera
 */
public class DefaultOntologies {
    
    final static Logger logger = LoggerFactory.getLogger(DefaultOntologies.class);

    private static ArrayList<Ontology> defaults = new ArrayList<Ontology>();
    
    /** 
     * These ontologies have a class within the project representing their vocabularies, 
     * in the package eu.morfeoproject.fast.vocabulary
     * Every time a change is made, the vocabulary has to be rewritten using the RDF2Go VocabularyWriter utility.
     */
    public static Ontology RDF = 
    	new Ontology(new URIImpl("http://www.w3.org/1999/02/22-rdf-syntax-ns#"), "rdf.rdf", Syntax.RdfXml, true);
    public static Ontology RDFS = 
        new Ontology(new URIImpl("http://www.w3.org/2000/01/rdf-schema#"), "rdfs.rdf", Syntax.RdfXml, true);
    public static Ontology DC = 
        new Ontology(new URIImpl("http://purl.org/dc/elements/1.1/"), "dc.rdf", Syntax.RdfXml, true);
    public static Ontology DOAP = 
        new Ontology(new URIImpl("http://usefulinc.com/ns/doap#"), "doap.rdf", Syntax.RdfXml, true);
    public static Ontology FGO =
    	new Ontology(new URIImpl("http://purl.oclc.org/fast/ontologies/gadget#"), "fgo20100408.ttl", Syntax.Turtle, true);
//    public static Ontology FOAF =
//    	new Ontology(new URIImpl("http://xmlns.com/foaf/0.1/"), "foaf.rdf", Syntax.RdfXml, true);
//    public static Ontology SIOC =
//    	new Ontology(new URIImpl("http://rdfs.org/sioc/ns#"), "sioc.owl", Syntax.RdfXml, true);
//    public static Ontology CTAG = /** Common Tag vocabulary to enhance tags and their meaning **/
//    	new Ontology(new URIImpl("http://commontag.org/ns#"), "ctag.owl", Syntax.RdfXml, true);

    /**-- The DBPedia ontology (no datasets included) --**/
//    public static PublicOntology DBPEDIA = 
//    	new PublicOntology(new URIImpl("http://dbpedia.org/ontology/#"),
//    			"http://downloads.dbpedia.org/3.2/en/dbpedia-ontology.owl",
//    			Syntax.RdfXml,
//    			true);

    /**-- Ontologies for test purposes --**/
    public static Ontology AMAZON_ECOMMERCE =
    	new Ontology(new URIImpl("http://fast.morfeo-project.org/ontologies/amazon#"), "amazon-ecommerce-v1.ttl", Syntax.Turtle, true);
//    public static Ontology DEMO =
//    	new Ontology(new URIImpl("http://www.morfeoproject.eu/fast/demo#"), "demo.rdf", Syntax.RdfXml, true);
//    public static PublicOntology GR =
//    	new PublicOntology(new URIImpl("http://purl.org/goodrelations/v1#"),
//    			"http://www.heppnetz.de/ontologies/goodrelations/v1.owl",
//    			Syntax.RdfXml,
//    			true);
//    public static Ontology GEO =
//    	new Ontology(new URIImpl("http://www.w3.org/2003/01/geo/wgs84_pos#"), "wgs84_pos.rdf", Syntax.RdfXml, true);
//    	new Ontology(new URIImpl("http://www.w3.org/2003/01/geo/wgs84_pos#"), 
//    			"http://www.w3.org/2003/01/geo/wgs84_pos.rdf",
//    			Syntax.RdfXml,
//    			true);
    
    
    /**
     * defining an ontology
     * @author Ismael Rivera
     */
    public static class Ontology {
        URI uri;
        String filename;
        Syntax syntax;
        
        public Ontology(URI uri, String filename, Syntax syntax, boolean isDefault) {
            super();
            this.uri = uri;
            this.filename = filename;
            this.syntax = syntax;
            if (isDefault)
            	defaults.add(this);
        }

		public URI getUri() {
            return uri;
        }
        
        public Syntax getSyntax() {
        	return syntax;
        }
        
//        public InputStream getAsRDFXML() throws OntologyInvalidException {
//            if (!syntax.equals(Syntax.RdfXml))
//                throw new OntologyInvalidException("Cannot load default RDF/XML representation of the ontology from resource: "+filename+". Try with "+syntax.toString()+".");
//            return getInputStream();
//        }
//        
//        public InputStream getAsTurtle() throws OntologyInvalidException {
//            if (!syntax.equals(Syntax.Turtle))
//                throw new OntologyInvalidException("Cannot load default Turtle representation of the ontology from resource: "+filename+". Try with "+syntax.toString()+".");
//            return getInputStream();
//        }
        
        public InputStream getInputStream() throws OntologyInvalidException {
            InputStream result = getClass().getResourceAsStream(filename);
            if (result == null)
                throw new OntologyInvalidException("Cannot load default ontology from class "+this.getClass().getName()+" from resource: "+filename);
            return result;
        }

    }
    

    /**
     * a public ontology is an ontology which you can find and access online
     * @author Ismael Rivera
     */
    public static class PublicOntology extends Ontology {
    	private String downloadUri;
    	private InputStream inputStream;
    	
    	public PublicOntology(URI uri, String downloadUri, Syntax syntax) {
    		this(uri, downloadUri, syntax, false);
    	}
		
    	public PublicOntology(URI uri, String downloadUri, Syntax syntax, boolean isDefault) {
			super(uri, null, syntax, isDefault);
			this.downloadUri = downloadUri;
		}
		
		public PublicOntology(URI uri, InputStream in, Syntax syntax) {
			super(uri, null, syntax, false);
			this.inputStream = in;
		}

		@Override
		public InputStream getInputStream() {
			if (inputStream != null) return inputStream;
        	InputStream result = null;
        	// check Internet connection
        	try {
				URL webont = new URL(downloadUri);
				URLConnection con = webont.openConnection();
				result = con.getInputStream();
			} catch (Exception e) {
				logger.warn("Cannot load "+this+": "+e.getMessage(), e);
			}
            return result;
        }

		@Override
		public String toString() {
			return "Default Web Ontology downloaduri="+downloadUri;
		}
    	
    }
    
    /**
     * get the default ontologies
     * @return the list
     */
    public static List<Ontology> getDefaults() {
        return defaults;
    }

    /**
     * return true, if the ontology identified by the passed URI
     * is a default ontology
     * @param ontologyUri a ontology URI
     * @return true, if this is a default ontology
     */
    public static boolean containsOntologyUri(URI ontologyUri) {
        for (Ontology o : defaults)
        { 
            if (o.uri.equals(ontologyUri.toString()))
                return true;
        }
        return false;
    }
    
}

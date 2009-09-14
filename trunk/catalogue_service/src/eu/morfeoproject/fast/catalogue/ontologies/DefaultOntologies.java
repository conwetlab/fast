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
    
    public static Ontology RDF = 
    	new DefaultOntology(new URIImpl("http://www.w3.org/1999/02/22-rdf-syntax-ns#"), "rdf.rdf", Syntax.RdfXml);
    public static Ontology RDFS = 
        new DefaultOntology(new URIImpl("http://www.w3.org/2000/01/rdf-schema#"), "rdfs.rdf", Syntax.RdfXml);
    public static Ontology FGO =
//    	new DefaultOntology(new URIImpl("http://purl.oclc.org/fast/ontology/gadget#"), "fco20090224.rdf", Syntax.RdfXml);
    	new DefaultOntology(new URIImpl("http://purl.oclc.org/fast/ontology/gadget#"), "fgo20090713.ttl", Syntax.Turtle);
    public static Ontology FOAF =
    	new DefaultOntology(new URIImpl("http://xmlns.com/foaf/0.1/"), "foaf.rdf", Syntax.RdfXml);
    public static Ontology SIOC =
    	new DefaultOntology(new URIImpl("http://rdfs.org/sioc/ns#"), "sioc.owl", Syntax.RdfXml);

    /**-- The DBPedia ontology (no datasets included) --**/
//  public static Ontology DBPEDIA =
//	new Ontology(new URIImpl("http://dbpedia.org/ontology/#"), "dbpedia.owl", Syntax.RdfXml);
//    public static PublicOntology DBPEDIA = 
//    	new PublicOntology(new URIImpl("http://dbpedia.org/ontology/#"),
//    			"http://downloads.dbpedia.org/3.2/en/dbpedia-ontology.owl",
//    			Syntax.RdfXml);

    /**-- Ontologies for test purposes --**/
    public static Ontology AMAZON_MOCKUP =
    	new DefaultOntology(new URIImpl("http://aws.amazon.com/AWSECommerceService#"), "amazon-mockup.rdf", Syntax.RdfXml);
    public static Ontology DEMO =
    	new DefaultOntology(new URIImpl("http://www.morfeoproject.eu/fast/demo#"), "demo.rdf", Syntax.RdfXml);
    
    

    public static class DefaultOntology extends Ontology {
    	public DefaultOntology(URI uri, String filename, Syntax syntax) {
    		super(uri, filename, syntax);
    		defaults.add(this);
    	}
    }
    
    /**
     * defining an ontology
     * @author Ismael Rivera
     */
    public static class Ontology {
        URI uri;
        String filename;
        Syntax syntax;
        
        /**
         * @param uri
         * @param filename
         */
        public Ontology(URI uri, String filename, Syntax syntax) {
            super();
            this.uri = uri;
            this.filename = filename;
            this.syntax = syntax;
        }

        public URI getUri() {
            return uri;
        }
        
        public Syntax getSyntax() {
        	return syntax;
        }
        
        public InputStream getAsRDFXML() throws OntologyInvalidException {
            if (!syntax.equals(Syntax.RdfXml))
                throw new OntologyInvalidException("Cannot load default RDF/XML representation of the ontology from resource: "+filename+". Try with "+syntax.toString()+".");
            return getInputStream();
        }
        
        public InputStream getAsTurtle() throws OntologyInvalidException {
            if (!syntax.equals(Syntax.Turtle))
                throw new OntologyInvalidException("Cannot load default Turtle representation of the ontology from resource: "+filename+". Try with "+syntax.toString()+".");
            return getInputStream();
        }
        
        protected InputStream getInputStream() throws OntologyInvalidException {
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
    	
		public PublicOntology(URI uri, String downloadUri, Syntax syntax) {
			super(uri, null, syntax);
			this.downloadUri = downloadUri;
		}
		
		@Override
		protected InputStream getInputStream() {
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

package eu.morfeoproject.fast.catalogue.ontologies;

import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

/**
 * Get the default ontologies as inputstreams
 * @author Ismael Rivera
 */
public class DefaultOntologies {
    
    static Logger logger = Logger.getLogger(DefaultOntologies.class);

    private static ArrayList<Ontology> defaults = new ArrayList<Ontology>();
    
    public static Ontology RDF = 
    	new Ontology(new URIImpl("http://www.w3.org/1999/02/22-rdf-syntax-ns#"), "rdf.rdf");
    public static Ontology RDFS = 
        new Ontology(new URIImpl("http://www.w3.org/2000/01/rdf-schema#"), "rdfs.rdf");
//    public static Ontology FCO =
//    	new Ontology(new URIImpl("http://www.morfeoproject.eu/fast/fco#"), "fco.rdf");
    public static Ontology FCO =
    	new Ontology(new URIImpl("http://purl.oclc.org/fast/ontology/gadget#"), "fco20090224.rdf");
    public static Ontology FOAF =
    	new Ontology(new URIImpl("http://xmlns.com/foaf/0.1/"), "foaf.rdf");
    
    public static Ontology AMAZON_MOCKUP =
    	new Ontology(new URIImpl("http://aws.amazon.com/AWSECommerceService#"), "amazon-mockup.rdf");
    public static Ontology DEMO =
    	new Ontology(new URIImpl("http://www.morfeoproject.eu/fast/demo#"), "demo.rdf");
    
//    public static Ontology BRESLIN =
//    	new Ontology(new URIImpl("http://www.johnbreslin.com/foaf/foaf.rdf#"), "breslin-foaf.rdf");
//    public static Ontology ANDREAS =
//    	new Ontology(new URIImpl("http://www.deri.ie/about/team/member/Andreas_Harth"), "andreas-foaf.rdf");
    
//    public static Ontology DBPEDIA = // TODO not supported yet!
//    	new Ontology(new URIImpl("http://dbpedia.org/ontology/#"), "dbpedia.owl");
    
//    public static Ontology PIMO = 
//    	new Ontology ("http://www.semanticdesktop.org/ontologies/2007/11/01/pimo#",
//    	"pimo.rdfs");
//    public static PublicOntology N2PM = 
//    	new PublicOntology ("http://www.semanticdesktop.org/ontologies/2007/11/01/nietopimomapping#",
//    	"nietopimomapping.rdf","http://www.semanticdesktop.org/ontologies/2007/11/01/nietopimomapping.rdf");
//    public static Ontology NOP = 
//    	new Ontology ("http://ontologies.opendfki.de/repos/ontologies/userobs/nop#",
//    	"nop.rdfs");
//    public static Ontology WCON = 
//    	new Ontology ("http://ontologies.opendfki.de/repos/ontologies/wcon/workcontext#",
//    	"wcon.rdfs");
    
    /**
     * defining an def-ontology
     * @author sauermann
     */
    public static class Ontology {
        URI uri;
        String filename;
        
        /**
         * @param uri
         * @param filename
         */
        public Ontology(URI uri, String filename) {
            super();
            this.uri = uri;
            this.filename = filename;
            defaults.add(this);
        }

        public URI getUri(){
            return uri;
        }
        
        public InputStream getAsRDFXML()
        {
            InputStream result = getClass().getResourceAsStream(filename);
            if (result == null)
                throw new RuntimeException("Cannot load default ontology from class "+this.getClass().getName()+" from resource: "+filename);
            return result;
        }
    }
    
    public static class PublicOntology extends Ontology {

    	private String downloadUri;
    	
		public PublicOntology(URI uri, String filename, String downloadUri) {
			super(uri, filename);
			this.downloadUri = downloadUri;
		}
		
        public InputStream getAsRDFXML() {
        	InputStream result;
        	// check Internet connection
        	try {
				URL webont = new URL(downloadUri);
				URLConnection con = webont.openConnection();
				result = con.getInputStream();
			} catch (Exception e) {
				logger.warn("Cannot load "+this+": "+e.getMessage(), e);
				return super.getAsRDFXML();
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

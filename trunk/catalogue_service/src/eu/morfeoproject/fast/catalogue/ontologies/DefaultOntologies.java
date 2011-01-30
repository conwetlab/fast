package eu.morfeoproject.fast.catalogue.ontologies;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.OntologyInvalidException;
import eu.morfeoproject.fast.catalogue.util.URLInputSource;

/**
 * Get the default ontologies as inputstreams
 * @author Ismael Rivera
 */
public class DefaultOntologies {
    
	protected static final Log log = LogFactory.getLog(DefaultOntologies.class);

    private static ArrayList<Ontology> defaults = new ArrayList<Ontology>();
    
    /** 
     * These ontologies have a class within the project representing their vocabularies, 
     * in the package eu.morfeoproject.fast.vocabulary
     * Every time a change is made, the vocabulary has to be rewritten using the RDF2Go VocabularyWriter utility.
     */
    public static Ontology RDF = 
    	new Ontology(new URIImpl("http://www.w3.org/1999/02/22-rdf-syntax-ns"), "rdf.rdf", Syntax.RdfXml, true);
    public static Ontology RDFS = 
        new Ontology(new URIImpl("http://www.w3.org/2000/01/rdf-schema"), "rdfs.rdf", Syntax.RdfXml, true);
    public static Ontology DC = 
        new Ontology(new URIImpl("http://purl.org/dc/terms/"), "dcterms.rdf", Syntax.RdfXml, true);
    public static Ontology DOAP = 
        new Ontology(new URIImpl("http://usefulinc.com/ns/doap"), "doap.rdf", Syntax.RdfXml, true);
    public static Ontology OMV =
    	new Ontology(new URIImpl("http://omv.ontoware.org/2005/05/ontology"), "OMV_v2.4.1.owl", Syntax.RdfXml, true);
    public static Ontology FGO =
    	new Ontology(new URIImpl("http://purl.oclc.org/fast/ontology/gadget"), "fgo2010-11-30.ttl", Syntax.Turtle, true);
    public static Ontology FOAF =
    	new Ontology(new URIImpl("http://xmlns.com/foaf/0.1"), "foaf.rdf", Syntax.RdfXml, true);
    public static Ontology SIOC =
    	new Ontology(new URIImpl("http://rdfs.org/sioc/ns"), "sioc.owl", Syntax.RdfXml, true);
    public static Ontology CTAG = /** Common Tag vocabulary to enhance tags and their meaning **/
    	new Ontology(new URIImpl("http://commontag.org/ns"), "ctag.owl", Syntax.RdfXml, true);
    /**-- The DBPedia ontology (no datasets included) --**/
    public static PublicOntology DBPEDIA = 
    	new PublicOntology(new URIImpl("http://dbpedia.org/ontology/"),
    			"http://downloads.dbpedia.org/3.2/en/dbpedia-ontology.owl",
    			Syntax.RdfXml,
    			true);
    public static PublicOntology GR =
    	new PublicOntology(new URIImpl("http://purl.org/goodrelations/v1"),
    			"http://www.heppnetz.de/ontologies/goodrelations/v1.owl",
    			Syntax.RdfXml,
    			true);
    public static Ontology GEO =
    	new Ontology(new URIImpl("http://www.w3.org/2003/01/geo/wgs84_pos"), "wgs84_pos.rdf", Syntax.RdfXml, true);

    
//    /**-- Ontologies for test purposes --**/
    public static Ontology AMAZON_ECOMMERCE =
    	new Ontology(new URIImpl("http://fast.morfeo-project.org/ontologies/amazon"), "amazon-ecommerce-v1.ttl", Syntax.Turtle, true);
    
    
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
        
        public InputStream getInputStream() throws OntologyInvalidException {
            InputStream result = getClass().getResourceAsStream(filename);
            if (result == null)
                throw new OntologyInvalidException("Cannot load default ontology from class "+this.getClass().getName()+" from resource: "+filename);
            return result;
        }
        
        public URL getLocation() {
        	return getClass().getResource(filename);
        }

    }
    

    /**
     * a public ontology is an ontology which you can find and access online
     * @author Ismael Rivera
     */
    public static class PublicOntology extends Ontology {
    	private String downloadUri;
    	
    	public PublicOntology(URI uri, String downloadUri, Syntax syntax) {
    		this(uri, downloadUri, syntax, false);
    	}
		
    	public PublicOntology(URI uri, String downloadUri, Syntax syntax, boolean isDefault) {
			super(uri, null, syntax, isDefault);
			this.downloadUri = downloadUri;
		}
		
		@Override
		public InputStream getInputStream() {
			try {
				URLInputSource source = new URLInputSource(new URL(downloadUri), syntax.getMimeType());
				return source.getInputStream();
			} catch (IOException e) {
				log.error("Cannot load "+this+": "+e.getLocalizedMessage(), e);
			}

			return null;
        }
		
		@Override
		public URL getLocation() {
			try {
				return new URL(downloadUri);
			} catch (MalformedURLException e) {
				log.error(downloadUri+" is not a valid URL: "+e.getLocalizedMessage(), e);
			}
			return null;
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

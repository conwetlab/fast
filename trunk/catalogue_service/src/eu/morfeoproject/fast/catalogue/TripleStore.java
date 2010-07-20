package eu.morfeoproject.fast.catalogue;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.ontoware.aifbcommons.collection.ClosableIterable;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.exception.ModelRuntimeException;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.ModelSet;
import org.ontoware.rdf2go.model.QuadPattern;
import org.ontoware.rdf2go.model.QueryResultTable;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.DatatypeLiteral;
import org.ontoware.rdf2go.model.node.LanguageTagLiteral;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.NodeOrVariable;
import org.ontoware.rdf2go.model.node.PlainLiteral;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.ResourceOrVariable;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.UriOrVariable;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.vocabulary.OWL;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.ontoware.rdf2go.vocabulary.XSD;
import org.openrdf.model.ValueFactory;
import org.openrdf.rdf2go.RepositoryModelSet;
import org.openrdf.repository.Repository;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;
import org.openrdf.rio.RDFFormat;
import org.openrdf.rio.RDFParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.util.DateFormatter;
import eu.morfeoproject.fast.catalogue.vocabulary.DC;

// TODO: The triple store must guarantee safe operations to the rdf repository
// 		 using synchronised statements when adding, deleting, and querying.

/**
 * @author Ismael Rivera
 *
 */
public class TripleStore {

	final Logger logger = LoggerFactory.getLogger(TripleStore.class);

	public static final String SPARQL_PREAMBLE = "";
	
	public static final int FORWARD_CHAINING_RDFS_INFERENCER = 0;
	
	/**
	 * the real persistent store
	 */
	private ModelSet persistentModelSet;
	
	private List<URI> createdURIs;
	
	private Repository repository;
	
	public TripleStore(String sesameServer, String repositoryID) {
		try {
			repository = PersistentRepository.getHTTPRepository(sesameServer, repositoryID);
			initStore(repository);
		} catch (Exception e) {
			logger.error("The triple store cannot be initialized.", e);
		}
	}
	
	public TripleStore(File dir, String indexes) {
		try {
			repository = PersistentRepository.getLocalRepository(dir, indexes);
			initStore(repository);
		} catch (RepositoryException e) {
			logger.error("The triple store cannot be initialized.", e);
		}
	}
	
	private void initStore(Repository repository) {
		persistentModelSet = new RepositoryModelSet(repository);
		
		createdURIs = new ArrayList<URI>();
	}
	
	public void open() {
		persistentModelSet.open();
	}
	
	public void close() {
		// close the model set
		persistentModelSet.close();
	}

	public void addModel(Model model, URI uriModel) {
    	if (uriModel == null)
    		throw new IllegalArgumentException("uriModel is null");
		persistentModelSet.addModel(model, uriModel);
	}
	
	/**
	 * Replaces blank nodes ids from the model to triple-store specific ids
	 * @param model
	 * @param uriModel
	 */
	private void addSafeModel(Model model, URI uriModel) {
		 
		persistentModelSet.addModel(model, uriModel);

	}
	
	public Model getModel(URI uriModel) {
    	if (uriModel == null)
    		throw new IllegalArgumentException("uriModel is null");
    	return persistentModelSet.getModel(uriModel);
	}
	
    public boolean removeModel(URI uriModel) {
    	if (uriModel == null)
    		throw new IllegalArgumentException("uriModel is null");
    	return persistentModelSet.removeModel(uriModel);
    }
    
	public boolean isValidURI(String uri) {
		return persistentModelSet.isValidURI(uri);
	}
	
	public BlankNode createBlankNode() {
		return persistentModelSet.createBlankNode();
	}
	
	public BlankNode createBlankNode(String arg0) {
		return persistentModelSet.createBlankNode(arg0);
	}
	
	public DatatypeLiteral createDatatypeLiteral(String arg0, URI arg1) {
		return persistentModelSet.createDatatypeLiteral(arg0, arg1);
	}
	
	public LanguageTagLiteral createLanguageTagLiteral(String arg0, String arg1) {
		return persistentModelSet.createLanguageTagLiteral(arg0, arg1);
	}
	
	public PlainLiteral createPlainLiteral(String arg0) {
		return persistentModelSet.createPlainLiteral(arg0);
	}
	
	public QuadPattern createQuadPattern(UriOrVariable arg0, ResourceOrVariable arg1, UriOrVariable arg2, NodeOrVariable arg3) {
		return persistentModelSet.createQuadPattern(arg0, arg1, arg2, arg3);
	}
	
	public Statement createStatement(Resource arg0, URI arg1, Node arg2) {
		return persistentModelSet.createStatement(arg0, arg1, arg2);
	}
	
	public Statement createStatement(URI arg0, Resource arg1, URI arg2, Node arg3) {
		return persistentModelSet.createStatement(arg0, arg1, arg2, arg3);
	}
	
	public URI createURI(String arg0) {
		return persistentModelSet.createURI(arg0);
	}
	
	public boolean isBlankNode(Node n) {
		try {
			n.asBlankNode();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isDatatypeLiteral(Node n) {
		try {
			n.asDatatypeLiteral();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}
	
	public boolean isLanguageTagLiteral(Node n) {
		try {
			n.asLanguageTagLiteral();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isLiteral(Node n) {
		try {
			n.asLiteral();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isResource(Node n) {
		try {
			n.asResource();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}

	public boolean isURI(Node n) {
		try {
			n.asURI();		
		} catch (java.lang.ClassCastException e) {
			return false;
		}
		return true;
	}
	
	/**
     * add the passed ontology to the main repository. The passed RDF model must only contain one ontology
     * at a time.
     * @param ontologyUri URI identifying the ontology in the passed rdf model
     * @param ontology a string with a serialized form of the ontology
     * @param syntax RDF syntax of the passed stream
	 * @throws RepositoryException 
	 * @throws IOException 
	 * @throws RDFParseException 
     */
    public void addOntology(URI ontologyUri, InputStream ontology, Syntax syntax) 
    throws RepositoryException, RDFParseException, IOException, OntologyInvalidException {
    	if (containsOntology(ontologyUri)) {
    		logger.info("The ontology "+ontologyUri+" already exists.");
    	} else {
			RepositoryConnection connection = repository.getConnection();
			ValueFactory factory = repository.getValueFactory();
			RDFFormat format = RDFFormat.RDFXML; // RDF/XML by default
			if (syntax.equals(Syntax.Ntriples)) format = RDFFormat.NTRIPLES;
			else if (syntax.equals(Syntax.RdfXml)) format = RDFFormat.RDFXML;
			else if (syntax.equals(Syntax.Trig)) format = RDFFormat.TRIG;
			else if (syntax.equals(Syntax.Trix)) format = RDFFormat.TRIX;
			else if (syntax.equals(Syntax.Turtle)) format = RDFFormat.TURTLE;
	    	// add the ontology to the repository
			connection.add(ontology, ontologyUri.toString(), format, factory.createURI(ontologyUri.toString()));
    	}
    	
// 		Ismael: this doesn't work properly when working with the HTTP sesame server
//    	it always launch a Exception when querying the triple store. it may be a bug
//		in the RDF2Go library?
//		Solution: above code using directly Sesame connection to the repository
		
//	 	// creates a model for the ontology
//  	Model ont = RDF2Go.getModelFactory().createModel(ontologyUri);
//  	ont.open();
//  	try {
//  		// read the ontology from the inputstream
//        ont.readFrom(ontology, syntax);
//        // add the ontology to the persistent modelset
//        persistentModelSet.addModel(ont);
//    } catch (IOException e) {
//        throw new OntologyInvalidException(e.getLocalizedMessage(), e);
//    } finally{
//    	ont.close();
//    }		
    }
	
	/**
     * A combined call to removeOntology and addOntology, but without having the problem
     * of dependencies based on imports. This works best when the new version of the ontology
     * has the same imports than the old version.
     * @param ontologyUri URI identifying the ontology in the passed rdf model
     * @param ontology a stream with a serialized form of the ontology
     * @param syntax the rdf syntax
     * @throws NotFoundException if the passed ontology is not in the store at the moment
     * @throws SailUpdateException if the database breaks
     * @throws OntologyInvalidException if the ontology is not valid according to PimoChecker
     * @throws OntologyImportsNotSatisfiedException if imports are missing
     * @throws RepositoryStorageException if the updating in the repository does not work
	 * @throws IOException 
	 * @throws RDFParseException 
	 * @throws RepositoryException 
     */
    public void updateOntology(URI ontologyUri, InputStream ontology, Syntax syntax)
    throws NotFoundException, OntologyInvalidException, OntologyImportsNotSatisfiedException, RepositoryStorageException, RepositoryException, RDFParseException, IOException {
        // TODO: implement differently to avoid a dangling ontology.
        // removing and adding again does not work, if others depend on this ont
        removeOntology(ontologyUri);
        addOntology(ontologyUri, ontology, syntax);
    }
    
    /**
     * remove the ontology, identified by the passed ontology uri, from the repository.
     * The ontology has to be in the list of stored ontologies ({@link #listOntologies()}),
     * if not a NotFoundException will be thrown. If the ontology is imported by other ontologies
     * in the resource-store, a OntologyImportsNotSatisfiedException will be thrown, having the
     * affected ontologies listed there.
     * @param ontologyUri the uri to delete
     * @throws NotFoundException if the passed ontology is not in this pimo
     * @throws OntologyImportsNotSatisfiedException if the ontology is imported by other ontologies,
     * list the affected ontologies and remove them first.
     * @throws OntologyInvalidException when the ontology to be removed is either the user's personal pimo or the pimo-language
     * @throws RepositoryStorageException if the database has a problem removing the graph 
     */
    public void removeOntology(URI ontologyUri) throws OntologyImportsNotSatisfiedException,
    NotFoundException, OntologyInvalidException, RepositoryStorageException {
    	if (ontologyUri == null)
    		throw new IllegalArgumentException("ontologyUri is null");
    	if (!existsOntology(ontologyUri))
    		throw new NotFoundException("Ontology "+ontologyUri+" not found or is not a valid ontology URI.");

    	Model ontInModelset = persistentModelSet.getModel(ontologyUri);
    	ontInModelset.open();
    	if (ontInModelset.size() == 0)
    		throw new NotFoundException("Ontology "+ontologyUri+" has no triples in the store");
    	ontInModelset.close();
    	persistentModelSet.removeModel(ontologyUri);
    }

    /**
     * Checks if a specific ontology already exists in the persistent modelset
     * @param ontologyUri
     * @return
     */
    public boolean existsOntology(URI ontologyUri) {
    	Model model = persistentModelSet.getModel(ontologyUri);
    	return model.size() > 0;
    }
	
    /**
     * true if the ontology is in the named graphs of the repository
     * @param ontologyUri
     * @return true, if the ontology is in the store
     */
    public boolean containsOntology(URI ontologyUri) {
    	// TODO: check if this is really an ontology and not just a graph
   		return persistentModelSet.containsModel(ontologyUri);
//   		return false;
//    	return true;
    }
    
    public void addStatement(Statement statement) {
    	persistentModelSet.addStatement(statement);
    }
    
    public void addStatement(Resource subject, URI predicate, Node object) {
    	persistentModelSet.addStatement(null, subject, predicate, object);
    }
    
    public void addStatement(Resource subject, URI predicate, String object) {
    	persistentModelSet.addStatement(null, subject, predicate, createDatatypeLiteral(object, XSD._string));
    }
    
    public void addStatement(Resource subject, URI predicate, boolean object) {
    	persistentModelSet.addStatement(null, subject, predicate, createDatatypeLiteral(new Boolean(object).toString(), XSD._boolean));
    }
    
    public void addStatement(Resource subject, URI predicate, int object) {
    	persistentModelSet.addStatement(null, subject, predicate, createDatatypeLiteral(new Integer(object).toString(), XSD._int));
    }
    
    public void addStatement(Resource subject, URI predicate, Date object) {
    	persistentModelSet.addStatement(null, subject, predicate, createDatatypeLiteral(DateFormatter.formatDateISO8601(object), XSD._dateTime));
    }
    
    public void addStatement(URI context, Resource subject, URI predicate, Node object) {
    	persistentModelSet.addStatement(context, subject, predicate, object);
    }
    
    private void removeStatements(ResourceOrVariable subject, UriOrVariable predicate, NodeOrVariable object) {
    	persistentModelSet.removeStatements(Variable.ANY, subject, predicate, object);
    }
    
    public ClosableIterator<Statement> findStatements(QuadPattern arg0) throws ModelRuntimeException {
    	return persistentModelSet.findStatements(arg0);
    }

    public ClosableIterator<Statement> findStatements(
    		ResourceOrVariable subject,
    		UriOrVariable predicate,
    		NodeOrVariable object) throws ModelRuntimeException {
    	return findStatements(Variable.ANY, subject, predicate, object);
    }
    
    public ClosableIterator<Statement> findStatements(
    		UriOrVariable context,
    		ResourceOrVariable subject,
    		UriOrVariable predicate,
    		NodeOrVariable object) throws ModelRuntimeException {
    	return persistentModelSet.findStatements(context, subject, predicate, object);
    }

	/**
	 * @return an open RDF2Go model as a view on a certain set of quads in the
	 *         ContextModel
	 */
	public Model getPersistentModel(URI contextURI) {
		if (contextURI == null)
			throw new IllegalArgumentException("null");
		logger.debug("Getting model: " + contextURI);
		Model model = persistentModelSet.getModel(contextURI);
		model.open();
		return model;
	}

	public void clear() {
		persistentModelSet.removeAll();
	}

	public void finalize() {
		persistentModelSet.close();
	}
	
    /**
     * check if the passed URI is defined as an RDFS.Class, either in the
     * WorkModel or in the main storage.
     * 
     * @param clazz the uri to check.
     * @return true, if the URI has a type RDFS.Class
     */
    public boolean isClass(URI clazz) {
        boolean contains = 
        	persistentModelSet.containsStatements(Variable.ANY, clazz, RDF.type, RDFS.Class)
        	|| persistentModelSet.containsStatements(Variable.ANY, clazz, RDF.type, OWL.Class);
        return contains;
    }
    
    /**
     * check if the passed URI is defined as an RDF.Property, either in the
     * WorkModel or in the main storage.
     * @param property the property to check
     * @return true, if the URI has a type RDF.Property
     */
    public boolean isProperty(URI property) {
        boolean contains = persistentModelSet.containsStatements(
            Variable.ANY,
            property,
            RDF.type,
            RDF.Property);
        return contains;
    }

    /**
     * check if the passed URI is defined as instance of the passed class
     * in the main storage.
     * @param resource the resource in question
     * 
     * @param clazz the uri to check.
     * @return true, if the URI has a type RDFS.Class
     */
    public boolean isResource(URI resource, URI clazz) {
    	if (resource == null) return false;
        return persistentModelSet.containsStatements(Variable.ANY, resource, RDF.type, clazz);
    }    
    
//    /**
//     * Creates a new resource with a specific URI
//     * @param uri
//     * @param ofClass
//     * @return
//     * @throws OntologyInvalidException
//     */
//    public URI createBuildingBlock(URI uri, URI ofClass)
//    throws OntologyInvalidException {
//    	assertClass(ofClass);
//    	persistentModelSet.addStatement(null, uri, RDF.type, ofClass);
//    	return uri;
//    }
    
    public void removeResource(Resource resource) throws NotFoundException {
//    	if(!isResource(resource))
//    		throw new NotFoundException();
    	// TODO: Only removes statements which subject is the resource, but the resource
    	// can still be in other statements as an object, and other resources only used
    	// by this resource are still in the store.
   		persistentModelSet.removeStatements(Variable.ANY, resource, Variable.ANY, Variable.ANY);
    }
    
	/**
     * Set the RDFSlabel and DC:title of the resource to the 
     * passed label. The resource can be a thing, class,
     * or property. The method deletes old rdfs:label and dc:title values
     * and replaces them.
     * @param resource the resource to change
     * @param label the new label.
	 * @throws OntologyReadonlyException when the resource is not writable
	 * @throws NotFoundException when the resource was not found or cannot be
     * connected to an ontology in which it is defined
     */
    public void setLabel(Resource resource, String label) throws OntologyReadonlyException, NotFoundException {
    	removeStatements(resource, DC.title, Variable.ANY);
    	removeStatements(resource, RDFS.label, Variable.ANY);
    	addStatement(resource, DC.title, label);
    	addStatement(resource, RDFS.label, label);
    }
    
    /**
     * check if the passed URI is a class and throw an exception if not
     * 
     * @param clazz the class to check
     * @throws OntologyInvalidException if the class is not a class
     */
    protected void assertClass(URI clazz) throws OntologyInvalidException {
        if (!isClass(clazz))
            throw new OntologyInvalidException("Class "+clazz+" is not an RDFS-class");
    }
    
	public URI newRandomUniqueURI() {
		return persistentModelSet.newRandomUniqueURI();
	}

	/**
     * Creates a new URI inside the namespace returned by 
     * {@link #getUserNamespace()}. The name passed as parameter
     * will be used inside this url, to increase readability.
     * If a URI with that name already exists, a random part will
     * be added to the name (the name is treated as "seed").
     * @param name a name to include in the URI
     * @return a new URI that is unique, new and from the namespace,
     * and contains the passed name.
     * No two uris returned here are the same.
     */
    public URI createUriWithName(URI namespace, String name) {
    	return createURI(namespace.toString()+name);
    }
    
    public URI createUniqueUri(URI namespace) {
    	return getCleanUniqueURI(namespace, null, false);
    }

    public URI createUniqueUriWithName(URI namespace, String name) {
    	return getCleanUniqueURI(namespace, name, false);
    }

    /**
     * get an URI that was not used before, use the passed ontology to create
     * the uri in there. If the uri is already taken, add some numbers to it,
     * but only do that when nullifexists is false, otherwise return null to
     * indicate that the uri is taken.
     * <p>
     * We should only use characters allowed in XML names, as RDF serialization
     * may brake otherwise. Correct <a
     * href="http://www.w3.org/TR/REC-xml/#NT-Name">XML names</a> are:
     * </p>
     * 
     * <pre>[5]     Name       ::=      (Letter | '_' | ':') (NameChar)*
     [4]     NameChar       ::=      Letter | Digit | '.' | '-' | '_' | ':' | CombiningChar | Extender</pre>
     * 
     * @param namespace namespace to use
     * @param name a seed for generating a good name
     * @param nullifexists if this is true, this method will return null if the
     *        passed name exists in that ontology
     * @return a new URI
     */
    public URI getCleanUniqueURI(
        URI namespace,
        String name,
        boolean nullifexists) {
        String cleanName = name == null ? "" : name;//TODO toCleanName(name);
        
        long millis = System.currentTimeMillis();
        URI uri = new URIImpl(namespace + cleanName + millis);
        try {
            boolean ok = false;
            while (!ok) {
                ok = true;
                ok = ok && !createdURIs.contains(uri);
                ok = ok
                    && !persistentModelSet.containsStatements(
                        Variable.ANY,
                        uri,
                        Variable.ANY,
                        Variable.ANY);
                ok = ok
                    && !persistentModelSet.containsStatements(
                        Variable.ANY,
                        Variable.ANY,
                        Variable.ANY,
                        uri);
                if (!ok) {
                    if (nullifexists)
                        return null;
                    uri = new URIImpl(namespace + cleanName + millis);
                    millis++;
                }
            }
            createdURIs.add(uri);
            
        } catch (ModelRuntimeException e) {
        	logger.error("Programming error: "+e);
        }
        return uri;
    }

    /**
     * make this name clean of all characters that should not be in a uri.
     * @param name the name to clean
     * @return a name without funny characters. 
     */
    public static String toCleanName(String name) {
        String cleanName = name;
        // replace all non-alphanum characters that are not allowed in XML names
        // with nothing
        // \w stands for alphas and nums
        cleanName = cleanName.replaceAll("[^\\w\\.\\-_:]", "");
        
        if (cleanName.length() == 0)
            cleanName = "x";

        // check if cleanname starts with a character (XML spec),
        // if not, add x at the beginning.
        if (!cleanName.substring(0, 1).matches("\\A\\w"))
            cleanName = "x" + cleanName;
        return cleanName;
    }
    
    public URI getUniqueNamespace(
        URI preffix,
        String name,
        boolean nullifexists) {
        String cleanName = name == null ? "" : name;
        
        long millis = System.currentTimeMillis();
        URI uri = new URIImpl(preffix + cleanName + millis);
        try {
            boolean ok = false;
            while (!ok) {
                ok = true;
                ok = ok && !createdURIs.contains(uri);
                ok = ok
                    && !persistentModelSet.containsStatements(
                    	uri,
                    	Variable.ANY,
                        Variable.ANY,
                        Variable.ANY);
                if (!ok) {
                    if (nullifexists)
                        return null;
                    uri = new URIImpl(preffix + cleanName + millis);
                    millis++;
                }
            }
            createdURIs.add(uri);
            
        } catch (ModelRuntimeException e) {
        	logger.error("Programming error: "+e);
        }
        return uri;
    }
    
    /**
     * Set the domain and range for the property. When an inverse propery exists,
     * will also change domain/range for that.
     * Domain/ranges that were set before will be <b>deleted</b>.
     * @param property
     * @param domain
     * @param range
     */
	public void setDomainRange(URI property, URI domain, URI range, Model inModel) {
		inModel.removeStatements(property, RDFS.domain, Variable.ANY);
		inModel.removeStatements(property, RDFS.range, Variable.ANY);
		inModel.addStatement(property, RDFS.domain, domain);
		inModel.addStatement(property, RDFS.range, range);
	}
	
	public boolean sparqlAsk(String query) {
        return persistentModelSet.sparqlAsk(query);
	}

	public ClosableIterable<Statement> sparqlConstruct(String query) {
		return persistentModelSet.sparqlConstruct(query);
	}
	
	public ClosableIterable<Statement> sparqlDescribe(String query) {
        return persistentModelSet.sparqlDescribe(query);
	}
	
	public QueryResultTable sparqlSelect(String query) {
        return persistentModelSet.sparqlSelect(query);
	}

	public void export(OutputStream output, Syntax syntax) {
		try {
            persistentModelSet.writeTo(output, syntax);       
        } catch (Exception e) {
			e.printStackTrace();
		}
	}


	
	
	// TODO remove it
	public void dump() {
		persistentModelSet.dump();
	}

}

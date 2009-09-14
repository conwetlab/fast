package eu.morfeoproject.fast.catalogue;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.ontoware.aifbcommons.collection.ClosableIterable;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.exception.ModelRuntimeException;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.ModelSet;
import org.ontoware.rdf2go.model.QuadPattern;
import org.ontoware.rdf2go.model.QueryResultTable;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.impl.DelegatingModel;
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
import org.ontoware.rdf2go.util.RDFTool;
import org.ontoware.rdf2go.vocabulary.OWL;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.openrdf.rdf2go.RepositoryModelSet;
import org.openrdf.repository.Repository;
import org.openrdf.repository.RepositoryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.services.rdfrepository.RDFRepository;
import eu.morfeoproject.fast.services.rdfrepository.RepositoryStorageException;
import eu.morfeoproject.fast.vocabulary.FGO;

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

	/**
	 * default model is FCO
	 */
	private Model defaultModel;
	
	private List<URI> createdURIs;
	
//	public TripleStore() {
//		Repository repository = PersistentRepository.getInstance().getGroundingRepository();
//		persistentModelSet = new RepositoryModelSet(repository);
//		createdURIs = new ArrayList<URI>();
//		
//		// TODO: Now create the screen under the ScreenOnt namespace, but this has to be
//		//       created in the user's namespace
//		defaultModel = getPersistentModelSet().getModel(FCO.NS_FCO);
//	}
	
	public TripleStore(File dir, String indexes) {
		Repository repository = PersistentRepository.getRepository(dir, indexes);
		persistentModelSet = new RepositoryModelSet(repository);

		createdURIs = new ArrayList<URI>();
		
		// TODO: Now create the screen under the ScreenOnt namespace, but this has to be
		//       created in the user's namespace
		defaultModel = getPersistentModelSet().getModel(FGO.NS_FGO);
	}
	
	public void open() {
		getDefaultModel().open();
		getPersistentModelSet().open();
	}
	
	public void close() {
		// close the default model
		getDefaultModel().close();
		// close every model in the pool
		
		// close the model set
		getPersistentModelSet().close();
	}
	
    private Model getDefaultModel() {
		return defaultModel;
	}

//	public void setWorkingModel(Model workingModel) throws ModelInvalidException {
////		this.workingModel.close();//TODO i am not sure
//		if (workingModel == null)
//			throw new ModelInvalidException("The working model cannot be null");
//		this.workingModel = workingModel;
////		this.workingModel.open();//TODO i am not sure
//	}
	
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
	
//	public void namespaces() {
//		RepositoryConnection con;
//		try {
//			con = repository.getConnection();
//			
//				try {
//					RepositoryResult<Namespace> results = con.getNamespaces();
//					while (results.hasNext())
//						logger.debug(results.next());
//				} catch (RepositoryException e) {
//					// TODO Auto-generated catch block
//					e.printStackTrace();
//				} finally {
//					con.close();
//				}
//		} catch (RepositoryException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
//	}
	
	/**
     * add the passed ontology to the main repository. The passed RDF model must only contain one ontology
     * at a time. The ontology should have declared imports statements for other ontologies it 
     * needs, these will be automatically compared to the list of ontologies, if a prerequisite
     * misses, an  OntologyImportsNotSatisfiedException will be thrown.
     * Before importing, the ontology will tested by merging it with its imports and 
     * checked using the PIMO-Checker. If it does not pass this test, an OntologyInvalidException
     * is thrown.
     * @param ontologyUri URI identifying the ontology in the passed rdf model
     * @param ontology a string with a serialized form of the ontology
     * @param syntax RDF syntax of the passed stream
     * @param formatMimetype the rdf mimetype serialization format of the string, 
     * see {@link RDFRepository} for an explanation. 
     * @throws RepositoryStorageException if the database breaks
     * @throws OntologyInvalidException if the ontology is not valid according to PimoChecker
     * @throws OntologyImportsNotSatisfiedException if imports are missing
     */
    public void addOntology(URI ontologyUri, InputStream ontology, Syntax syntax) throws OntologyInvalidException {
       	if (containsOntology(ontologyUri))
       		throw new OntologyInvalidException("The ontology "+ontologyUri+" already exists.");
       	
       	// creates a model for the ontology
      	Model ont = RDF2Go.getModelFactory().createModel();
      	ont.open();
      	try {
      		// read the ontology from the inputstream
            ont.readFrom(ontology, syntax);
            // add the ontology to the persistent modelset
//            Model ontModel = getPersistentModelSet().getModel(ontologyUri);
            getPersistentModelSet().addModel(ont, ontologyUri);
            Map<String, String> namespaces = ont.getNamespaces();
            for (String key : namespaces.keySet()) {
            	if (!getPersistentModelSet().getNamespaces().containsKey(key)) {
	            	String value = namespaces.get(key);
	            	getPersistentModelSet().setNamespace(key, value);
	            	logger.info("added namespace "+key+"="+value);
            	}
            }
//           	ontModel.addAll(ont.iterator());
//           	ontModel.close();
        } catch (IOException e) {
            throw new OntologyInvalidException(e.getLocalizedMessage(), e);
        } finally{
        	ont.close();
        }
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
     */
    public void updateOntology(URI ontologyUri, InputStream ontology, Syntax syntax)
        throws NotFoundException, OntologyInvalidException, 
        OntologyImportsNotSatisfiedException,
        RepositoryStorageException{
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
    	if (!containsOntology(ontologyUri))
    		throw new NotFoundException("Ontology "+ontologyUri+" not found or is not a valid ontology URI.");
    	// you cannot remove the core ontologies
//    	if (ontologyUri.equals(pimoClient.getPimoUri()))
//    		throw new OntologyInvalidException("You cannot delete the PIMO of the user");
//    	if (PimoDefaultOntologies.containsOntologyUri(ontologyUri))
//    		throw new OntologyInvalidException("You cannot delete a default ontology");

    	Model ontInModelset = getPersistentModelSet().getModel(ontologyUri);
    	ontInModelset.open();
    	if (ontInModelset.size() == 0)
    		throw new NotFoundException("Ontology "+ontologyUri+" has no triples in the store");
    	ontInModelset.close();
    	getPersistentModelSet().removeModel(ontologyUri);
    }

//    /**
//     * Checks if a specific ontology already exists in the persistent modelset
//     * @param ontologyUri
//     * @return
//     */
//    public boolean existOntology(URI ontologyUri) {
//    	Model model = getPersistentModelSet().getModel(ontologyUri);
//    	return model.size() > 0;
//    }
	
    /**
     * true if the ontology is in the named graphs of the repository
     * @param ontologyUri
     * @return true, if the ontology is in the store
     */
    public boolean containsOntology(URI ontologyUri) {
    	// TODO: check if this is really an ontology and not just a graph
   		return getPersistentModelSet().containsModel(ontologyUri);
    }
    
    public boolean removeModel(URI uriModel) {
    	if (uriModel == null)
    		throw new IllegalArgumentException("uriModel is null");
    	return getPersistentModelSet().removeModel(uriModel);
    }
    
    public List<URI> getDirectSubClasses(URI clazz) {
    	return getDirectSubClasses(Variable.ANY, clazz);
    }

    public List<URI> getDirectSubClasses(UriOrVariable ontologyUri, URI clazz) {
    	ArrayList<URI> results = new ArrayList<URI>();
    	ClosableIterator<Statement> statements = getPersistentModelSet().findStatements(ontologyUri, Variable.ANY, RDFS.subClassOf, clazz);
    	while (statements.hasNext()) {
    		Statement st = statements.next();
    		logger.debug("{SUBCLASSOF} "+st);
    		URI subClass = st.getSubject().asURI();
    		String prefix = subClass.toString().substring(0, subClass.toString().indexOf("#"));
    		if (!subClass.equals(clazz)
    				&& !prefix.equals(RDF.RDF_NS)
    				&& !prefix.equals(RDFS.RDFS_NS)
    				&& !prefix.equals(OWL.OWL_NS)) {
    			if (!results.contains(subClass))
    				results.add(subClass);
    		}
    	}
    	statements.close();
    	return results;
    }
    
    public List<URI> getDirectSuperClasses(URI clazz) {
    	return getDirectSuperClasses(Variable.ANY, clazz);
    }
    
    public List<URI> getDirectSuperClasses(UriOrVariable ontologyUri, URI clazz) {
    	ArrayList<URI> results = new ArrayList<URI>();
    	ClosableIterator<Statement> statements = getPersistentModelSet().findStatements(ontologyUri, Variable.ANY, RDFS.subClassOf, clazz);
    	while (statements.hasNext()) {
    		Statement st = statements.next();
    		URI superClass = st.getObject().asURI();
    		String prefix = superClass.toString().substring(0, superClass.toString().indexOf("#"));
    		if (!superClass.equals(clazz)
    				&& !prefix.equals(RDF.RDF_NS)
    				&& !prefix.equals(RDFS.RDFS_NS)
    				&& !prefix.equals(OWL.OWL_NS)) {
    			if (!results.contains(superClass))
    				results.add(superClass);
    		}
    	}
    	statements.close();
        return results;
    }
    
	/**
	 * @return an open RDF2Go model as a view on a certain set of quads in the
	 *         ContextModel
	 */
	public Model getPersistentModel(URI contextURI) {
		if (contextURI == null)
			throw new IllegalArgumentException("null");
		logger.debug("Getting model: " + contextURI);
		Model model = getPersistentModelSet().getModel(contextURI);
		model.open();
		return model;
	}

	/** return an in-memory Model, opened */
//	public Model getTempModel(URI uri) {
//		// IMPROVE for hardcore scalability use persistent modlsets here
//		ModelSet inMemoryModelSet = new RepositoryModelFactory().createModelSet();
//		inMemoryModelSet.open();
//		Model m = inMemoryModelSet.getModel(uri);
//		m.open();
//		return new ClosingModel(m,inMemoryModelSet);
//	}

	class ClosingModel extends DelegatingModel {
		private ModelSet modelset;

		public ClosingModel(Model model, ModelSet modelset) {
			super(model);
			this.modelset = modelset;
		}

		public void close() {
			super.close();
			modelset.close();
		}
	}

	/**
	 * Adds the contents of an external model to the context model. Expensive
	 * operation, as the model has to be copied.
	 * 
	 * @param m
	 * @return the persistent Model, opened
	 */
//	public Model addModelAndPersist(Model m) {
//		assert m != null;
//
//		// if m is a persistent model already: copy to memory first
//		if (m.getContextURI() != null
//				&& getPersistentModelSet().containsModel(m.getContextURI())) {
//			throw new RuntimeException("A model with URI "+m.getContextURI()+" is already in the persistent store");
//		} else {
//			URI u = getPersistentModelSet().newRandomUniqueURI();
//			Model persistent = getPersistentModel(u);
//			ClosableIterator<Statement> it = m.iterator();
//			persistent.addAll(it);
//			it.close();
//			return persistent;
//		}
//
//	}

	// TODO remove it
	public void dump() {
		getPersistentModelSet().dump();
	}

	public void clear() {
		getPersistentModelSet().removeAll();
	}

	/**
	 * Make sure all bnodes have a unique inverse functional property
	 * 
	 * TODO: test this method
	 * 
	 * @param m
	 * @return
	 * @throws Exception
	 */
	public static void bnodeEnrichment(Model m) throws Exception {
//		Iterator<Statement> it = m.iterator();
//		Map<BlankNode, URI> knownBnodes = new HashMap<BlankNode, URI>();
//
//		DiffImpl diff = new DiffImpl();
//		boolean changed = false;
//		while (it.hasNext()) {
//			Statement s = it.next();
//			if (s.getSubject() instanceof BlankNode) {
//				changed = true;
//				URI u = knownBnodes.get(s.getSubject());
//				if (u == null) {
//					u = m.newRandomUniqueURI();
//					knownBnodes.put((BlankNode) s.getSubject(), u);
//				}
//				diff.addStatement(s.getSubject(), SemVersion.BLANK_NODE_ID,
//						u);
//			}
//			if (s.getObject() instanceof BlankNode) {
//				changed = true;
//				URI u = knownBnodes.get(s.getObject());
//				if (u == null) {
//					u = m.newRandomUniqueURI();
//					knownBnodes.put((BlankNode) s.getObject(), u);
//				}
//				diff.addStatement((Resource) s.getObject(),
//						SemVersion.BLANK_NODE_ID, u);
//			}
//		}
//		if (changed) {
//			m.addAll(diff.getAdded().iterator());
//		}
	}

	public URI newRandomUniqueURI() {
		return getPersistentModelSet().newRandomUniqueURI();
	}

	/**
	 * @return persistent ModelSet
	 */
	ModelSet getPersistentModelSet() {
		return this.persistentModelSet;
	}

	/**
	 * return a non-persistent copy of the model stored at the given URI.
	 * Returned model is open
	 */
//	public Model getAsTempCopy(URI modelURI) {
//		Model p = getPersistentModel(modelURI);
//		Model copy = getTempModel(newRandomUniqueURI());
//		ClosableIterator<Statement> it = p.iterator();
//		copy.addAll(it);
//		it.close();
//		return copy;
//	}

	public void finalize() {
		getPersistentModelSet().close();
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
        	getPersistentModelSet().containsStatements(Variable.ANY, clazz, RDF.type, RDFS.Class)
        	|| getPersistentModelSet().containsStatements(Variable.ANY, clazz, RDF.type, OWL.Class);
        return contains;
    }
    
    /**
     * check if the passed URI is defined as an RDF.Property, either in the
     * WorkModel or in the main storage.
     * @param property the property to check
     * @return true, if the URI has a type RDF.Property
     */
    private boolean isProperty(URI property) {
        boolean contains = getPersistentModelSet().containsStatements(
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
        return getPersistentModelSet().containsStatements(Variable.ANY, resource, RDF.type, clazz);
    }    
    
    ///// NO SE SI ESTOS METODOS DEBERIAN EXISTIR
    public void addStatement(Statement statement) {
    	getDefaultModel().addStatement(statement);
    }
    public void addStatement(Resource subject, URI predicate, Node object) {
    	getDefaultModel().addStatement(subject, predicate, object);
    }
    public void addStatement(Resource subject, URI predicate, String object) {
    	getDefaultModel().addStatement(subject, predicate, object);
    }
    public void addStatement(URI context, Resource subject, URI predicate, Node object) {
    	getPersistentModelSet().addStatement(context, subject, predicate, object);
    }
    /////
    
    public List<URI> getSubClasses(URI clazz) {
       	List<URI> results = new ArrayList<URI>();
    	List<URI> subClasses = getDirectSubClasses(clazz);
    	results.addAll(subClasses);
    	for (URI subClass : subClasses)
    		results.addAll(getSubClasses(subClass));
    	return results;
    }
    
    public List<URI> getSuperClasses(URI clazz) {
    	List<URI> results = new ArrayList<URI>();
    	List<URI> superClasses = getDirectSuperClasses(clazz);
    	results.addAll(superClasses);
    	for (URI superClass : superClasses)
    		results.addAll(getSuperClasses(superClass));
    	return results;
    }
    

    //////////// METODOS EXTRAIDOS DE CLIENTSESSION ///////////////
    
    public URI getOrCreateClass(String name)
    throws RepositoryException, OntologyInvalidException {
    	return getOrCreateClass(name, getDefaultModel()); 
    }
    
    private URI getOrCreateClass(String name, Model inModel)
    throws RepositoryException, OntologyInvalidException {
    	ClosableIterator<Statement> it = inModel.findStatements(Variable.ANY, RDF.type, RDFS.Class);
    	for ( ; it.hasNext(); ) {
			Resource r = it.next().getSubject();
			if (RDFTool.getLabel(r).equals(toCleanName(name))) {
				it.close();
				return r.asURI();
			}
    	}
    	it.close();
    	// the class was not found, so it's created
    	return createClass(name, inModel);
    }
    
    public URI getOrCreateClass(String name, URI superClass) 
    throws RepositoryException, OntologyInvalidException {
    	return getOrCreateClass(name, superClass, getDefaultModel());
    }

    private URI getOrCreateClass(String name, URI superClass, Model inModel) 
    throws RepositoryException, OntologyInvalidException {
    	ClosableIterator<Statement> it = inModel.findStatements(Variable.ANY, RDF.type, RDFS.Class);
    	for ( ; it.hasNext(); ) {
			Resource r = it.next().getSubject();
			if (RDFTool.getLabel(r).equals(toCleanName(name))) {
				it.close();
//			if (r.toString().equals(inModel.getContextURI() + name))
				return r.asURI();
			//TODO: should be checked if the class is a subClass of the superClass URI?
			}
    	}
    	it.close();
    	// the class was not found
    	return createClass(name, superClass, inModel);
    }
    
    public URI getOrCreateClass(String name, URI superClass, URI namespace) throws OntologyInvalidException {
    	URI uri = new URIImpl(namespace+name);
    	ClosableIterator<Statement> it = persistentModelSet.findStatements(namespace, uri, RDF.type, RDFS.Class);
    	URI result = null;
    	if (it.hasNext()) {
    		result = it.next().getSubject().asURI();
    		it.close();
    	} else {
    		result = createClass(name, superClass, namespace);
    	}
    	return result;
    }    
    
    /**
     * Create a new class for the user, it gets typed an rdfs:Class. Superclass
     * is the passed class. New classes are always created in the workModel,
     * which is a new context. The user can only create classes that have not
     * been created by himself, to avoid duplication each class has to have a
     * distinctive name.
     * 
     * @param name the name of the class, used as label and part of the uri
     * @param superClass the uri of the superclass of the created class
     * @param inModel the model in which the class is created
     * @return the uri of the created class
     * @throws OntologyInvalidException if the passed superClass is not defined
     *         as class in the users pimo. Gunnar protested, we should not be
     *         able to edit any model. Provenance MUST BE CORRECT!
     * @throws RepositoryException 
     */
    public URI createClass(String name, Model inModel)
    throws OntologyInvalidException, RepositoryException {
    	return createClass(name, RDFS.Class, inModel);
    }
    
    /**
     * Create a new class for the user, it gets typed an rdfs:Class. Superclass
     * is the passed class. New classes are always created in the workModel,
     * which is a new context. The user can only create classes that have not
     * been created by himself, to avoid duplication each class has to have a
     * distinctive name.
     * 
     * @param name the name of the class, used as label and part of the uri
     * @param superClass the uri of the superclass of the created class
     * @param inModel the model in which the class is created
     * @return the uri of the created class
     * @throws OntologyInvalidException if the passed superClass is not defined
     *         as class in the users pimo. Gunnar protested, we should not be
     *         able to edit any model. Provenance MUST BE CORRECT!
     * @throws RepositoryException 
     */
    public URI createClass(String name, URI superClass, Model inModel)
    throws OntologyInvalidException, RepositoryException {
    	URI uriClass = inModel.createURI(inModel.getContextURI()+name);
    	if (isClass(uriClass))
    		throw new OntologyInvalidException("There already exists a class with the same name '"
    				+name+"' with URI "+uriClass);
    	assertClass(superClass);
    	inModel.addStatement(uriClass, RDF.type, RDFS.Class);
    	inModel.addStatement(uriClass, RDFS.subClassOf, superClass);
    	inModel.addStatement(uriClass, RDFS.label, name);
    	logger.info("Created '"+uriClass+"' class in "+inModel.getContextURI()+".");
    	return uriClass;
    }
    
    // FIXME add a label to the class
    public URI createClass(String name, URI superClass, URI namespace) throws OntologyInvalidException {
    	URI uriClass = persistentModelSet.createURI(namespace+name);
    	if (isClass(uriClass))
    		throw new OntologyInvalidException("There already exists a class with the same name '"
    				+name+"' with URI "+uriClass);
    	if (superClass != null)
    		assertClass(superClass);
    	persistentModelSet.addStatement(namespace, uriClass, RDF.type, RDFS.Class);
    	if (superClass != null)
    		persistentModelSet.addStatement(namespace, uriClass, RDFS.subClassOf, superClass);
//    	persistentModelSet.addStatement(namespace, uriClass, RDFS.label, new LiteralImpl(name));
    	logger.info("Created '"+uriClass+"' class in "+namespace+".");
    	return uriClass;
    }
    
    /**
     * Create a new resource, an instance of a rdfs:Class New resources are
     * always created in the workModel, which is a new context.
     * The initial label of the resource will be derived from the class.
     * 
     * @param ofClass the uri of the class of the created resource
     * @return the uri of the created resource
     * @throws OntologyInvalidException if the passed uri is not defined as
     *         class in the pimo.
     */
    public URI createResource(URI ofClass) throws OntologyInvalidException {
    	return createResource(ofClass, getDefaultModel());
    }
    
    /**
     * Creates a new resource with a specific URI
     * @param uri
     * @param ofClass
     * @return
     * @throws OntologyInvalidException
     */
    public URI createResource(URI uri, URI ofClass) throws OntologyInvalidException {
    	return createResource(uri, RDFTool.getLabel(ofClass), ofClass, getDefaultModel());
    }
    
    /**
     * Create a new resource, an instance of a rdfs:Class New resources are
     * always created in the workModel, which is a new context.
     * The initial label of the resource will be derived from the class.
     * 
     * @param ofClass the uri of the class of the created resource
     * @return the uri of the created resource
     * @throws OntologyInvalidException if the passed uri is not defined as
     *         class in the pimo.
     */
    private URI createResource(URI ofClass, Model inModel) throws OntologyInvalidException {
    	String name = RDFTool.getLabel(ofClass);
    	return createResource(name, ofClass, inModel);
    }

    public URI createResource(URI uri, String name, URI ofClass, Model inModel)
    throws OntologyInvalidException {
	    assertClass(ofClass);
	    
	    if (uri == null)
	    	uri = createUniqueUriWithName(inModel.getContextURI(), name);
	    
	    inModel.addStatement(uri, RDF.type, ofClass);
//	    inModel.addStatement(uri, RDFS.label, name);
//    inModel.addStatement(result, NAO.prefLabel, name);
//    inModel.addStatement(result, NAO.created, 
//        new DatatypeLiteralImpl(RDFTool.dateTime2String(new Date()), XSD._dateTime));
//    inModel.addStatement(result, PIMO.isDefinedBy, getPimoUri());
	    return uri;
    }
    
    /**
     * Create a new resource
     * 
     * @param name
     * @param ofClass
     * @param inModel
     * @return the resource
     * @throws OntologyInvalidException 
     */
    private URI createResource(String name, URI ofClass, Model inModel)
    throws OntologyInvalidException {
        URI resourceUri = createUniqueUriWithName(inModel.getContextURI(), name);
        return createResource(resourceUri, name, ofClass, inModel);
    }
    
    public void removeResource(Resource resource) throws NotFoundException {
//    	if(!isResource(resource))
//    		throw new NotFoundException();
    	// TODO: Only removes statements which subject is the resource, but the resource
    	// can still be in other statements as an object, and other resources only used
    	// by this resource are still in the store.
    	if (getDefaultModel().contains(resource, Variable.ANY, Variable.ANY))
    		getDefaultModel().removeStatements(resource, Variable.ANY, Variable.ANY);
    	else if (getPersistentModelSet().containsStatements(Variable.ANY, resource, Variable.ANY, Variable.ANY)) {
    		logger.debug("size="+getPersistentModelSet().size());
    		getPersistentModelSet().removeStatements(Variable.ANY, resource, Variable.ANY, Variable.ANY);
    		logger.debug("size="+getPersistentModelSet().size());
    	}
    }
    
//    public URI getOrCreateTag(String name, URI namespace)
//    throws OntologyInvalidException, RepositoryException {
//    	Model tagModel = getPersistentModel(namespace);
//    	ClosableIterator<Statement> it = tagModel.findStatements(Variable.ANY, RDF.type, FCO.Tag);
//    	for ( ; it.hasNext(); ) {
//			Resource r = it.next().getSubject();
//			if (RDFTool.getLabel(r).equals(toCleanName(name))) {
//				it.close();
//				return r.asURI();
//			//TODO: should be checked if the class is a subClass of the superClass URI?
//			}
//    	}
//    	it.close();
//    	// the tag was not found
//    	URI tag = createResource(name, FCO.Tag, tagModel);
//    	tagModel.addStatement(tag, RDFS.label, name);
//    	tagModel.close();
//    	return tag;
//    }
    
	/**
     * Set the preflabel and RDFSlabel of the resource to the 
     * passed label. The resource can be a thing, class,
     * or property. The method deletes old rdfs:label and nao:prefLabel values
     * and replaces them.
     * @param resource the resource to change
     * @param label the new label.
	 * @throws OntologyReadonlyException when the resource is not writeable
	 * @throws NotFoundException when the resource was not found or cannot be
     * connected to an ontology in which it is defined
     */
    public void setLabel(URI resource, String label) throws OntologyReadonlyException, NotFoundException {
    	setLabel(resource, label, getDefaultModel());
    }
    
	/**
     * Set the preflabel and RDFSlabel of the resource to the 
     * passed label. The resource can be a thing, class,
     * or property. The method deletes old rdfs:label and nao:prefLabel values
     * and replaces them.
     * @param resource the resource to change
     * @param label the new label.
	 * @throws OntologyReadonlyException when the resource is not writeable
	 * @throws NotFoundException when the resource was not found or cannot be
     * connected to an ontology in which it is defined
     */
    private void setLabel(URI resource, String label, Model inModel) throws OntologyReadonlyException, NotFoundException {
//        assertWriteableResource(resource, "change label");
        // is there a personal identifier?
//        Model m = getMagicModel();
//        String personalidentifier = RDFTool.getSingleValueString(m, resource, NAO.personalIdentifier);
//        if (personalidentifier != null)
//        	try {
//        		// there is a personal identifier, change it
//        		setPersonalIdentifier(resource, label);
//        	} catch (NameNotUniqueException x) {
//        		// well, then remove the old one
//                getPersistentModelSet().removeStatements(Variable.ANY, resource, NAO.personalIdentifier, Variable.ANY);
//        	}
//    	inModel.removeStatements(resource, DC.title, Variable.ANY);
    	inModel.removeStatements(resource, RDFS.label, Variable.ANY);
//    	inModel.addStatement(resource, DC.title, label);
    	inModel.addStatement(resource, RDFS.label, label);
    }
    
    /**
     * check if the passed URI is a class and throw an exception if not
     * 
     * @param clazz the class to check
     * @throws OntologyInvalidException if the class is not a class
     */
    protected void assertClass(URI clazz) throws OntologyInvalidException {
        if (!isClass(clazz))
            throw new OntologyInvalidException("Class "
                + clazz
                + " is not an RDFS-class");
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
    
    public URI createUniqueUriWithName(URI namespace, String name) {
    	return getCleanUniqueURI(namespace, name, false);
    }
    
    public ClosableIterator<Statement> findStatements(QuadPattern arg0)
    throws ModelRuntimeException {
    	return getPersistentModelSet().findStatements(arg0);
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
    	return getPersistentModelSet().findStatements(context, subject, predicate, object);
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
        String cleanName = toCleanName(name);
        
        long millis = System.currentTimeMillis();
        URI uri = new URIImpl(namespace + cleanName + millis);
        try {
            boolean ok = false;
            while (!ok) {
                ok = true;
                ok = ok && !createdURIs.contains(uri);
                ok = ok
                    && !getPersistentModelSet().containsStatements(
                        Variable.ANY,
                        uri,
                        Variable.ANY,
                        Variable.ANY);
                ok = ok
                    && !getPersistentModelSet().containsStatements(
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
//            throw new PimoError("Programming error: " + x, x);
        }
        return uri;
    }

    /**
     * make this name clean of all characters that should not be in a uri.
     * Method used internally and by PimoQuery
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
		// inverse?
//		URI inverse = (URI) RDFTool.getSingleValue(inModel, property, NRL.inverseProperty);
//		if (inverse != null) {
//			inModel.removeStatements(inverse, RDFS.domain, Variable.ANY);
//			inModel.removeStatements(inverse, RDFS.range, Variable.ANY);
//			inModel.addStatement(inverse, RDFS.domain, range);
//			inModel.addStatement(inverse, RDFS.range, domain);
//		}
	}
	
	public boolean sparqlAsk(String query) {
        return getPersistentModelSet().sparqlAsk(query);
	}

	public ClosableIterable<Statement> sparqlConstruct(String query) {
		return getPersistentModelSet().sparqlConstruct(query);
	}
	
	public ClosableIterable<Statement> sparqlDescribe(String query) {
        return getPersistentModelSet().sparqlDescribe(query);
	}
	
	public QueryResultTable sparqlSelect(String query) {
        return getPersistentModelSet().sparqlSelect(query);
	}

	public void export(OutputStream output, Syntax syntax) {
		try {
            persistentModelSet.writeTo(output, syntax);       
        } catch (Exception e) {
			e.printStackTrace();
		}
	}
}

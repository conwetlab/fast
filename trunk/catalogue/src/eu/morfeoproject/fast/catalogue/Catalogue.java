package eu.morfeoproject.fast.catalogue;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.log4j.Logger;
import org.ontoware.aifbcommons.collection.ClosableIterable;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.exception.ModelRuntimeException;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.ModelSet;
import org.ontoware.rdf2go.model.QueryResultTable;
import org.ontoware.rdf2go.model.QueryRow;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.openrdf.repository.RepositoryException;

import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.FastModelFactory;
import eu.morfeoproject.fast.model.Screen;
import eu.morfeoproject.fast.model.ScreenFlow;
import eu.morfeoproject.fast.services.rdfrepository.RDFRepository;
import eu.morfeoproject.fast.services.rdfrepository.RepositoryStorageException;
import eu.morfeoproject.fast.util.FormatterUtil;
import eu.morfeoproject.fast.vocabulary.DC;
import eu.morfeoproject.fast.vocabulary.FCO;

/**
 * 
 * @author irivera
 */
public class Catalogue {
	
	static Logger logger = Logger.getLogger(Catalogue.class);
	
	public static final int FAIL = 0;
	public static final int EXACT = 1;
	public static final int PLUGIN = 2;
	public static final int SUBSUME = 3;
	public static final int INTERSECTION = 4;

	public static final String XMLS_PREFIX = "http://www.w3.org/2001/XMLSchema#";
	public static final String RDF_PREFIX 	= "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
	public static final String RDFS_PREFIX = "http://www.w3.org/2000/01/rdf-schema#";
	public static final String OWL_PREFIX 	= "http://www.w3.org/2002/07/owl#";
	public static final String FCO_PREFIX = "http://www.morfeoproject.eu/fast/fco#";
	
	public static final String DEFAULT_PREFIXES =
			"PREFIX xmls: <" + XMLS_PREFIX + "> " +
			"PREFIX rdf: <" + RDF_PREFIX + "> " +
			"PREFIX rdfs: <" + RDFS_PREFIX + "> " +
			"PREFIX owl: <" + OWL_PREFIX + "> " +
			"PREFIX fco: <" + FCO_PREFIX + "> ";

	private TripleStore tripleStore;
//	private Model canvas;
	
	/**
	 * Returns a opened connection to the catalogue
	 */
	public Catalogue() {
		// creates a new triple store
		tripleStore = new TripleStore();
    	tripleStore.open();
    	
		// check if the catalogue is correct
		if (!check()) {
			// recover the catalogue
			restore();
		}
		
		// initialise the canvas
		//TODO: the namespace has to be the user namespace
//		canvas = RDF2Go.getModelFactory().createModel(tripleStore.createUniqueUriWithName(FCO.NS_FCO, "canvas"));
	}
	
	// TODO remove this method
	public TripleStore getTripleStore() {
		return tripleStore;
	}
	
    /**
     * Restore the catalogue
     * Should only be done when {@link #check()} returns true.
     * @throws Exception if something goes wrong.
     */
    private void restore() {  
        // add default ontologies
        for (DefaultOntologies.Ontology ont : DefaultOntologies.getDefaults()) {
            try {
                logger.info("adding default ontology '"+ont.getUri()+"'");
                tripleStore.addOntology(ont.getUri(), ont.getAsRDFXML(), Syntax.RdfXml);
            } catch (OntologyInvalidException e) {
                logger.error("Cannot add default ontology '"+ont.getUri()+"': "+e, e);
            }
        }
    }
    
    public boolean check() {
    	return checkUser() && checkDefaultOntologies();
    }
    
    /**
     * This checks if the default ontologies are there or not.
     * This can only work after init() is called.
     * @return false, if {@link #restore()} needs to be called.
     */
    public boolean checkDefaultOntologies() {
    	boolean result = false;
        // are the default ontologies here?
        for (DefaultOntologies.Ontology ont : DefaultOntologies.getDefaults()) {
            boolean misses = (!tripleStore.containsOntology(ont.getUri()));
            logger.info("default ontology '"+ont.getUri()+"' is in the store: "+!misses);
            result = result || misses;
        }
        return !result;
    }
    
    // TODO: tiene sentido??
    // check if user is there.
    /**
     * check if the PIMO is not created yet and {@link #createNewPimo()} needs to be called.
     * @return false, if {@link #restore()} needs to be called.
     */
    public boolean checkUser() {
//	    try {
//	        Model pimo = repository.getMainRepository().getModel(client.getPimoUri());
//	        pimo.open();
//	        boolean result =  !pimo.contains(client.getUserUri(), RDF.type, PIMO.Person);
//	        pimo.close();
//	        return result;
//	    } catch (ModelRuntimeException e) {
//	        throw new PimoError("Unable to check if user is defined in pimo: "+e,e);
//	    }
    	
    	return true;
    }

	public void open() throws RepositoryException {
		tripleStore.open();
	}

	public void close() {
		tripleStore.close();
	}

	private ModelSet getPersistentModelSet() {
		return tripleStore.getPersistentModelSet();
	}
	
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
	public void addOntology(URI ontologyUri, InputStream ontology, Syntax syntax) throws RepositoryStorageException, OntologyInvalidException, OntologyImportsNotSatisfiedException {
		// load
		Model ont = RDF2Go.getModelFactory().createModel();
		ont.open();
		try {
			ont.readFrom(ontology, syntax);
			addOntology(ontologyUri, ont);
		} catch (Exception e) {
			throw new RepositoryStorageException(e.getLocalizedMessage(), e);
		} finally{
			ont.close();
		}
	}




	/**
	 * add the passed ontology to the main repository. The passed RDF model must only contain one ontology
	 * at a time. The ontology should have declared imports statements for other ontologies it 
	 * needs, these will be automatically compared to the list of ontologies, if a prerequisite
	 * misses, an  OntologyImportsNotSatisfiedException will be thrown.
	 * Before importing, the ontology will tested by merging it with its imports and 
	 * checked using the PIMO-Checker. If it does not pass this test, an OntologyInvalidException
	 * is thrown.
	 * @param ontologyUri URI identifying the ontology in the passed rdf model
	 * @param ontology a model with the ontology to add
	 * @param formatMimetype the rdf mimetype serialization format of the string, 
	 * see {@link RDFRepository} for an explanation. 
	 * @throws Exception if the database breaks
	 * @throws OntologyInvalidException if the ontology is not valid according to PimoChecker
	 * @throws OntologyImportsNotSatisfiedException if imports are missing
	 */
	public void addOntology(URI ontologyUri, Model ontology) throws Exception, OntologyInvalidException, OntologyImportsNotSatisfiedException {
		// create metadata on the fly
		Model metadata = RDF2Go.getModelFactory().createModel();
		metadata.open();
		try {
			// assign a URI for the metadata
			URI metadatauri = new URIImpl(ontologyUri+"-autogeneratedmetadata");

			// describe the metadata
//			metadata.addStatement(metadatauri, RDF.type, NRL.GraphMetadata);
//			metadata.addStatement(metadatauri, RDF.type, NRL.DocumentGraph);
//			metadata.addStatement(metadatauri, NRL.coreGraphMetadataFor, ontologyUri);

			// describe the ontology
//			metadata.addStatement(ontologyUri, RDF.type, OWL.ONTOLOGY);
			
			addOntology(ontologyUri, ontology, metadatauri, metadata);
		} finally {
			metadata.close();
		}
	}

	/**
	 * add the passed ontology to the main repository. The passed RDF model must only contain one ontology
	 * at a time. The ontology should have declared imports statements for other ontologies it 
	 * needs, these will be automatically compared to the list of ontologies, if a prerequisite
	 * misses, an  OntologyImportsNotSatisfiedException will be thrown.
	 * Before importing, the ontology will tested by merging it with its imports and 
	 * checked using the PIMO-Checker. If it does not pass this test, an OntologyInvalidException
	 * is thrown.
	 * @param ontologyUri URI identifying the ontology in the passed rdf model
	 * @param ontology a model with the ontology to add
	 * @param metadataUri URI identifying the ontologymetadata in the passed metadata model
	 * @param metadata a model with the ontology metadata to add
	 * @throws Exception if the database breaks
	 * @throws OntologyInvalidException if the ontology is not valid according to PimoChecker
	 * @throws OntologyImportsNotSatisfiedException if imports are missing
	 */
	public void addOntology(URI ontologyUri, Model ontology, URI metadataUri, Model metadata) throws Exception, OntologyInvalidException, OntologyImportsNotSatisfiedException {
		// check metadata

		// one of the types has to be an "ontology", or if a subclass of "ontology", add this
//		if (!metadata.contains(ontologyUri, RDF.type, OWL.ONTOLOGY))
//		{
//			boolean asubclass = false;
//			// a subclass?
//			for (ClosableIterator<? extends Statement> i = metadata.findStatements(ontologyUri, RDF.type, Variable.ANY); i.hasNext(); )
//			{
//				Resource t = i.next().getObject().asResource();
//				// a subclass?
//				if (getModelSet().containsStatements(Variable.ANY, t, RDFS.subClassOf, OWL.ONTOLOGY))
//				{
//					asubclass = true;
//					// add the inference
//					metadata.addStatement(ontologyUri, RDF.type, OWL.ONTOLOGY);
//					i.close();
//					break;
//				}
//			}
//			if (!asubclass)
//				throw new OntologyInvalidException("Invalid: ontology with URI '"+ontologyUri+"' does not have a definition of itself being a NRL:Ontology (or sublcass of this) in its metadata.");
//		}

		// namespace and abbreviation have to be set
		// TODO: check validitiy and imports

		// check if already in store
//		Model ontInModelset = getModelSet().getModel(ontologyUri);
//		Model metadataInModelset = getModelSet().getModel(metadataUri);
//		ontInModelset.open();
//		metadataInModelset.open();
//		if (ontInModelset.size() > 0)
//			throw new Exception("Ontology '"+ontologyUri+"' already in store, use update to update the existing ontology.");
//		if (metadataInModelset.size() > 0)
//			throw new Exception("Ontology Metadata '"+metadataUri+"' already in store, use update to update the existing ontology.");
//
//		// ADD ontology and metadata
//		ontInModelset.addAll(ontology.iterator());
//		metadataInModelset.addAll(metadata.iterator());
//		logger.info("Added ontology "+ontologyUri+" with "+ontInModelset.size()+" triples. Ontology metadata in graph '"+
//				metadataUri+"' with "+metadataInModelset.size()+" triples.");
//		ontInModelset.close();
//		metadataInModelset.close();
	}

	// FIXME finish this method
	public void addScreenFlow(ScreenFlow sf) throws DuplicatedScreenException,
	OntologyInvalidException, OntologyReadonlyException, NotFoundException  {
//		if (containsScreen(sf))
//			throw new DuplicatedScreenException();
		
		URI sfUri = tripleStore.createResource(sf.getUri(), FCO.Screen);
		tripleStore.setLabel(sfUri, sf.getName());
		for (Screen screen : sf.getScreens()) {
			tripleStore.addStatement(sfUri, FCO.hasScreen, screen.getUri());
		}
		logger.info("ScreenFlow " + sf.getUri() + " added.");
	}
	
	public void addScreen(Screen screen) throws DuplicatedScreenException,
	OntologyInvalidException, OntologyReadonlyException, NotFoundException  {
		URI screenUri = null;
		if (screen.getUri() != null) {
			screenUri = screen.getUri();
			if (containsScreen(screenUri))
				throw new DuplicatedScreenException();
		} else {
			screenUri = tripleStore.createResource(FCO.Screen);
			screen.setUri(screenUri);
		}
		tripleStore.setLabel(screenUri, screen.getLabel());
		if (screen.getDescription() != null)
			tripleStore.addStatement(screenUri, DC.description, screen.getDescription());
		if (screen.getCreator() != null)
			tripleStore.addStatement(screenUri, DC.creator, screen.getCreator());
		if (screen.getRights() != null)
			tripleStore.addStatement(screenUri, DC.rights, screen.getRights());
		if (screen.getVersion() != null)
			tripleStore.addStatement(screenUri, FCO.version, screen.getVersion());
		if (screen.getCreationDate() != null)
			tripleStore.addStatement(screenUri, DC.date, FormatterUtil.formatDate(screen.getCreationDate()));
		if (screen.getIcon() != null)
			tripleStore.addStatement(screenUri, FCO.icon, screen.getIcon());
		if (screen.getScreenshot() != null)
			tripleStore.addStatement(screenUri, FCO.screenshot, screen.getScreenshot());
		for (URI tag : screen.getDomainContext())
			tripleStore.addStatement(screenUri, FCO.hasTag, tag);
		if (screen.getVersion() != null)
			tripleStore.addStatement(screenUri, FCO.version, screen.getVersion());
		for (Condition con : screen.getPreconditions()) {
			boolean first = true;
			for (Statement st : con.getStatements()) {
				// FIXME take the first statement as the precondition, maybe problems!!
				if (first) {
					tripleStore.addStatement(screenUri, FCO.hasPrecondition, st.getSubject());
					first = false;
				}
				tripleStore.addStatement(st);
			}
		}
		for (Condition con : screen.getPostconditions()) {
			boolean first = true;
			for (Statement st : con.getStatements()) {
				// FIXME take the first statement as the postcondition, maybe problems!!
				if (first) {
					tripleStore.addStatement(screenUri, FCO.hasPostcondition, st.getSubject());
					first = false;
				}
				tripleStore.addStatement(st);
			}
		}
		logger.info("Screen " + screen.getUri() + " added.");
	}
	
	public void updateScreen(Screen screen) throws NotFoundException, 
	DuplicatedScreenException, OntologyInvalidException, OntologyReadonlyException {
		// TODO No actualiza la screen, porque al insertar no utiliza la misma URI sino que inventa
		// una nueva
		logger.info("Updating screen " + screen.getUri() + "...");
		removeScreen(screen.getUri());
		addScreen(screen);
		logger.info("Screen " + screen.getUri() + " updated.");
	}
	
	public void removeScreen(URI screenUri) throws NotFoundException {
		if (!containsScreen(screenUri))
			throw new NotFoundException();
		
//		Model model = tripleStore.getPersistentModelSet().getModel(FCO.NS_FCO);
		// TODO: remove all the preconditions
		// TODO: remove all the postconditions
		// remove the screen
		tripleStore.removeResource(screenUri);

		logger.info("Screen " + screenUri + " removed.");
	}

	public boolean containsScreenFlow(ScreenFlow sf) {
		return tripleStore.isResource(sf.getUri(), FCO.ScreenFlow);
	}
	
	public boolean containsScreen(URI screenUri) {
		return tripleStore.isResource(screenUri, FCO.Screen);
	}

	/*
	 * Only for debug purpose
	 */
	public ClosableIterator<Statement> listAllScreens() {
		return tripleStore.findStatements(Variable.ANY, RDF.type, FCO.Screen);
	}
	public ClosableIterator<Statement> listAllStatements() {
		return tripleStore.findStatements(Variable.ANY, Variable.ANY, Variable.ANY);
	}

	public void removeAllScreens() {
		ClosableIterator<Statement> it = listAllScreens();
		while (it.hasNext()) {
			Statement st = it.next();
			try {
				tripleStore.removeResource(st.getSubject().asURI());
			} catch (NotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		it.close();
	}
	
	public void clear() {
		tripleStore.clear();
	}
	
	public URI getOrCreateClass(String name)
	throws OntologyInvalidException, RepositoryException {
		return tripleStore.getOrCreateClass(name, tripleStore.getWorkingModel());
	}
	
	public URI getOrCreateClass(String name, URI superClass)
	throws OntologyInvalidException, RepositoryException {
		return tripleStore.getOrCreateClass(name, superClass, tripleStore.getWorkingModel());
	}
	
	// TODO has to create a new class to a specific ontology (namespace) 
	public URI getOrCreateClass(String name, URI superClass, URI namespace)
	throws OntologyInvalidException, RepositoryException {
		return tripleStore.getOrCreateClass(name, superClass, namespace);
	}
	
	public URI getOrCreateTag(String name)
	throws OntologyInvalidException, RepositoryException {
		return tripleStore.getOrCreateTag(name, tripleStore.getWorkingModel());
	}
	
	@Deprecated
	public URI createClass(String name)
    throws OntologyInvalidException, RepositoryException {
    	return createClass(name, RDFS.Class);
    }
	
	@Deprecated
	public URI createClass(String name, URI superClass)
    throws OntologyInvalidException, RepositoryException {
    	return tripleStore.createClass(name, superClass, tripleStore.getWorkingModel());
    }
	
	public Set<Screen> find(Set<Screen> screenSet) {
		return null;
	}
	
    public ArrayList<Statement> listStatements(URI thingUri) {
    	ArrayList<Statement> listStatements = new ArrayList<Statement>();
    	ClosableIterator<Statement> it = tripleStore.findStatements(thingUri, Variable.ANY, Variable.ANY);
    	for ( ; it.hasNext(); )
    		listStatements.add(it.next());
    	it.close();
    	return listStatements;
    }
    
    public Collection<Screen> find(List<URI> tags) {
    	HashMap<URI, Screen> results = new HashMap<URI, Screen>();
    	for (URI tag : tags) {
    		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, FCO.hasTag, tag);
    		for ( ; it.hasNext(); ) {
    			URI screenUri = it.next().getSubject().asURI();
    			Screen s = FastModelFactory.createScreen();
    			s.setUri(screenUri);
    			if (!results.containsKey(s.getUri()))
    				results.put(s.getUri(), s);
    		}
    		it.close();
    	}
    	return results.values();
    }
    
    //TODO remove this method
    public void printStatements() {
    	ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, Variable.ANY, Variable.ANY);
    	for ( ; it.hasNext(); )
    		System.out.println(it.next());
    }
    
    //TODO remove this method
    public void printTags() {
    	ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FCO.Tag);
    	for ( ; it.hasNext(); )
    		System.out.println(it.next().getSubject().asURI());
    }
    
    public Set<Screen> find(Set<Screen> screenSet,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<URI> domainContext) { // TODO take into account the domainContext
    	Set<Screen> results = null;
    	//TODO: the URI of this model has to be a different one
    	Model screens = RDF2Go.getModelFactory().createModel(FCO.NS_FCO);
    	screens.open();
    	for (Screen screen : screenSet) {
    		if (screen.getUri() == null)
    			screen.setUri(tripleStore.createUniqueUriWithName(screens.getContextURI(), "Screen"));
    		screens.addStatement(screen.getUri(), RDF.type, FCO.Screen);
    		screens.addStatement(screen.getUri(), RDFS.label, screen.getLabel());
    		// TODO add only relevant information wrt the search
    		for (Condition con : screen.getPreconditions()) {
    			boolean first = true;
    			for (Statement st : con.getStatements()) {
    				// FIXME take the first statement as the precondition, maybe problems!!
    				if (first) {
    					screens.addStatement(screen.getUri(), FCO.hasPrecondition, st.getSubject());
    					first = false;
    				}
    				screens.addStatement(st);
    			}
    		}
    		for (Condition con : screen.getPostconditions()) {
    			boolean first = true;
    			for (Statement st : con.getStatements()) {
    				// FIXME take the first statement as the precondition, maybe problems!!
    				if (first) {
    					screens.addStatement(screen.getUri(), FCO.hasPostcondition, st.getSubject());
    					first = false;
    				}
    				screens.addStatement(st);
    			}
    		}
    	}
    	results = find(screens, screenSet, plugin, subsume, offset, limit, domainContext);
    	screens.close();
    	return results;
    }
    
    /*
     * Search for screen which has at least one of the concepts of the list given
     * if limit is a negative number, there were no limit
     */
    private Set<Screen> find(Model screens,
    		Set<Screen> screenSet,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<URI> domainContext) throws ClassCastException, ModelRuntimeException {
    	Set<Screen> results = new HashSet<Screen>();
    	ArrayList<Condition> unCon = getUnsatisfiedPreconditions(screens, screenSet, plugin, subsume);
    	if (unCon.size() > 0) {
        	String queryString = 
	    		"SELECT DISTINCT ?screen \n" +
	    		"WHERE {\n" +
	    		"?screen " + RDF.type + " " + FCO.Screen + " . ";
        	queryString = queryString.concat("{");
        	for (URI tag : domainContext)
	    		queryString = queryString.concat(" { ?screen "+FCO.hasTag+" "+tag+ " } UNION");
        	// remove last 'UNION'
	    	if (queryString.endsWith("UNION"))
				queryString = queryString.substring(0, queryString.length() - 5);
			queryString = queryString.concat("}\n");
	    	queryString = queryString.concat("?screen " + FCO.hasPostcondition + " " + unCon.get(0).getStatements().get(0).getSubject() + " . "); // FIXME only get the subject of the first statement
        	for (Condition c : unCon) {
        		logger.debug("[UNSATISFIED] "+c.toString());
        		queryString = queryString.concat("\n{");
        		for (Statement st : c.getStatements())
        			queryString = queryString.concat(st.getSubject()+" "+st.getPredicate()+" "+st.getObject()+" . ");
        		queryString = queryString.concat("\n} UNION");
        	}
        	// remove last 'UNION'
	    	if (queryString.endsWith("UNION"))
				queryString = queryString.substring(0, queryString.length() - 5);
			queryString = queryString.concat("\n}");
			queryString = queryString.concat("\nLIMIT "+limit);
			queryString = queryString.concat("\nOFFSET "+offset);
			// replace prefixes 'http://...' by 'prefix:'
			queryString = replaceBlankNodes(queryString);
			queryString = DEFAULT_PREFIXES + replacePrefixes(queryString);
			logger.debug("Executing SPARQL query:\n"+queryString+"\n-----");
	    	QueryResultTable qrt = tripleStore.sparqlSelect(queryString);
	    	ClosableIterator<QueryRow> itResults = qrt.iterator();
	    	while (itResults.hasNext()) {
	    		// gets the URI of a screen
	    		URI screenUri = itResults.next().getValue("screen").asURI();
	    		// creates and populates a Screen object
	    		Screen s = getScreen(screenUri);
	    		results.add(s);
	    	}
	    	itResults.close();
    	} else { // TODO delete this!!
    		logger.debug("NO PRECONDITIONS UNSATISFIED, FIND DOES NOT NEED TO BE EXECUTED");    		
    	}
    	return results;
    }
    
	public ArrayList<Condition> getUnsatisfiedPreconditions(Model screens, Set<Screen> screenSet, boolean plugin, boolean subsume) {
		ArrayList<Condition> unsatisfied = new ArrayList<Condition>();
		for (Screen s : screenSet)
			for (Condition c : s.getPreconditions())
				if (!isSatisfied(screens, c, plugin, subsume, s.getUri()))
					unsatisfied.add(c);
		return unsatisfied;
	}
	
	public boolean isSatisfied(Model screens, Condition precondition, boolean plugin, boolean subsume, URI screenExcluded) {
		boolean satisfied = false;
		int degree = degreeOfMatch(screens, precondition, screenExcluded);
		
		if (degree == EXACT)
			satisfied = true;
		else if ((degree == PLUGIN) && plugin)
			satisfied = true;
		else if ((degree == SUBSUME) && subsume)
			satisfied = true;
		
		return satisfied;
	}
	
	public int degreeOfMatch(Model screens, Condition condition, URI screenExcluded) {
		// by default it is FAIL
		int degree = FAIL;
		
		// list of the preconditions to match
		List<URI> preList;
		
		// check if is a EXACT case
		preList = new ArrayList<URI>();
		
		
		/*
		 * COMPROBAR QUE LA LISTA DE STATEMENTS DENTRO DE LA CONDICION SE CUMPLE
		 * DENTRO DEL MODELO screens QUE CONTIENE EL 'CANVAS'
		 * SINO, SE METERA EN UNA LISTA DE CONDICIONES PARA LANZAR A BUSCAR
		 * 
		 */
		if (screenHasPostcondition(screens, condition, screenExcluded))
			degree = EXACT;

		
		
//		preList.add(getType(screens, precondition));
//	    if (screenHasPostcondition(screens, preList, screenExcluded))
//	    	degree = EXACT;
	    
	    // TODO check if is a PLUGIN case
//	    if (degree == FAIL) {
//	    	preList = this.getSubClasses(getType(screens, precondition));
//	    	if (screenHasPostcondition(screens, preList, screenExcluded))
//		    	degree = PLUGIN;
//	    }
	    
	    // TODO check if is a SUBSUME case
//	    if (degree == FAIL) {
//	    	preList = this.getSuperClasses(getType(screens, precondition));
//	    	if (screenHasPostcondition(screens, preList, screenExcluded))
//		    	degree = SUBSUME;
//	    }

		return degree;
	}
	
	private List<URI> getSuperClasses(URI clazz) {
		return tripleStore.getSuperClasses(clazz);
	}

	private List<URI> getSubClasses(URI clazz) {
		return tripleStore.getSubClasses(clazz);
	}

	public URI getType(Model model, Variable concept) {
		URI type = null;
		ClosableIterator<Statement> it = model.findStatements(concept, RDF.type, Variable.ANY);
		if (it.hasNext())
			type = it.next().getObject().asURI();
		it.close();
	    return type;
	}
	
	private boolean screenHasPostcondition(Model screens, Condition condition, URI screenExcluded) {
		boolean result = false;
		
		if (condition == null || condition.getStatements().isEmpty())
			return false;
		
    	String queryString = 
    		"ASK {" +
			"?screen " + RDF.type + " " + FCO.Screen + " . " +
			// exclude the same screen of the precondition to check
			// e.g.: a screen has a User as PRE and POST
    		"FILTER (?screen != " + screenExcluded + ") . ";
    	String nodeID = condition.getStatements().get(0).getSubject().asBlankNode().toString();
    	queryString = queryString.concat("?screen " + FCO.hasPostcondition + " " + nodeID + " . ");
    	for (Statement st : condition.getStatements())
        	queryString = queryString.concat(st.getSubject()+" "+st.getPredicate()+" "+st.getObject()+" . ");
    	queryString = queryString.concat("}");
		queryString = DEFAULT_PREFIXES + replacePrefixes(queryString);
		
		result = screens.sparqlAsk(queryString);
	    return result;
	}
	
	/**
	 * Determines if there is a screen in a given model which has at least a postcondition 
	 * of one of the types within the type list. 
	 * @param screens
	 * @param types
	 * @param screenExcluded
	 * @return
	 */
	@Deprecated
	private boolean screenHasPostcondition(Model screens, List<URI> types, URI screenExcluded) {
		boolean result = false;
		
		if (types == null || types.isEmpty())
			return false;
		
    	String queryString = 
			"SELECT DISTINCT ?screen \n" +
			"WHERE {\n" +
			"?screen " + FCO.hasPostcondition + " ?post . " +
			// exclude the same screen of the precondition to check
			// e.g.: a screen has a User as PRE and POST
			"FILTER (?screen != " + screenExcluded + ") " +
			"{";
		
		for (URI type : types)
			queryString = queryString.concat(" { ?post rdf:type " + type + " } UNION");
		
		// remove last 'UNION'
		queryString = queryString.substring(0, queryString.length() - 5);
		queryString = queryString.concat("} }");		
		queryString = DEFAULT_PREFIXES + replacePrefixes(queryString);
		
		QueryResultTable qrt = screens.sparqlSelect(queryString);
		result = qrt.iterator().hasNext();
		
	    return result;
	}
	
	public Collection<Screen> listScreens() {
		ArrayList<Screen> results = new ArrayList<Screen>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FCO.Screen);
		while (it.hasNext())
			results.add(getScreen(it.next().getSubject().asURI()));
		it.close();
		return results;
	}
	
	@Deprecated
	public ArrayList<Condition> getUnsatisfiedPreconditions(Set<Screen> screenSet, boolean plugin, boolean subsume) {
		ArrayList<Condition> unsatisfied = new ArrayList<Condition>();
		
		// check all the preconditions of all the screens
		for (Screen screen : screenSet) {
			// get all the preconditions of the screen
			for (Condition pre : screen.getPreconditions()) {
				// add the preconditions which are not satisfied
				if (!isSatisfied(pre, plugin, subsume, screen))
					unsatisfied.add(pre);
			}
		}
		
		return unsatisfied;
	}
	
	@Deprecated
	public int degreeOfMatch(Condition precondition, Screen screenExcluded) {
		// by default it is FAIL
		int degree = FAIL;
		
		// list of the preconditions to match
		ArrayList<String> preList;
		
		// check if is a EXACT case
		preList = new ArrayList<String>();
//		preList.add(precondition.getClazz().toString());
	    if (buscarnombremetodo(preList, screenExcluded))
	    	degree = EXACT;
			    
	    // check if is a PLUGIN case
//	    if (degree == FAIL) {
//	    	preList = subClassesOfExtended(precondition.getClazz());
//	    	if (buscarnombremetodo(preList, screenExcluded))
//		    	degree = PLUGIN;
//	    }
	    
	    // check if is a SUBSUME case
//	    if (degree == FAIL) {
//	    	preList = superClassesOfExtended(precondition.getClazz());
//	    	if (buscarnombremetodo(preList, screenExcluded))
//		    	degree = SUBSUME;
//	    }
			
		return degree;
	}
	
	@Deprecated
	public boolean isSatisfied(Condition precondition, boolean plugin, boolean subsume, Screen screenExcluded) {
		boolean satisfied = false;
		int degree = degreeOfMatch(precondition, screenExcluded);
		
		if (degree == EXACT)
			satisfied = true;
		else if ((degree == PLUGIN) && plugin)
			satisfied = true;
		else if ((degree == SUBSUME) && subsume)
			satisfied = true;
		
		return satisfied;
	}
	
	private boolean buscarnombremetodo(ArrayList<String> types, Screen screenExcluded) {
		boolean result = false;
		
		if (types == null || types.isEmpty())
			return false;
    	String queryString = 
			"\nASK {" +
			"\n?screen " + FCO.hasPostcondition + " ?post . " +
			// exclude the same screen of the precondition to check
			// e.g.: a screen has a User as PRE and POST
			"\nFILTER (?screen != " + screenExcluded.getUri() + ") . " +
			"\n{";
		
		for (String type : types)
			queryString = queryString.concat(" { ?post rdf:type " + type + " } UNION");
		
		// remove last 'UNION'
		queryString = queryString.substring(0, queryString.length() - 5);
		queryString = queryString.concat("}\n}");
		
		// replace prefixes 'http://...' by 'prefix:'
		queryString = DEFAULT_PREFIXES + replacePrefixes(queryString);
		
		result = tripleStore.sparqlAsk(queryString);

	    return result;
	}
	
    private String replacePrefixes(String origin) {
    	String result = new String(origin);
    	Map<String, String> prefixes = getPersistentModelSet().getNamespaces();
    	for (String prefix : prefixes.keySet()) {
    		if (prefix.length() > 0)
    			result = result.replaceAll(prefixes.get(prefix), prefix + ":");
    	}
    	return result;
    }
    
    private String replaceBlankNodes(String origin) {
    	return origin.replaceAll("_:", "?");
    }
    
    // TODO only for debug purposes
    public void dump() {
		tripleStore.dump();
	}
	
    @Deprecated
	public void find(Condition c) {
		int limit = 10;
		int offset = 0;
    	String queryString = 
    		"SELECT DISTINCT ?screen \n" +
    		"WHERE {\n" +
    		"?screen " + RDF.type + " " + FCO.Screen + " . ";
    	queryString = queryString.concat("?screen " + FCO.hasPostcondition + " " + c.getStatements().get(0).getSubject() + " . ");
    	for (Statement st : c.getStatements())
        	queryString = queryString.concat(st.getSubject() + " " + st.getPredicate() + " " + st.getObject() + " . ");
    	queryString = queryString.concat("}");
    	queryString = queryString.concat("\nLIMIT "+limit);
		queryString = queryString.concat("\nOFFSET "+offset);
		// replace prefixes 'http://...' by 'prefix:'
		queryString = DEFAULT_PREFIXES + replacePrefixes(queryString);
    	logger.debug(queryString);
    	QueryResultTable qrt = tripleStore.sparqlSelect(queryString);
    	ClosableIterator<QueryRow> itResults = qrt.iterator();
    	while (itResults.hasNext()) {
    		// gets the URI of a screen
    		URI screenUri = itResults.next().getValue("screen").asURI();
    		
    		System.out.println(screenUri);
    	}
    	itResults.close();
	}
	
    // TODO only for debug purposes
	public void dumpStatements() {
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, Variable.ANY, Variable.ANY);
		for ( ; it.hasNext(); ) {
			Statement st = it.next();
			System.out.println(st.getSubject()+"-"+st.getPredicate()+"-"+st.getObject());
		}
		it.close();
	}

	public Screen getScreen(URI uri) {
		Screen screen = FastModelFactory.createScreen();
		
		// find all the info related to a screen
		ClosableIterator<Statement> screenTriples = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		if (!screenTriples.hasNext()) // the screen does not exist
			return null;
		screen.setUri(uri);
		for ( ; screenTriples.hasNext(); ) {
			Statement st = screenTriples.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			if (predicate.equals(RDFS.label)) {
				screen.setLabel(object.toString());
			} else if (predicate.equals(DC.description)) {
				screen.setDescription(object.toString());
			} else if (predicate.equals(DC.creator)) {
				screen.setCreator(object.asURI());
			} else if (predicate.equals(DC.rights)) {
				screen.setRights(object.asURI());
			} else if (predicate.equals(FCO.version)) {
				screen.setVersion(object.toString());
			} else if (predicate.equals(DC.date)) {
				// FIXME the dates has to be fixed and contemplate the zone offsets
				screen.setCreationDate(FormatterUtil.parseDate(object.toString()));
			} else if (predicate.equals(FCO.icon)) {
				screen.setIcon(object.asURI());
			} else if (predicate.equals(FCO.screenshot)) {
				screen.setScreenshot(object.asURI());
			} else if (predicate.equals(FCO.hasTag)) {
				screen.getDomainContext().add(object.asURI());
			} else if (predicate.equals(FCO.homepage)) {
				screen.setHomepage(object.asURI());
			} else if (predicate.equals(FCO.hasPrecondition)) {
				// FIXME it will not retrieve complex conditions
				Condition c = FastModelFactory.createCondition();
				ClosableIterator<Statement> it = tripleStore.findStatements(object.asBlankNode(), Variable.ANY, Variable.ANY);
				for ( ; it.hasNext(); ) {
					Statement stmt = it.next();
					if (stmt.getContext() != null) // null means it was inferred
						c.getStatements().add(stmt);
				}
				it.close();
				screen.getPreconditions().add(c);
			} else if (predicate.equals(FCO.hasPostcondition)) {
				// FIXME it will not retrieve complex conditions
				Condition c = FastModelFactory.createCondition();
				ClosableIterator<Statement> it = tripleStore.findStatements(object.asBlankNode(), Variable.ANY, Variable.ANY);
				for ( ; it.hasNext(); ) {
					Statement stmt = it.next();
					if (stmt.getContext() != null) // null means it was inferred
						c.getStatements().add(stmt);
				}
				it.close();
				screen.getPostconditions().add(c);
			}
		}
		screenTriples.close();
		
		return screen;
	}

}

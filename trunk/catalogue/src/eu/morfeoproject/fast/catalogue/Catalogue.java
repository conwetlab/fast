package eu.morfeoproject.fast.catalogue;

import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.log4j.Logger;
import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.exception.ModelRuntimeException;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.QueryResultTable;
import org.ontoware.rdf2go.model.QueryRow;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.LanguageTagLiteral;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.openrdf.repository.RepositoryException;

import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies;
import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies.PublicOntology;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.FastModelFactory;
import eu.morfeoproject.fast.model.Screen;
import eu.morfeoproject.fast.model.ScreenFlow;
import eu.morfeoproject.fast.services.rdfrepository.RDFRepository;
import eu.morfeoproject.fast.services.rdfrepository.RepositoryStorageException;
import eu.morfeoproject.fast.util.FormatterUtil;
import eu.morfeoproject.fast.vocabulary.DC;
import eu.morfeoproject.fast.vocabulary.FCO;
import eu.morfeoproject.fast.vocabulary.FOAF;

/**
 * Catalogue
 * @author irivera
 */
public class Catalogue {
	
	static Logger logger = Logger.getLogger(Catalogue.class);
	
	public static final int FAIL = 0;
	public static final int EXACT = 1;
	public static final int PLUGIN = 2;
	public static final int SUBSUME = 3;
	public static final int INTERSECTION = 4;

//	public static final URI TAGS_NAMESPACE = new URIImpl("http://www.morfeoproject.eu/fast/tags/");
	
	private TripleStore tripleStore;
	
	/**
	 * Returns a opened connection to the catalogue
	 */
//	public Catalogue() {
//		// creates a new triple store
//		tripleStore = new TripleStore();
//    	tripleStore.open();
//    	
//		// check if the catalogue is correct
//		if (!check()) {
//			// recover the catalogue
//			restore();
//		}
//		
////		dumpStatements();
//	}
	
	public Catalogue(File dir) {
		// creates a new triple store
		tripleStore = new TripleStore(dir);
    	tripleStore.open();
    	
		// check if the catalogue is correct
		if (!check()) {
			// recover the catalogue
			restore();
		}
		
//		dumpStatements();
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
     * Check if the PIMO is not created yet and {@link #createNewPimo()} needs to be called.
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
	public boolean addPublicOntology(URI uri, String filename, String downloadUri) {
		PublicOntology ont = new PublicOntology(uri, filename, downloadUri);
		try {
            logger.info("adding ontology '"+ont.getUri()+"'");
            tripleStore.addOntology(ont.getUri(), ont.getAsRDFXML(), Syntax.RdfXml);
            return true;
        } catch (OntologyInvalidException e) {
            logger.error("Cannot add ontology '"+ont.getUri()+"': "+e, e);
            return false;
        }
	}
	
	// FIXME finish this method
	public void addScreenFlow(ScreenFlow sf) throws DuplicatedScreenFlowException,
	OntologyInvalidException, OntologyReadonlyException, NotFoundException {
		URI sfUri = null;
		if (sf.getUri() != null) {
			sfUri = sf.getUri();
			if (containsScreenFlow(sf))
				throw new DuplicatedScreenFlowException();
		} else {
			sfUri = tripleStore.createResource(FCO.ScreenFlow);
			sf.setUri(sfUri);
		}
		// persists the screen
		saveScreenFlow(sf);
	}
	
	private void saveScreenFlow(ScreenFlow sf) throws OntologyReadonlyException, NotFoundException {
		URI sfUri = sf.getUri();
		for (String key : sf.getLabels().keySet())
			tripleStore.addStatement(sfUri, RDFS.label, tripleStore.createLanguageTagLiteral(sf.getLabels().get(key), key));
		for (String key : sf.getDescriptions().keySet())
			tripleStore.addStatement(sfUri, DC.description, tripleStore.createLanguageTagLiteral(sf.getDescriptions().get(key), key));
		if (sf.getCreator() != null)
			tripleStore.addStatement(sfUri, DC.creator, sf.getCreator());
		if (sf.getRights() != null)
			tripleStore.addStatement(sfUri, DC.rights, sf.getRights());
		if (sf.getVersion() != null)
			tripleStore.addStatement(sfUri, FCO.hasVersion, sf.getVersion());
		if (sf.getCreationDate() != null)
			tripleStore.addStatement(sfUri, DC.date, FormatterUtil.formatDateISO8601(sf.getCreationDate()));
		if (sf.getIcon() != null)
			tripleStore.addStatement(sfUri, FCO.hasIcon, sf.getIcon());
		if (sf.getScreenshot() != null)
			tripleStore.addStatement(sfUri, FCO.hasScreenshot, sf.getScreenshot());
		for (URI tag : sf.getDomainContext())
			tripleStore.addStatement(sfUri, FCO.hasTag, tag);
		if (sf.getHomepage() != null)
			tripleStore.addStatement(sfUri, FOAF.homepage, sf.getHomepage());
		if (sf.getVersion() != null)
			tripleStore.addStatement(sfUri, FCO.hasVersion, sf.getVersion());
		for (Condition con : sf.getPreconditions()) {
			BlankNode c = tripleStore.createBlankNode();
			tripleStore.addStatement(sfUri, FCO.hasPreCondition, c);
			tripleStore.addStatement(c, FCO.hasPatternString, con.getPatternString());
			URI p = tripleStore.getCleanUniqueURI(FCO.NS_FCO, "pattern", false);
			tripleStore.addStatement(c, FCO.hasPattern, p);
			for (Statement st : con.getPattern()) {
				tripleStore.addStatement(p, st.getSubject(), st.getPredicate(), st.getObject());
			}
		}
		for (Condition con : sf.getPostconditions()) {
			BlankNode c = tripleStore.createBlankNode();
			tripleStore.addStatement(sfUri, FCO.hasPostCondition, c);
			tripleStore.addStatement(c, FCO.hasPatternString, con.getPatternString());
			URI p = tripleStore.getCleanUniqueURI(FCO.NS_FCO, "pattern", false);
			tripleStore.addStatement(c, FCO.hasPattern, p);
			for (Statement st : con.getPattern()) {
				tripleStore.addStatement(p, st.getSubject(), st.getPredicate(), st.getObject());
			}
		}
		for (Screen s : sf.getScreens())
			tripleStore.addStatement(sfUri, FCO.contains, s.getUri());
		
		logger.info("Screen " + sf.getUri() + " added.");
	}
	
	public void updateScreenFlow(ScreenFlow screenFlow) throws NotFoundException, OntologyReadonlyException  {
		logger.info("Updating screenflow " + screenFlow.getUri() + "...");
		removeScreenFlow(screenFlow.getUri());
		// do not call addScreenFlow because it does not need to create a new URI for the screenflow
		saveScreenFlow(screenFlow);
		logger.info("Screenflow " + screenFlow.getUri() + " updated.");
	}
	
	/**
	 * Delete a screen flow from the catalogue
	 * NOTE: Do NOT delete the screens which is composed by.
	 * @param sfUri the URI of the screen flow to be deleted
	 * @throws NotFoundException
	 */
	public void removeScreenFlow(URI sfUri) throws NotFoundException {
		if (!containsScreenFlow(sfUri))
			throw new NotFoundException();
		// remove all preconditions
		ClosableIterator<Statement> preconditions = tripleStore.findStatements(sfUri, FCO.hasPreCondition, Variable.ANY);
		for ( ; preconditions.hasNext(); ) {
			BlankNode cNode = preconditions.next().getObject().asBlankNode();
			ClosableIterator<Statement> patterns = tripleStore.findStatements(cNode, FCO.hasPattern, Variable.ANY);
			for ( ; patterns.hasNext(); ) {
				tripleStore.removeModel(patterns.next().getObject().asURI());
			}
			patterns.close();
			tripleStore.removeResource(cNode);
		}
		preconditions.close();
		// remove all postconditions
		ClosableIterator<Statement> postconditions = tripleStore.findStatements(sfUri, FCO.hasPostCondition, Variable.ANY);
		for ( ; postconditions.hasNext(); ) {
			BlankNode cNode = postconditions.next().getObject().asBlankNode();
			ClosableIterator<Statement> patterns = tripleStore.findStatements(cNode, FCO.hasPattern, Variable.ANY);
			for ( ; patterns.hasNext(); ) {
				tripleStore.removeModel(patterns.next().getObject().asURI());
			}
			patterns.close();
			tripleStore.removeResource(cNode);
		}
		postconditions.close();
		// remove the screen itself
		tripleStore.removeResource(sfUri);
		logger.info("Screenflow " + sfUri + " removed.");
	}
	
	/**
	 * Creates a new Screen into the catalogue
	 * @param screen
	 * @throws DuplicatedScreenException
	 * @throws OntologyInvalidException
	 * @throws OntologyReadonlyException
	 * @throws NotFoundException
	 * @throws RepositoryException 
	 */
	public void addScreen(Screen screen)
	throws DuplicatedScreenException, OntologyInvalidException, OntologyReadonlyException, NotFoundException, RepositoryException {
		URI screenUri = null;
		if (screen.getUri() != null) {
			screenUri = screen.getUri();
			if (containsScreen(screen))
				throw new DuplicatedScreenException();
		} else {
			screenUri = tripleStore.createResource(FCO.Screen);
			screen.setUri(screenUri);
		}
		// persists the screen
		saveScreen(screen);
	}
	
	/**
	 * Do not check if the screen already exists, and assumes the screen has a well-formed unique URI
	 * To be invoked by addScreen and updateScreen methods
	 * @throws NotFoundException 
	 * @throws OntologyReadonlyException 
	 * @throws OntologyInvalidException 
	 * @throws RepositoryException 
	 */
	private void saveScreen(Screen screen) throws OntologyReadonlyException, NotFoundException, RepositoryException, OntologyInvalidException {
		URI screenUri = screen.getUri();
		for (String key : screen.getLabels().keySet())
			tripleStore.addStatement(screenUri, RDFS.label, tripleStore.createLanguageTagLiteral(screen.getLabels().get(key), key));
		for (String key : screen.getDescriptions().keySet())
			tripleStore.addStatement(screenUri, DC.description, tripleStore.createLanguageTagLiteral(screen.getDescriptions().get(key), key));
		if (screen.getCreator() != null)
			tripleStore.addStatement(screenUri, DC.creator, screen.getCreator());
		if (screen.getRights() != null)
			tripleStore.addStatement(screenUri, DC.rights, screen.getRights());
		if (screen.getVersion() != null)
			tripleStore.addStatement(screenUri, FCO.hasVersion, screen.getVersion());
		if (screen.getCreationDate() != null)
			tripleStore.addStatement(screenUri, DC.date, FormatterUtil.formatDateISO8601(screen.getCreationDate()));
		if (screen.getIcon() != null)
			tripleStore.addStatement(screenUri, FCO.hasIcon, screen.getIcon());
		if (screen.getScreenshot() != null)
			tripleStore.addStatement(screenUri, FCO.hasScreenshot, screen.getScreenshot());
		for (String tag : screen.getDomainContext().getTags())
			tripleStore.addStatement(screenUri, FCO.hasTag, tag);
		if (screen.getHomepage() != null)
			tripleStore.addStatement(screenUri, FOAF.homepage, screen.getHomepage());
		if (screen.getVersion() != null)
			tripleStore.addStatement(screenUri, FCO.hasVersion, screen.getVersion());
		for (Condition con : screen.getPreconditions()) {
			BlankNode c = tripleStore.createBlankNode();
			tripleStore.addStatement(screenUri, FCO.hasPreCondition, c);
			tripleStore.addStatement(c, FCO.hasPatternString, con.getPatternString());
			URI p = tripleStore.getCleanUniqueURI(FCO.NS_FCO, "pattern", false);
			tripleStore.addStatement(c, FCO.hasPattern, p);
			for (Statement st : con.getPattern()) {
				tripleStore.addStatement(p, st.getSubject(), st.getPredicate(), st.getObject());
			}
		}
		for (Condition con : screen.getPostconditions()) {
			BlankNode c = tripleStore.createBlankNode();
			tripleStore.addStatement(screenUri, FCO.hasPostCondition, c);
			tripleStore.addStatement(c, FCO.hasPatternString, con.getPatternString());
			URI p = tripleStore.getCleanUniqueURI(FCO.NS_FCO, "pattern", false);
			tripleStore.addStatement(c, FCO.hasPattern, p);
			for (Statement st : con.getPattern()) {
				tripleStore.addStatement(p, st.getSubject(), st.getPredicate(), st.getObject());
			}
		}
		if (screen.getCode() != null)
			tripleStore.addStatement(screenUri, FCO.hasCode, screen.getCode());
		logger.info("Screen " + screen.getUri() + " added.");
	}
	
	public void updateScreen(Screen screen) throws NotFoundException, OntologyReadonlyException, RepositoryException, OntologyInvalidException  {
		logger.info("Updating screen " + screen.getUri() + "...");
		removeScreen(screen.getUri());
		// do not call addScreen because it does not need to create a new URI for the screen
		saveScreen(screen);
		logger.info("Screen " + screen.getUri() + " updated.");
	}
	
	public void removeScreen(URI screenUri) throws NotFoundException {
		if (!containsScreen(screenUri))
			throw new NotFoundException();
		// remove all preconditions
		ClosableIterator<Statement> preconditions = tripleStore.findStatements(screenUri, FCO.hasPreCondition, Variable.ANY);
		for ( ; preconditions.hasNext(); ) {
			BlankNode cNode = preconditions.next().getObject().asBlankNode();
			ClosableIterator<Statement> patterns = tripleStore.findStatements(cNode, FCO.hasPattern, Variable.ANY);
			for ( ; patterns.hasNext(); ) {
				tripleStore.removeModel(patterns.next().getObject().asURI());
			}
			patterns.close();
			tripleStore.removeResource(cNode);
		}
		preconditions.close();
		// remove all postconditions
		ClosableIterator<Statement> postconditions = tripleStore.findStatements(screenUri, FCO.hasPostCondition, Variable.ANY);
		for ( ; postconditions.hasNext(); ) {
			BlankNode cNode = postconditions.next().getObject().asBlankNode();
			ClosableIterator<Statement> patterns = tripleStore.findStatements(cNode, FCO.hasPattern, Variable.ANY);
			for ( ; patterns.hasNext(); ) {
				tripleStore.removeModel(patterns.next().getObject().asURI());
			}
			patterns.close();
			tripleStore.removeResource(cNode);
		}
		postconditions.close();
		// remove the screen itself
		tripleStore.removeResource(screenUri);
		logger.info("Screen " + screenUri + " removed.");
	}

	public boolean containsScreenFlow(URI sfUri) {
		return tripleStore.isResource(sfUri, FCO.ScreenFlow);
	}

	public boolean containsScreenFlow(ScreenFlow sf) {
		return containsScreenFlow(sf.getUri());
	}

	public boolean containsScreen(URI screenUri) {
		return tripleStore.isResource(screenUri, FCO.Screen);
	}
	
	public boolean containsScreen(Screen screen) {
		return containsScreen(screen.getUri());
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
		return tripleStore.getOrCreateClass(name);
	}
	
	public URI getOrCreateClass(String name, URI superClass)
	throws OntologyInvalidException, RepositoryException {
		return tripleStore.getOrCreateClass(name, superClass);
	}
	
	// TODO has to create a new class to a specific ontology (namespace) 
	public URI getOrCreateClass(String name, URI superClass, URI namespace)
	throws OntologyInvalidException, RepositoryException {
		return tripleStore.getOrCreateClass(name, superClass, namespace);
	}
	
//	public URI getOrCreateTag(String name)
//	throws OntologyInvalidException, RepositoryException {
//		return tripleStore.getOrCreateTag(name, TAGS_NAMESPACE);
//	}
	
    public ArrayList<Statement> listStatements(URI thingUri) {
    	ArrayList<Statement> listStatements = new ArrayList<Statement>();
    	ClosableIterator<Statement> it = tripleStore.findStatements(thingUri, Variable.ANY, Variable.ANY);
    	for ( ; it.hasNext(); )
    		listStatements.add(it.next());
    	it.close();
    	return listStatements;
    }

    /**
     * Search for screens inside the catalogue which satisfy the unsatisfied preconditions of a set of screens
     * and also takes into account the domain context composed by a list of tags.
     * If within the set of screens there are not unsatisfied preconditions, no screens will be returned because
     * it is assume that there is no need to satisfied any condition.
     * If any tag is given, the set of screens to be returned will be filtered by this tag. If no tag is given,
     * no tag filter will be done.
     * If the number of screens returned is high, you can use the parameters OFFSET and LIMIT in order to
     * retrieve small sets of screens.
     * @param screens
     * @param plugin ignored at this version
     * @param subsume ignored at this version
     * @param offset indicate the start of the set of screens to be returned
     * @param limit specify the maximum number of screens to be returned [negative means no limit]
     * @param domainContext the domain context contains information such a as tags, a user, etc.
     * @return a recommended set of screens according to the input given
     * @throws ClassCastException
     * @throws ModelRuntimeException
     */
    public Set<Screen> find(
    		Set<Screen> screens,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<String> domainContext) throws ClassCastException, ModelRuntimeException {
    	HashSet<Screen> results = new HashSet<Screen>();

    	String queryString = 
    		"SELECT DISTINCT ?screen \n" +
    		"WHERE {\n" +
    		"?screen "+RDF.type.toSPARQL()+" "+FCO.Screen.toSPARQL()+" . ";
//    	for (Screen s : screens)
//    		queryString = queryString.concat("FILTER (?screen != " + s.getUri().toSPARQL() + ") . ");

    	if (domainContext.size() > 0) {
        	queryString = queryString.concat("{");
        	for (String tag : domainContext)
	    		queryString = queryString.concat(" { ?screen "+FCO.hasTag.toSPARQL()+" ?tag . FILTER regex(?tag, \""+tag+"\", \"i\")} UNION");
        	// remove last 'UNION'
	    	if (queryString.endsWith("UNION"))
				queryString = queryString.substring(0, queryString.length() - 5);
			queryString = queryString.concat("} . ");
    	}
    	
    	ArrayList<Condition> unCon = getUnsatisfiedPreconditions(screens, plugin, subsume);
    	if (unCon.size() > 0) {
        	queryString = queryString.concat("{");
			for (Condition con : unCon) {
				if (logger.isDebugEnabled())
					logger.debug("[UNSATISFIED] "+con.toString());
				queryString = queryString.concat("{ ?screen "+FCO.hasPostCondition.toSPARQL()+" ?c . ");
				queryString = queryString.concat(" ?c "+FCO.hasPattern.toSPARQL()+" ?p . ");
    			queryString = queryString.concat("GRAPH ?p {");
        		for (Statement st : con.getPattern()) {
        			String s = (st.getSubject() instanceof BlankNode) ? st.getSubject().toString() : st.getSubject().toSPARQL();
        			String o = (st.getObject() instanceof BlankNode) ? st.getObject().toString() : st.getObject().toSPARQL();
        			queryString = queryString.concat(s+" "+st.getPredicate().toSPARQL()+" "+o+" . ");
        		}
        		queryString = queryString.concat("} } UNION");
        	}
        	// remove last 'UNION'
	    	if (queryString.endsWith("UNION"))
				queryString = queryString.substring(0, queryString.length() - 5);
			queryString = queryString.concat("}");
    	}
		queryString = queryString.concat("\n}");
		if (limit > 0)
			queryString = queryString.concat("\nLIMIT "+limit);
		queryString = queryString.concat("\nOFFSET "+offset);
		// replace ':_' by '?' to make the query
		queryString = replaceBlankNodes(queryString);
		if (logger.isDebugEnabled())
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

    	return results;
    }

    public Set<Screen> findRecursive(
    		Set<Screen> screens,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<String> domainContext) throws ClassCastException, ModelRuntimeException {
    	HashSet<Screen> results = new HashSet<Screen>();
     	
		boolean stop = false;
		while (!stop) {
			Set<Screen> aux = find(screens, plugin, subsume, offset, limit, domainContext);
			results.addAll(aux);
			if (getUnsatisfiedPreconditions(aux, plugin, subsume).size() < 1)
				stop = true;
			screens = aux;
		}
    	
    	return results;
    }
    
    /**
     * Retrieves all the unsatisfied preconditions of a set of screens
     * @param screens The set of screens where the preconditions are obtained
     * @param plugin ignored at this version
     * @param subsume ignored at this version
     * @return a list of conditions which are unsatisfied
     */
	protected ArrayList<Condition> getUnsatisfiedPreconditions(Set<Screen> screens, boolean plugin, boolean subsume) {
		ArrayList<Condition> unsatisfied = new ArrayList<Condition>();
		for (Screen s : screens)
			for (Condition c : s.getPreconditions())
				if (!isSatisfied(screens, c, plugin, subsume, s.getUri()))
					unsatisfied.add(c);
		return unsatisfied;
	}
	
	/**
	 * Determines if a specific precondition is satisfied by a set of screens, in other words, check if any postcondition of
	 * the set of screens satisfy the precondition.
	 * Usually the set of screens will include the screen which the precondition belongs to, hence you can set if a screen
	 * has to be excluded while checking.
	 * @param screens a set of screens which might satisfy the precondition
	 * @param precondition the condition to check if it is satisfied
	 * @param plugin not yet implemented
	 * @param subsume not yet implemented
	 * @param screenExcluded the URI of the screen which will be ignored while checking
	 * @return true if the condition is satisfied
	 */
	public boolean isSatisfied(Set<Screen> screens, Condition precondition, boolean plugin, boolean subsume, URI screenExcluded) {
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
	
	/**
	 * A condition can be satisfied by different degrees of matches: EXACT, PLUGIN, SUBSUME and FAIL.
	 * Given a condition C, the degree of match with another condition C' is:
	 * <ul> 
	 *   <li>EXACT: C and C' are exactly the same condition</li>
	 *   <li>PLUGIN (not yet implemented): C is a super-condition of C'. For instance, if C says "there is a Person" and C' says "there is a Woman".</li>
	 *   <li>SUBSUME (not yet implemented): C is a sub-condition of C', in other words, it is the inverse of PLUGIN</li>
	 *   <li>FAIL: the condition is not satisfied</li>
	 * </ul>
	 * @param screens 
	 * @param condition
	 * @param screenExcluded
	 * @return
	 */
	private int degreeOfMatch(Set<Screen> screens, Condition condition, URI screenExcluded) {
		// by default it is FAIL
		int degree = FAIL;
		
		// list of the preconditions to match
		List<URI> preList;
		
		// check if is a EXACT case
		preList = new ArrayList<URI>();
		
		if (screenHasPostcondition(screens, condition, screenExcluded))
			degree = EXACT;
		
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
	
	/**
	 * 
	 * @param screens
	 * @param condition
	 * @param screenExcluded
	 * @return
	 */
	private boolean screenHasPostcondition(Set<Screen> screens, Condition condition, URI screenExcluded) {
		boolean result = false;

		if (screens.size() < 1)
			return false;
		
		if (screens.size() < 2 && screenExcluded != null)
			return false; // only screenExcluded is in the set, the condition can't be satisfied
		
		if (condition == null || condition.getPattern().isEmpty())
			return false; // TODO is this necessary??
		
    	String queryString = "ASK { {";
    	for (Screen s : screens) {
    		if (screenExcluded == null || !s.getUri().equals(screenExcluded))
    	    	queryString = queryString.concat(" { "+s.getUri().toSPARQL()+" "+FCO.hasPostCondition.toSPARQL()+" ?condition } UNION");
    	}
    	queryString = queryString.substring(0, queryString.length() - 5); // remove last 'UNION'
    	queryString = queryString.concat(" } . ");
    	
    	queryString = queryString.concat("?condition "+FCO.hasPattern.toSPARQL()+" ?pattern . ");
		queryString = queryString.concat("GRAPH ?pattern { ");
    	for (Statement st : condition.getPattern()) {
			String su = (st.getSubject() instanceof BlankNode) ? st.getSubject().toString() : st.getSubject().toSPARQL();
			String ob = (st.getObject() instanceof BlankNode) ? st.getObject().toString() : st.getObject().toSPARQL();
			queryString = queryString.concat(su+" "+st.getPredicate().toSPARQL()+" "+ob+" . ");
    	}
    	queryString = queryString.concat("} }");

    	result = tripleStore.sparqlAsk(queryString);
	    return result;
	}
	
	/**
	 * Returns the set of screens which contains only screens reachable in a set of screens
	 * @param screens
	 * @return
	 */
	public Set<Screen> filterReachableScreens(Set<Screen> screens) {
    	HashSet<Screen> results = new HashSet<Screen>();
    	HashSet<Screen> toCheck = new HashSet<Screen>();
    	for (Screen s : screens) {
    		if (s.getPreconditions().isEmpty())
    			results.add(s);
    		else
    			toCheck.add(s);
    	}
    	results.addAll(filterReachableScreens(results, toCheck));
    	return results;
	}
	
	private Set<Screen> filterReachableScreens(Set<Screen> reachables, Set<Screen> screens) {
    	HashSet<Screen> results = new HashSet<Screen>();
    	HashSet<Screen> toCheck = new HashSet<Screen>();
    	for (Screen s : screens) {
    		boolean reachable = true;
    		for (Condition c : s.getPreconditions())
    			reachable = reachable & screenHasPostcondition(reachables, c, null);
    		if (reachable)
    			results.add(s);
    		else
    			toCheck.add(s);
    	}
    	// if there are new reachable screens and there are screens to check
    	if (results.size() > 0 && toCheck.size() > 0) {
    		reachables.addAll(results);
    		results.addAll(filterReachableScreens(reachables, toCheck));
    	}
    	return results;
	}
	
	public Collection<ScreenFlow> listScreenFlows() {
		ArrayList<ScreenFlow> results = new ArrayList<ScreenFlow>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FCO.ScreenFlow);
		while (it.hasNext())
			results.add(getScreenFlow(it.next().getSubject().asURI()));
		it.close();
		return results;
	}
	
	public Collection<Screen> listScreens() {
		ArrayList<Screen> results = new ArrayList<Screen>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FCO.Screen);
		while (it.hasNext())
			results.add(getScreen(it.next().getSubject().asURI()));
		it.close();
		return results;
	}
	
    protected String replaceBlankNodes(String origin) {
    	return origin.replaceAll("_:", "?");
    }

	public ScreenFlow getScreenFlow(URI uri) {
		ScreenFlow sf = FastModelFactory.createScreenFlow();
		
		// find all the info related to a screenflow
		ClosableIterator<Statement> sfTriples = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		if (!sfTriples.hasNext()) // the screen does not exist
			return null;
		sf.setUri(uri);
		for ( ; sfTriples.hasNext(); ) {
			Statement st = sfTriples.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			if (predicate.equals(RDFS.label)) {
				if (object instanceof LanguageTagLiteral) {
					LanguageTagLiteral label = object.asLanguageTagLiteral();
					sf.getLabels().put(label.getLanguageTag(), label.getValue());
				}
			} else if (predicate.equals(DC.description)) {
				LanguageTagLiteral description = object.asLanguageTagLiteral();
				sf.getDescriptions().put(description.getLanguageTag(), description.getValue());
			} else if (predicate.equals(DC.creator)) {
				sf.setCreator(object.asURI());
			} else if (predicate.equals(DC.rights)) {
				sf.setRights(object.asURI());
			} else if (predicate.equals(FCO.hasVersion)) {
				sf.setVersion(object.toString());
			} else if (predicate.equals(DC.date)) {
				sf.setCreationDate(FormatterUtil.parseDateISO8601(object.toString()));
			} else if (predicate.equals(FCO.hasIcon)) {
				sf.setIcon(object.asURI());
			} else if (predicate.equals(FCO.hasScreenshot)) {
				sf.setScreenshot(object.asURI());
			} else if (predicate.equals(FCO.hasTag)) {
				sf.getDomainContext().add(object.asURI());
			} else if (predicate.equals(FOAF.homepage)) {
				sf.setHomepage(object.asURI());
			} else if (predicate.equals(FCO.hasPreCondition)) {
				sf.getPreconditions().add(getCondition(object));
			} else if (predicate.equals(FCO.hasPostCondition)) {
				sf.getPostconditions().add(getCondition(object));
			} else if (predicate.equals(FCO.contains)) {
				sf.getScreens().add(getScreen(object.asURI()));
			}
		}
		sfTriples.close();
		
		return sf;
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
				if (object instanceof LanguageTagLiteral) {
					LanguageTagLiteral label = object.asLanguageTagLiteral();
					screen.getLabels().put(label.getLanguageTag(), label.getValue());
				}
			} else if (predicate.equals(DC.description)) {
				LanguageTagLiteral description = object.asLanguageTagLiteral();
				screen.getDescriptions().put(description.getLanguageTag(), description.getValue());
			} else if (predicate.equals(DC.creator)) {
				screen.setCreator(object.asURI());
			} else if (predicate.equals(DC.rights)) {
				screen.setRights(object.asURI());
			} else if (predicate.equals(FCO.hasVersion)) {
				screen.setVersion(object.toString());
			} else if (predicate.equals(DC.date)) {
				screen.setCreationDate(FormatterUtil.parseDateISO8601(object.toString()));
			} else if (predicate.equals(FCO.hasIcon)) {
				screen.setIcon(object.asURI());
			} else if (predicate.equals(FCO.hasScreenshot)) {
				screen.setScreenshot(object.asURI());
			} else if (predicate.equals(FCO.hasTag)) {
				screen.getDomainContext().getTags().add(object.asLiteral().toString());
//				ClosableIterator<Statement> tagLabel = tripleStore.findStatements(object.asURI(), RDFS.label, Variable.ANY);
//				if (tagLabel.hasNext())
//					screen.getDomainContext().getTags().add(tagLabel.next().getObject().asLiteral().toString());
//				tagLabel.close();
			} else if (predicate.equals(FOAF.homepage)) {
				screen.setHomepage(object.asURI());
			} else if (predicate.equals(FCO.hasPreCondition)) {
				screen.getPreconditions().add(getCondition(object));
			} else if (predicate.equals(FCO.hasPostCondition)) {
				screen.getPostconditions().add(getCondition(object));
			} else if (predicate.equals(FCO.hasCode)) {
				screen.setCode(object.asURI());
			}
		}
		screenTriples.close();
		
		return screen;
	}

	/*
	 * Each condition will have only one pattern at most
	 */
	private Condition getCondition(Node subject) {
		Condition c = FastModelFactory.createCondition();
		ClosableIterator<Statement> pIt = tripleStore.findStatements(subject.asBlankNode(), FCO.hasPatternString, Variable.ANY);
		if (pIt.hasNext())
			c.setPatternString(pIt.next().getObject().toString());
		pIt.close();
		ClosableIterator<Statement> cIt = tripleStore.findStatements(subject.asBlankNode(), FCO.hasPattern, Variable.ANY);
		if (cIt.hasNext()) {
			Statement st = cIt.next();
			URI pattern = st.getObject().asURI();
			ClosableIterator<Statement> it = tripleStore.findStatements(pattern, Variable.ANY, Variable.ANY, Variable.ANY);
			for ( ; it.hasNext(); )
				c.getPattern().add(it.next());
			it.close();
		}
		cIt.close();
		return c;
	}

	
	
    
	
	
	
	
	
    //TODO remove this method
    public void printStatements() {
    	ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, Variable.ANY, Variable.ANY);
    	for ( ; it.hasNext(); )
    		System.out.println(it.next());
    }
    
    //TODO remove this method
//    public void printTags() {
//    	ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FCO.Tag);
//    	for ( ; it.hasNext(); )
//    		System.out.println(it.next().getSubject().asURI());
//    }
    
//	private List<URI> getSuperClasses(URI clazz) {
//	return tripleStore.getSuperClasses(clazz);
//}
//
//private List<URI> getSubClasses(URI clazz) {
//	return tripleStore.getSubClasses(clazz);
//}

//public URI getType(Model model, Variable concept) {
//	URI type = null;
//	ClosableIterator<Statement> it = model.findStatements(concept, RDF.type, Variable.ANY);
//	if (it.hasNext())
//		type = it.next().getObject().asURI();
//	it.close();
//    return type;
//}
	
    // TODO only for debug purposes
    public void dump() {
		tripleStore.dump();
	}
    public void dumpStatements() {
    	ClosableIterator<Statement> it = listAllStatements();
    	for ( ; it.hasNext(); ) {
    		Statement st = it.next();
    		logger.debug(st.getContext()+" - "+st.getSubject()+" - "+st.getPredicate()+" - "+st.getObject());
    	}
    	it.close();
    }
	
    public ClosableIterator<Statement> screensIterator() {
    	return tripleStore.findStatements(Variable.ANY, RDF.type, FCO.Screen);
    }
}

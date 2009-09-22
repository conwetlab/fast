package eu.morfeoproject.fast.catalogue;

import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
import org.ontoware.rdf2go.vocabulary.OWL;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.openrdf.repository.RepositoryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies;
import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies.PublicOntology;
import eu.morfeoproject.fast.catalogue.planner.Plan;
import eu.morfeoproject.fast.catalogue.planner.Planner;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.Event;
import eu.morfeoproject.fast.model.FastModelFactory;
import eu.morfeoproject.fast.model.Resource;
import eu.morfeoproject.fast.model.Screen;
import eu.morfeoproject.fast.model.ScreenFlow;
import eu.morfeoproject.fast.model.Slot;
import eu.morfeoproject.fast.model.SlotOrEvent;
import eu.morfeoproject.fast.util.DateFormatter;
import eu.morfeoproject.fast.vocabulary.DC;
import eu.morfeoproject.fast.vocabulary.FGO;
import eu.morfeoproject.fast.vocabulary.FOAF;

/**
 * Catalogue
 * @author irivera
 */
public class Catalogue {
	
	final Logger logger = LoggerFactory.getLogger(Catalogue.class);
	
	public static final int FAIL = 0;
	public static final int EXACT = 1;
	public static final int PLUGIN = 2;
	public static final int SUBSUME = 3;
	public static final int INTERSECTION = 4;

	private TripleStore tripleStore;
	private Planner planner;
	
	
	public Catalogue(String sesameServer, String repositoryID) {
		create(sesameServer, repositoryID);
	}
	
	public Catalogue(File dir, String indexes) {
		create(dir, indexes);
	}
	
	public Catalogue(File dir) {
		create(dir, null);
	}
	
	/**
	 * Returns a opened connection to a local catalogue
	 */
	private void create(File dir, String indexes) {
		logger.info("Catalogue loaded at "+dir.getAbsolutePath()+" ["+indexes+"]");
		// creates a new triple store
		tripleStore = new TripleStore(dir, indexes);
    	tripleStore.open();

    	// check if the catalogue is correct
		if (!check()) {
			// recover the catalogue
			restore();
		}
		
		// creates a planner
		planner = new Planner(this);
	}
	
	/**
	 * Returns a opened connection to a local catalogue
	 */
	private void create(String sesameServer, String repositoryID) {
		logger.info("Catalogue loaded at "+sesameServer+", ID="+repositoryID);
		// creates a new triple store
		tripleStore = new TripleStore(sesameServer, repositoryID);
    	tripleStore.open();

    	// check if the catalogue is correct
		if (!check()) {
			// recover the catalogue
			restore();
		}
		
		// creates a planner
		planner = new Planner(this);
	}
	
	// TODO remove this method
	public TripleStore getTripleStore() {
		return tripleStore;
	}
	public Planner getPlanner() {
		return planner;
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
                if (ont.getSyntax().equals(Syntax.RdfXml))
                	tripleStore.addOntology(ont.getUri(), ont.getAsRDFXML(), Syntax.RdfXml);
                else if (ont.getSyntax().equals(Syntax.Turtle))
                	tripleStore.addOntology(ont.getUri(), ont.getAsTurtle(), Syntax.Turtle);
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
        	logger.info("checking ontology '"+ont.getUri()+"'...");
            boolean misses = (!tripleStore.containsOntology(ont.getUri()));
            logger.info("default ontology '"+ont.getUri()+"' is in the store: "+!misses);
            result = result || misses;
        }
        return !result;
    }
    
    // TODO: does this method make sense??
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
	
	public boolean addPublicOntology(URI uri, String downloadUri, Syntax syntax) {
		PublicOntology ont = new PublicOntology(uri, downloadUri, syntax);
		try {
            logger.info("adding ontology '"+ont.getUri()+"'");
            if (syntax.equals(Syntax.RdfXml))
            	tripleStore.addOntology(ont.getUri(), ont.getAsRDFXML(), syntax);
            else if (syntax.equals(Syntax.Turtle))
            	tripleStore.addOntology(ont.getUri(), ont.getAsTurtle(), syntax);
            else {
                logger.error("Cannot add ontology '"+ont.getUri()+"': Syntax '"+syntax+"' not allowed.");
            	return false;
            }
            return true;
        } catch (OntologyInvalidException e) {
            logger.error("Cannot add ontology '"+ont.getUri()+"': "+e, e);
            return false;
		}
	}
	
	public void addScreenFlow(ScreenFlow sf) throws DuplicatedResourceException,
	OntologyInvalidException, OntologyReadonlyException, NotFoundException {
		URI sfUri = null;
		if (sf.getUri() != null) {
			sfUri = sf.getUri();
			if (containsScreenFlow(sf))
				throw new DuplicatedResourceException(sf.getUri()+" already exists.");
		} else {
			sfUri = tripleStore.createResource(FGO.ScreenFlow);
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
			tripleStore.addStatement(sfUri, FGO.hasVersion, sf.getVersion());
		if (sf.getCreationDate() != null)
			tripleStore.addStatement(sfUri, DC.date, DateFormatter.formatDateISO8601(sf.getCreationDate()));
		if (sf.getIcon() != null)
			tripleStore.addStatement(sfUri, FGO.hasIcon, sf.getIcon());
		if (sf.getScreenshot() != null)
			tripleStore.addStatement(sfUri, FGO.hasScreenshot, sf.getScreenshot());
		for (String tag : sf.getDomainContext().getTags())
			tripleStore.addStatement(sfUri, FGO.hasTag, tag);
		if (sf.getHomepage() != null)
			tripleStore.addStatement(sfUri, FOAF.homepage, sf.getHomepage());
		if (sf.getVersion() != null)
			tripleStore.addStatement(sfUri, FGO.hasVersion, sf.getVersion());
		for (URI rUri : sf.getResources()) {
			if (containsResource(rUri))
				tripleStore.addStatement(sfUri, FGO.contains, rUri);
			else
				logger.error("Resource "+rUri+" does not exist and cannot be added to the ScreenFlow.");
		}
		logger.info("ScreenFlow "+sf.getUri()+" added.");
	}
	
	public void updateScreenFlow(ScreenFlow screenFlow) throws NotFoundException, OntologyReadonlyException  {
		logger.info("Updating screenflow "+screenFlow.getUri()+"...");
		removeScreenFlow(screenFlow.getUri());
		// do not call addScreenFlow because it does not need to create a new URI for the screenflow
		saveScreenFlow(screenFlow);
		logger.info("Screenflow "+screenFlow.getUri()+" updated.");
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
		// remove the screen itself
		tripleStore.removeResource(sfUri);
		logger.info("Screenflow "+sfUri+" removed.");
	}
	
	/**
	 * Creates a new Screen into the catalogue
	 * @param screen
	 * @throws DuplicatedResourceException
	 * @throws OntologyInvalidException
	 * @throws OntologyReadonlyException
	 * @throws NotFoundException
	 * @throws RepositoryException 
	 */
	public void addScreen(Screen screen)
	throws DuplicatedResourceException, OntologyInvalidException, OntologyReadonlyException, NotFoundException, RepositoryException {
		URI screenUri = null;
		if (screen.getUri() != null) {
			screenUri = screen.getUri();
			if (containsScreen(screen))
				throw new DuplicatedResourceException(screenUri+" already exists.");
		} else {
			screenUri = tripleStore.createResource(FGO.Screen);
			screen.setUri(screenUri);
		}
		// persists the screen
		saveScreen(screen);
		// create plans for the screen
		planner.add(screen);
	}
	
	/**
	 * Do not check if the screen already exists, and assumes the screen has a well-formed unique URI
	 * To be invoked by addScreen and updateScreen methods
	 * @throws NotFoundException 
	 * @throws OntologyReadonlyException 
	 * @throws OntologyInvalidException 
	 * @throws RepositoryException 
	 */
	private void saveScreen(Screen screen)
	throws OntologyReadonlyException, NotFoundException, RepositoryException, OntologyInvalidException {
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
			tripleStore.addStatement(screenUri, FGO.hasVersion, screen.getVersion());
		if (screen.getCreationDate() != null)
			tripleStore.addStatement(screenUri, DC.date, DateFormatter.formatDateISO8601(screen.getCreationDate()));
		if (screen.getIcon() != null)
			tripleStore.addStatement(screenUri, FGO.hasIcon, screen.getIcon());
		if (screen.getScreenshot() != null)
			tripleStore.addStatement(screenUri, FGO.hasScreenshot, screen.getScreenshot());
		for (String tag : screen.getDomainContext().getTags())
			tripleStore.addStatement(screenUri, FGO.hasTag, tag);
		if (screen.getHomepage() != null)
			tripleStore.addStatement(screenUri, FOAF.homepage, screen.getHomepage());
		if (screen.getVersion() != null)
			tripleStore.addStatement(screenUri, FGO.hasVersion, screen.getVersion());
		for (List<Condition> conList : screen.getPreconditions()) {
			BlankNode bag = tripleStore.createBlankNode();
			tripleStore.addStatement(bag, RDF.type, RDF.Bag);
			tripleStore.addStatement(screenUri, FGO.hasPreCondition, bag);
			int i = 1;
			for (Condition con : conList) {
				BlankNode c = tripleStore.createBlankNode();
				tripleStore.addStatement(bag, RDF.li(i++), c);
				tripleStore.addStatement(c, FGO.hasPatternString, con.getPatternString());
				URI p = tripleStore.getCleanUniqueURI(FGO.NS_FGO, "pattern", false);
				tripleStore.addStatement(c, FGO.hasPattern, p);
				for (Statement st : con.getPattern()) {
					tripleStore.addStatement(p, st.getSubject(), st.getPredicate(), st.getObject());
				}
				tripleStore.addStatement(c, FGO.hasScope, con.getScope());
				for (String key : con.getLabels().keySet())
					tripleStore.addStatement(c, RDFS.label, tripleStore.createLanguageTagLiteral(con.getLabels().get(key), key));
			}
		}
		for (List<Condition> conList : screen.getPostconditions()) {
			BlankNode bag = tripleStore.createBlankNode();
			tripleStore.addStatement(bag, RDF.type, RDF.Bag);
			tripleStore.addStatement(screenUri, FGO.hasPostCondition, bag);
			int i = 1;
			for (Condition con : conList) {
				BlankNode c = tripleStore.createBlankNode();
				tripleStore.addStatement(bag, RDF.li(i++), c);
				tripleStore.addStatement(c, FGO.hasPatternString, con.getPatternString());
				URI p = tripleStore.getCleanUniqueURI(FGO.NS_FGO, "pattern", false);
				tripleStore.addStatement(c, FGO.hasPattern, p);
				for (Statement st : con.getPattern()) {
					tripleStore.addStatement(p, st.getSubject(), st.getPredicate(), st.getObject());
				}
				tripleStore.addStatement(c, FGO.hasScope, con.getScope());
				for (String key : con.getLabels().keySet())
					tripleStore.addStatement(c, RDFS.label, tripleStore.createLanguageTagLiteral(con.getLabels().get(key), key));
			}
		}
		if (screen.getCode() != null)
			tripleStore.addStatement(screenUri, FGO.hasCode, screen.getCode());
		logger.info("Screen "+screen.getUri()+" added.");
	}
	
	public void updateScreen(Screen screen)
	throws NotFoundException, OntologyReadonlyException, RepositoryException, OntologyInvalidException  {
		logger.info("Updating screen "+screen.getUri()+"...");
		Screen oldScreen = getScreen(screen.getUri());
		// remove old screen from the catalogue
		removeScreen(screen.getUri());
		// do not call addScreen because it does not need to create a new URI for the screen
		saveScreen(screen);
		// calculate new plans if necessary
		planner.update(screen, oldScreen);
		logger.info("Screen "+screen.getUri()+" updated.");
	}
	
	public void removeScreen(URI screenUri) throws NotFoundException {
		if (!containsScreen(screenUri))
			throw new NotFoundException();
		// remove all preconditions
		ClosableIterator<Statement> preconditions = tripleStore.findStatements(screenUri, FGO.hasPreCondition, Variable.ANY);
		for ( ; preconditions.hasNext(); ) {
			BlankNode cNode = preconditions.next().getObject().asBlankNode();
			ClosableIterator<Statement> patterns = tripleStore.findStatements(cNode, FGO.hasPattern, Variable.ANY);
			for ( ; patterns.hasNext(); ) {
				tripleStore.removeModel(patterns.next().getObject().asURI());
			}
			patterns.close();
			tripleStore.removeResource(cNode);
		}
		preconditions.close();
		// remove all postconditions
		ClosableIterator<Statement> postconditions = tripleStore.findStatements(screenUri, FGO.hasPostCondition, Variable.ANY);
		for ( ; postconditions.hasNext(); ) {
			BlankNode cNode = postconditions.next().getObject().asBlankNode();
			ClosableIterator<Statement> patterns = tripleStore.findStatements(cNode, FGO.hasPattern, Variable.ANY);
			for ( ; patterns.hasNext(); ) {
				tripleStore.removeModel(patterns.next().getObject().asURI());
			}
			patterns.close();
			tripleStore.removeResource(cNode);
		}
		postconditions.close();
		// remove the screen itself
		tripleStore.removeResource(screenUri);
		// remove the screen from the planner
		planner.remove(screenUri);
		logger.info("Screen "+screenUri+" removed.");
	}

	
	public void addSlotOrEvent(SlotOrEvent se) throws DuplicatedResourceException, OntologyInvalidException {
		URI seUri = null;
		if (se.getUri() != null) {
			seUri = se.getUri();
			if (containsSlotOrEvent(se))
				throw new DuplicatedResourceException(seUri+" already exists.");
		} else {
			if (se instanceof Slot)
				seUri = tripleStore.createResource(FGO.Slot);
			else if (se instanceof Event)
				seUri = tripleStore.createResource(FGO.Event);
			se.setUri(seUri);
		}
		// persists the slot/event
		saveSlotOrEvent(se);
		// create plans for the slot
		if (se instanceof Slot)
			planner.add(se);
	}
	
	public void saveSlotOrEvent(SlotOrEvent se) {
		BlankNode bag = tripleStore.createBlankNode();
		tripleStore.addStatement(bag, RDF.type, RDF.Bag);
		tripleStore.addStatement(se.getUri(), FGO.hasCondition, bag);
		int i = 1;
		for (Condition con : se.getConditions()) {
			BlankNode c = tripleStore.createBlankNode();
			tripleStore.addStatement(bag, RDF.li(i++), c);
			tripleStore.addStatement(c, FGO.hasPatternString, con.getPatternString());
			URI p = tripleStore.getCleanUniqueURI(FGO.NS_FGO, "pattern", false);
			tripleStore.addStatement(c, FGO.hasPattern, p);
			for (Statement st : con.getPattern()) {
				tripleStore.addStatement(p, st.getSubject(), st.getPredicate(), st.getObject());
			}
			tripleStore.addStatement(c, FGO.hasScope, con.getScope());
			for (String key : con.getLabels().keySet())
				tripleStore.addStatement(c, RDFS.label, tripleStore.createLanguageTagLiteral(con.getLabels().get(key), key));
		}
	}
	
	public void updateSlotOrEvent(SlotOrEvent se) throws NotFoundException, OntologyReadonlyException, RepositoryException, OntologyInvalidException  {
		logger.info("Updating slot "+se.getUri()+"...");
		SlotOrEvent oldSe = getSlotOrEvent(se.getUri());
		removeSlotOrEvent(se.getUri());
		// do not call addSlot because it does not need to create a new URI for the screen
		saveSlotOrEvent(se);
		// calculate new plans if necessary
		planner.update(se, oldSe);
		logger.info(se.getUri()+" updated.");
	}
	
	public void removeSlotOrEvent(URI seUri) throws NotFoundException {
		logger.info("removing "+seUri);
		if (!containsSlotOrEvent(seUri))
			throw new NotFoundException();
		// remove all conditions
		ClosableIterator<Statement> conditionBagIt = tripleStore.findStatements(seUri, FGO.hasCondition, Variable.ANY);
		for ( ; conditionBagIt.hasNext(); ) {
			BlankNode bagNode = conditionBagIt.next().getObject().asBlankNode();
			ClosableIterator<Statement> conditionIt = tripleStore.findStatements(bagNode, Variable.ANY, Variable.ANY);
			for ( ; conditionIt.hasNext(); ) {
				Node object = conditionIt.next().getObject();
				// only need to look for triples like: bNode rdf:li bNode
				if (object instanceof BlankNode) {
					BlankNode cNode = object.asBlankNode();
					ClosableIterator<Statement> patterns = tripleStore.findStatements(cNode, FGO.hasPattern, Variable.ANY);
					for ( ; patterns.hasNext(); ) {
						tripleStore.removeModel(patterns.next().getObject().asURI());
					}
					patterns.close();
					tripleStore.removeResource(cNode);
				}
			}
			conditionIt.close();
			tripleStore.removeResource(bagNode);
		}
		conditionBagIt.close();
		// remove the slot/event itself
		tripleStore.removeResource(seUri);
		// remove the slot from the planner
		planner.remove(seUri);
		logger.info(seUri+" removed.");
	}
	
	public boolean containsResource(URI uri) {
		return containsScreenFlow(uri)
			|| containsScreen(uri)
			|| containsSlotOrEvent(uri);
	}
	
	public boolean containsScreenFlow(URI sfUri) {
		return tripleStore.isResource(sfUri, FGO.ScreenFlow);
	}

	public boolean containsScreenFlow(ScreenFlow sf) {
		return containsScreenFlow(sf.getUri());
	}

	public boolean containsScreen(URI screenUri) {
		return tripleStore.isResource(screenUri, FGO.Screen);
	}
	
	public boolean containsScreen(Screen screen) {
		return containsScreen(screen.getUri());
	}

	public boolean containsSlotOrEvent(URI seUri) {
		return tripleStore.isResource(seUri, FGO.Slot) || tripleStore.isResource(seUri, FGO.Event);
	}
	
	public boolean containsSlotOrEvent(SlotOrEvent se) {
		return containsSlotOrEvent(se.getUri());
	}
	
	/*
	 * Only for debug purpose
	 */
	public ClosableIterator<Statement> listAllScreens() {
		return tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Screen);
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
    private Set<URI> find(
    		Set<Resource> resources,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<String> domainContext,
    		URI predicate) throws ClassCastException, ModelRuntimeException {
    	HashSet<URI> results = new HashSet<URI>();
    	ArrayList<Condition> unCon = getUnsatisfiedPreconditions(resources, plugin, subsume);

    	String queryString = 
    		"SELECT DISTINCT ?resource \n" +
    		"WHERE {\n" +
    		"{ ?resource "+RDF.type.toSPARQL()+" "+FGO.Screen.toSPARQL()+" . ";
    	
    	/////*** LOOK FOR SCREENS ***/////
    	for (Resource r : resources)
    		if (r instanceof Screen)
    			queryString = queryString.concat("FILTER (?resource != "+r.getUri().toSPARQL()+") . ");

    	if (domainContext != null && domainContext.size() > 0) {
        	queryString = queryString.concat("{");
        	for (String tag : domainContext) {
	    		queryString = queryString.concat(" { ?resource "+FGO.hasTag.toSPARQL()+" ?tag . FILTER regex(?tag, \""+tag+"\", \"i\")} UNION");
        	}
        	// remove last 'UNION'
	    	if (queryString.endsWith("UNION"))
				queryString = queryString.substring(0, queryString.length() - 5);
			queryString = queryString.concat("} . ");
    	}
    	
    	if (unCon.size() > 0) {
        	queryString = queryString.concat("{");
			for (Condition con : unCon) {
				if (logger.isDebugEnabled())
					logger.debug("[UNSATISFIED] "+con.toString());
				queryString = queryString.concat("{ ?resource "+predicate.toSPARQL()+" ?b . ");
				queryString = queryString.concat(" ?b ?li ?c . "); // :_bag rdf:li_1 :_condition
				queryString = queryString.concat(" ?c "+FGO.hasPattern.toSPARQL()+" ?p . ");
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
		queryString = queryString.concat("\n} UNION ");
		
		/////*** LOOK FOR SLOTS ***/////
		queryString = queryString.concat("{ ?resource "+RDF.type.toSPARQL()+" "+FGO.Slot.toSPARQL()+" . ");
		
		for (Resource r : resources)
			if (r instanceof Slot)
				queryString = queryString.concat("FILTER (?resource != "+r.getUri().toSPARQL()+") . ");

		if (domainContext != null && domainContext.size() > 0) {
	    	queryString = queryString.concat("{");
	    	for (String tag : domainContext) {
	    		queryString = queryString.concat(" { ?resource "+FGO.hasTag.toSPARQL()+" ?tag . FILTER regex(?tag, \""+tag+"\", \"i\")} UNION");
	    	}
	    	// remove last 'UNION'
	    	if (queryString.endsWith("UNION"))
				queryString = queryString.substring(0, queryString.length() - 5);
			queryString = queryString.concat("} . ");
		}
		if (unCon.size() > 0) {
        	queryString = queryString.concat("{");
			for (Condition con : unCon) {
				queryString = queryString.concat("{ ?resource "+FGO.hasCondition.toSPARQL()+" ?b . ");
				queryString = queryString.concat(" ?b ?li ?c . "); // :_bag rdf:li_1 :_condition
				queryString = queryString.concat(" ?c "+FGO.hasPattern.toSPARQL()+" ?p . ");
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
		queryString = queryString.concat("\n} }");
		
		
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
    		results.add(itResults.next().getValue("resource").asURI());
    	}
    	itResults.close();

    	return results;
    }

    public Set<URI> findBackwards(
    		Set<Resource> resources,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<String> domainContext) throws ClassCastException, ModelRuntimeException {
    	return find(resources, plugin, subsume, offset, limit, domainContext, FGO.hasPostCondition);
    }
    
    public Set<URI> findForwards(
    		Set<Resource> resources,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<String> domainContext) throws ClassCastException, ModelRuntimeException {
    	Set<Resource> tmpResources = new HashSet<Resource>();
    	for (Resource r : resources) {
    		if (r instanceof Screen) {
    			Screen s = FastModelFactory.createScreen();
    			s.setUri(r.getUri());
    			s.setPreconditions(((Screen) r).getPostconditions());
    			tmpResources.add(s);
    		} else {
    			tmpResources.add(r);
    		}
    	}
    	return find(tmpResources, plugin, subsume, offset, limit, domainContext, FGO.hasPreCondition);
    }

    public Set<Resource> findRecursive(
    		Set<Resource> resources,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<String> domainContext) throws ClassCastException, ModelRuntimeException {
    	HashSet<Resource> results = new HashSet<Resource>();
     	
//		boolean stop = false;
//		while (!stop) {
//			Set<Resource> aux = find(resources, plugin, subsume, offset, limit, domainContext);
//			results.addAll(aux);
//			if (getUnsatisfiedPreconditions(aux, plugin, subsume).size() < 1)
//				stop = true;
//			resources = aux;
//		}
    	
    	return results;
    }
    
    /**
     * Retrieves all the unsatisfied preconditions of a set of screens. It also
     * checks whether a 'event' is satisfied.
     * NOTE: 'slots' are always satisfied
     * @param screens The set of screens where the preconditions are obtained
     * @param plugin ignored at this version
     * @param subsume ignored at this version
     * @return a list of conditions which are unsatisfied
     */
	protected ArrayList<Condition> getUnsatisfiedPreconditions(Set<Resource> resources, boolean plugin, boolean subsume) {
		ArrayList<Condition> unsatisfied = new ArrayList<Condition>();
		for (Resource r : resources) {
			if (r instanceof Screen) {
				Screen s = (Screen)r;
				for (List<Condition> conList : s.getPreconditions())
					if (!isListSatisfied(resources, conList, plugin, subsume, s.getUri()))
						for (Condition c : conList)
							unsatisfied.add(c);
			} else if (r instanceof Event) {
				Event e = (Event)r;
				List<Condition> conList = e.getConditions();
				if (!isListSatisfied(resources, conList, plugin, subsume, e.getUri()))
					for (Condition c : conList)
						unsatisfied.add(c);
			}
		}
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
	/* Check if all the conditions in a list are satisfied by a set of screens */
	public boolean isListSatisfied(Set<Resource> resources, List<Condition> precondition, boolean plugin, boolean subsume, URI screenExcluded) {
		Set<Resource> tmpResources = new HashSet<Resource>();
		
		// if no conditions are provided, then returns true
		if (precondition.isEmpty())
			return true;
		
		// if there are no resources to check with, the conditions cannot be satisfied
		if (resources.isEmpty())
			return false;
		
		// copy the set of screens except the screen to be excluded
		for (Resource r : resources)
			if (r instanceof Slot)
				tmpResources.add(r);
			else if (r instanceof Screen && !r.getUri().equals(screenExcluded))
				tmpResources.add((Screen)r);
		
		//TODO include also the Slots in the creation of models
		Set<Model> models = createModels(tmpResources, plugin, subsume);
		boolean satisfied = false;
		
		// create the ASK sparql query for a precondition
    	String queryStr = "ASK {";
    	for (Condition condition : precondition) {
	    	for (Statement st : condition.getPattern()) {
				String su = (st.getSubject() instanceof BlankNode) ? st.getSubject().toString() : st.getSubject().toSPARQL();
				String ob = (st.getObject() instanceof BlankNode) ? st.getObject().toString() : st.getObject().toSPARQL();
				queryStr = queryStr.concat(su+" "+st.getPredicate().toSPARQL()+" "+ob+" . ");
	    	}
    	}
    	queryStr = queryStr.concat("}");
  	
		for (Model m : models) {
			satisfied = m.sparqlAsk(queryStr);
			if (satisfied) break;
		}
		
		return satisfied;
	}
	
	public Set<Model> createModels(Set<Resource> resources, boolean plugin, boolean subsume) {
		Set<Model> models = new HashSet<Model>();
		if (resources.isEmpty()) {
			return models;
		} else if (resources.size() == 1) {
			Resource r = resources.iterator().next();
			if (r instanceof Slot) {
				Model m = RDF2Go.getModelFactory().createModel();
				m.open();
				for (Condition c : ((Slot) r).getConditions())
					m.addAll(c.getPattern().iterator());
				models.add(m); 
			} else if (r instanceof Screen) {
				Model m = RDF2Go.getModelFactory().createModel();
				m.open();
				for (List<Condition> postcondition : ((Screen) r).getPostconditions()) {
					for (Condition c : postcondition)
						m.addAll(c.getPattern().iterator());
				}
				models.add(m);
			}
		} else {
			Resource r = resources.iterator().next();
			resources.remove(r);
			Set<Model> result = createModels(resources, plugin, subsume);
			for (Model model : result) {
				if (r instanceof Slot) {
					Model m = RDF2Go.getModelFactory().createModel();
					m.open();
					for (Condition c : ((Slot) r).getConditions())
						m.addAll(c.getPattern().iterator());
					m.addModel(model);
					models.add(m);
				} else if (r instanceof Screen) {
					Model m = RDF2Go.getModelFactory().createModel();
					m.open();
					for (List<Condition> postcondition : ((Screen) r).getPostconditions()) {
						for (Condition c : postcondition)
							m.addAll(c.getPattern().iterator());						
					}
					m.addModel(model);
					models.add(m);
				}
			}
		}
		return models;
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
//		List<URI> preList;
		
		// check if is a EXACT case
//		preList = new ArrayList<URI>();
		
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
	 * Check if any of the screens given has the postcondition required
	 * @param screens the set of screens to be checked
	 * @param condition the condition to look for
	 * @param screenExcluded URI of a screen to exclude from the set (i.e. the screen which the condition
	 * has been obtained)
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
    	    	queryString = queryString.concat(" { "+s.getUri().toSPARQL()+" "+FGO.hasPostCondition.toSPARQL()+" ?bag . ?bag ?li ?condition } UNION");
    	}
    	queryString = queryString.substring(0, queryString.length() - 5); // remove last 'UNION'
    	queryString = queryString.concat(" } . ");
    	
    	queryString = queryString.concat("?condition "+FGO.hasPattern.toSPARQL()+" ?pattern . ");
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
	public Set<Resource> filterReachableResources(Set<Resource> resources) {
    	HashSet<Resource> results = new HashSet<Resource>();
    	HashSet<Resource> toCheck = new HashSet<Resource>();
    	for (Resource r : resources) {
    		if (r instanceof Slot) {
    			results.add(r);
    		} else if (r instanceof Screen) {
    			Screen s = (Screen)r;
    			if (s.getPreconditions().isEmpty())
    				results.add(s);
    			else
    				toCheck.add(s);
    		}
    	}
    	if (!results.isEmpty() && !toCheck.isEmpty())
    		results.addAll(filterReachableResources(results, toCheck));
    	return results;
	}
	
	private Set<Resource> filterReachableResources(Set<Resource> reachables, Set<Resource> resources) {
    	HashSet<Resource> results = new HashSet<Resource>();
    	HashSet<Resource> toCheck = new HashSet<Resource>();
    	for (Resource r : resources) {
    		if (r instanceof Screen) {
    			Screen s = (Screen)r;
	    		boolean reachable = false;
	    		// check whether a set of preconditions is fulfilled => makes the screen reachable
	    		for (List<Condition> conList : s.getPreconditions()) { /* OR */
	    			reachable = isListSatisfied(reachables, conList, true, true, s.getUri());
	    			if (reachable)
	    				break;
	    		}
	    		if (reachable)
	    			results.add(s);
	    		else
	    			toCheck.add(s);
    		}
    	}
    	// if there are new reachable screens and screens to check
    	if (results.size() > 0 && toCheck.size() > 0) {
    		reachables.addAll(results);
    		results.addAll(filterReachableResources(reachables, toCheck));
    	}
    	return results;
	}
	
	public Collection<ScreenFlow> listScreenFlows() {
		ArrayList<ScreenFlow> results = new ArrayList<ScreenFlow>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.ScreenFlow);
		while (it.hasNext())
			results.add(getScreenFlow(it.next().getSubject().asURI()));
		it.close();
		return results;
	}
	
	public Collection<Screen> listScreens() {
		ArrayList<Screen> results = new ArrayList<Screen>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Screen);
		while (it.hasNext())
			results.add(getScreen(it.next().getSubject().asURI()));
		it.close();
		return results;
	}
	
	public Collection<Slot> listSlots() {
		ArrayList<Slot> results = new ArrayList<Slot>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Slot);
		while (it.hasNext())
			results.add(getSlot(it.next().getSubject().asURI()));
		it.close();
		return results;
	}
	
	public Collection<Event> listEvents() {
		ArrayList<Event> results = new ArrayList<Event>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Event);
		while (it.hasNext())
			results.add(getEvent(it.next().getSubject().asURI()));
		it.close();
		return results;
	}

	public Collection<URI> listConcepts(String[] tags) {
    	ArrayList<URI> results = new ArrayList<URI>();
    	String queryString = 
    		"SELECT DISTINCT ?concept \n" +
    		"WHERE {\n";
		queryString = queryString.concat("{ { ?concept "+RDF.type.toSPARQL()+" "+RDFS.Class.toSPARQL()+" } UNION { ?concept "+RDF.type.toSPARQL()+" "+OWL.Class.toSPARQL()+" } } ");
    	if (tags != null && tags.length > 0) {
        	queryString = queryString.concat("{");
        	for (String tag : tags)
	    		queryString = queryString.concat(" { ?concept "+FGO.hasTag.toSPARQL()+" ?tag . FILTER regex(?tag, \""+tag+"\", \"i\")} UNION");
        	// remove last 'UNION'
	    	if (queryString.endsWith("UNION"))
				queryString = queryString.substring(0, queryString.length() - 5);
			queryString = queryString.concat("} . ");
    	}
		queryString = queryString.concat("}");
		QueryResultTable qrt = tripleStore.sparqlSelect(queryString);
    	ClosableIterator<QueryRow> itResults = qrt.iterator();
    	while (itResults.hasNext()) {
    		QueryRow qr = itResults.next();
    		Node node = qr.getValue("concept");
    		
    		if (node instanceof BlankNode) {
//        		System.out.println(node+" is a blank node.");
//    			try {
//					ClosableIterator<Statement> ci = getTripleStore().findStatements(node.asBlankNode(), Variable.ANY, Variable.ANY);
//					while (ci.hasNext())
//						System.out.println(ci.next());
//					ci.close();
//				} catch (Exception e) {
//					e.printStackTrace();
//				}
    		} else {
    			results.add(qr.getValue("concept").asURI());
    		}
    	}
    	itResults.close();
    	
    	return results;
	}

	protected String replaceBlankNodes(String origin) {
    	return origin.replaceAll("_:", "?");
    }

    public Resource getResource(URI uri) {
    	if (isType(uri, FGO.ScreenFlow)) {
    		return getScreenFlow(uri);
    	} else if (isType(uri, FGO.Screen)) {
    		return getScreen(uri);
    	} else if (isType(uri, FGO.Slot)) {
    		return getSlot(uri);
    	} else if (isType(uri, FGO.Event)) {
    		return getEvent(uri);
    	}
    	return null;
    }
    
    public boolean isType(URI uri, URI type) {
		ClosableIterator<Statement> it = tripleStore.findStatements(uri, RDF.type, Variable.ANY);
		for ( ; it.hasNext(); ) {
			if (it.next().getObject().asURI().equals(type)) {
				it.close();
				return true;
			}
		}
		it.close();
		return false;
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
			} else if (predicate.equals(FGO.hasVersion)) {
				sf.setVersion(object.toString());
			} else if (predicate.equals(DC.date)) {
				sf.setCreationDate(DateFormatter.parseDateISO8601(object.toString()));
			} else if (predicate.equals(FGO.hasIcon)) {
				sf.setIcon(object.asURI());
			} else if (predicate.equals(FGO.hasScreenshot)) {
				sf.setScreenshot(object.asURI());
			} else if (predicate.equals(FGO.hasTag)) {
				sf.getDomainContext().getTags().add(object.asLiteral().toString());
			} else if (predicate.equals(FOAF.homepage)) {
				sf.setHomepage(object.asURI());
			} else if (predicate.equals(FGO.contains)) {
				sf.getResources().add(object.asURI());
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
			} else if (predicate.equals(FGO.hasVersion)) {
				screen.setVersion(object.toString());
			} else if (predicate.equals(DC.date)) {
				screen.setCreationDate(DateFormatter.parseDateISO8601(object.toString()));
			} else if (predicate.equals(FGO.hasIcon)) {
				screen.setIcon(object.asURI());
			} else if (predicate.equals(FGO.hasScreenshot)) {
				screen.setScreenshot(object.asURI());
			} else if (predicate.equals(FGO.hasTag)) {
				screen.getDomainContext().getTags().add(object.asLiteral().toString());
			} else if (predicate.equals(FOAF.homepage)) {
				screen.setHomepage(object.asURI());
			} else if (predicate.equals(FGO.hasPreCondition)) {
				ArrayList<Condition> conList = new ArrayList<Condition>();
				int i = 1;
				boolean stop = false;
				while (!stop) {
					ClosableIterator<Statement> conBag = tripleStore.findStatements(object.asBlankNode(), RDF.li(i++), Variable.ANY);
					if (!conBag.hasNext()) {
						stop = true;
					} else {
						while (conBag.hasNext())
							conList.add(getCondition(conBag.next().getObject().asBlankNode()));
					}
					conBag.close();
				}
				screen.getPreconditions().add(conList);
			} else if (predicate.equals(FGO.hasPostCondition)) {
				ArrayList<Condition> conList = new ArrayList<Condition>();
				int i = 1;
				boolean stop = false;
				while (!stop) {
					ClosableIterator<Statement> conBag = tripleStore.findStatements(object.asBlankNode(), RDF.li(i++), Variable.ANY);
					if (!conBag.hasNext()) {
						stop = true;
					} else {
						while (conBag.hasNext())
							conList.add(getCondition(conBag.next().getObject().asBlankNode()));
					}
					conBag.close();
				}
				screen.getPostconditions().add(conList);
			} else if (predicate.equals(FGO.hasCode)) {
				screen.setCode(object.asURI());
			}
		}
		screenTriples.close();
		
		return screen;
	}

	public Slot getSlot(URI uri) {
		Slot slot = FastModelFactory.createSlot();
		slot = (Slot)getSlotOrEvent(uri, slot);
		return slot;
	}

	public Event getEvent(URI uri) {
		Event event = FastModelFactory.createEvent();
		event = (Event)getSlotOrEvent(uri, event);
		return event;
	}

	public SlotOrEvent getSlotOrEvent(URI uri) {
		if (isType(uri, FGO.Slot))
			return getSlot(uri);
		else if (isType(uri, FGO.Event))
			return getEvent(uri);
		else
			return null;
	}
	
	private SlotOrEvent getSlotOrEvent(URI uri, SlotOrEvent se) {
		// find all the info related to a slot or an event
		ClosableIterator<Statement> it = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		if (!it.hasNext()) // the slot/event does not exist
			return null;
		se.setUri(uri);
		for ( ; it.hasNext(); ) {
			Statement st = it.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			if (predicate.equals(FGO.hasCondition)) {
				ArrayList<Condition> conList = new ArrayList<Condition>();
				int i = 1;
				boolean stop = false;
				while (!stop) {
					ClosableIterator<Statement> conBag = tripleStore.findStatements(object.asBlankNode(), RDF.li(i++), Variable.ANY);
					if (!conBag.hasNext()) {
						stop = true;
					} else {
						while (conBag.hasNext())
							conList.add(getCondition(conBag.next().getObject().asBlankNode()));
					}
					conBag.close();
				}
				se.getConditions().addAll(conList);
			}
		}
		it.close();
		return se;
	}
	
	/*
	 * Each condition will have only one pattern at most
	 */
	private Condition getCondition(Node subject) {
		Condition c = FastModelFactory.createCondition();
		ClosableIterator<Statement> cIt = tripleStore.findStatements(subject.asBlankNode(), Variable.ANY, Variable.ANY);
		for ( ; cIt.hasNext(); ) {
			Statement st = cIt.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			if (predicate.equals(RDFS.label)) {
				if (object instanceof LanguageTagLiteral) {
					LanguageTagLiteral label = object.asLanguageTagLiteral();
					c.getLabels().put(label.getLanguageTag(), label.getValue());
				}
			} else if (predicate.equals(FGO.hasScope)) {
				c.setScope(object.toString());
			} else if (predicate.equals(FGO.hasPatternString)) {
				c.setPatternString(object.toString());
			} else if (predicate.equals(FGO.hasPattern)) {
				URI pattern = st.getObject().asURI();
				ClosableIterator<Statement> it = tripleStore.findStatements(pattern, Variable.ANY, Variable.ANY, Variable.ANY);
				for ( ; it.hasNext(); )
					c.getPattern().add(it.next());
				it.close();
			}
		}
		cIt.close();

		return c;
	}

	public Set<Statement> getConcept(URI uri) {
		Set<Statement> result = new HashSet<Statement>();
		ClosableIterator<Statement> cIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		for ( ; cIt.hasNext(); ) {
			Statement st = cIt.next();
			result.add(st);
		}
		return result;
	}
	
	/**
	 * Remove a concept given its URI.
	 * Only removes the triples which start with the given URI, if there are
	 * more triples with this URI as object, they will remain.
	 * @param uri
	 * @throws NotFoundException 
	 */
	public void removeConcept(URI uri) throws NotFoundException {
		getTripleStore().removeResource(uri);
	}
	
	public void exportToTrig() {
		tripleStore.export(System.out, Syntax.Trig);
	}
	
	
	public List<Plan> searchPlans(URI uri, Set<Resource> resources) {
		return planner.searchPlans(uri, resources);
	}
	
	
	
	
	
	
	
    
	
	
	
	
	
    //TODO remove this method
    public void printStatements() {
    	ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, Variable.ANY, Variable.ANY);
    	for ( ; it.hasNext(); ) {
    		Statement st = it.next();
    		System.out.println(st.getContext()+" - "+st.getSubject()+" - "+st.getPredicate()+" - "+st.getObject());
    	}
    }
    
    //TODO remove this method
//    public void printTags() {
//    	ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Tag);
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
    	return tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Screen);
    }
    
}

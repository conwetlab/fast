package eu.morfeoproject.fast.catalogue;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.StringTokenizer;
import java.util.UUID;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.commontag.AuthorCTag;
import org.commontag.AutoCTag;
import org.commontag.CTag;
import org.commontag.ReaderCTag;
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
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.UriOrVariable;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.vocabulary.OWL;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.ontoware.rdf2go.vocabulary.XSD;
import org.openrdf.repository.RepositoryException;
import org.openrdf.rio.RDFParseException;

import uk.ac.open.kmi.iserve.IServeClient;
import uk.ac.open.kmi.iserve.IServeConfiguration;
import uk.ac.open.kmi.iserve.IServeResponse;
import eu.morfeoproject.fast.catalogue.builder.BuildingBlockRDF2GoBuilder;
import eu.morfeoproject.fast.catalogue.builder.SampleRDF2GoBuilder;
import eu.morfeoproject.fast.catalogue.model.Action;
import eu.morfeoproject.fast.catalogue.model.BackendService;
import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.model.Concept;
import eu.morfeoproject.fast.catalogue.model.Condition;
import eu.morfeoproject.fast.catalogue.model.Form;
import eu.morfeoproject.fast.catalogue.model.Operator;
import eu.morfeoproject.fast.catalogue.model.Pipe;
import eu.morfeoproject.fast.catalogue.model.Property;
import eu.morfeoproject.fast.catalogue.model.Sample;
import eu.morfeoproject.fast.catalogue.model.Screen;
import eu.morfeoproject.fast.catalogue.model.ScreenComponent;
import eu.morfeoproject.fast.catalogue.model.ScreenFlow;
import eu.morfeoproject.fast.catalogue.model.Trigger;
import eu.morfeoproject.fast.catalogue.model.factory.BuildingBlockFactory;
import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies;
import eu.morfeoproject.fast.catalogue.ontologies.OntologyFetcher;
import eu.morfeoproject.fast.catalogue.ontologies.OntologyFinder;
import eu.morfeoproject.fast.catalogue.ontologies.OntologyManager;
import eu.morfeoproject.fast.catalogue.ontologies.SindiceOntologyFinder;
import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies.Ontology;
import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies.PublicOntology;
import eu.morfeoproject.fast.catalogue.planner.Plan;
import eu.morfeoproject.fast.catalogue.planner.Planner;
import eu.morfeoproject.fast.catalogue.planner.PlannerFactory;
import eu.morfeoproject.fast.catalogue.recommender.Recommender;
import eu.morfeoproject.fast.catalogue.recommender.ScreenComponentRecommender;
import eu.morfeoproject.fast.catalogue.recommender.ScreenRecommender;
import eu.morfeoproject.fast.catalogue.util.DateFormatter;
import eu.morfeoproject.fast.catalogue.util.MiscUtil;
import eu.morfeoproject.fast.catalogue.vocabulary.CTAG;
import eu.morfeoproject.fast.catalogue.vocabulary.DC;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

/**
 * Catalogue
 * 
 * @author irivera
 */
public class Catalogue {

	protected final Log log = LogFactory.getLog(this.getClass());

	private CatalogueConfiguration configuration;
	private OntologyManager ontologyManager; // TODO do it persistent, now it's just in memory, so when the catalogue is loaded, the ontology list is empty
	private TripleStore tripleStore;
	private Planner planner;
	private Recommender screenRecommender;
	private Recommender scRecommender;
	private String environment;
	private URI prototypesGraph;
	private URI clonesGraph;

	public Catalogue(CatalogueConfiguration conf) {
		this(conf, "default");
	}

	public Catalogue(CatalogueConfiguration conf, String environment) {
		this.configuration = conf;
		this.environment = environment;

		try {
			init();
		} catch (Exception e) {
			throw new RuntimeException("Unable to start the catalogue service.", e);
		}
	}

	protected void init() throws ConfigurationException, TripleStoreException {
		// read configuration
		String serverURL = this.configuration.get(this.environment, "serverURL");
		String sesameServer = this.configuration.get(this.environment, "sesameServer");
		String repositoryID = this.configuration.get(this.environment, "repositoryID");
		String storageDir = this.configuration.get(this.environment, "storageDir");
		String indexes = this.configuration.get(this.environment, "indexes");

		// connect to local or remote triple store
		tripleStore = (sesameServer != null && repositoryID != null) ?
			new RemoteTripleStore(sesameServer, repositoryID) :
				new LocalTripleStore(storageDir, indexes);
		tripleStore.open();

		// creates the URIs for the prototypes/clones graphs
		prototypesGraph = tripleStore.createURI(serverURL+"/prototypes");
		clonesGraph = tripleStore.createURI(serverURL+"/clones");
		
		// creates the ontology manager
		ontologyManager = new OntologyManager(getAllOntologies());

		// check if the catalogue is correct
		if (!check()) {
			// recover the catalogue
			restore();
		}

		// creates the planner
		planner = PlannerFactory.createPlanner(this, this.environment);
		
		// creates the recommenders
		screenRecommender = new ScreenRecommender(this);
		scRecommender = new ScreenComponentRecommender(this);
	}

	public URL getServerURL() {
		return configuration.getURL(this.environment, "serverURL");
	}

	public Planner getPlanner() {
		return this.planner;
	}

	/**
	 * Restores the catalogue Should only be done when {@link #check()} returns
	 * true.
	 */
	protected void restore() {
		// add default ontologies
		for (DefaultOntologies.Ontology ontology : DefaultOntologies.getDefaults()) {
			if (log.isInfoEnabled()) log.info("adding default ontology '" + ontology.getUri() + "'");
			addOntology(ontology);
		}
	}

	protected boolean addOntology(Ontology ontology) {
		try {
			return addOntology(ontology.getUri(), ontology.getInputStream(), ontology.getSyntax());
		} catch (OntologyInvalidException e) {
			log.error("Cannot add ontology '" + ontology.getUri() + "': " + e, e);
		}
		return false;
	}

	protected boolean addOntology(URI uri, InputStream in, Syntax syntax) {
		try {
			boolean added = tripleStore.addOntology(uri, in, syntax);
			if (added) ontologyManager.add(uri);
			return added;
		} catch (OntologyInvalidException e) {
			log.error("Cannot add ontology '" + uri + "': " + e, e);
		} catch (RepositoryException e) {
			log.error("Cannot add ontology '" + uri + "': " + e, e);
		} catch (RDFParseException e) {
			log.error("Cannot add ontology '" + uri + "': " + e, e);
		} catch (IOException e) {
			log.error("Cannot read ontology '" + uri + "': " + e, e);
		}
		return false;
	}

	public boolean addPublicOntology(URI uri, String downloadUri, Syntax syntax) {
		return addOntology(new PublicOntology(uri, downloadUri, syntax));
	}

	public List<URI> getAllOntologies() {
		LinkedList<URI> ontologies = new LinkedList<URI>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, OWL.Ontology);
		for (; it.hasNext();) {
			URI uri = it.next().getSubject().asURI();
			if (!ontologies.contains(uri)) ontologies.add(uri);
		}
		return ontologies;
	}

	public void clear() {
		// clear the repository
		tripleStore.clear();
		// clear the planner
		planner.clear();
		// clear recommenders
		screenRecommender.rebuild();
		scRecommender.rebuild();
		// restores default ontologies
		restore();
	}

	public boolean check() {
		return checkDefaultOntologies();
	}

	/**
	 * This checks if the default ontologies are there or not. This can only
	 * work after init() is called.
	 * 
	 * @return false, if {@link #restore()} needs to be called.
	 */
	public boolean checkDefaultOntologies() {
		boolean result = false;
		// are the default ontologies here?
		for (DefaultOntologies.Ontology ont : DefaultOntologies.getDefaults()) {
			if (log.isInfoEnabled()) log.info("checking ontology '" + ont.getUri() + "'...");
			boolean misses = (!tripleStore.containsOntology(ont.getUri()));
			if (log.isInfoEnabled()) log.info("default ontology '" + ont.getUri() + "' is in the store: " + !misses);
			result = result || misses;
		}
		return !result;
	}

	public void open() throws RepositoryException {
		tripleStore.open();
	}

	public void close() {
		tripleStore.close();
	}

	public boolean containsBuildingBlock(URI uri) {
		return tripleStore.isResource(uri, FGO.ScreenFlow)
				|| tripleStore.isResource(uri, FGO.Screen)
				|| tripleStore.isResource(uri, FGO.Form)
				|| tripleStore.isResource(uri, FGO.Operator)
				|| tripleStore.isResource(uri, FGO.BackendService);
	}

	public boolean containsBuildingBlock(BuildingBlock bb) {
		return containsBuildingBlock(bb.getUri());
	}

	public boolean containsResource(URI uri) {
		return tripleStore.isResource(uri);
	}

	public boolean containsConcept(URI uri) {
		return isConcept(uri);
	}

	/**
	 * 
	 * @param canvasList list of building blocks (clones) in a certain canvas. the results
	 * will try satisfy this list, unless 'selectedItem' has a value
	 * @param selectedItem the results will be optimised for this element, as if the canvas
	 * has only one element (results won't contain repeated building blocks from the canvas)
	 * @param conditions list of conditions to be satisfied
	 * @param offset
	 * @param limit
	 * @param tags
	 * @param strategy
	 * @return a list of suggested building block URIs
	 * @throws ClassCastException
	 * @throws ModelRuntimeException
	 */
	public List<URI> findScreenComponents(List<ScreenComponent> canvasList, ScreenComponent selectedItem,
			List<Condition> conditions, int offset, int limit, List<String> tags, int strategy)
			throws ClassCastException, ModelRuntimeException {
		
		if (limit == 0) return new ArrayList<URI>();
		
		boolean prepost = Constants.PREPOST == (strategy & Constants.PREPOST);
		boolean patterns = Constants.PATTERNS == (strategy & Constants.PATTERNS);
		
		ArrayList<URI> queryList = new ArrayList<URI>();
		List<URI> suggestionList = new ArrayList<URI>();

		//---------------------------//
		// queries the repository searching for building blocks compatible in terms of their pre/postconditions 
		//---------------------------//
		
		if (prepost) {
			String queryString = "SELECT DISTINCT ?bb WHERE {"
				+ " { GRAPH " + prototypesGraph.toSPARQL() + " {"
				+ " { ?bb " + RDF.type.toSPARQL() + " " + FGO.Form.toSPARQL() + " } UNION"
				+ " { ?bb " + RDF.type.toSPARQL() + " " + FGO.Operator.toSPARQL() + " } UNION"
				+ " { ?bb " + RDF.type.toSPARQL() + " " + FGO.BackendService.toSPARQL() + " } } .";
	
			// doesn't include the building blocks where the postconditions were taken from
			for (ScreenComponent sc : canvasList) {
				queryString = queryString.concat("FILTER (?bb != " + sc.getPrototype().toSPARQL() + ") . ");
			}
	
			// tags
			if (tags != null && tags.size() > 0) {
				queryString = queryString.concat("{");
				for (String tag : tags) {
					queryString = queryString.concat(" { ?bb " + CTAG.tagged.toSPARQL() + " ?ctag . "
							+ " ?ctag " + CTAG.label.toSPARQL() + " ?tag . "
							+ " FILTER(regex(str(?tag), \"" + tag + "\", \"i\")) } UNION");
				}
				// remove last 'UNION'
				if (queryString.endsWith("UNION"))
					queryString = queryString.substring(0, queryString.length() - 5);
				queryString = queryString.concat("} . ");
			}
	
			// search for components which preconditions (from actions) are
			// satisfied by any of the conditions given
			if (conditions.size() > 0) {
				queryString = queryString.concat("{");
				for (Condition con : conditions) {
					ClosableIterator<Statement> cIt = null;
					// query for building blocks with the condition as an action's precondition
					queryString = queryString.concat(" { ?bb " + FGO.hasAction.toSPARQL() + " ?a . ");
					queryString = queryString.concat(" ?a " + FGO.hasPreCondition.toSPARQL() + " ?c . ");
					queryString = queryString.concat(" ?c " + FGO.hasPattern.toSPARQL() + " ?p . ");
					queryString = queryString.concat("GRAPH ?p {");
					cIt = patternToRDF2GoModel(con.getPatternString()).iterator();
					for (; cIt.hasNext();) {
						Statement st = cIt.next();
						Resource subject = st.getSubject();
						Node object = st.getObject();
						String s = (subject instanceof BlankNode) ?
								toCleanVariable(subject.toString()) :
									subject.toSPARQL();
						String o = (object instanceof BlankNode) ?
								toCleanVariable(object.toString()) :
									object.toSPARQL();
						queryString = queryString.concat(s + " " + st.getPredicate().toSPARQL() + " " + o + " . ");
					}
					cIt.close();
					queryString = queryString.concat("} } UNION");
					// query for building blocks with the condition as a postcondition
					queryString = queryString.concat(" { ?bb " + FGO.hasPostCondition.toSPARQL() + " ?c . ");
					queryString = queryString.concat(" ?c " + FGO.hasPattern.toSPARQL() + " ?p . ");
					queryString = queryString.concat("GRAPH ?p {");
					cIt = patternToRDF2GoModel(con.getPatternString()).iterator();
					for (; cIt.hasNext();) {
						Statement st = cIt.next();
						Resource subject = st.getSubject();
						Node object = st.getObject();
						String s = (subject instanceof BlankNode) ?
								toCleanVariable(subject.toString()) :
									subject.toSPARQL();
						String o = (object instanceof BlankNode) ?
								toCleanVariable(object.toString()) :
									object.toSPARQL();
						queryString = queryString.concat(s + " " + st.getPredicate().toSPARQL() + " " + o + " . ");
					}
					cIt.close();
					queryString = queryString.concat("} } UNION");
				}
				queryString = queryString.substring(0, queryString.length() - 5); // remove last 'UNION'
				queryString = queryString.concat("}");
			}
			queryString = queryString.concat("} }");
	
			if (log.isInfoEnabled()) log.info(queryString);
			QueryResultTable qrt = tripleStore.sparqlSelect(queryString);
			ClosableIterator<QueryRow> itResults = qrt.iterator();
			while (itResults.hasNext()) {
				queryList.add(itResults.next().getValue("bb").asURI());
			}
			itResults.close();
		}

		//---------------------------//
		// ask the recommender for building blocks related to the current canvas
		//---------------------------//
		
		if (patterns) {
			ArrayList<URI> uriList = new ArrayList<URI>();
			if (selectedItem == null) {
				for (ScreenComponent sc : canvasList) {
					URI uri = getPrototypeOfClone(sc.getUri());
					if (uri != null && !uriList.contains(uri))
						uriList.add(uri);
				}
			} else {
				uriList.add(selectedItem.getUri());
			}
			suggestionList.addAll(scRecommender.getSuggestionList(uriList));
			if (log.isInfoEnabled()) {
				log.info("--- Recommendation algorithm ---");
				log.info("Input: " + uriList);
				log.info("Ouput: " + suggestionList);
			}
		}
		
		//---------------------------//
		// merge the results of both building blocks lists
		//---------------------------//

		List<URI> results = new ArrayList<URI>();
		results.addAll(suggestionList); // most commonly used together
		for (URI uri : queryList) { // adds compatible building blocks
			if (!results.contains(uri)) {
				results.add(uri);
			}
		}
		
		// do pagination
		if (offset > 0 || limit > -1) {
			int toIndex = limit > -1 ? offset + limit : results.size();
			results = results.subList(offset, toIndex);
		}

		return results;
	}
	
	/**
	 * Search for screens inside the catalogue which satisfy the unsatisfied
	 * preconditions of a list of screens and also takes into account the domain
	 * context composed by a list of tags. If within the list of screens there
	 * are not unsatisfied preconditions, no screens will be returned because it
	 * is assume that there is no need to satisfied any condition. If any tag is
	 * given, the list of screens to be returned will be filtered by this tag.
	 * If no tag is given, no tag filter will be done. If the number of screens
	 * returned is high, you can use the parameters OFFSET and LIMIT in order to
	 * retrieve small lists of screens.
	 * 
	 * @param screens
	 *            list of screens (must be a list of 'clones')
	 * @param plugin
	 *            ignored at this version
	 * @param subsume
	 *            ignored at this version
	 * @param offset
	 *            indicate the start of the list of screens to be returned
	 * @param limit
	 *            specify the maximum number of screens to be returned [negative
	 *            means no limit]
	 * @param tags
	 *            a list of tags for filtering the results
	 * @return a recommended list of screens according to the input given
	 * @throws ClassCastException
	 * @throws ModelRuntimeException
	 */
	protected List<URI> findScreens(
			List<Screen> screens, 
			List<Condition> preconditions,
			List<Condition> postconditions,
			boolean plugin, boolean subsume, 
			int offset, int limit,
			List<String> tags,
			URI predicate) throws ModelRuntimeException {

		if (limit == 0) return new ArrayList<URI>();
		
		ArrayList<URI> results = new ArrayList<URI>();

		String queryString = "SELECT DISTINCT ?bb"
			+ " WHERE { { GRAPH " + prototypesGraph.toSPARQL() + " { ?bb " + RDF.type.toSPARQL() + " " + FGO.Screen.toSPARQL() + " } . ";

		for (Screen screen : screens) {
			//FIXME should we accept prototypes and clones in this method?
			URI filterURI = screen.getPrototype() == null ? screen.getUri() : screen.getPrototype();
			queryString = queryString.concat("FILTER (?bb != " + filterURI.toSPARQL() + ") . ");
		}

		if (tags != null && tags.size() > 0) {
			queryString = queryString.concat("{");
			for (String tag : tags) {
				queryString = queryString.concat(" { ?bb " + CTAG.tagged.toSPARQL() + " ?ctag . "
						+ " ?ctag " + CTAG.label.toSPARQL() + " ?tag . "
						+ " FILTER(regex(str(?tag), \"" + tag + "\", \"i\")) } UNION");
			}
			// remove last 'UNION'
			if (queryString.endsWith("UNION"))
				queryString = queryString.substring(0, queryString.length() - 5);
			queryString = queryString.concat("} . ");
		}

		ArrayList<Condition> unCon = getUnsatisfiedConditions(screens, preconditions, postconditions, plugin, subsume);
		if (unCon.size() > 0) {
			queryString = queryString.concat("{");
			for (Condition con : unCon) {
				if (log.isDebugEnabled()) log.debug("[UNSATISFIED] " + con.toString());
				queryString = queryString.concat("{ ?bb " + predicate.toSPARQL() + " ?condition . ");
				queryString = queryString.concat(" ?condition " + FGO.hasPattern.toSPARQL() + " ?pattern . ");
				queryString = queryString.concat("GRAPH ?pattern {");
				ClosableIterator<Statement> it = patternToRDF2GoModel(con.getPatternString()).iterator();
				for (; it.hasNext();) {
					Statement st = it.next();
					Resource subject = st.getSubject();
					Node object = st.getObject();
					String s = (subject instanceof BlankNode) ?
							toCleanVariable(subject.toString()) :
								subject.toSPARQL();
					String o = (object instanceof BlankNode) ?
							toCleanVariable(object.toString()) :
								object.toSPARQL();
					queryString = queryString.concat(s + " " + st.getPredicate().toSPARQL() + " " + o + " . ");
				}
				it.close();
				queryString = queryString.concat("} } UNION");
			}
			// remove last 'UNION'
			if (queryString.endsWith("UNION"))
				queryString = queryString.substring(0, queryString.length() - 5);
			queryString = queryString.concat("}");
		}
		queryString = queryString.concat("} }");

		if (limit > 0) queryString = queryString.concat(" LIMIT " + limit);
		queryString = queryString.concat(" OFFSET " + offset);

		if (log.isInfoEnabled()) log.info(queryString);
		QueryResultTable qrt = tripleStore.sparqlSelect(queryString);
		ClosableIterator<QueryRow> itResults = qrt.iterator();
		while (itResults.hasNext()) {
			results.add(itResults.next().getValue("bb").asURI());
		}
		itResults.close();

		return results;
	}

	public List<URI> findScreensBackwards(
			List<Screen> screens, List<Condition> preconditions, List<Condition> postconditions, 
			boolean plugin, boolean subsume, int offset, int limit, 
			List<String> tags) throws ModelRuntimeException {
		return findScreens(screens, preconditions, postconditions, plugin, subsume, offset, limit, tags, FGO.hasPostCondition);
	}

	public List<URI> findScreensForwards(
			List<Screen> screens, List<Condition> preconditions, List<Condition> postconditions,
			boolean plugin, boolean subsume, int offset, int limit,
			List<String> tags) throws ModelRuntimeException {
		ArrayList<Screen> tmpScreenList = new ArrayList<Screen>();
		for (Screen screen : screens) {
			Screen s = BuildingBlockFactory.createScreen();
			s.setUri(screen.getUri());
			s.setPreconditions(screen.getPostconditions());
			tmpScreenList.add(s);
		}
		return findScreens(tmpScreenList, postconditions, preconditions, plugin, subsume, offset, limit, tags, FGO.hasPreCondition);
	}
	
	public List<URI> findScreens(
			List<Screen> screens, Screen selectedItem, 
			List<Condition> preconditions, List<Condition> postconditions, 
			boolean plugin, boolean subsume, int offset, int limit, 
			List<String> tags, int strategy) {
		
		if (limit == 0) return new ArrayList<URI>();
		
		boolean prepost = Constants.PREPOST == (strategy & Constants.PREPOST);
		boolean patterns = Constants.PATTERNS == (strategy & Constants.PATTERNS);
		
		ArrayList<URI> queryList = new ArrayList<URI>();
		List<URI> suggestionList = new ArrayList<URI>();

		//---------------------------//
		// queries the repository searching for building blocks compatible in terms of their pre/postconditions 
		//---------------------------//

		if (prepost) {
			queryList.addAll(findScreensBackwards(screens, preconditions, postconditions, plugin, subsume, offset, limit, tags));
			if (!screens.isEmpty())
				queryList.addAll(findScreensForwards(screens, new ArrayList<Condition>(), new ArrayList<Condition>(), plugin, subsume, offset, limit, tags));
		}
	
		//---------------------------//
		// ask the recommender for building blocks related to the current canvas
		//---------------------------//
		
		if (patterns) {
			ArrayList<URI> uriList = new ArrayList<URI>();
			if (selectedItem == null) {
				for (Screen screen : screens) {
					URI uri = getPrototypeOfClone(screen.getUri());
					if (uri != null && !uriList.contains(uri))
						uriList.add(uri);
				}
			} else {
				uriList.add(selectedItem.getUri());
			}
			suggestionList.addAll(screenRecommender.getSuggestionList(uriList));
			if (log.isInfoEnabled()) {
				log.info("--- Recommendation algorithm ---");
				log.info("Input: " + uriList);
				log.info("Ouput: " + suggestionList);
			}
		}
		
		//---------------------------//
		// merge the results of both building blocks lists
		//---------------------------//

		List<URI> results = new ArrayList<URI>();
		results.addAll(suggestionList); // most commonly used together
		for (URI uri : queryList) { // adds compatible building blocks
			if (!results.contains(uri)) {
				results.add(uri);
			}
		}
		
		// do pagination
		if (offset > 0 || limit > -1) {
			int toIndex = limit > -1 ? offset + limit : results.size();
			results = results.subList(offset, toIndex);
		}

		return results;
	}

	/**
	 * Retrieves all the unsatisfied preconditions of a list of screens. It also
	 * checks whether a 'postcondition' is satisfied. NOTE: 'preconditions' are
	 * always satisfied
	 * 
	 * @param screens
	 *            The list of screens where the preconditions are obtained
	 * @param plugin
	 *            ignored at this version
	 * @param subsume
	 *            ignored at this version
	 * @return a list of conditions which are unsatisfied
	 */
	protected ArrayList<Condition> getUnsatisfiedConditions(
			List<Screen> screenList, List<Condition> preconditions, List<Condition> postconditions, 
			boolean plugin, boolean subsume) {
		ArrayList<Condition> unsatisfied = new ArrayList<Condition>();
		for (Screen screen : screenList) {
			for (Condition condition : screen.getPreconditions()) {
				if (condition.isPositive() && !isConditionSatisfied(preconditions, screenList, condition, plugin, subsume, screen.getUri())) {
					unsatisfied.add(condition);
				}
			}
		}
		for (Condition condition : postconditions) {
			if (condition.isPositive() && !isConditionSatisfied(preconditions, screenList, condition, plugin, subsume, null)) {
				unsatisfied.add(condition);
			}
		}
		return unsatisfied;
	}

	/**
	 * Determines if a specific precondition is satisfied by a list of screens,
	 * in other words, check if any postcondition of the list of screens satisfy
	 * the precondition. Usually the list of screens will include the screen
	 * which the precondition belongs to, hence you can set if a screen has to
	 * be excluded while checking.
	 * 
	 * @param screens
	 *            a list of screens which might satisfy the precondition
	 * @param conditionToCheck
	 *            the condition to check if it is satisfied
	 * @param plugin
	 *            not yet implemented
	 * @param subsume
	 *            not yet implemented
	 * @param screenExcluded
	 *            the URI of the screen which will be ignored while checking
	 * @return true if the condition is satisfied
	 */
	public boolean isConditionSatisfied(
			List<Condition> conditionList, List<Screen> screenList, Condition conditionToCheck, 
			boolean plugin, boolean subsume, URI screenExcluded) {
		ArrayList<Condition> listToCheck = new ArrayList<Condition>(1);
		listToCheck.add(conditionToCheck);
		return isConditionListSatisfied(screenList, conditionList, listToCheck, plugin, subsume, screenExcluded);
	}

	public boolean isConditionListSatisfied(
			List<Screen> screenList, List<Condition> conditionList, List<Condition> conditionsToCheck, 
			boolean plugin, boolean subsume, URI screenExcluded) {
		// if no conditions are provided, then returns true
		if (conditionsToCheck.isEmpty()) return true;

		// creates the model of the already satisfied conditions
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		for (Condition condition : conditionList) {
			if (condition.isPositive()) {
				model.addModel(patternToRDF2GoModel(condition.getPatternString()));
			}
		}
		for (Screen screen : screenList) {
			if (!screen.getUri().equals(screenExcluded)) {
				for (Condition condition : screen.getPostconditions()) {
					if (condition.isPositive()) {
						model.addModel(patternToRDF2GoModel(condition.getPatternString()));
					}
				}
			}
		}
		
		// create the ASK sparql query for a precondition
		String queryStr = "ASK {";
		for (Condition condition : conditionsToCheck) {
			if (condition.isPositive()) {
				ClosableIterator<Statement> it = patternToRDF2GoModel(condition.getPatternString()).iterator();
				for (; it.hasNext();) {
					Statement st = it.next();
					String subject = (st.getSubject() instanceof BlankNode) ?
							toCleanVariable(st.getSubject().toString()) :
								st.getSubject().toSPARQL();
					String object = (st.getObject() instanceof BlankNode) ?
							toCleanVariable(st.getObject().toString()) :
								st.getObject().toSPARQL();
					queryStr = queryStr.concat(subject + " " + st.getPredicate().toSPARQL() + " " + object + " . ");
				}
				it.close();
			}
		}
		queryStr = queryStr.concat("}");

		// empty query = is satisfied
		if (queryStr.equals("ASK {}")) return true;

		return model.sparqlAsk(queryStr);
	}

	/**
	 * Checks if c2 is satisfied by c1, in other words, if doing an ASK sparql
	 * query with all statements from c2 patterns into c1 pattern model returns
	 * true
	 * 
	 * @param c1
	 * @param c2
	 * @return
	 */
	public boolean isConditionCompatible(Condition c1, Condition c2) {
		if (c1 == null || c2 == null) return false;

		Model m1 = patternToRDF2GoModel(c1.getPatternString());
		Model m2 = patternToRDF2GoModel(c2.getPatternString());
		if (m1.size() == m2.size()) {
			// create the ASK sparql query for a condition
			String queryStr = "ASK {";
			ClosableIterator<Statement> it = m2.iterator();
			for (; it.hasNext();) {
				Statement st = it.next();
				String su = (st.getSubject() instanceof BlankNode) ?
						toCleanVariable(st.getSubject().toString()) :
							st.getSubject().toSPARQL();
				String ob = (st.getObject() instanceof BlankNode) ?
						toCleanVariable(st.getObject().toString()) :
							st.getObject().toSPARQL();
				queryStr = queryStr.concat(su + " " + st.getPredicate().toSPARQL() + " " + ob + " . ");
			}
			it.close();
			queryStr = queryStr.concat("}");

			return m1.sparqlAsk(queryStr);
		}

		return false;
	}

	/**
	 * Returns the subset of screens which are reachable within the given set. It receives a list of conditions
	 * which are already satisfied (screenflow preconditions), which can satisfy screens' preconditions.
	 * 
	 * @param conditionList
	 * @param screenList
	 * @return
	 */
	public List<Screen> filterReachableScreens(List<Condition> conditionList, List<Screen> screenList) {
		ArrayList<Screen> results = new ArrayList<Screen>();
		ArrayList<Screen> toCheck = new ArrayList<Screen>();
		for (Screen screen : screenList) {
			if (screen.getPreconditions().isEmpty()) {
				results.add(screen);
			} else {
				toCheck.add(screen);
			}
		}
		if (!results.isEmpty() || !toCheck.isEmpty()) {
			results.addAll(filterReachableScreens(results, conditionList, toCheck));
		}
		return results;
	}

	protected List<Screen> filterReachableScreens(List<Screen> reachables, List<Condition> conditionList, List<Screen> screensToFilter) {
		ArrayList<Screen> results = new ArrayList<Screen>();
		ArrayList<Screen> toCheck = new ArrayList<Screen>();
		for (Screen screen : screensToFilter) {
			// check whether a list of preconditions is fulfilled => makes the screen reachable
			if (isConditionListSatisfied(reachables, conditionList, screen.getPreconditions(), true, true, screen.getUri())) {
				results.add(screen);
			} else {
				toCheck.add(screen);
			}
		}
		// if there are new reachable screens and screens to check
		if (results.size() > 0 && toCheck.size() > 0) {
			reachables.addAll(results);
			results.addAll(filterReachableScreens(reachables, conditionList, toCheck));
		}
		return results;
	}

	protected String toCleanVariable(String name) {
		return "?" + name.replaceAll("[^a-zA-Z0-9]", "");
	}

	protected URI createClass(URI clazz) {
		tripleStore.addStatement(null, clazz, RDF.type, RDFS.Class);
		return clazz;
	}

	protected URI createClass(URI clazz, URI subClassOf) {
		tripleStore.addStatement(null, clazz, RDF.type, RDFS.Class);
		tripleStore.addStatement(null, clazz, RDFS.subClassOf, subClassOf);
		return clazz;
	}

	public void setLabel(URI clazz, String lang, String label) {
		tripleStore.addStatement(clazz, RDFS.label, tripleStore.createLanguageTagLiteral(label, lang));
	}

	public void setDescription(URI clazz, String lang, String description) {
		tripleStore.addStatement(clazz, DC.description, tripleStore.createLanguageTagLiteral(description, lang));
	}

	public void setTag(URI clazz, CTag tag) {
		BlankNode bnTag = tripleStore.createBlankNode();
		tripleStore.addStatement(clazz, CTAG.tagged, bnTag);

		if (tag instanceof AuthorCTag)
			tripleStore.addStatement(bnTag, RDF.type, CTAG.AuthorTag);
		else if (tag instanceof ReaderCTag)
			tripleStore.addStatement(bnTag, RDF.type, CTAG.ReaderTag);
		else if (tag instanceof AutoCTag)
			tripleStore.addStatement(bnTag, RDF.type, CTAG.AutoTag);
		else
			tripleStore.addStatement(bnTag, RDF.type, CTAG.Tag);

		if (tag.getMeans() != null)
			tripleStore.addStatement(bnTag, CTAG.means, tag.getMeans());
		for (String lang : tag.getLabels().keySet())
			tripleStore.addStatement(bnTag, CTAG.label,
				tripleStore.createLanguageTagLiteral(tag.getLabels().get(lang), lang));
		if (tag.getTaggingDate() != null) {
			tripleStore.addStatement(bnTag, CTAG.taggingDate,
				tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(tag.getTaggingDate()), XSD._date));
		} else { // no date provided, save the current date
			Date currentDate = new Date();
			tag.setTaggingDate(currentDate);
			tripleStore.addStatement(bnTag, CTAG.taggingDate,
				tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(currentDate), XSD._date));
		}
	}

	public URI createConceptURI(String name, String domain) {
		return tripleStore.createURI(configuration.getURI(environment, "serverURL") + "/concepts/" + domain + "/" + name);
	}

	public boolean isConcept(URI concept) {
		return tripleStore.isClass(concept);
	}

	public URI createURIforBuildingBlock(URL namespace, String bb, URI ofClass, String id)
	throws DuplicatedException, OntologyInvalidException {
		URI bbUri = tripleStore.createURI(namespace.toString() + "/" + bb + "/" + id);
		if (containsBuildingBlock(bbUri))
			throw new DuplicatedException(bbUri + " already exists.");
		return bbUri;
	}

	protected URI createURIforBuildingBlock(URI ofClass, String id)
	throws DuplicatedException, OntologyInvalidException {
		if (ofClass.equals(FGO.ScreenFlow)) {
			return createURIforBuildingBlock(getServerURL(), "screen-flows", ofClass, id);
		} else if (ofClass.equals(FGO.Screen)) {
			return createURIforBuildingBlock(getServerURL(), "screens", ofClass, id);
		} else if (ofClass.equals(FGO.Form)) {
			return createURIforBuildingBlock(getServerURL(), "forms", ofClass, id);
		} else if (ofClass.equals(FGO.Operator)) {
			return createURIforBuildingBlock(getServerURL(), "operators", ofClass, id);
		} else if (ofClass.equals(FGO.BackendService)) {
			return createURIforBuildingBlock(getServerURL(), "services", ofClass, id);
		}
		return null;
	}

	protected Model getModelForBuildingBlock(URI uri) {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		ClosableIterator<Statement> bbIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		while (bbIt.hasNext()) {
			Statement stmt = bbIt.next();
			URI predicate = stmt.getPredicate();
			Node object = stmt.getObject();
			model.addStatement(stmt);
			if (predicate.equals(FGO.hasAction)) {
				model.addModel(getModelForAction(object.asURI()));
			} else if (predicate.equals(FGO.hasPreCondition)) {
				model.addModel(getModelForURI(object.asURI()));
			} else if (predicate.equals(FGO.hasPostCondition)) {
				model.addModel(getModelForURI(object.asURI()));
			} else if (predicate.equals(CTAG.tagged)) {
				model.addModel(getModelForBlankNode(object.asBlankNode()));
			} else if (predicate.equals(FGO.contains)) {
				model.addModel(getModelForURI(object.asURI()));
			} else if (predicate.equals(FGO.hasLibrary)) {
				model.addModel(getModelForBlankNode(object.asBlankNode()));
			}
		}
		return model;
	}

	protected Model getModelForAction(URI uri) {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		ClosableIterator<Statement> aIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		while (aIt.hasNext()) {
			Statement stmt = aIt.next();
			model.addStatement(stmt);
			if (stmt.getPredicate().equals(FGO.hasPreCondition)) {
				model.addModel(getModelForURI(stmt.getObject().asURI()));
			} else if (stmt.getPredicate().equals(FGO.uses)) {
				model.addModel(getModelForBlankNode(stmt.getObject().asBlankNode()));
			}
		}
		aIt.close();
		return model;
	}

	protected Model getModelForBlankNode(BlankNode bn) {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		ClosableIterator<Statement> cIt = tripleStore.findStatements(bn, Variable.ANY, Variable.ANY);
		while (cIt.hasNext()) {
			model.addStatement(cIt.next());
		}
		cIt.close();
		return model;
	}

	protected Model getModelForURI(URI uri) {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		ClosableIterator<Statement> cIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		while (cIt.hasNext()) {
			model.addStatement(cIt.next());
		}
		cIt.close();
		return model;
	}

	/**
	 * Removes all the triples about the building block, its pre-/post-conditions, actions, etc.
	 * 
	 * @param rUri
	 * @throws NotFoundException
	 */
	protected void removeBuildingBlock(URI bbUri) throws NotFoundException {
		if (!containsBuildingBlock(bbUri))
			throw new NotFoundException();
		
		ClosableIterator<Statement> bbIt = tripleStore.findStatements(bbUri, Variable.ANY, Variable.ANY);
		for (; bbIt.hasNext(); ) {
			Statement bbSt = bbIt.next();
			URI predicate = bbSt.getPredicate();
			Node object = bbSt.getObject();
			if (predicate.equals(FGO.hasAction)) {
				ClosableIterator<Statement> aIt = tripleStore.findStatements(object.asURI(), Variable.ANY, Variable.ANY);
				for (; aIt.hasNext(); ) {
					Statement aSt = aIt.next();
					if (aSt.getPredicate().equals(FGO.hasPreCondition)) {
						removeCondition(aSt.getObject().asURI());
					}
				}
				aIt.close();
				tripleStore.removeResource(object.asURI());
			} else if (predicate.equals(FGO.hasPreCondition)
					|| predicate.equals(FGO.hasPostCondition)) {
				removeCondition(object.asURI());
			} else if (predicate.equals(CTAG.tagged)) {
				tripleStore.removeResource(object.asBlankNode());
			}
		}
		bbIt.close();
		tripleStore.removeResource(bbUri);
		if(log.isInfoEnabled()) log.info(bbUri+" removed.");
	}
	
	protected void removeCondition(URI cUri) throws NotFoundException {
		ClosableIterator<Statement> cIt = tripleStore.findStatements(cUri, Variable.ANY, Variable.ANY);
		for (; cIt.hasNext(); ) {
			Statement st = cIt.next();
			if (st.getPredicate().equals(FGO.hasPattern)) {
				tripleStore.removeModel(st.getObject().asURI());
				if(log.isInfoEnabled()) log.info("Pattern graph "+st.getObject().asURI()+" removed.");
			}
		}
		cIt.close();
		tripleStore.removeResource(cUri);
		if(log.isInfoEnabled()) log.info(cUri+" removed.");
	}
	
	public void addScreenFlow(ScreenFlow sf)
	throws DuplicatedException, OntologyInvalidException,
			OntologyReadonlyException, NotFoundException, BuildingBlockException {
		URI sfUri = sf.getUri();
		if (sfUri != null) {
			if (containsBuildingBlock(sf))
				throw new DuplicatedException(sf.getUri() + " already exists.");
		} else {
			sfUri = createURIforBuildingBlock(FGO.ScreenFlow, sf.getId());
			sf.setUri(sfUri);
		}
		// sets current date if no date given
		if (sf.getCreationDate() == null)
			sf.setCreationDate(new Date());
		// persists the screen-flow
		saveScreenFlow(sf);
		screenRecommender.rebuild(); //FIXME do not rebuild every time a new screen-flow is added!
		if (log.isInfoEnabled()) log.info("Screenflow " + sfUri + " added.");
	}

	protected void saveScreenFlow(ScreenFlow sf)
	throws OntologyReadonlyException, NotFoundException, BuildingBlockException {
		URI sfUri = sf.getUri();
		try {
			Model model = sf.toRDF2GoModel();
			tripleStore.addModel(model, prototypesGraph);
			processConditionsPatterns(model, prototypesGraph);
			model.close();
		} catch (Exception e) {
			log.error("Error while saving screen-flow " + sfUri, e);
			try {
				removeScreenFlow(sfUri);
			} catch (NotFoundException nfe) {
				log.error("Screen-flow " + sfUri + " does not exist.", nfe);
			}
			throw new BuildingBlockException("An error ocurred while saving the screen-flow: " + e, e);
		}
	}

	public void updateScreenFlow(ScreenFlow screenflow)
	throws NotFoundException, OntologyReadonlyException, BuildingBlockException {
		if (log.isInfoEnabled()) log.info("Updating screen-flow " + screenflow.getUri() + "...");
		removeScreenFlow(screenflow.getUri());
		// save new content with the same URI
		saveScreenFlow(screenflow);
		screenRecommender.rebuild(); //FIXME do not rebuild every time a new screen-flow is updated!
		if (log.isInfoEnabled()) log.info("Screen-flow " + screenflow.getUri() + " updated.");
	}

	/**
	 * Delete a screen flow from the catalogue NOTE: Do NOT delete the screens
	 * which is composed by.
	 * 
	 * @param sfUri
	 *            the URI of the screen flow to be deleted
	 * @throws NotFoundException
	 */
	public void removeScreenFlow(URI sfUri) throws NotFoundException {
		removeBuildingBlock(sfUri);
		screenRecommender.rebuild(); //FIXME do not rebuild every time a new screen-flow is deleted!
	}

	public void addScreens(Screen... screens)
	throws DuplicatedException, OntologyInvalidException, BuildingBlockException {
		for (Screen screen : screens) addScreen(screen);
	}

	/**
	 * Creates a new Screen into the catalogue
	 * 
	 * @param screen
	 * @throws DuplicatedException
	 * @throws OntologyInvalidException
	 * @throws BuildingBlockException
	 */
	public void addScreen(Screen screen)
	throws DuplicatedException, OntologyInvalidException, BuildingBlockException {
		URI screenUri = null;
		if (screen.getUri() != null) {
			screenUri = screen.getUri();
			if (containsBuildingBlock(screen))
				throw new DuplicatedException(screenUri + " already exists.");
		} else {
			screenUri = createURIforBuildingBlock(FGO.Screen, screen.getId());
			screen.setUri(screenUri);
		}
		// sets current date if no date given
		if (screen.getCreationDate() == null)
			screen.setCreationDate(new Date());
		// persists the screen
		saveScreen(screen);
		// create plans for the screen
		if (planner != null) planner.add(screen);
		scRecommender.rebuild(); //FIXME do not rebuild every time a new screen is added!
	}

	/**
	 * Do not check if the screen already exists, and assumes the screen has a
	 * well-formed unique URI To be invoked by addScreen and updateScreen
	 * methods
	 * 
	 * @throws BuildingBlockException
	 */
	protected void saveScreen(Screen screen) throws BuildingBlockException {
		URI sUri = screen.getUri();
		try {
			Model model = screen.toRDF2GoModel();
			tripleStore.addModel(model, prototypesGraph);
			processConditionsPatterns(model, prototypesGraph);
			model.close();
		} catch (Exception e) {
			log.error("Error while saving screen " + sUri, e);
			try {
				removeScreen(sUri);
			} catch (NotFoundException nfe) {
				log.error(nfe.toString(), nfe);
			}
			throw new BuildingBlockException("An error ocurred while saving the screen: " + e, e);
		}
	}

	public void updateScreen(Screen screen)
	throws NotFoundException, OntologyReadonlyException, RepositoryException, OntologyInvalidException, BuildingBlockException {
		if (log.isInfoEnabled()) log.info("Updating screen " + screen.getUri() + "...");
		Screen oldScreen = getScreen(screen.getUri());
		// remove screen from the catalogue
		removeScreen(screen.getUri());
		// save new content with the same URI
		saveScreen(screen);
		// calculate new plans
		if (planner != null) planner.update(screen, oldScreen);
		scRecommender.rebuild(); //FIXME do not rebuild every time a screen is updated!
		if (log.isInfoEnabled()) log.info("Screen " + screen.getUri() + " updated.");
	}

	public void removeScreen(URI screenUri) throws NotFoundException {
		removeBuildingBlock(screenUri);
		// remove the screen from the planner
		if (planner != null) planner.remove(screenUri);
		scRecommender.rebuild(); //FIXME do not rebuild every time a screen is deleted!
	}

	public URI cloneBuildingBlockByURI(URI bbUri) throws NotFoundException, BuildingBlockException {
		return cloneBuildingBlock(getBuildingBlock(bbUri));
	}

	//FIXME this method should be rethink! and implemented in a more maintainable and reusable way
	public URI cloneBuildingBlock(BuildingBlock bb) throws BuildingBlockException {
		String type = null;
		
		if (bb instanceof Screen)				type = "screens";
		else if (bb instanceof Form)			type = "forms";
		else if (bb instanceof Operator)		type = "operators";
		else if (bb instanceof BackendService)	type = "services";
		
		if (type == null)
			throw new BuildingBlockException("Building block must be a 'screen', 'form', 'operator' or 'backend service'.");
		
		// do a 'copy' of basic data of any building block
		URI copyUri = tripleStore.createUniqueUriWithName(configuration.getURI(environment, "serverURL"), "/" + type + "/clones/");
		String query = "CONSTRUCT { <copy> ?p ?o } WHERE { <bb> ?p ?o }";
		query = query.replaceFirst("<copy>", copyUri.toSPARQL());
		query = query.replaceFirst("<bb>", bb.getUri().toSPARQL());
		ClosableIterator<Statement> it = tripleStore.sparqlConstruct(query).iterator();
		while (it.hasNext()) {
			Statement stmt = it.next();
			Resource subject = stmt.getSubject();
			URI predicate = stmt.getPredicate();
			Node object = stmt.getObject();
			if (predicate.equals(FGO.hasPreCondition)
					|| predicate.equals(FGO.hasPostCondition)
					|| predicate.equals(FGO.hasAction)) {
				// these triples are created with specific URIs for the copy, so they are now discarded
			} else if (predicate.equals(FGO.contains)) {
				String str = object.asURI().toString();
				//FIXME pipes and triggers should not be saved from this triples, but the triples which points to other building blocks have to!
				if (!str.contains("/pipes/") && !str.contains("/triggers/")) {
					tripleStore.addStatement(clonesGraph, subject, predicate, object);
				}
			} else if (predicate.equals(DC.date)) {
				// overrides the creation date
				tripleStore.addStatement(clonesGraph, copyUri, DC.date,
						tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(new Date()), XSD._date));
			} else {
				tripleStore.addStatement(clonesGraph, subject, predicate, object);
			}
		}
		it.close();
		tripleStore.addStatement(clonesGraph, copyUri, FGO.hasPrototype, bb.getUri());
		tripleStore.addStatement(prototypesGraph, bb.getUri(), FGO.hasClone, copyUri);
		
		// adds data to the 'copy' based on the particular type of building block
		if (bb instanceof Screen) {
			Screen screen = (Screen) bb;
			// copy preconditions of the screen
			for (Condition condition : screen.getPreconditions()) {
				URI cUri = tripleStore.createURI(copyUri.toString() + "/preconditions/" + condition.getId());
				query = "CONSTRUCT { <copy> ?p ?o } WHERE { <bb> ?p ?o }";
				query = query.replaceFirst("<copy>", cUri.toSPARQL());
				query = query.replaceFirst("<bb>", condition.getUri().toSPARQL());
				it = tripleStore.sparqlConstruct(query).iterator();
				while (it.hasNext()) {
					Statement stmt = it.next();
					tripleStore.addStatement(clonesGraph, stmt.getSubject(), stmt.getPredicate(), stmt.getObject());
				}
				tripleStore.addStatement(clonesGraph, copyUri, FGO.hasPreCondition, cUri);
			}
			// copy postconditions of the screen
			for (Condition condition : screen.getPostconditions()) {
				URI cUri = tripleStore.createURI(copyUri.toString() + "/postconditions/" + condition.getId());
				query = "CONSTRUCT { <copy> ?p ?o } WHERE { <bb> ?p ?o }";
				query = query.replaceFirst("<copy>", cUri.toSPARQL());
				query = query.replaceFirst("<bb>", condition.getUri().toSPARQL());
				it = tripleStore.sparqlConstruct(query).iterator();
				while (it.hasNext()) {
					Statement stmt = it.next();
					tripleStore.addStatement(clonesGraph, stmt.getSubject(), stmt.getPredicate(), stmt.getObject());
				}
				tripleStore.addStatement(clonesGraph, copyUri, FGO.hasPostCondition, cUri);
			}
			for (Pipe pipe : screen.getPipes()) {
				URI pUri = tripleStore.createURI(copyUri+"/pipes/"+UUID.randomUUID().toString());
				Pipe newPipe = pipe.clone(copyUri, pUri);
				tripleStore.addModel(newPipe.toRDF2GoModel(), clonesGraph);
				tripleStore.addStatement(clonesGraph, copyUri, FGO.contains, pUri);
			}
			for (Trigger trigger : screen.getTriggers()) {
				URI tUri = tripleStore.createURI(copyUri+"/triggers/"+UUID.randomUUID().toString());
				Trigger newTrigger = trigger.clone(copyUri, tUri);
				tripleStore.addModel(newTrigger.toRDF2GoModel(), clonesGraph);
				tripleStore.addStatement(clonesGraph, copyUri, FGO.contains, tUri);
			}
		} else if (bb instanceof ScreenComponent){
			ScreenComponent sc = (ScreenComponent) bb;
			// copy actions of the screen component
			for (Action action : sc.getActions()) {
				URI aUri = tripleStore.createURI(copyUri.toString() + "/actions/" + action.getName());
				query = "CONSTRUCT { <copy> ?p ?o } WHERE { <bb> ?p ?o }";
				query = query.replaceFirst("<copy>", aUri.toSPARQL());
				query = query.replaceFirst("<bb>", action.getUri().toSPARQL());
				it = tripleStore.sparqlConstruct(query).iterator();
				while (it.hasNext()) {
					Statement stmt = it.next();
					URI predicate = stmt.getPredicate();
					if (predicate.equals(FGO.hasPreCondition)) {
						// these triples are created with specific URIs for the copy, so they are now discarded
					} else {
						tripleStore.addStatement(clonesGraph, stmt.getSubject(), stmt.getPredicate(), stmt.getObject());
					}
				}
				tripleStore.addStatement(clonesGraph, copyUri, FGO.hasAction, aUri);
				// copy preconditions of the action
				for (Condition condition : action.getPreconditions()) {
					URI cUri = tripleStore.createURI(aUri.toString() + "/preconditions/" + condition.getId());
					query = "CONSTRUCT { <copy> ?p ?o } WHERE { <bb> ?p ?o }";
					query = query.replaceFirst("<copy>", cUri.toSPARQL());
					query = query.replaceFirst("<bb>", condition.getUri().toSPARQL());
					it = tripleStore.sparqlConstruct(query).iterator();
					while (it.hasNext()) {
						Statement stmt = it.next();
						tripleStore.addStatement(clonesGraph, stmt.getSubject(), stmt.getPredicate(), stmt.getObject());
					}
					tripleStore.addStatement(clonesGraph, aUri, FGO.hasPreCondition, cUri);
				}
			}
			// copy postconditions of the screen component
			for (Condition condition : sc.getPostconditions()) {
				URI cUri = tripleStore.createURI(copyUri.toString() + "/postconditions/" + condition.getId());
				query = "CONSTRUCT { <copy> ?p ?o } WHERE { <bb> ?p ?o }";
				query = query.replaceFirst("<copy>", cUri.toSPARQL());
				query = query.replaceFirst("<bb>", condition.getUri().toSPARQL());
				it = tripleStore.sparqlConstruct(query).iterator();
				while (it.hasNext()) {
					Statement stmt = it.next();
					tripleStore.addStatement(clonesGraph, stmt.getSubject(), stmt.getPredicate(), stmt.getObject());
				}
				tripleStore.addStatement(clonesGraph, copyUri, FGO.hasPostCondition, cUri);
			}
		}
		
		return copyUri;
	}
	
	public void removeClone(URI uri) throws NotFoundException {
		ClosableIterator<Statement> cIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		for (; cIt.hasNext(); ) {
			Statement bbSt = cIt.next();
			URI predicate = bbSt.getPredicate();
			Node object = bbSt.getObject();
			if (predicate.equals(FGO.hasAction)) {
				ClosableIterator<Statement> aIt = tripleStore.findStatements(object.asURI(), Variable.ANY, Variable.ANY);
				for (; aIt.hasNext(); ) {
					Statement aSt = aIt.next();
					if (aSt.getPredicate().equals(FGO.hasPreCondition)) {
						tripleStore.removeResource(aSt.getObject().asURI());
					}
				}
				aIt.close();
				tripleStore.removeResource(object.asURI());
			} else if (predicate.equals(FGO.hasPreCondition)
					|| predicate.equals(FGO.hasPostCondition)) {
				tripleStore.removeResource(object.asURI());
			} else if (predicate.equals(FGO.contains)) {
				String str = object.asURI().toString();
				if (!str.contains("/pipes/") && !str.contains("/triggers/")) {
					tripleStore.removeResource(object.asURI());
				}
			}
		}
		cIt.close();
		tripleStore.removeResource(uri);
	}

	public URI getPrototypeOfClone(URI clone) {
		ClosableIterator<Statement> cIt = tripleStore.findStatements(clone, FGO.hasPrototype, Variable.ANY);
		URI prototype = cIt.hasNext() ? cIt.next().getObject().asURI() : null;
		cIt.close();
		return prototype;
	}
	
	protected void addScreenComponent(URI type, ScreenComponent sc)
			throws DuplicatedException, OntologyInvalidException,
			InvalidBuildingBlockTypeException, BuildingBlockException {
		if (!type.equals(FGO.Form)
				&& !type.equals(FGO.Operator)
				&& !type.equals(FGO.BackendService))
			throw new InvalidBuildingBlockTypeException(type + " is not a screen component.");

		URI scUri = null;
		if (sc.getUri() != null) {
			scUri = sc.getUri();
			if (containsBuildingBlock(sc))
				throw new DuplicatedException(scUri + " already exists.");
		} else {
			scUri = createURIforBuildingBlock(type, sc.getId());
			sc.setUri(scUri);
		}
		// sets current date if no date given
		if (sc.getCreationDate() == null) sc.setCreationDate(new Date());
		// persists the screen component
		saveScreenComponent(sc);
	}

	protected void saveScreenComponent(ScreenComponent sc) throws BuildingBlockException {
		URI scUri = sc.getUri();
		try {
			Model model = sc.toRDF2GoModel();
			tripleStore.addModel(model, prototypesGraph);
			processConditionsPatterns(model, prototypesGraph);
			model.close();
		} catch (Exception e) {
			log.error("Error while saving screen component " + scUri, e);
			try {
				removeBuildingBlock(scUri);
			} catch (NotFoundException nfe) {}
			throw new BuildingBlockException("An error ocurred while saving the screen component: " + e, e);
		}
	}

	protected void updateScreenComponent(ScreenComponent sc) throws NotFoundException, BuildingBlockException {
		if (log.isInfoEnabled()) log.info("Updating screen component " + sc.getUri() + "...");
		// remove old screen component from the catalogue
		removeScreenComponent(sc.getUri());
		// save new content with the same URI
		saveScreenComponent(sc);
		if (log.isInfoEnabled()) log.info("Screen component " + sc.getUri() + " updated.");
	}

	protected void removeScreenComponent(URI scUri) throws NotFoundException {
		URI type = getType(scUri);
		if (type == null) {
			removeBuildingBlock(scUri);
			log.warn("Type is unknown: " + scUri + " cannot be removed.");
		} else {
			if (type.equals(FGO.Form))
				removeForm(scUri);
			else if (type.equals(FGO.Operator))
				removeOperator(scUri);
			else if (type.equals(FGO.BackendService))
				removeBackendService(scUri);
			else {
				removeBuildingBlock(scUri);
				log.warn(scUri + " is not of type: Form, Operator or BackendService. Removing as generic building block.");
			}
		}
	}

	public void addForms(Form... forms) 
	throws DuplicatedException, OntologyInvalidException,
			InvalidBuildingBlockTypeException, BuildingBlockException {
		for (Form form : forms) addForm(form);
	}

	public void addForm(Form fe) throws DuplicatedException, OntologyInvalidException,
			InvalidBuildingBlockTypeException, BuildingBlockException {
		addScreenComponent(FGO.Form, fe);
	}

	public void updateForm(Form fe) throws NotFoundException, BuildingBlockException {
		updateScreenComponent(fe);
	}

	public void removeForm(URI formUri) throws NotFoundException {
		removeBuildingBlock(formUri);
	}

	public void addOperators(Operator... operators)
	throws DuplicatedException, OntologyInvalidException,
			InvalidBuildingBlockTypeException, BuildingBlockException {
		for (Operator operator : operators) addOperator(operator);
	}

	public void addOperator(Operator op)
	throws DuplicatedException, OntologyInvalidException,
			InvalidBuildingBlockTypeException, BuildingBlockException {
		addScreenComponent(FGO.Operator, op);
	}

	public void updateOperator(Operator op) throws NotFoundException, BuildingBlockException {
		updateScreenComponent(op);
	}

	public void removeOperator(URI opUri) throws NotFoundException {
		removeBuildingBlock(opUri);
	}

	public void addBackendServices(BackendService... backendservices)
	throws DuplicatedException, OntologyInvalidException,
			InvalidBuildingBlockTypeException, BuildingBlockException {
		for (BackendService bs : backendservices) addBackendService(bs);
	}

	public void addBackendService(BackendService bs)
	throws DuplicatedException, OntologyInvalidException,
			InvalidBuildingBlockTypeException, BuildingBlockException {
		addScreenComponent(FGO.BackendService, bs);
	}

	public void updateBackendService(BackendService bs) throws NotFoundException, BuildingBlockException {
		updateScreenComponent(bs);
	}

	public void removeBackendService(URI bsUri) throws NotFoundException {
		removeBuildingBlock(bsUri);
	}

	public Collection<ScreenFlow> getAllScreenFlows() {
		return getAllScreenFlows(true);
	}
	
	public Collection<ScreenFlow> getAllScreenFlows(boolean isPrototype) {
		return getAllScreenFlows(isPrototype ? prototypesGraph : clonesGraph);
	}
	
	private Collection<ScreenFlow> getAllScreenFlows(URI graph) {
		LinkedList<ScreenFlow> results = new LinkedList<ScreenFlow>();
		ClosableIterator<Statement> it = tripleStore.findStatements(graph, Variable.ANY, RDF.type, FGO.ScreenFlow);
		while (it.hasNext())
			try {
				results.add(getScreenFlow(it.next().getSubject().asURI()));
			} catch (NotFoundException e) {
				log.error(e.getMessage(), e);
			}
		it.close();
		return results;
	}

	public Collection<Screen> getAllScreens() {
		return getAllScreens(true);
	}
	
	public Collection<Screen> getAllScreens(boolean isPrototype) {
		return getAllScreens(isPrototype ? prototypesGraph : clonesGraph);
	}
	
	private Collection<Screen> getAllScreens(URI graph) {
		LinkedList<Screen> results = new LinkedList<Screen>();
		ClosableIterator<Statement> it = tripleStore.findStatements(graph, Variable.ANY, RDF.type, FGO.Screen);
		while (it.hasNext()) {
			try {
				results.add(getScreen(it.next().getSubject().asURI()));
			} catch (NotFoundException e) {
				log.error(e.getMessage(), e);
			}
		}
		it.close();
		return results;
	}

	public Collection<Form> getAllForms() {
		return getAllForms(true);
	}
	
	public Collection<Form> getAllForms(boolean isPrototype) {
		return getAllForms(isPrototype ? prototypesGraph : clonesGraph);
	}
	
	private Collection<Form> getAllForms(URI graph) {
		LinkedList<Form> results = new LinkedList<Form>();
		ClosableIterator<Statement> it = tripleStore.findStatements(graph, Variable.ANY, RDF.type, FGO.Form);
		while (it.hasNext()) {
			try {
				results.add(getForm(it.next().getSubject().asURI()));
			} catch (NotFoundException e) {
				log.error(e.getMessage(), e);
			}
		}
		it.close();
		return results;
	}
	
	public Collection<Operator> getAllOperators() {
		return getAllOperators(true);
	}
	
	public Collection<Operator> getAllOperators(boolean isPrototype) {
		return getAllOperators(isPrototype ? prototypesGraph : clonesGraph);
	}
	
	private Collection<Operator> getAllOperators(URI graph) {
		LinkedList<Operator> results = new LinkedList<Operator>();
		ClosableIterator<Statement> it = tripleStore.findStatements(graph, Variable.ANY, RDF.type, FGO.Operator);
		while (it.hasNext()) {
			try {
				results.add(getOperator(it.next().getSubject().asURI()));
			} catch (NotFoundException e) {
				log.error(e.getMessage(), e);
			}
		}
		it.close();
		return results;
	}

	public Collection<BackendService> getAllBackendServices() {
		return getAllBackendServices(true);
	}
	
	public Collection<BackendService> getAllBackendServices(boolean isPrototype) {
		return getAllBackendServices(isPrototype ? prototypesGraph : clonesGraph);
	}
	
	private Collection<BackendService> getAllBackendServices(URI graph) {
		LinkedList<BackendService> results = new LinkedList<BackendService>();
		ClosableIterator<Statement> it = tripleStore.findStatements(graph, Variable.ANY, RDF.type, FGO.BackendService);
		while (it.hasNext()) {
			try {
				results.add(getBackendService(it.next().getSubject().asURI()));
			} catch (NotFoundException e) {
				log.error(e.getMessage(), e);
			}
		}
		it.close();
		return results;
	}

	public Collection<URI> getAllConcepts(String[] tags) {
		LinkedList<URI> results = new LinkedList<URI>();
		String queryString = "SELECT DISTINCT ?concept \n" 
			+ "WHERE {\n"
			+ " { { ?concept " + RDF.type.toSPARQL() + " " + RDFS.Class.toSPARQL() + " } UNION { "
			+ " ?concept " + RDF.type.toSPARQL() + " " + OWL.Class.toSPARQL() + " } } ";
		if (tags != null && tags.length > 0) {
			queryString = queryString.concat("{");
			for (String tag : tags) {
				queryString = queryString.concat(
						" { ?concept " + CTAG.tagged.toSPARQL() + " ?ctag . "
						+ " ?ctag " + CTAG.label.toSPARQL() + " ?tag . "
						+ " FILTER(regex(str(?tag), \"" + tag + "\", \"i\")) } UNION");
			}
			queryString = queryString.substring(0, queryString.length() - 5); // remove last 'UNION'
			queryString = queryString.concat("} . ");
		}
		queryString = queryString.concat("}");
		QueryResultTable qrt = tripleStore.sparqlSelect(queryString);
		ClosableIterator<QueryRow> itResults = qrt.iterator();
		while (itResults.hasNext()) {
			QueryRow qr = itResults.next();
			Node node = qr.getValue("concept");

			if (node instanceof URI) { // some ontologies (ie: DBPedia) adds some concepts as Blank Nodes
				results.add(qr.getValue("concept").asURI());
			}
		}
		itResults.close();

		return results;
	}

	public BuildingBlock getBuildingBlock(URI uri) throws NotFoundException {
		if (isType(uri, FGO.ScreenFlow))			return getScreenFlow(uri);
		else if (isType(uri, FGO.Screen))			return getScreen(uri);
		else if (isType(uri, FGO.Form))				return getForm(uri);
		else if (isType(uri, FGO.Operator))			return getOperator(uri);
		else if (isType(uri, FGO.BackendService))	return getBackendService(uri);
		return null;
	}

	public boolean isType(URI uri, URI type) {
		URI t = getType(uri);
		if (t != null && t.equals(type)) return true;
		return false;
	}

	/**
	 * Returns the first type found for an URI
	 * 
	 * @param uri
	 * @return
	 */
	public URI getType(URI uri) {
		ClosableIterator<Statement> it = tripleStore.findStatements(uri, RDF.type, Variable.ANY);
		URI type = null;
		if (it.hasNext()) {
			type = it.next().getObject().asURI();
		}
		it.close();
		return type;
	}

	public ScreenFlow getScreenFlow(URI uri) throws NotFoundException {
		if (!containsBuildingBlock(uri)) throw new NotFoundException();
		return BuildingBlockRDF2GoBuilder.buildScreenFlow(getModelForBuildingBlock(uri));
	}

	public Screen getScreen(URI uri) throws NotFoundException {
		if (!containsBuildingBlock(uri)) throw new NotFoundException();
		return BuildingBlockRDF2GoBuilder.buildScreen(getModelForBuildingBlock(uri));
	}

	public ScreenComponent getScreenComponent(URI uri) throws NotFoundException {
		URI type = getType(uri);
		if (type == null)							return null;
		if (type.equals(FGO.Form))					return getForm(uri);
		else if (type.equals(FGO.Operator))			return getOperator(uri);
		else if (type.equals(FGO.BackendService))	return getBackendService(uri);
		return null;
	}

	public Form getForm(URI uri) throws NotFoundException {
		if (!containsBuildingBlock(uri)) throw new NotFoundException();
		return BuildingBlockRDF2GoBuilder.buildForm(getModelForBuildingBlock(uri));
	}

	public Operator getOperator(URI uri) throws NotFoundException {
		if (!containsBuildingBlock(uri)) throw new NotFoundException();
		return BuildingBlockRDF2GoBuilder.buildOperator(getModelForBuildingBlock(uri));
	}

	public BackendService getBackendService(URI uri) throws NotFoundException {
		if (!containsBuildingBlock(uri))
			throw new NotFoundException();
		return BuildingBlockRDF2GoBuilder.buildBackendService(getModelForBuildingBlock(uri));
	}

	protected void processConditionsPatterns(Model model, URI graphURI) {
		ClosableIterator<Statement> it = model.iterator();
		for (; it.hasNext();) {
			Statement stmt = it.next();
			if (stmt.getPredicate().equals(FGO.hasPatternString)
					&& isConditionPositive(model, stmt.getSubject().asURI())) {
				URI pUri = tripleStore.createUniqueUriWithName(configuration.getURI(environment, "serverURL"), "/patterns/");
				String pattern = stmt.getObject().asDatatypeLiteral().getValue();
				Model patternModel = patternToRDF2GoModel(pattern);
				tripleStore.addStatement(graphURI, stmt.getSubject(), FGO.hasPattern, pUri);
				tripleStore.addModel(patternModel, pUri);
				if (configuration.getBoolean("import-ontologies", this.environment)) {
					importMissingOntologies(patternModel);
				}
			}
		}
		it.close();
	}

	protected boolean isConditionPositive(Model model, URI conUri) {
		boolean isPositive = false;
		ClosableIterator<Statement> it = model.findStatements(conUri, FGO.isPositive, Variable.ANY);
		if (it.hasNext()) {
			Statement stmt = it.next();
			isPositive = Boolean.parseBoolean(stmt.getObject().asDatatypeLiteral().getValue());
		}
		it.close();
		return isPositive;
	}

	public Model patternToRDF2GoModel(String pattern) {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		HashMap<String, BlankNode> blankNodes = new HashMap<String, BlankNode>();

		StringTokenizer tokens = new StringTokenizer(pattern);// , " . ");
		for (; tokens.hasMoreTokens();) {
			String subject = tokens.nextToken();
			String predicate = tokens.nextToken();
			String object = tokens.nextToken();
			if (tokens.hasMoreTokens())
				tokens.nextToken(); // discard the .
			// gets if exists or creates the subject
			BlankNode subjectNode = blankNodes.get(subject);
			if (subjectNode == null) {
				subjectNode = model.createBlankNode();
				blankNodes.put(subject, subjectNode);
			}
			// creates a URI or BlankNode for the object
			Node objectNode;
			try {
				objectNode = tripleStore.createURI(object);
			} catch (IllegalArgumentException e) {
				objectNode = blankNodes.get(object);
				if (objectNode == null) {
					objectNode = model.createBlankNode();
					blankNodes.put(subject, subjectNode);
				}
			}
			model.addStatement(subjectNode, tripleStore.createURI(predicate), objectNode);
		}

		return model;
	}

	public Concept getConcept(URI uri) {
		Concept concept = BuildingBlockFactory.createConcept();
		concept.setUri(uri);

		// fill the information about the concept
		ClosableIterator<Statement> cIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		if (!cIt.hasNext()) // the resource does not exist
			return null;
		for (; cIt.hasNext();) {
			Statement st = cIt.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			if (predicate.equals(RDFS.subClassOf)) {
				concept.setSubClassOf(object.asURI());
			} else if (predicate.equals(RDFS.label)) {
				if (object instanceof LanguageTagLiteral) {
					LanguageTagLiteral label = object.asLanguageTagLiteral();
					concept.getLabels().put(label.getLanguageTag(), label.getValue());
				}
			} else if (predicate.equals(DC.description)) {
				LanguageTagLiteral description = object.asLanguageTagLiteral();
				concept.getDescriptions().put(description.getLanguageTag(), description.getValue());
			} else if (predicate.equals(CTAG.tagged)) {
				CTag tag = new CTag();
				ClosableIterator<Statement> tagIt = tripleStore.findStatements(object.asBlankNode(), Variable.ANY, Variable.ANY);
				for (; tagIt.hasNext();) {
					Statement tagSt = tagIt.next();
					URI tagPredicate = tagSt.getPredicate();
					Node tagObject = tagSt.getObject();
					if (tagPredicate.equals(CTAG.means)) {
						tag.setMeans(tagObject.asURI());
					} else if (tagPredicate.equals(CTAG.label)) {
						if (tagObject instanceof LanguageTagLiteral) {
							LanguageTagLiteral label = tagObject.asLanguageTagLiteral();
							tag.getLabels().put(label.getLanguageTag(), label.getValue());
						}
					} else if (tagPredicate.equals(CTAG.taggingDate)) {
						tag.setTaggingDate(DateFormatter.parseDateISO8601(tagObject.asDatatypeLiteral().getValue()));
					}
				}
				concept.getTags().add(tag);
			}
		}
		cIt.close();

		// read its attributes (properties)
		concept.getAttributes().addAll(attributesFor(concept));

		return concept;
	}

	protected Property getAttribute(URI uri) {
		Property att = BuildingBlockFactory.createAttribute();
		att.setUri(uri);

		ClosableIterator<Statement> cIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		if (!cIt.hasNext()) // the resource does not exist
			return null;
		for (; cIt.hasNext();) {
			Statement st = cIt.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			if (predicate.equals(RDFS.subPropertyOf)) {
				att.setSubPropertyOf(object.asURI());
			} else if (predicate.equals(RDFS.range)) {
				att.setType(object.asURI());
			}
		}
		cIt.close();

		return att;
	}

	public List<Property> attributesFor(Concept concept) {
		LinkedList<Property> attList = new LinkedList<Property>();
		ClosableIterator<Statement> cIt = tripleStore.findStatements(Variable.ANY, RDFS.domain, concept.getUri());
		for (; cIt.hasNext();) {
			Statement st = cIt.next();
			Property att = getAttribute(st.getSubject().asURI());
			att.setConcept(concept);
			attList.add(att);
		}
		cIt.close();
		return attList;
	}

	public void addConcept(Concept concept) throws DuplicatedException, BuildingBlockException {
		URI cUri = concept.getUri();
		if (containsConcept(cUri)) {
			throw new DuplicatedException(cUri + " already exists.");
		}
		// persists the concept
		if (!saveConcept(concept)) {
			throw new BuildingBlockException("An error ocurred while saving the concept. Please, ensure the concept is well defined.");
		}
	}

	// FIXME: throw an exception instead of boolean
	protected boolean saveConcept(Concept concept) {
		URI cUri = concept.getUri();
		Model model = null;
		try {
			model = concept.toRDF2GoModel();
			tripleStore.addModel(model);
			model.close();
			return true;
		} catch (Exception e) {
			log.error("Error while saving concept " + cUri, e);
			try {
				removeConcept(cUri);
			} catch (NotFoundException nfe) {
				log.error("Concept " + cUri + " does not exist.", nfe);
			}
		} finally {
			if (model != null) model.close();
		}
		return false;
	}

	public void updateConcept(Concept concept) throws NotFoundException, BuildingBlockException {
		if (log.isInfoEnabled()) log.info("Updating concept " + concept.getUri() + "...");
		removeConcept(concept.getUri());
		// save new content with the same URI
		if (saveConcept(concept)) {
			if (log.isInfoEnabled()) log.info("Concept " + concept.getUri() + " updated.");
		} else {
			throw new BuildingBlockException("An error ocurred while saving the concept. Please, ensure the concept is well defined.");
		}
	}

	/**
	 * Remove a concept given its URI. Only removes the triples which start with
	 * the given URI or as its context URI, if there are more triples with this
	 * URI as object, they will remain.
	 * 
	 * @param uri
	 * @throws NotFoundException
	 */
	public void removeConcept(URI uri) throws NotFoundException {
		tripleStore.removeModel(uri);
		tripleStore.removeResource(uri);
	}

	/**
	 * 
	 * @param cloneGoal
	 * @param cloneList list of 'cloned' screens
	 * @return
	 * @throws BuildingBlockException
	 * @throws NotFoundException 
	 */
	public List<Plan> searchPlans(URI cloneGoal, List<Screen> cloneList) throws BuildingBlockException, NotFoundException {
		URI prototypeGoal = getPrototypeOfClone(cloneGoal);
		if (prototypeGoal == null) {
			throw new BuildingBlockException(cloneGoal + " must be a clone of a prototype.");
		}
		
		ArrayList<Screen> prototypeList = new ArrayList<Screen>(); 
		for (Screen screen : cloneList) {
			if (screen.getPrototype() == null) {
				throw new BuildingBlockException(screen.getUri() + " must be a clone of a prototype.");
			}
			Screen s = getScreen(screen.getPrototype());
			if (!prototypeList.contains(s)) {
				prototypeList.add(s);
			}
		}
		
		List<Plan> planList = new ArrayList<Plan>();
		if (planner != null) {
			planList.addAll(planner.searchPlans(prototypeGoal, prototypeList));
		}
		
		return planList;
	}
	
	/**
	 * 
	 * @param cloneGoalList
	 * @param screenList
	 * @return
	 * @throws BuildingBlockException 
	 * @throws NotFoundException 
	 */
	public List<Plan> searchPlans(List<URI> cloneGoalList, List<Screen> cloneList) throws BuildingBlockException, NotFoundException {
		ArrayList<URI> prototypeGoalList = new ArrayList<URI>(); 
		for (URI cloneGoal : cloneGoalList) {
			URI prototypeGoal = getPrototypeOfClone(cloneGoal);
			if (prototypeGoal == null) {
				throw new BuildingBlockException(cloneGoal + " must be a clone of a prototype.");
			}
			prototypeGoalList.add(prototypeGoal);
		}
		
		ArrayList<Screen> prototypeList = new ArrayList<Screen>(); 
		for (Screen screen : cloneList) {
			if (screen.getPrototype() == null) {
				throw new BuildingBlockException(screen.getUri() + " must be a clone of a prototype.");
			}
			Screen s = getScreen(screen.getPrototype());
			if (!prototypeList.contains(s)) {
				prototypeList.add(s);
			}
		}
		
		List<Plan> planList = new ArrayList<Plan>();
		if (planner != null) {
			planList.addAll(planner.searchPlans(prototypeGoalList, prototypeList));
		}
		
		return planList;
	}

	/**
	 * Says whether a given object is an URI
	 * @param o the object to be checked
	 * @return true if the object is an URI
	 */
	public boolean isURI(Object o) {
		return o instanceof URI;
	}

	/**
	 * Imports into the catalogue any ontology which is being
	 * used in the given model, in the form of a concept or a
	 * property for example.
	 * Ex: if the model contains the URI http://xmlns.com/foaf/0.1/Person,
	 * the FOAF (http://xmlns.com/foaf/0.1) ontology will be imported.
	 * @param model set of triples used to check for URIs
	 */
	protected void importMissingOntologies(Model model) {
		ClosableIterator<Statement> it = model.iterator();
		for (; it.hasNext();) {
			Statement stmt = it.next();
			Resource subject = stmt.getSubject();
			URI predicate = stmt.getPredicate();
			Node object = stmt.getObject();
			if (isURI(subject)) importIfMissing(subject.asURI());
			importIfMissing(predicate);
			if (isURI(object)) importIfMissing(object.asURI());
		}
		it.close();
	}

	/**
	 * Figures out the ontology URI for a given concept or property URI, then it
	 * fetches and store the ontology in the catalogue.
	 * @param uri
	 */
	protected void importIfMissing(URI uri) {
		OntologyFinder finder = new SindiceOntologyFinder();
		for (URI ontUri : ontologyManager.list())
			if (ontologyManager.isDefinedBy(uri, ontUri)) return;

		URI oUri = finder.find(uri);
		if (oUri != null) {
			Ontology ontology = OntologyFetcher.fetch(MiscUtil.RDF2GoURItoURL(oUri));
			if (ontology != null) addOntology(ontology);
		}
	}

	public Collection<Sample> getAllSamples() {
		return getAllSamples(null);
	}

	public Collection<Sample> getAllSamples(URI classUri) {
		UriOrVariable object = classUri == null ? Variable.ANY : classUri;
		LinkedList<Sample> results = new LinkedList<Sample>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, object);
		Sample sample;
		while (it.hasNext()) {
			Resource subject = it.next().getSubject();
			if (isURI(subject) && subject.toString().startsWith(getServerURL() + "/samples/")) {
				sample = getSample(subject.asURI());
				if (sample != null) results.add(sample);
			}
		}
		it.close();
		return results;
	}

	public Sample getSample(URI uri) {
		return SampleRDF2GoBuilder.buildSample(getModelForURI(uri));
	}

	public Sample addSample(Sample sample) {
		URI uri = tripleStore.createUniqueUriWithName(MiscUtil.URLtoRDF2GoURI(getServerURL()), "/samples/");
		sample.setUri(uri);
		return saveSample(sample) ? sample : null;
	}

	// FIXME: throw an exception instead of boolean
	protected boolean saveSample(Sample sample) {
		URI uri = sample.getUri();
		Model model = null;
		try {
			model = sample.toRDF2GoModel();
			tripleStore.addModel(model);
			model.close();
			return true;
		} catch (Exception e) {
			log.error(e.toString(), e);
			try {
				removeSample(uri);
			} catch (NotFoundException nfe) {
				log.error(nfe.toString(), nfe);
			}
		} finally {
			if (model != null)
				model.close();
		}
		return false;
	}

	public void updateSample(Sample sample) throws BuildingBlockException, NotFoundException {
		removeSample(sample.getUri());
		if (!saveSample(sample)) {
			throw new BuildingBlockException("An error ocurred while saving the sample. Please, ensure the sample is well defined.");
		}
	}

	public void removeSample(URI uri) throws NotFoundException {
		tripleStore.removeResource(uri);
	}

	public Collection<IServeResponse> findIServeWS(List<Condition> conList) {
		if (conList.isEmpty())
			return new LinkedList<IServeResponse>();

		IServeClient client = new IServeClient(new IServeConfiguration("iserve.properties"));
		ArrayList<URI> list = new ArrayList<URI>();
		for (Condition con : conList) {
			ClosableIterator<Statement> it = patternToRDF2GoModel(
					con.getPatternString()).findStatements(Variable.ANY, RDF.type, Variable.ANY);
			for (; it.hasNext();) {
				Node object = it.next().getObject();
				if (object instanceof URI) list.add(object.asURI());
			}
			it.close();
		}

		return client.query(list);
	}

	// TODO only for debug purposes
	public TripleStore getTripleStore() {
		return tripleStore;
	}

	// TODO only for debug purposes
	public void exportToTrig() {
		try {
			tripleStore.export(new FileOutputStream("C:\\catalogue.n3"), Syntax.Trig);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
	}

	// TODO only for debug purposes
	public void printStatements() {
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, Variable.ANY, Variable.ANY);
		for (; it.hasNext();) {
			Statement st = it.next();
			System.out.println(st.getContext() + " - " + st.getSubject() + " - " + st.getPredicate() + " - " + st.getObject());
		}
	}

	// TODO only for debug purposes
	public void dump() {
		tripleStore.dump();
	}

}

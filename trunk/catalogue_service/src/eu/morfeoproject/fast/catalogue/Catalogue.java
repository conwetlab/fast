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
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.StringTokenizer;

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
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.vocabulary.OWL;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.ontoware.rdf2go.vocabulary.XSD;
import org.openrdf.repository.RepositoryException;
import org.openrdf.rio.RDFParseException;

import eu.morfeoproject.fast.catalogue.builder.BuildingBlockRDF2GoBuilder;
import eu.morfeoproject.fast.catalogue.builder.SampleRDF2GoBuilder;
import eu.morfeoproject.fast.catalogue.model.BackendService;
import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.model.Concept;
import eu.morfeoproject.fast.catalogue.model.Condition;
import eu.morfeoproject.fast.catalogue.model.Form;
import eu.morfeoproject.fast.catalogue.model.Operator;
import eu.morfeoproject.fast.catalogue.model.Postcondition;
import eu.morfeoproject.fast.catalogue.model.PreOrPost;
import eu.morfeoproject.fast.catalogue.model.Precondition;
import eu.morfeoproject.fast.catalogue.model.Property;
import eu.morfeoproject.fast.catalogue.model.Sample;
import eu.morfeoproject.fast.catalogue.model.Screen;
import eu.morfeoproject.fast.catalogue.model.ScreenComponent;
import eu.morfeoproject.fast.catalogue.model.ScreenFlow;
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
	private String environment;

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

		// creates the ontology manager
		ontologyManager = new OntologyManager(getAllOntologies());
		
		// check if the catalogue is correct
		if (!check()) {
			// recover the catalogue
			restore();
		}
		
		// creates the planner
		planner = PlannerFactory.createPlanner(this, this.environment);
	}

	public URL getServerURL() {
		return configuration.getURL(this.environment, "serverURL");
	}

	public Planner getPlanner() {
		return planner;
	}

	/**
	 * Restores the catalogue Should only be done when {@link #check()} returns
	 * true.
	 */
	protected void restore() {
		// add default ontologies
		for (DefaultOntologies.Ontology ontology : DefaultOntologies.getDefaults()) {
			if(log.isInfoEnabled()) log.info("adding default ontology '" + ontology.getUri() + "'");
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
		for (; it.hasNext(); ) {
			URI uri = it.next().getSubject().asURI();
			if (!ontologies.contains(uri)) ontologies.add(uri);
		}
		return ontologies;
	}
	
	public void clear() {
		// clear the repository
		tripleStore.clear();
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
			if(log.isInfoEnabled()) log.info("checking ontology '" + ont.getUri() + "'...");
			boolean misses = (!tripleStore.containsOntology(ont.getUri()));
			if(log.isInfoEnabled()) log.info("default ontology '" + ont.getUri() + "' is in the store: " + !misses);
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
				|| tripleStore.isResource(uri, FGO.Precondition)
				|| tripleStore.isResource(uri, FGO.Postcondition)
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

	public Set<URI> findScreenComponents(Screen container,
			List<Condition> conditions, Set<ScreenComponent> toExclude,
			int offset, int limit, Set<String> tags) throws ClassCastException,
			ModelRuntimeException {
		HashSet<URI> results = new HashSet<URI>();
		results.addAll(findScreenComponents(container, conditions, toExclude, offset, limit, tags, FGO.Form));
		results.addAll(findScreenComponents(container, conditions, toExclude, offset, limit, tags, FGO.Operator));
		results.addAll(findScreenComponents(container, conditions, toExclude, offset, limit, tags, FGO.BackendService));
		return results;
	}

	public Set<URI> findScreenComponents(Screen container,
			List<Condition> conditions, Set<ScreenComponent> toExclude,
			int offset, int limit, Set<String> tags, URI typeBuildingBlock)
			throws ClassCastException, ModelRuntimeException {
		HashSet<URI> results = new HashSet<URI>();

		String queryString = "SELECT DISTINCT ?bb " 
			+ " WHERE { { ?bb " + RDF.type.toSPARQL() + " " + typeBuildingBlock.toSPARQL() + " . ";

		// doesn't include the building blocks where the postconditions were
		// taken from
		for (ScreenComponent comp : toExclude)
			queryString = queryString.concat("FILTER (?bb != " + comp.getUri().toSPARQL() + ") . ");

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
		// satisfied
		// by any of the conditions given
		if (conditions.size() > 0) {
			queryString = queryString.concat("{");
			for (Condition con : conditions) {
				queryString = queryString.concat("{ ?bb " + FGO.hasAction.toSPARQL() + " ?a . ");
				queryString = queryString.concat(" ?a " + FGO.hasPreCondition.toSPARQL() + " ?c . ");
				queryString = queryString.concat(" ?c " + FGO.hasPattern.toSPARQL() + " ?p . ");
				queryString = queryString.concat("GRAPH ?p {");
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

	/**
	 * Search for screens inside the catalogue which satisfy the unsatisfied
	 * preconditions of a set of screens and also takes into account the domain
	 * context composed by a list of tags. If within the set of screens there
	 * are not unsatisfied preconditions, no screens will be returned because it
	 * is assume that there is no need to satisfied any condition. If any tag is
	 * given, the set of screens to be returned will be filtered by this tag. If
	 * no tag is given, no tag filter will be done. If the number of screens
	 * returned is high, you can use the parameters OFFSET and LIMIT in order to
	 * retrieve small sets of screens.
	 * 
	 * @param screens
	 * @param plugin
	 *            ignored at this version
	 * @param subsume
	 *            ignored at this version
	 * @param offset
	 *            indicate the start of the set of screens to be returned
	 * @param limit
	 *            specify the maximum number of screens to be returned [negative
	 *            means no limit]
	 * @param tags
	 *            a list of tags for filtering the results
	 * @return a recommended set of screens according to the input given
	 * @throws ClassCastException
	 * @throws ModelRuntimeException
	 */
	protected Set<URI> findScreens(Set<BuildingBlock> bbSet, boolean plugin,
			boolean subsume, int offset, int limit, Set<String> tags,
			URI predicate) throws ClassCastException, ModelRuntimeException {
		HashSet<URI> results = new HashSet<URI>();
		ArrayList<Condition> unCon = getUnsatisfiedPreconditions(bbSet, plugin, subsume);

		String queryString = "SELECT DISTINCT ?bb " 
			+ "WHERE { { ?bb " + RDF.type.toSPARQL() + " " + FGO.Screen.toSPARQL() + " . ";

		// ///*** LOOK FOR SCREENS ***/////
		for (BuildingBlock r : bbSet)
			if (r instanceof Screen)
				queryString = queryString.concat("FILTER (?bb != " + r.getUri().toSPARQL() + ") . ");

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

	public Set<URI> findBackwards(Set<BuildingBlock> bbSet, boolean plugin,
			boolean subsume, int offset, int limit, Set<String> tags)
			throws ClassCastException, ModelRuntimeException {
		return findScreens(bbSet, plugin, subsume, offset, limit, tags, FGO.hasPostCondition);
	}

	public Set<URI> findForwards(Set<BuildingBlock> bbSet, boolean plugin,
			boolean subsume, int offset, int limit, Set<String> tags)
			throws ClassCastException, ModelRuntimeException {
		Set<BuildingBlock> tmpBBSet = new HashSet<BuildingBlock>();
		for (BuildingBlock bb : bbSet) {
			if (bb instanceof Screen) {
				Screen s = BuildingBlockFactory.createScreen();
				s.setUri(bb.getUri());
				s.setPreconditions(((Screen) bb).getPostconditions());
				tmpBBSet.add(s);
			} else {
				tmpBBSet.add(bb);
			}
		}
		return findScreens(tmpBBSet, plugin, subsume, offset, limit, tags, FGO.hasPreCondition);
	}

	/**
	 * Retrieves all the unsatisfied preconditions of a set of screens. It also
	 * checks whether a 'postcondition' is satisfied. NOTE: 'preconditions' are
	 * always satisfied
	 * 
	 * @param screens
	 *            The set of screens where the preconditions are obtained
	 * @param plugin
	 *            ignored at this version
	 * @param subsume
	 *            ignored at this version
	 * @return a list of conditions which are unsatisfied
	 */
	protected ArrayList<Condition> getUnsatisfiedPreconditions(Set<BuildingBlock> bbSet, boolean plugin, boolean subsume) {
		ArrayList<Condition> unsatisfied = new ArrayList<Condition>();
		for (BuildingBlock bb : bbSet) {
			if (bb instanceof Screen) {
				Screen s = (Screen) bb;
				for (Condition condition : s.getPreconditions()) {
					if (condition.isPositive() &&
							!isConditionSatisfied(bbSet, condition, plugin, subsume, s.getUri())) {
						unsatisfied.add(condition);
					}
				}
			} else if (bb instanceof Postcondition) {
				Postcondition p = (Postcondition) bb;
				for (Condition condition : p.getConditions()) {
					if (condition.isPositive() &&
							!isConditionSatisfied(bbSet, condition, plugin, subsume, p.getUri())) {
						unsatisfied.add(condition);
					}
				}
			}
		}
		return unsatisfied;
	}

	/**
	 * Determines if a specific precondition is satisfied by a set of screens,
	 * in other words, check if any postcondition of the set of screens satisfy
	 * the precondition. Usually the set of screens will include the screen
	 * which the precondition belongs to, hence you can set if a screen has to
	 * be excluded while checking.
	 * 
	 * @param screens
	 *            a set of screens which might satisfy the precondition
	 * @param condition
	 *            the condition to check if it is satisfied
	 * @param plugin
	 *            not yet implemented
	 * @param subsume
	 *            not yet implemented
	 * @param screenExcluded
	 *            the URI of the screen which will be ignored while checking
	 * @return true if the condition is satisfied
	 */
	public boolean isConditionSatisfied(Set<BuildingBlock> bbSet,
			Condition condition, boolean plugin, boolean subsume, URI screenExcluded) {
		Set<BuildingBlock> tmpBBSet = new HashSet<BuildingBlock>();

		// if no condition is provided, then returns true
		if (condition == null) return true;

		// copy the set of screens except the screen to be excluded
		for (BuildingBlock bb : bbSet) {
			if (bb instanceof Precondition) {
				tmpBBSet.add(bb);
			} else if (bb instanceof Screen 
					&& !bb.getUri().equals(screenExcluded)) {
				tmpBBSet.add((Screen) bb);
			}
		}

		// create the ASK sparql query for a precondition
		String queryStr = "ASK {";
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
		queryStr = queryStr.concat("}");

		// empty query = is satisfied
		if (queryStr.equals("ASK {}")) return true;

		// creates all possible combination of preconditions
		Set<Model> models = createModels(tmpBBSet, plugin, subsume);
		boolean satisfied = false;

		for (Model m : models) {
			satisfied = m.sparqlAsk(queryStr);
			if (satisfied) break;
		}

		return satisfied;
	}

	public boolean isConditionListSatisfied(Set<BuildingBlock> bbSet,
			List<Condition> precondition, boolean plugin, boolean subsume,
			URI screenExcluded) {
		Set<BuildingBlock> tmpBBSet = new HashSet<BuildingBlock>();

		// if no conditions are provided, then returns true
		if (precondition.isEmpty()) return true;

		// copy the set of screens except the screen to be excluded
		for (BuildingBlock bb : bbSet)
			if (bb instanceof Precondition)
				tmpBBSet.add(bb);
			else if (bb instanceof Screen && !bb.getUri().equals(screenExcluded))
				tmpBBSet.add((Screen) bb);

		// creates all possible combination of preconditions
		Set<Model> models = createModels(tmpBBSet, plugin, subsume);
		boolean satisfied = false;

		// create the ASK sparql query for a precondition
		String queryStr = "ASK {";
		for (Condition condition : precondition) {
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

		for (Model m : models) {
			satisfied = m.sparqlAsk(queryStr);
			if (satisfied) break;
		}

		return satisfied;
	}
	
	public Set<Model> createModels(Set<BuildingBlock> bbSet, boolean plugin, boolean subsume) {
		Set<Model> models = new HashSet<Model>();
		if (bbSet.isEmpty()) {
			return models;
		} else if (bbSet.size() == 1) {
			BuildingBlock r = bbSet.iterator().next();
			if (r instanceof Precondition) {
				Model m = RDF2Go.getModelFactory().createModel();
				m.open();
				for (Condition c : ((Precondition) r).getConditions()) {
					if (c.isPositive()) m.addModel(patternToRDF2GoModel(c.getPatternString()));
				}
				models.add(m);
			} else if (r instanceof Screen) {
				Model m = RDF2Go.getModelFactory().createModel();
				m.open();
				for (Condition c: ((Screen) r).getPostconditions()) {
					if (c.isPositive()) m.addModel(patternToRDF2GoModel(c.getPatternString()));
				}
				models.add(m);
			}
		} else {
			BuildingBlock bb = bbSet.iterator().next();
			bbSet.remove(bb);
			Set<Model> result = createModels(bbSet, plugin, subsume);
			for (Model model : result) {
				if (bb instanceof Precondition) {
					Model m = RDF2Go.getModelFactory().createModel();
					m.open();
					for (Condition c : ((Precondition) bb).getConditions()) {
						if (c.isPositive()) m.addModel(patternToRDF2GoModel(c.getPatternString()));
					}
					m.addModel(model);
					models.add(m);
				} else if (bb instanceof Screen) {
					Model m = RDF2Go.getModelFactory().createModel();
					m.open();
					for (Condition c : ((Screen) bb).getPostconditions()) {
						if (c.isPositive()) m.addModel(patternToRDF2GoModel(c.getPatternString()));
					}
					m.addModel(model);
					models.add(m);
				}
			}
		}
		return models;
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
				queryStr = queryStr.concat(su + " "
						+ st.getPredicate().toSPARQL() + " " + ob + " . ");
			}
			it.close();
			queryStr = queryStr.concat("}");

			return m1.sparqlAsk(queryStr);
		}
		
		return false;
	}

	/**
	 * Returns the subset of building blocks (screens or preconditions) which
	 * are reachable within the given set. All preconditions are reachable by
	 * default.
	 * 
	 * @param bbSet
	 * @return
	 */
	public Set<BuildingBlock> filterReachableBuildingBlocks(Set<BuildingBlock> bbSet) {
		HashSet<BuildingBlock> results = new HashSet<BuildingBlock>();
		HashSet<BuildingBlock> toCheck = new HashSet<BuildingBlock>();
		for (BuildingBlock bb : bbSet) {
			if (bb instanceof Precondition) {
				results.add(bb);
			} else if (bb instanceof Screen) {
				Screen s = (Screen) bb;
				if (s.getPreconditions().isEmpty()){
					results.add(s);
				} else {
					toCheck.add(s);
				}
			}
		}
		if (!results.isEmpty() && !toCheck.isEmpty()) {
			results.addAll(filterReachableBuildingBlocks(results, toCheck));
		}
		return results;
	}

	protected Set<BuildingBlock> filterReachableBuildingBlocks(Set<BuildingBlock> reachables, Set<BuildingBlock> bbSet) {
		HashSet<BuildingBlock> results = new HashSet<BuildingBlock>();
		HashSet<BuildingBlock> toCheck = new HashSet<BuildingBlock>();
		for (BuildingBlock bb : bbSet) {
			if (bb instanceof Screen) {
				Screen s = (Screen) bb;
				// check whether a set of preconditions is fulfilled => makes the screen reachable
				if (isConditionListSatisfied(reachables, s.getPreconditions(), true, true, s.getUri())) {
					results.add(s);
				} else {
					toCheck.add(s);
				}
			}
		}
		// if there are new reachable screens and screens to check
		if (results.size() > 0 && toCheck.size() > 0) {
			reachables.addAll(results);
			results.addAll(filterReachableBuildingBlocks(reachables, toCheck));
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

	protected URI saveModelToGraph(Model model) {
		URI graphUri = tripleStore.getUniqueNamespace(configuration.getURI(environment, "serverURL"), "/bb/", false);
		return saveModelToGraph(graphUri, model);
	}

	protected URI saveModelToGraph(URI graphUri, Model model) {
		tripleStore.addModel(model, graphUri);
		return graphUri;
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
			tripleStore.addStatement(bnTag, CTAG.label, tripleStore.createLanguageTagLiteral(tag.getLabels().get(lang), lang));
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
		return new URIImpl(configuration.getURI(environment, "serverURL") + "/concepts/" + domain + "/" + name);
	}

	public boolean isConcept(URI concept) {
		return tripleStore.isClass(concept);
	}

	public URI createURIforBuildingBlock(URL namespace, String bb, URI ofClass, String id) 
	throws DuplicatedException, OntologyInvalidException {
		URI bbUri = new URIImpl(namespace.toString() + "/" + bb + "/" + id);
		if (containsBuildingBlock(bbUri))
			throw new DuplicatedException(bbUri + " already exists.");
		return bbUri;
	}

	protected URI createURIforBuildingBlock(URI ofClass, String id)
	throws DuplicatedException, OntologyInvalidException {
		if (ofClass.equals(FGO.ScreenFlow)) {
			return createURIforBuildingBlock(getServerURL(), "screenflows", ofClass, id);
		} else if (ofClass.equals(FGO.Screen)) {
			return createURIforBuildingBlock(getServerURL(), "screens", ofClass, id);
		} else if (ofClass.equals(FGO.Form)) {
			return createURIforBuildingBlock(getServerURL(), "forms", ofClass, id);
		} else if (ofClass.equals(FGO.Operator)) {
			return createURIforBuildingBlock(getServerURL(), "operators", ofClass, id);
		} else if (ofClass.equals(FGO.BackendService)) {
			return createURIforBuildingBlock(getServerURL(), "services", ofClass, id);
		} else if (ofClass.equals(FGO.Precondition)) {
			return createURIforBuildingBlock(getServerURL(), "preconditions", ofClass, id);
		} else if (ofClass.equals(FGO.Postcondition)) {
			return createURIforBuildingBlock(getServerURL(), "postconditions", ofClass, id);
		}
		return null;
	}

	protected Model getModelForSubject(Resource subject) {
		return tripleStore.getModel(subject.asURI());
	}
	
	protected Model getModelForBuildingBlock(URI uri) {
		ClosableIterator<Statement> it = tripleStore.findStatements(uri, new URIImpl("http://replace.for.real.one"), Variable.ANY);
		URI graphUri = null;
		if (it.hasNext())
			graphUri = it.next().getObject().asURI();
		it.close();
		return tripleStore.getModel(graphUri);
	}

	/**
	 * Removes the graph containing the building block
	 * 
	 * @param rUri
	 * @throws NotFoundException
	 */
	// TODO needs to remove statements created for the patterns
	protected void removeBuildingBlock(URI bbUri) throws NotFoundException {
		if (!containsBuildingBlock(bbUri))
			throw new NotFoundException();
		URI graphUri = getGraphForBuildingBlock(bbUri);
		if (graphUri == null)
			throw new NotFoundException();
		removeConditionsStatements(graphUri);
		tripleStore.removeModel(graphUri);
		if(log.isInfoEnabled()) log.info(bbUri+" removed.");
	}

	protected URI getGraphForBuildingBlock(URI bbUri) {
		ClosableIterator<Statement> it = tripleStore.findStatements(bbUri, new URIImpl("http://replace.for.real.one"), Variable.ANY);
		if (it.hasNext()) return it.next().getObject().asURI();
		return null;
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
		if (!saveScreenFlow(sf)) {
			throw new BuildingBlockException("An error ocurred while saving the screen-flow. Please, ensure the screen-flow is well defined.");
		}
		if(log.isInfoEnabled()) log.info("Screenflow " + sfUri + " added.");
	}

	protected boolean saveScreenFlow(ScreenFlow sf)
	throws OntologyReadonlyException, NotFoundException {
		URI sfUri = sf.getUri();
		try {
			Model model = sf.toRDF2GoModel();
			URI graphUri = saveModelToGraph(model);
			tripleStore.addStatement(graphUri, sfUri, new URIImpl("http://replace.for.real.one"), graphUri);
			generateConditionsStatements(model, graphUri);
			model.close();
			return true;
		} catch (Exception e) {
			log.error("Error while saving screen " + sfUri, e);
			try {
				removeScreenFlow(sfUri);
			} catch (NotFoundException nfe) {
				log.error("Screen-flow " + sfUri + " does not exist.", nfe);
			}
		}
		return false;
	}

	public void updateScreenFlow(ScreenFlow screenflow)
			throws NotFoundException, OntologyReadonlyException,
			BuildingBlockException {
		if(log.isInfoEnabled()) log.info("Updating screenflow " + screenflow.getUri() + "...");
		removeScreenFlow(screenflow.getUri());
		// save new content with the same URI
		if (!saveScreenFlow(screenflow)) {
			throw new BuildingBlockException("An error ocurred while saving the screen-flow. Please, ensure the screen-flow is well defined.");
		}
		if(log.isInfoEnabled()) log.info("Screenflow " + screenflow.getUri() + " updated.");
	}

	/**
	 * Delete a screen flow from the catalogue NOTE: Do NOT delete the screens
	 * which is composed by.
	 * 
	 * @param sfUri
	 *            the URI of the screen flow to be deleted
	 * @throws NotFoundException
	 */
	public void removeScreenFlow(URI sfUri)
	throws NotFoundException {
		removeBuildingBlock(sfUri);
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
		if (saveScreen(screen)) {
			// create plans for the screen
			if (planner != null) planner.add(screen);
		} else {
			throw new BuildingBlockException("An error ocurred while saving the screen. Please, ensure the screen is well defined.");
		}
	}

	/**
	 * Do not check if the screen already exists, and assumes the screen has a
	 * well-formed unique URI To be invoked by addScreen and updateScreen
	 * methods
	 */
	protected boolean saveScreen(Screen screen) {
		URI sUri = screen.getUri();
		try {
			Model model = screen.toRDF2GoModel();
			URI graphUri = saveModelToGraph(model);
			tripleStore.addStatement(graphUri, sUri, new URIImpl("http://replace.for.real.one"), graphUri);
			generateConditionsStatements(model, graphUri);
			model.close();
			return true;
		} catch (Exception e) {
			log.error(e.toString(), e);
			try {
				removeScreen(sUri);
			} catch (NotFoundException nfe) {
				log.error(nfe.toString(), nfe);
			}
		}
		return false;
	}

	public void updateScreen(Screen screen) throws NotFoundException,
			OntologyReadonlyException, RepositoryException,
			OntologyInvalidException, BuildingBlockException {
		if(log.isInfoEnabled()) log.info("Updating screen " + screen.getUri() + "...");
		Screen oldScreen = getScreen(screen.getUri());
		// remove screen from the catalogue
		removeScreen(screen.getUri());
		// save new content with the same URI
		if (saveScreen(screen)) {
			// calculate new plans if necessary
			if (planner != null) planner.update(screen, oldScreen);
			if(log.isInfoEnabled()) log.info("Screen " + screen.getUri() + " updated.");
		} else {
			throw new BuildingBlockException("An error ocurred while saving the screen. Please, ensure the screen is well defined.");
		}
	}

	public void removeScreen(URI screenUri) throws NotFoundException {
		removeBuildingBlock(screenUri);
		// remove the screen from the planner
		if (planner != null) planner.remove(screenUri);
	}

	public void addPreOrPost(PreOrPost se)
	throws DuplicatedException, OntologyInvalidException, BuildingBlockException {
		URI seUri = null;
		if (se.getUri() != null) {
			seUri = se.getUri();
			if (containsBuildingBlock(se))
				throw new DuplicatedException(seUri + " already exists.");
		} else {
			if (se instanceof Precondition) {
				seUri = createURIforBuildingBlock(FGO.Precondition, se.getId());
			}
			else if (se instanceof Postcondition) {
				seUri = createURIforBuildingBlock(FGO.Postcondition, se.getId());
			}
			se.setUri(seUri);
		}
		// sets current date if no date given
		if (se.getCreationDate() == null)
			se.setCreationDate(new Date());
		// persists the pre/postcondition
		if (!savePreOrPost(se)) {
			throw new BuildingBlockException("An error ocurred while saving the screen. Please, ensure the screen is well defined.");
		}
	}

	protected boolean savePreOrPost(PreOrPost preOrPost) {
		URI uri = preOrPost.getUri();
		try {
			Model model = preOrPost.toRDF2GoModel();
			URI graphUri = saveModelToGraph(model);
			tripleStore.addStatement(graphUri, uri, new URIImpl("http://replace.for.real.one"), graphUri);
			generateConditionsStatements(model, graphUri);
			model.close();
			return true;
		} catch (Exception e) {
			log.error("Error while saving pre/postcondition " + uri, e);
			try {
				removeScreen(uri);
			} catch (NotFoundException nfe) {
				log.error("Pre/postcondition " + uri + " does not exist.", nfe);
			}
		}
		return false;
	}

	public void updatePreOrPost(PreOrPost se)
	throws NotFoundException, BuildingBlockException {
		if(log.isInfoEnabled()) log.info("Updating pre/postcondition " + se.getUri() + "...");
		removePreOrPost(se.getUri());
		// save new content with the same URI
		if (savePreOrPost(se)) {
			if(log.isInfoEnabled()) log.info(se.getUri() + " updated.");
		} else {
			throw new BuildingBlockException("An error ocurred while saving the pre/postcondition. Please, ensure the screen is well defined.");
		}
	}

	public void removePreOrPost(URI uri) throws NotFoundException {
		removeBuildingBlock(uri);
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
		if (sc.getCreationDate() == null)
			sc.setCreationDate(new Date());
		// persists the screen component
		if (!saveScreenComponent(sc)) {
			throw new BuildingBlockException("An error ocurred while saving the screen component. Please, ensure the component is well defined.");
		}
	}

	// TODO methods "save" should throw the exception, so we have more details to show in the servlet when an error occurs
	protected boolean saveScreenComponent(ScreenComponent sc) {
		URI scUri = sc.getUri();
		try {
			Model model = sc.toRDF2GoModel();
//			ClosableIterator<Statement> it = model.findStatements(Variable.ANY, Variable.ANY, Variable.ANY);
//			for (;it.hasNext();) {
//				System.out.println(it.next());
//			}
			URI graphUri = saveModelToGraph(model);
			tripleStore.addStatement(graphUri, scUri, new URIImpl("http://replace.for.real.one"), graphUri);
			generateConditionsStatements(model, graphUri);
			model.close();
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			log.error("Error while saving screen component " + scUri, e);
			try {
				removeBuildingBlock(scUri);
			} catch (NotFoundException nfe) {
				log.error("Screen component " + scUri + " does not exist.", nfe);
			}
		}
		return false;
	}

	protected void updateScreenComponent(ScreenComponent sc)
			throws NotFoundException, BuildingBlockException {
		if(log.isInfoEnabled()) log.info("Updating screen component " + sc.getUri() + "...");
		// remove old screen component from the catalogue
		removeScreenComponent(sc.getUri());
		// save new content with the same URI
		if (!saveScreenComponent(sc))
			throw new BuildingBlockException("An error ocurred while saving the screen component. Please, ensure the component is well defined.");
		if(log.isInfoEnabled()) log.info("Screen component " + sc.getUri() + " updated.");
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

	public void addForm(Form fe)
	throws DuplicatedException, OntologyInvalidException,
			InvalidBuildingBlockTypeException, BuildingBlockException {
		addScreenComponent(FGO.Form, fe);
	}

	public void updateForm(Form fe)
	throws NotFoundException, BuildingBlockException {
		updateScreenComponent(fe);
	}

	public void removeForm(URI formUri)
	throws NotFoundException {
		removeBuildingBlock(formUri);
	}

	public void addOperator(Operator op)
	throws DuplicatedException, OntologyInvalidException,
			InvalidBuildingBlockTypeException, BuildingBlockException {
		addScreenComponent(FGO.Operator, op);
	}

	public void updateOperator(Operator op) throws NotFoundException,
			BuildingBlockException {
		updateScreenComponent(op);
	}

	public void removeOperator(URI opUri) throws NotFoundException {
		removeBuildingBlock(opUri);
	}

	public void addBackendService(BackendService bs)
	throws DuplicatedException, OntologyInvalidException,
			InvalidBuildingBlockTypeException, BuildingBlockException {
		addScreenComponent(FGO.BackendService, bs);
	}

	public void updateBackendService(BackendService bs)
	throws NotFoundException, BuildingBlockException {
		updateScreenComponent(bs);
	}

	public void removeBackendService(URI bsUri)
	throws NotFoundException {
		removeBuildingBlock(bsUri);
	}

	public Collection<ScreenFlow> getAllScreenFlows() {
		LinkedList<ScreenFlow> results = new LinkedList<ScreenFlow>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.ScreenFlow);
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
		LinkedList<Screen> results = new LinkedList<Screen>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Screen);
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
		LinkedList<Form> results = new LinkedList<Form>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Form);
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
		LinkedList<Operator> results = new LinkedList<Operator>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Operator);
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
		LinkedList<BackendService> results = new LinkedList<BackendService>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.BackendService);
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

	public Collection<Precondition> getAllPreconditions() {
		LinkedList<Precondition> results = new LinkedList<Precondition>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Precondition);
		while (it.hasNext()) {
			try {
				results.add(getPrecondition(it.next().getSubject().asURI()));
			} catch (NotFoundException e) {
				log.error(e.getMessage(), e);
			}
		}
		it.close();
		return results;
	}

	public Collection<Postcondition> getAllPostconditions() {
		LinkedList<Postcondition> results = new LinkedList<Postcondition>();
		ClosableIterator<Statement> it = tripleStore.findStatements(
				Variable.ANY, RDF.type, FGO.Postcondition);
		while (it.hasNext()) {
			try {
				results.add(getPostcondition(it.next().getSubject().asURI()));
			} catch (NotFoundException e) {
				log.error(e.getMessage(), e);
			}
		}
		it.close();
		return results;
	}

	public Collection<URI> getAllConcepts(String[] tags) {
		LinkedList<URI> results = new LinkedList<URI>();
		String queryString = "SELECT DISTINCT ?concept \n" + "WHERE {\n";
		queryString = queryString.concat("{ { ?concept " + RDF.type.toSPARQL()
				+ " " + RDFS.Class.toSPARQL() + " } UNION { ?concept "
				+ RDF.type.toSPARQL() + " " + OWL.Class.toSPARQL() + " } } ");
		if (tags != null && tags.length > 0) {
			queryString = queryString.concat("{");
			for (String tag : tags)
				queryString = queryString.concat(" { ?concept "
						+ CTAG.tagged.toSPARQL() + " ?ctag . ?ctag "
						+ CTAG.label.toSPARQL()
						+ " ?tag . FILTER(regex(str(?tag), \"" + tag
						+ "\", \"i\")) } UNION");
			// remove last 'UNION'
			if (queryString.endsWith("UNION"))
				queryString = queryString
						.substring(0, queryString.length() - 5);
			queryString = queryString.concat("} . ");
		}
		queryString = queryString.concat("}");
		QueryResultTable qrt = tripleStore.sparqlSelect(queryString);
		ClosableIterator<QueryRow> itResults = qrt.iterator();
		while (itResults.hasNext()) {
			QueryRow qr = itResults.next();
			Node node = qr.getValue("concept");

			if (node instanceof BlankNode) {
				// problems adding some ontologies, ie: DBPedia
			} else {
				results.add(qr.getValue("concept").asURI());
			}
		}
		itResults.close();

		return results;
	}

	public BuildingBlock getBuildingBlock(URI uri) throws NotFoundException {
		if (isType(uri, FGO.ScreenFlow))			return getScreenFlow(uri);
		else if (isType(uri, FGO.Screen))			return getScreen(uri);
		else if (isType(uri, FGO.Precondition))		return getPrecondition(uri);
		else if (isType(uri, FGO.Postcondition))	return getPostcondition(uri);
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

	public Precondition getPrecondition(URI uri) throws NotFoundException {
		if (!containsBuildingBlock(uri)) throw new NotFoundException();
		return (Precondition) getPreOrPost(uri);
	}

	public Postcondition getPostcondition(URI uri) throws NotFoundException {
		if (!containsBuildingBlock(uri)) throw new NotFoundException();
		return (Postcondition) getPreOrPost(uri);
	}

	protected PreOrPost getPreOrPost(URI uri) throws NotFoundException {
		if (!containsBuildingBlock(uri)) throw new NotFoundException();
		return BuildingBlockRDF2GoBuilder.buildPreOrPost(getModelForBuildingBlock(uri), uri);
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

	protected void generateConditionsStatements(Model model, URI graphUri) {
		ClosableIterator<Statement> it = model.iterator();
		for (; it.hasNext();) {
			Statement stmt = it.next();
			if (stmt.getPredicate().equals(FGO.hasPatternString)
					&& isConditionPositive(model, stmt.getSubject().asBlankNode())) {
				URI pUri = tripleStore.createUniqueUriWithName(configuration.getURI(environment, "serverURL"), "/pattern/");
				String pattern = stmt.getObject().asDatatypeLiteral().getValue();
				Model patternModel = patternToRDF2GoModel(pattern);
				tripleStore.addStatement(graphUri, stmt.getSubject(), FGO.hasPattern, pUri);
				tripleStore.addModel(patternModel, pUri);
				if (configuration.getBoolean("import-ontologies", this.environment)) 
					importMissingOntologies(patternModel);
			}
		}
		it.close();
	}

	protected boolean isConditionPositive(Model model, BlankNode cNode) {
		boolean isPositive = false;
		ClosableIterator<Statement> it = model.findStatements(cNode, FGO.isPositive, Variable.ANY);
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
				objectNode = new URIImpl(object);
			} catch (IllegalArgumentException e) {
				objectNode = blankNodes.get(object);
				if (objectNode == null) {
					objectNode = model.createBlankNode();
					blankNodes.put(subject, subjectNode);
				}
			}
			model.addStatement(subjectNode, new URIImpl(predicate), objectNode);
		}

		return model;
	}

	protected void removeConditionsStatements(URI graphUri) {
		ClosableIterator<Statement> it = tripleStore.findStatements(graphUri, Variable.ANY, FGO.hasPattern, Variable.ANY);
		for (; it.hasNext();) {
			Statement stmt = it.next();
			tripleStore.removeModel(stmt.getObject().asURI());
		}
		it.close();
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
				BlankNode bnTag = object.asBlankNode();
				ClosableIterator<Statement> tagIt = tripleStore.findStatements(bnTag, Variable.ANY, Variable.ANY);
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

	public void addConcept(Concept concept)
	throws DuplicatedException, BuildingBlockException {
		URI cUri = concept.getUri();
		if (containsConcept(cUri)) {
			throw new DuplicatedException(cUri + " already exists.");
		}
		// persists the concept
		if (!saveConcept(concept)) {
			throw new BuildingBlockException("An error ocurred while saving the concept. Please, ensure the concept is well defined.");
		}
	}

	protected boolean saveConcept(Concept concept) {
		URI cUri = concept.getUri();
		Model model = null;
		try {
			model = concept.toRDF2GoModel();
			URI graphUri = saveModelToGraph(model);
			tripleStore.addStatement(cUri, new URIImpl("http://replace.for.real.one"), graphUri);
			return true;
		} catch (Exception e) {
			log.error("Error while saving concept " + cUri, e);
			try {
				removeScreen(cUri);
			} catch (NotFoundException nfe) {
				log.error("Concept " + cUri + " does not exist.", nfe);
			}
		} finally {
			if (model != null) model.close();
		}
		return false;
	}

	public void updateConcept(Concept concept) throws NotFoundException, BuildingBlockException {
		if(log.isInfoEnabled()) log.info("Updating concept " + concept.getUri() + "...");
		removeConcept(concept.getUri());
		// save new content with the same URI
		if (saveConcept(concept)) {
			if(log.isInfoEnabled()) log.info("Concept " + concept.getUri() + " updated.");
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
	 * @param uri
	 * @param buildingBlockSet
	 * @return
	 */
	public List<Plan> searchPlans(URI uri, Set<BuildingBlock> buildingBlockSet) {
		List<Plan> planList = new ArrayList<Plan>();
		if (planner != null) {
			planList.addAll(planner.searchPlans(uri, buildingBlockSet));
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
		for (; it.hasNext(); ) {
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
	 * Figures out the ontology URI for a given concept or 
	 * property URI, then it fetches and store the ontology
	 * in the catalogue.
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
			if (isURI(subject) && subject.toString().startsWith(getServerURL()+"/samples/")) {
				sample = getSample(subject.asURI());
				if (sample != null) results.add(sample);
			}
		}
		it.close();
		return results;
	}

	public Sample getSample(URI uri) {
		return SampleRDF2GoBuilder.buildSample(getModelForSubject(uri));
	}
	
	public Sample addSample(Sample sample) {
		URI uri = tripleStore.createUniqueUriWithName(MiscUtil.URLtoRDF2GoURI(getServerURL()), "/samples/");
		sample.setUri(uri);
		return saveSample(sample) ? sample : null;
	}
	
	protected boolean saveSample(Sample sample) {
		URI uri = sample.getUri();
		try {
			Model model = sample.toRDF2GoModel();
			saveModelToGraph(uri, model);
			model.close();
			return true;
		} catch (Exception e) {
			log.error(e.toString(), e);
			try {
				removeSample(uri);
			} catch (NotFoundException nfe) {
				log.error(nfe.toString(), nfe);
			}
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
			System.out.println(st.getContext() + " - " + st.getSubject()+ " - " + st.getPredicate() + " - " + st.getObject());
		}
	}

	// TODO only for debug purposes
	public void dump() {
		tripleStore.dump();
	}

}

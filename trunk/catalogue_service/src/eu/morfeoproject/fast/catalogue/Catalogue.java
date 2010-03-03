package eu.morfeoproject.fast.catalogue;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.StringTokenizer;

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
import org.ontoware.rdf2go.vocabulary.OWL;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.ontoware.rdf2go.vocabulary.XSD;
import org.openrdf.repository.RepositoryException;
import org.openrdf.rio.RDFParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies;
import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies.PublicOntology;
import eu.morfeoproject.fast.catalogue.planner.Plan;
import eu.morfeoproject.fast.catalogue.planner.Planner;
import eu.morfeoproject.fast.model.Action;
import eu.morfeoproject.fast.model.AuthorCTag;
import eu.morfeoproject.fast.model.AutoCTag;
import eu.morfeoproject.fast.model.BackendService;
import eu.morfeoproject.fast.model.CTag;
import eu.morfeoproject.fast.model.Concept;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.FastModelFactory;
import eu.morfeoproject.fast.model.Form;
import eu.morfeoproject.fast.model.Library;
import eu.morfeoproject.fast.model.Operator;
import eu.morfeoproject.fast.model.Pipe;
import eu.morfeoproject.fast.model.Postcondition;
import eu.morfeoproject.fast.model.PreOrPost;
import eu.morfeoproject.fast.model.Precondition;
import eu.morfeoproject.fast.model.ReaderCTag;
import eu.morfeoproject.fast.model.Resource;
import eu.morfeoproject.fast.model.Screen;
import eu.morfeoproject.fast.model.ScreenComponent;
import eu.morfeoproject.fast.model.ScreenDefinition;
import eu.morfeoproject.fast.model.ScreenFlow;
import eu.morfeoproject.fast.model.Trigger;
import eu.morfeoproject.fast.model.WithConditions;
import eu.morfeoproject.fast.util.DateFormatter;
import eu.morfeoproject.fast.vocabulary.CTAG;
import eu.morfeoproject.fast.vocabulary.DC;
import eu.morfeoproject.fast.vocabulary.FGO;
import eu.morfeoproject.fast.vocabulary.FOAF;

/**
 * Catalogue
 * @author irivera
 */
public class Catalogue {
	
	final Logger logger = LoggerFactory.getLogger(Catalogue.class);
	
	private TripleStore tripleStore;
	private Planner planner;
	private URI serverURL;
	
	public Catalogue(URI serverURL, String sesameServer, String repositoryID) {
		this.serverURL = serverURL;
		create(serverURL, sesameServer, repositoryID);
	}
	
	public Catalogue(URI serverURL, File dir, String indexes) {
		this.serverURL = serverURL;
		create(serverURL, dir, indexes);
	}
	
	public Catalogue(URI serverURL, File dir) {
		this.serverURL = serverURL;
		create(serverURL, dir, null);
	}
	
	/**
	 * Returns a opened connection to a local repository
	 */
	private void create(URI serverURL, File dir, String indexes) {
		logger.info("Catalogue loaded at "+dir.getAbsolutePath()+" ["+indexes+"]");
		if (serverURL == null) {
			logger.error("Server URL must hold a valid URL");
		} else {
			// creates a new triple store
			tripleStore = new TripleStore(dir, indexes);
	    	tripleStore.open();
//	    	tripleStore.clear();
	
	    	// check if the catalogue is correct
			if (!check()) {
				// recover the catalogue
				restore();
			}
//	    	printStatements();
//			dump();
//			exportToTrig();
			
			// creates a planner
			planner = new Planner(this);
		}
	}
	
	/**
	 * Returns a opened connection to a remote repository
	 */
	private void create(URI serverURL, String sesameServer, String repositoryID) {
		logger.info("Catalogue loaded at "+sesameServer+", ID="+repositoryID);
		if (serverURL == null) {
			logger.error("Server URL must hold a valid URL");
		} else {
			// creates a new triple store
			tripleStore = new TripleStore(sesameServer, repositoryID);
	    	tripleStore.open();
//	    	tripleStore.clear();
	
	    	// check if the catalogue is correct
			if (!check()) {
				// recover the catalogue
				restore();
			}
			
			// creates a planner
			planner = new Planner(this);
		}
	}
	
	public URI getServerURL() {
		return serverURL;
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
                else
                	logger.error("Syntax for ontology '"+ont.getUri()+"' is not valid. Must be RDF/XML or Turtle");
            } catch (OntologyInvalidException e) {
                logger.error("Cannot add default ontology '"+ont.getUri()+"': "+e, e);
            } catch (RepositoryException e) {
                logger.error("Cannot add default ontology '"+ont.getUri()+"': "+e, e);
			} catch (RDFParseException e) {
                logger.error("Cannot add default ontology '"+ont.getUri()+"': "+e, e);
			} catch (IOException e) {
                logger.error("Cannot read ontology '"+ont.getUri()+"': "+e, e);
			}
        }
    }
    
    public boolean check() {
    	return checkDefaultOntologies();
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
		} catch (RepositoryException e) {
            logger.error("Cannot add ontology '"+ont.getUri()+"': "+e, e);
            return false;
		} catch (RDFParseException e) {
            logger.error("Cannot add ontology '"+ont.getUri()+"': "+e, e);
            return false;
		} catch (IOException e) {
            logger.error("Cannot read ontology '"+ont.getUri()+"': "+e, e);
            return false;
		}
	}
	
	public boolean containsResource(URI uri) {
		return containsScreenFlow(uri)
			|| containsScreen(uri)
			|| containsPreOrPost(uri)
			|| containsScreenComponent(uri);
	}
	
	public boolean containsResource(Resource resource) {
		return containsResource(resource.getUri());
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

	public boolean containsPreOrPost(URI seUri) {
		return tripleStore.isResource(seUri, FGO.Precondition) || tripleStore.isResource(seUri, FGO.Postcondition);
	}
	
	public boolean containsPreOrPost(PreOrPost se) {
		return containsPreOrPost(se.getUri());
	}
	
	public boolean containsScreenComponent(URI uri) {
		return containsForm(uri)
			|| containsOperator(uri)
			|| containsBackendService(uri);
	}
	
	public boolean containsScreenComponent(ScreenComponent sc) {
		return containsScreenComponent(sc.getUri());
	}
	
	public boolean containsForm(URI feUri) {
		return tripleStore.isResource(feUri, FGO.Form);
	}
	
	public boolean containsForm(Form fe) {
		return containsForm(fe.getUri());
	}

	public boolean containsOperator(URI opUri) {
		return tripleStore.isResource(opUri, FGO.Operator);
	}
	
	public boolean containsOperator(Operator op) {
		return containsOperator(op.getUri());
	}

	public boolean containsBackendService(URI bsUri) {
		return tripleStore.isResource(bsUri, FGO.BackendService);
	}
	
	public boolean containsBackendService(BackendService bs) {
		return containsBackendService(bs.getUri());
	}

    public ArrayList<Statement> listStatements(URI thingUri) {
    	ArrayList<Statement> listStatements = new ArrayList<Statement>();
    	ClosableIterator<Statement> it = tripleStore.findStatements(thingUri, Variable.ANY, Variable.ANY);
    	for ( ; it.hasNext(); )
    		listStatements.add(it.next());
    	it.close();
    	return listStatements;
    }

    public Set<URI> findScreenComponents(
    		Screen container,
    		List<Condition> conditions,
    		Set<ScreenComponent> toExclude,
    		int offset,
    		int limit,
    		Set<String> domainContext) throws ClassCastException, ModelRuntimeException {
    	HashSet<URI> results = new HashSet<URI>();
    	results.addAll(findScreenComponents(container, conditions, toExclude, offset, limit, domainContext, FGO.Form));
    	results.addAll(findScreenComponents(container, conditions, toExclude, offset, limit, domainContext, FGO.Operator));
    	results.addAll(findScreenComponents(container, conditions, toExclude, offset, limit, domainContext, FGO.BackendService));
    	return results;
    }
    
    public Set<URI> findScreenComponents(
    		Screen container,
    		List<Condition> conditions,
    		Set<ScreenComponent> toExclude,
    		int offset,
    		int limit,
    		Set<String> domainContext,
    		URI typeResource) throws ClassCastException, ModelRuntimeException {
    	HashSet<URI> results = new HashSet<URI>();

    	String queryString = 
    		"SELECT DISTINCT ?resource \n" +
    		"WHERE {\n" +
    		"{ ?resource "+RDF.type.toSPARQL()+" "+typeResource.toSPARQL()+" . ";
    	
    	// doesn't include the resources where the postconditions were taken from
    	for (ScreenComponent comp : toExclude)
   			queryString = queryString.concat("FILTER (?resource != "+comp.getUri().toSPARQL()+") . ");

    	// tags from the domain context
    	if (domainContext != null && domainContext.size() > 0) {
        	queryString = queryString.concat("{");
        	for (String tag : domainContext) {
	    		queryString = queryString.concat(" { ?resource "+CTAG.tagged.toSPARQL()+" ?ctag . ?ctag "+CTAG.label.toSPARQL()+" ?tag . FILTER(regex(str(?tag), \""+tag+"\", \"i\")) } UNION");
        	}
        	// remove last 'UNION'
	    	if (queryString.endsWith("UNION"))
				queryString = queryString.substring(0, queryString.length() - 5);
			queryString = queryString.concat("} . ");
    	}
    	
    	// search for components which preconditions (from actions) are satisfied 
    	// by any of the conditions given
    	if (conditions.size() > 0) {
        	queryString = queryString.concat("{");
			for (Condition con : conditions) {
				queryString = queryString.concat("{ ?resource "+FGO.hasAction.toSPARQL()+" ?a . ");
				queryString = queryString.concat(" ?a "+FGO.hasPreCondition.toSPARQL()+" ?c . ");
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

    	QueryResultTable qrt = tripleStore.sparqlSelect(queryString);
    	ClosableIterator<QueryRow> itResults = qrt.iterator();
    	while (itResults.hasNext()) {
    		results.add(itResults.next().getValue("resource").asURI());
    	}
    	itResults.close();

    	return results;
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
    private Set<URI> findScreens(
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
	    		queryString = queryString.concat(" { ?resource "+CTAG.tagged.toSPARQL()+" ?ctag . ?ctag "+CTAG.label.toSPARQL()+" ?tag . FILTER(regex(str(?tag), \""+tag+"\", \"i\")) } UNION");
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
//		queryString = queryString.concat("\n} UNION ");
//		
//		/////*** LOOK FOR PRECONDITIONS (SLOTS) ***/////
//		queryString = queryString.concat("{ ?resource "+RDF.type.toSPARQL()+" "+FGO.Precondition.toSPARQL()+" . ");
//		
//		for (Resource r : resources)
//			if (r instanceof Precondition)
//				queryString = queryString.concat("FILTER (?resource != "+r.getUri().toSPARQL()+") . ");
//
//		if (domainContext != null && domainContext.size() > 0) {
//	    	queryString = queryString.concat("{");
//	    	for (String tag : domainContext) {
//	    		queryString = queryString.concat(" { ?resource "+FGO.hasTag.toSPARQL()+" ?tag . FILTER regex(str(?tag), \""+tag+"\", \"i\")} UNION");
//	    	}
//	    	// remove last 'UNION'
//	    	if (queryString.endsWith("UNION"))
//				queryString = queryString.substring(0, queryString.length() - 5);
//			queryString = queryString.concat("} . ");
//		}
//		if (unCon.size() > 0) {
//        	queryString = queryString.concat("{");
//			for (Condition con : unCon) {
//				queryString = queryString.concat("{ ?resource "+FGO.hasCondition.toSPARQL()+" ?b . ");
//				queryString = queryString.concat(" ?b ?li ?c . "); // :_bag rdf:li_1 :_condition
//				queryString = queryString.concat(" ?c "+FGO.hasPattern.toSPARQL()+" ?p . ");
//    			queryString = queryString.concat("GRAPH ?p {");
//        		for (Statement st : con.getPattern()) {
//        			String s = (st.getSubject() instanceof BlankNode) ? st.getSubject().toString() : st.getSubject().toSPARQL();
//        			String o = (st.getObject() instanceof BlankNode) ? st.getObject().toString() : st.getObject().toSPARQL();
//        			queryString = queryString.concat(s+" "+st.getPredicate().toSPARQL()+" "+o+" . ");
//        		}
//        		queryString = queryString.concat("} } UNION");
//        	}
//        	// remove last 'UNION'
//	    	if (queryString.endsWith("UNION"))
//				queryString = queryString.substring(0, queryString.length() - 5);
//			queryString = queryString.concat("}");
//    	}
		queryString = queryString.concat("\n} }");
		
		if (limit > 0)
			queryString = queryString.concat("\nLIMIT "+limit);
		queryString = queryString.concat("\nOFFSET "+offset);
		// replace ':_' by '?' to make the query
		queryString = replaceBlankNodes(queryString);

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
    	return findScreens(resources, plugin, subsume, offset, limit, domainContext, FGO.hasPostCondition);
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
    	return findScreens(tmpResources, plugin, subsume, offset, limit, domainContext, FGO.hasPreCondition);
    }

    /**
     * Retrieves all the unsatisfied preconditions of a set of screens. It also
     * checks whether a 'postcondition' is satisfied.
     * NOTE: 'preconditions' are always satisfied
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
					if (!isConditionSatisfied(resources, conList, plugin, subsume, s.getUri()))
						for (Condition c : conList) {
							if (c.isPositive())
								unsatisfied.add(c);
						}
			} else if (r instanceof Postcondition) {
				Postcondition e = (Postcondition)r;
				List<Condition> conList = e.getConditions();
				if (!isConditionSatisfied(resources, conList, plugin, subsume, e.getUri()))
					for (Condition c : conList) {
						if (c.isPositive())
							unsatisfied.add(c);
					}
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
	public boolean isConditionSatisfied(Set<Resource> resources, List<Condition> precondition, boolean plugin, boolean subsume, URI screenExcluded) {
		Set<Resource> tmpResources = new HashSet<Resource>();
		
		// if no conditions are provided, then returns true
		if (precondition.isEmpty())
			return true;
		
		// copy the set of screens except the screen to be excluded
		for (Resource r : resources)
			if (r instanceof Precondition)
				tmpResources.add(r);
			else if (r instanceof Screen && !r.getUri().equals(screenExcluded))
				tmpResources.add((Screen)r);
		
		// creates all possible combination of preconditions
		Set<Model> models = createModels(tmpResources, plugin, subsume);
		boolean satisfied = false;
		
		// create the ASK sparql query for a precondition
    	String queryStr = "ASK {";
    	for (Condition condition : precondition) {
    		if (condition.isPositive()) {
		    	for (Statement st : condition.getPattern()) {
					String su = (st.getSubject() instanceof BlankNode) ? st.getSubject().toString() : st.getSubject().toSPARQL();
					String ob = (st.getObject() instanceof BlankNode) ? st.getObject().toString() : st.getObject().toSPARQL();
					queryStr = queryStr.concat(su+" "+st.getPredicate().toSPARQL()+" "+ob+" . ");
		    	}
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
	
	public Set<Model> createModels(Set<Resource> resources, boolean plugin, boolean subsume) {
		Set<Model> models = new HashSet<Model>();
		if (resources.isEmpty()) {
			return models;
		} else if (resources.size() == 1) {
			Resource r = resources.iterator().next();
			if (r instanceof Precondition) {
				Model m = RDF2Go.getModelFactory().createModel();
				m.open();
				for (Condition c : ((Precondition) r).getConditions())
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
				if (r instanceof Precondition) {
					Model m = RDF2Go.getModelFactory().createModel();
					m.open();
					for (Condition c : ((Precondition) r).getConditions())
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
	
	public boolean isConditionCompatible(Condition conA, Condition conB) {
		if (conA != null && conB != null) {
			Model m = RDF2Go.getModelFactory().createModel();
			m.open();
			m.addAll(conA.getPattern().iterator());

			// create the ASK SPARQL query for conB
	    	String queryStr = "ASK {";
    		if (conB.isPositive()) {
		    	for (Statement st : conB.getPattern()) {
					String su = (st.getSubject() instanceof BlankNode) ? st.getSubject().toString() : st.getSubject().toSPARQL();
					String ob = (st.getObject() instanceof BlankNode) ? st.getObject().toString() : st.getObject().toSPARQL();
					queryStr = queryStr.concat(su+" "+st.getPredicate().toSPARQL()+" "+ob+" . ");
		    	}
	    	}
	    	queryStr = queryStr.concat("}");

	    	// empty query = is satisfied
	    	if (queryStr.equals("ASK {}")) return true;
	    	
			return m.sparqlAsk(queryStr);
		}
		return false;
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
    		if (r instanceof Precondition) {
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
	    			reachable = isConditionSatisfied(reachables, conList, true, true, s.getUri());
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
	
    public URI createClass(URI clazz) {
    	tripleStore.addStatement(null, clazz, RDF.type, RDFS.Class);
    	return clazz;
	}

    public URI createClass(URI clazz, URI subClassOf) {
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
			tripleStore.addStatement(bnTag, CTAG.label, tripleStore.createLanguageTagLiteral(tag.getLabels().get(lang), lang));
		if (tag.getTaggingDate() != null) {
			tripleStore.addStatement(bnTag, CTAG.taggingDate, tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(tag.getTaggingDate()), XSD._date));
		} else { // no date provided, save the current date
			Date currentDate = new Date();
			tag.setTaggingDate(currentDate);
			tripleStore.addStatement(bnTag, CTAG.taggingDate, tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(currentDate), XSD._date));
		}
    }

	public URI createResource(URI namespace, String resource, URI ofClass, String id)
    throws DuplicatedResourceException, OntologyInvalidException {
    	URI resourceUri = new URIImpl(namespace.toString()+"/"+resource+"/"+id);
    	if (containsResource(resourceUri))
    		throw new DuplicatedResourceException(resourceUri+" already exists.");
    	return tripleStore.createResource(resourceUri, ofClass);
    }
    
    private URI createResource(URI ofClass, String id) throws DuplicatedResourceException, OntologyInvalidException {
		if (ofClass.equals(FGO.ScreenFlow)) {
			return createResource(serverURL, "screenflows", ofClass, id);
		} else if (ofClass.equals(FGO.Screen)) {
			return createResource(serverURL, "screens", ofClass, id);
		} else if (ofClass.equals(FGO.Form)) {
			return createResource(serverURL, "forms", ofClass, id);
		} else if (ofClass.equals(FGO.Operator)) {
			return createResource(serverURL, "operators", ofClass, id);
		} else if (ofClass.equals(FGO.BackendService)) {
			return createResource(serverURL, "services", ofClass, id);
		} else if (ofClass.equals(FGO.Precondition)) {
			return createResource(serverURL, "preconditions", ofClass, id);
		} else if (ofClass.equals(FGO.Postcondition)) {
			return createResource(serverURL, "postconditions", ofClass, id);
		}
		return null;
	}
	
	public void addScreenFlow(ScreenFlow sf) throws DuplicatedResourceException,
	OntologyInvalidException, OntologyReadonlyException, NotFoundException, ResourceException {
		URI sfUri = null;
		if (sf.getUri() != null) {
			sfUri = sf.getUri();
			if (containsScreenFlow(sf))
				throw new DuplicatedResourceException(sf.getUri()+" already exists.");
		} else {
			sfUri = createResource(FGO.ScreenFlow, sf.getId());
			sf.setUri(sfUri);
		}
		// persists the screen-flow
		if (saveScreenFlow(sf)) {
			// create plans for the screen
			planner.add(sf);
		} else {
			throw new ResourceException("An error ocurred while saving the screen-flow. Please, ensure the screen-flow is well defined.");
		}
	}
	
	private boolean saveScreenFlow(ScreenFlow sf) throws OntologyReadonlyException, NotFoundException {
		// save the common properties of the resource
		if (saveResource(sf)) {
			try {
				URI sfUri = sf.getUri();
				for (URI rUri : sf.getResources()) {
					if (containsResource(rUri))
						tripleStore.addStatement(sfUri, FGO.contains, rUri);
					else
						logger.error("Resource "+rUri+" does not exist and cannot be added to the ScreenFlow.");
				}
				logger.info("ScreenFlow "+sf.getUri()+" added.");
				return true;
			} catch (Exception e) {
				logger.error("Error while saving screen-flow "+sf.getUri(), e);
				try {
					removeScreenFlow(sf.getUri());
				} catch (NotFoundException nfe) {
					logger.error("Screen-flow "+sf.getUri()+" does not exist.", nfe);
				}
			}
		}
		return false;
	}
	
	public void updateScreenFlow(ScreenFlow screenflow) throws NotFoundException, OntologyReadonlyException, ResourceException  {
		logger.info("Updating screenflow "+screenflow.getUri()+"...");
		removeScreenFlow(screenflow.getUri());
		// do not call addScreenFlow because it does not need to create a new URI for the screen-flow
		// persists the screen-flow
		if (saveScreenFlow(screenflow)) {
			// specify that it's a screen-flow
			tripleStore.addStatement(screenflow.getUri(), RDF.type, FGO.ScreenFlow);
		} else {
			throw new ResourceException("An error ocurred while saving the screen-flow. Please, ensure the screen-flow is well defined.");
		}
		logger.info("Screenflow "+screenflow.getUri()+" updated.");
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
	 * @throws ResourceException 
	 */
	public void addScreen(Screen screen) throws DuplicatedResourceException, OntologyInvalidException, ResourceException {
		URI screenUri = null;
		if (screen.getUri() != null) {
			screenUri = screen.getUri();
			if (containsScreen(screen))
				throw new DuplicatedResourceException(screenUri+" already exists.");
		} else {
			screenUri = createResource(FGO.Screen, screen.getId());
			screen.setUri(screenUri);
		}
		// persists the screen
		if (saveScreen(screen)) {
			// create plans for the screen
			planner.add(screen);
		} else {
			throw new ResourceException("An error ocurred while saving the screen. Please, ensure the screen is well defined.");
		}
	}
	
	/**
	 * Do not check if the screen already exists, and assumes the screen has a well-formed unique URI
	 * To be invoked by addScreen and updateScreen methods
	 */
	private boolean saveScreen(Screen screen) {
		// save the common properties of the resource
		if (saveResource(screen)) {
			try {
				URI screenUri = screen.getUri();
				// save preconditions
				for (List<Condition> conList : screen.getPreconditions()) {
					BlankNode bag = tripleStore.createBlankNode();
					tripleStore.addStatement(bag, RDF.type, RDF.Bag);
					tripleStore.addStatement(screenUri, FGO.hasPreCondition, bag);
					int i = 1;
					for (Condition con : conList) {
						BlankNode c = saveCondition(con);
						tripleStore.addStatement(bag, RDF.li(i++), c);
					}
				}
				// save postconditions
				for (List<Condition> conList : screen.getPostconditions()) {
					BlankNode bag = tripleStore.createBlankNode();
					tripleStore.addStatement(bag, RDF.type, RDF.Bag);
					tripleStore.addStatement(screenUri, FGO.hasPostCondition, bag);
					int i = 1;
					for (Condition con : conList) {
						BlankNode c = saveCondition(con);
						tripleStore.addStatement(bag, RDF.li(i++), c);
					}
				}
				// save either 'code' or 'definition'
				if (screen.getCode() != null) {
					tripleStore.addStatement(screenUri, FGO.hasCode, screen.getCode());
				} else if (screen.getDefinition() != null) {
					ScreenDefinition def = screen.getDefinition();
					BlankNode bnDef = tripleStore.createBlankNode();
					tripleStore.addStatement(screenUri, FGO.hasDefinition, bnDef);
					// building blocks
					for (String id : def.getBuildingBlocks().keySet()) {
						BlankNode bnBB = tripleStore.createBlankNode();
						tripleStore.addStatement(bnDef, FGO.contains, bnBB);
						tripleStore.addStatement(bnBB, RDF.type, FGO.ResourceReference);
						tripleStore.addStatement(bnBB, FGO.hasId, id);
						tripleStore.addStatement(bnBB, FGO.hasUri, def.getBuildingBlocks().get(id));
					}
					// pipes
					for (Pipe pipe : def.getPipes()) {
						BlankNode bnPipe = tripleStore.createBlankNode();
						tripleStore.addStatement(bnDef, FGO.contains, bnPipe);
						tripleStore.addStatement(bnPipe, RDF.type, FGO.Pipe);
						if (pipe.getIdBBFrom() != null)
							tripleStore.addStatement(bnPipe, FGO.hasIdBBFrom, pipe.getIdBBFrom());
						if (pipe.getIdConditionFrom() != null)
							tripleStore.addStatement(bnPipe, FGO.hasIdConditionFrom, pipe.getIdConditionFrom());
						if (pipe.getIdBBTo() != null)
							tripleStore.addStatement(bnPipe, FGO.hasIdBBTo, pipe.getIdBBTo());
						if (pipe.getIdConditionTo() != null)
							tripleStore.addStatement(bnPipe, FGO.hasIdConditionTo, pipe.getIdConditionTo());
						if (pipe.getIdActionTo() != null)
							tripleStore.addStatement(bnPipe, FGO.hasIdActionTo, pipe.getIdActionTo());
					}
					// triggers
					for (Trigger trigger : def.getTriggers()) {
						BlankNode bnTrigger = tripleStore.createBlankNode();
						tripleStore.addStatement(bnDef, FGO.hasTrigger, bnTrigger);
						tripleStore.addStatement(bnTrigger, RDF.type, FGO.Trigger);
						if (trigger.getIdBBFrom() != null)
							tripleStore.addStatement(bnTrigger, FGO.hasIdBBFrom, trigger.getIdBBFrom());
						if (trigger.getNameFrom() != null)
							tripleStore.addStatement(bnTrigger, FGO.hasNameFrom, trigger.getNameFrom());
						if (trigger.getIdBBTo() != null)
							tripleStore.addStatement(bnTrigger, FGO.hasIdBBTo, trigger.getIdBBTo());
						if (trigger.getIdBBTo() != null)
							tripleStore.addStatement(bnTrigger, FGO.hasIdActionTo, trigger.getIdActionTo());
					}
				}
				logger.info("Screen "+screen.getUri()+" added.");
				return true;
			} catch (Exception e) {
				logger.error("Error while saving screen "+screen.getUri(), e);
				try {
					removeScreen(screen.getUri());
				} catch (NotFoundException nfe) {
					logger.error("Screen "+screen.getUri()+" does not exist.", nfe);
				}
			}
		}
		return false;
	}
	
	public void updateScreen(Screen screen)
	throws NotFoundException, OntologyReadonlyException, RepositoryException, OntologyInvalidException, ResourceException  {
		logger.info("Updating screen "+screen.getUri()+"...");
		Screen oldScreen = getScreen(screen.getUri());
		// remove old screen from the catalogue
		removeScreen(screen.getUri());
		// do not call addScreen because it does not need to create a new URI for the screen
		// persists the screen
		if (saveScreen(screen)) {
			// specify that it's a screen
			tripleStore.addStatement(screen.getUri(), RDF.type, FGO.Screen);
			// calculate new plans if necessary
			planner.update(screen, oldScreen);
			logger.info("Screen "+screen.getUri()+" updated.");
		} else {
			throw new ResourceException("An error ocurred while saving the screen. Please, ensure the screen is well defined.");
		}
	}
	
	public void removeScreen(URI screenUri) throws NotFoundException {
		if (!containsScreen(screenUri))
			throw new NotFoundException();
		
		// remove all preconditions
		ClosableIterator<Statement> preconditions = tripleStore.findStatements(screenUri, FGO.hasPreCondition, Variable.ANY);
		for ( ; preconditions.hasNext(); ) {
			BlankNode cNode = preconditions.next().getObject().asBlankNode();
			removeCondition(cNode);
		}
		preconditions.close();
		// remove all postconditions
		ClosableIterator<Statement> postconditions = tripleStore.findStatements(screenUri, FGO.hasPostCondition, Variable.ANY);
		for ( ; postconditions.hasNext(); ) {
			BlankNode cNode = postconditions.next().getObject().asBlankNode();
			removeCondition(cNode);
		}
		postconditions.close();
		// remove definition
		ClosableIterator<Statement> defIt = tripleStore.findStatements(screenUri, FGO.hasDefinition, Variable.ANY);
		for ( ; defIt.hasNext(); ) {
			BlankNode defNode = defIt.next().getObject().asBlankNode();
			// remove references to components
			ClosableIterator<Statement> comIt = tripleStore.findStatements(defNode, FGO.contains, Variable.ANY);
			for ( ; comIt.hasNext(); ) {
				BlankNode bNode = comIt.next().getObject().asBlankNode();
				tripleStore.removeResource(bNode);
			}
			comIt.close();
			// remove triggers
			ClosableIterator<Statement> triIt = tripleStore.findStatements(defNode, FGO.hasTrigger, Variable.ANY);
			for ( ; triIt.hasNext(); ) {
				BlankNode bNode = triIt.next().getObject().asBlankNode();
				tripleStore.removeResource(bNode);
			}
			triIt.close();
			tripleStore.removeResource(defNode);
		}
		defIt.close();
		// remove the screen itself
		removeResource(screenUri);
		// remove the screen from the planner
		planner.remove(screenUri);
		logger.info("Screen "+screenUri+" removed.");
	}
	
	public void addPreOrPost(PreOrPost se) throws DuplicatedResourceException, OntologyInvalidException, ResourceException {
		URI seUri = null;
		if (se.getUri() != null) {
			seUri = se.getUri();
			if (containsPreOrPost(se))
				throw new DuplicatedResourceException(seUri+" already exists.");
		} else {
			if (se instanceof Precondition)
				seUri = createResource(FGO.Precondition, se.getId());
			else if (se instanceof Postcondition)
				seUri = createResource(FGO.Postcondition, se.getId());
			se.setUri(seUri);
		}
		// persists the pre/postcondition
		if (savePreOrPost(se)) {
			// create plans for the precondition
//			if (se instanceof Precondition)
//				planner.add(se);
		} else {
			throw new ResourceException("An error ocurred while saving the screen. Please, ensure the screen is well defined.");
		}
	}
	
	private boolean savePreOrPost(PreOrPost se) {
		try {
			tripleStore.addStatement(se.getUri(), FGO.hasName, se.getName());
			BlankNode bag = tripleStore.createBlankNode();
			tripleStore.addStatement(bag, RDF.type, RDF.Bag);
			tripleStore.addStatement(se.getUri(), FGO.hasCondition, bag);
			int i = 1;
			for (Condition con : se.getConditions()) {
				BlankNode c = saveCondition(con);
				tripleStore.addStatement(bag, RDF.li(i++), c);
			}
			logger.info("Pre/postcondition "+se.getUri()+" added.");
			tripleStore.dump();
			return true;
		} catch (Exception e) {
			logger.error("Error while saving pre/postcondition "+se.getUri(), e);
			try {
				removePreOrPost(se.getUri());
			} catch (NotFoundException nfe) {
				logger.error("Pre/postcondition "+se.getUri()+" does not exist.", nfe);
			}
		}
		return false;
	}
	
	public void updatePreOrPost(PreOrPost se) throws NotFoundException, ResourceException {
		logger.info("Updating pre/postcondition "+se.getUri()+"...");
//		PreOrPost oldSe = getPreOrPost(se.getUri());
		removePreOrPost(se.getUri());
		// do not call addPrecondition because it does not need to create a new URI for the screen
		if (savePreOrPost(se)) {
			// specify that it's a pre/postcondition
			if (se instanceof Precondition)
				tripleStore.addStatement(se.getUri(), RDF.type, FGO.Precondition);
			else if (se instanceof Postcondition)
				tripleStore.addStatement(se.getUri(), RDF.type, FGO.Postcondition);
			// calculate new plans if necessary
//			planner.update(se, oldSe);
			logger.info(se.getUri()+" updated.");
		} else {
			throw new ResourceException("An error ocurred while saving the pre/postcondition. Please, ensure the screen is well defined.");
		}
	}
	
	public void removePreOrPost(URI seUri) throws NotFoundException {
		if (!containsPreOrPost(seUri))
			throw new NotFoundException();

		// remove all conditions
		ClosableIterator<Statement> conditionBagIt = tripleStore.findStatements(seUri, FGO.hasCondition, Variable.ANY);
		for ( ; conditionBagIt.hasNext(); ) {
			BlankNode bagNode = conditionBagIt.next().getObject().asBlankNode();
			removeCondition(bagNode);
		}
		conditionBagIt.close();
		// remove the pre/postcondition itself
		tripleStore.removeResource(seUri);
		// remove the precondition from the planner
		planner.remove(seUri);
		logger.info(seUri+" removed.");
		tripleStore.dump();
	}

	private boolean saveResource(Resource resource) {
		URI rUri = resource.getUri();
		try {
			for (String key : resource.getLabels().keySet())
				tripleStore.addStatement(rUri, RDFS.label, tripleStore.createLanguageTagLiteral(resource.getLabels().get(key), key));
			for (String key : resource.getDescriptions().keySet())
				tripleStore.addStatement(rUri, DC.description, tripleStore.createLanguageTagLiteral(resource.getDescriptions().get(key), key));
			if (resource.getCreator() != null) {
				tripleStore.addStatement(rUri, DC.creator, resource.getCreator());
				tripleStore.addStatement(rUri, FOAF.maker, resource.getCreator());
			}
			if (resource.getRights() != null)
				tripleStore.addStatement(rUri, DC.rights, resource.getRights());
			if (resource.getVersion() != null)
				tripleStore.addStatement(rUri, FGO.hasVersion, resource.getVersion());
			if (resource.getCreationDate() != null) {
				tripleStore.addStatement(rUri, DC.date, tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(resource.getCreationDate()), XSD._date));
			} else { // no date provided, save the current date
				Date currentDate = new Date();
				resource.setCreationDate(currentDate);
				tripleStore.addStatement(rUri, DC.date, tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(currentDate), XSD._date));
			}
			if (resource.getIcon() != null)
				tripleStore.addStatement(rUri, FGO.hasIcon, resource.getIcon());
			if (resource.getScreenshot() != null)
				tripleStore.addStatement(rUri, FGO.hasScreenshot, resource.getScreenshot());
			for (CTag tag : resource.getTags()) {
				BlankNode bnTag = tripleStore.createBlankNode();
				tripleStore.addStatement(rUri, CTAG.tagged, bnTag);
				
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
					tripleStore.addStatement(bnTag, CTAG.taggingDate, tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(tag.getTaggingDate()), XSD._date));
				} else { // no date provided, save the current date
					Date currentDate = new Date();
					tag.setTaggingDate(currentDate);
					tripleStore.addStatement(bnTag, CTAG.taggingDate, tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(currentDate), XSD._date));
				}
			}
			if (resource.getHomepage() != null)
				tripleStore.addStatement(rUri, FOAF.homepage, resource.getHomepage());
			if (resource.getVersion() != null)
				tripleStore.addStatement(rUri, FGO.hasVersion, resource.getVersion());
			if (resource.getName() != null)
				tripleStore.addStatement(rUri, FGO.hasName, resource.getName());
			
			logger.info("Resource "+rUri+" saved.");
			return true;
		} catch (Exception e) {
			logger.error("Error while saving resource "+rUri, e);
			try {
				removeResource(rUri);
			} catch (NotFoundException nfe) {
				logger.error("Resource "+rUri+" does not exist.", nfe);
			}
		}
		System.out.println(System.in);
		return false;
	}

	private void removeResource(URI rUri) throws NotFoundException {
		// remove the tags associated to this resource
		removeTags(rUri);
		// remove the resource itself
		tripleStore.removeResource(rUri);
	}
	
	/**
	 * Removes all tags associated to a given resource URI
	 * @param rUri
	 * @throws NotFoundException 
	 */
	private void removeTags(URI rUri) throws NotFoundException {
		ClosableIterator<Statement> tagIt = tripleStore.findStatements(rUri, CTAG.tagged, Variable.ANY);
		for ( ; tagIt.hasNext(); ) {
			Node oTag = tagIt.next().getObject();
			if (oTag instanceof BlankNode) {
				BlankNode tagNode = oTag.asBlankNode();
				tripleStore.removeResource(tagNode);
			}
		}
		tagIt.close();
	}

	private BlankNode saveCondition(Condition condition) {
		BlankNode c = tripleStore.createBlankNode();
		tripleStore.addStatement(c, FGO.hasPatternString, condition.getPatternString());
		URI p = tripleStore.getCleanUniqueURI(FGO.NS_FGO, "pattern", false);
		tripleStore.addStatement(c, FGO.hasPattern, p);
		for (Statement st : condition.getPattern()) {
			tripleStore.addStatement(p, st.getSubject(), st.getPredicate(), st.getObject());
		}
		tripleStore.addStatement(c, FGO.isPositive, condition.isPositive());
		for (String key : condition.getLabels().keySet())
			tripleStore.addStatement(c, RDFS.label, tripleStore.createLanguageTagLiteral(condition.getLabels().get(key), key));
		if (condition.getId() != null)
			tripleStore.addStatement(c, FGO.hasId, condition.getId());
		return c;
	}	
	
	private void removeCondition(BlankNode conditionNode) throws NotFoundException {
		ClosableIterator<Statement> conditionIt = tripleStore.findStatements(conditionNode, Variable.ANY, Variable.ANY);
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
		tripleStore.removeResource(conditionNode);
	}
	
	private void addScreenComponent(URI type, ScreenComponent sc)
	throws DuplicatedResourceException, OntologyInvalidException, InvalidResourceTypeException, ResourceException {
		if (!type.equals(FGO.Form) && !type.equals(FGO.Operator) && !type.equals(FGO.BackendService))
			throw new InvalidResourceTypeException(type+" is not a ScreenComponent.");
		
		URI scUri = null;
		if (sc.getUri() != null) {
			scUri = sc.getUri();
			if (containsScreenComponent(sc))
				throw new DuplicatedResourceException(scUri+" already exists.");
		} else {
			scUri = createResource(type, sc.getId());
			sc.setUri(scUri);
		}
		// persists the screen component
		if (!saveScreenComponent(sc)) {
			throw new ResourceException("An error ocurred while saving the screen component. Please, ensure the component is well defined.");
		}
	}
	
	private boolean saveScreenComponent(ScreenComponent sc) {
		// save the common properties of the resource
		if (saveResource(sc)) {
			try {
				URI scUri = sc.getUri();
				// actions
				for (Action action : sc.getActions()) {
					BlankNode aNode = tripleStore.createBlankNode();
					tripleStore.addStatement(scUri, FGO.hasAction, aNode);
					tripleStore.addStatement(aNode, RDFS.label, tripleStore.createPlainLiteral(action.getName()));
					// preconditions
					for (Condition con : action.getPreconditions()) {
						BlankNode c = saveCondition(con);
						tripleStore.addStatement(aNode, FGO.hasPreCondition, c);
					}
					// uses
					for (String id : action.getUses().keySet()) {
						BlankNode bnUse = tripleStore.createBlankNode();
						tripleStore.addStatement(aNode, FGO.hasUse, bnUse);
						tripleStore.addStatement(bnUse, RDF.type, FGO.ResourceReference);
						tripleStore.addStatement(bnUse, FGO.hasId, id);
						tripleStore.addStatement(bnUse, FGO.hasUri, action.getUses().get(id));
					}
				}
				// postconditions
				for (List<Condition> conList : sc.getPostconditions()) {
					BlankNode bag = tripleStore.createBlankNode();
					tripleStore.addStatement(bag, RDF.type, RDF.Bag);
					tripleStore.addStatement(scUri, FGO.hasPostCondition, bag);
					int i = 1;
					for (Condition con : conList) {
						BlankNode c = saveCondition(con);
						tripleStore.addStatement(bag, RDF.li(i++), c);
					}
				}
				// code
				if (sc.getCode() != null)
					tripleStore.addStatement(scUri, FGO.hasCode, sc.getCode());
				// libraries
				for (Library library : sc.getLibraries()) {
					BlankNode libNode = tripleStore.createBlankNode();
					tripleStore.addStatement(scUri, FGO.hasLibrary, libNode);
					tripleStore.addStatement(libNode, FGO.hasLanguage, tripleStore.createPlainLiteral(library.getLanguage()));
					tripleStore.addStatement(libNode, FGO.hasSource, library.getSource());
				}
				// triggers
				for (String trigger : sc.getTriggers())
					tripleStore.addStatement(scUri, FGO.hasTrigger, tripleStore.createPlainLiteral(trigger));
		
				logger.info("ScreenComponent "+sc.getUri()+" added.");
				return true;
			} catch (Exception e) {
				logger.error("Error while saving screen component "+sc.getUri(), e);
				try {
					removeScreenComponent(sc.getUri());
				} catch (NotFoundException nfe) {
					logger.error("Screen component "+sc.getUri()+" does not exist.", nfe);
				}
			}
		}
		return false;
	}
	
	private void updateScreenComponent(ScreenComponent sc) throws NotFoundException, ResourceException {
		logger.info("Updating screen component "+sc.getUri()+"...");
		// remove old screen component from the catalogue
		removeScreenComponent(sc.getUri());
		// do not call addScreen because it does not need to create a new URI for the screen
		if (saveScreenComponent(sc)) {
			// specify the type of screen component
			if (sc instanceof Form)
				tripleStore.addStatement(sc.getUri(), RDF.type, FGO.Form);
			else if (sc instanceof Operator)
				tripleStore.addStatement(sc.getUri(), RDF.type, FGO.Operator);
			else if (sc instanceof BackendService)
				tripleStore.addStatement(sc.getUri(), RDF.type, FGO.BackendService);
			logger.info("Screen component "+sc.getUri()+" updated.");
		} else {
			throw new ResourceException("An error ocurred while saving the screen component. Please, ensure the component is well defined.");
		}
	}
	
	private void removeScreenComponent(URI scUri) throws NotFoundException {
		if (!containsScreenComponent(scUri))
			throw new NotFoundException();
		// remove all actions
		ClosableIterator<Statement> actionsIt = tripleStore.findStatements(scUri, FGO.hasAction, Variable.ANY);
		for ( ; actionsIt.hasNext(); ) {
			BlankNode aNode = actionsIt.next().getObject().asBlankNode();
			// remove preconditions
			ClosableIterator<Statement> preIt = tripleStore.findStatements(aNode, FGO.hasPreCondition, Variable.ANY);
			for ( ; preIt.hasNext(); ) {
				BlankNode cNode = preIt.next().getObject().asBlankNode();
				ClosableIterator<Statement> patterns = tripleStore.findStatements(cNode, FGO.hasPattern, Variable.ANY);
				for ( ; patterns.hasNext(); ) {
					tripleStore.removeModel(patterns.next().getObject().asURI());
				}
				patterns.close();
				tripleStore.removeResource(cNode);
			}
			preIt.close();
			// remove uses
			ClosableIterator<Statement> usesIt = tripleStore.findStatements(aNode, FGO.hasUse, Variable.ANY);
			for ( ; usesIt.hasNext(); )
				tripleStore.removeResource(usesIt.next().getObject().asBlankNode());
			usesIt.close();
			// remove action itself
			tripleStore.removeResource(aNode);
		}
		actionsIt.close();
		// remove all postconditions
		ClosableIterator<Statement> postconditions = tripleStore.findStatements(scUri, FGO.hasPostCondition, Variable.ANY);
		for ( ; postconditions.hasNext(); ) {
			BlankNode cNode = postconditions.next().getObject().asBlankNode();
			removeCondition(cNode);
		}
		postconditions.close();
		// remove all libraries
		ClosableIterator<Statement> libIt = tripleStore.findStatements(scUri, FGO.hasLibrary, Variable.ANY);
		for ( ; libIt.hasNext(); ) {
			BlankNode libNode = libIt.next().getObject().asBlankNode();
			tripleStore.removeResource(libNode);
		}
		libIt.close();
		
		// remove the screen component itself
		tripleStore.removeResource(scUri);
		logger.info("Screen component "+scUri+" removed.");
	}
	
	public void addForm(Form fe)
	throws DuplicatedResourceException, OntologyInvalidException, InvalidResourceTypeException, ResourceException {
		addScreenComponent(FGO.Form, fe);
	}
	
	public void updateForm(Form fe) throws NotFoundException, ResourceException {
		updateScreenComponent(fe);
	}
	
	public void removeForm(URI feUri) throws NotFoundException {
		removeScreenComponent(feUri);
	}
	
	public void addOperator(Operator op)
	throws DuplicatedResourceException, OntologyInvalidException, InvalidResourceTypeException, ResourceException {
		addScreenComponent(FGO.Operator, op);
	}
	
	public void updateOperator(Operator op) throws NotFoundException, ResourceException {
		updateScreenComponent(op);
	}
	
	public void removeOperator(URI opUri) throws NotFoundException {
		removeScreenComponent(opUri);
	}

	public void addBackendService(BackendService bs)
	throws DuplicatedResourceException, OntologyInvalidException, InvalidResourceTypeException, ResourceException {
		addScreenComponent(FGO.BackendService, bs);
	}
	
	public void updateBackendService(BackendService bs) throws NotFoundException, ResourceException {
		updateScreenComponent(bs);
	}
	
	public void removeBackendService(URI bsUri) throws NotFoundException {
		removeScreenComponent(bsUri);
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
		while (it.hasNext()) {
			URI sUri = it.next().getSubject().asURI();
			results.add(getScreen(sUri));
		}
		it.close();
		return results;
	}
	
	public Collection<Form> listForms() {
		ArrayList<Form> results = new ArrayList<Form>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Form);
		while (it.hasNext())
			results.add(getForm(it.next().getSubject().asURI()));
		it.close();
		return results;
	}

	public Collection<Operator> listOperators() {
		ArrayList<Operator> results = new ArrayList<Operator>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Operator);
		while (it.hasNext())
			results.add(getOperator(it.next().getSubject().asURI()));
		it.close();
		return results;
	}

	public Collection<BackendService> listBackendServices() {
		ArrayList<BackendService> results = new ArrayList<BackendService>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.BackendService);
		while (it.hasNext())
			results.add(getBackendService(it.next().getSubject().asURI()));
		it.close();
		return results;
	}

	public Collection<Precondition> listPreconditions() {
		ArrayList<Precondition> results = new ArrayList<Precondition>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Precondition);
		while (it.hasNext())
			results.add(getPrecondition(it.next().getSubject().asURI()));
		it.close();
		return results;
	}
	
	public Collection<Postcondition> listPostconditions() {
		ArrayList<Postcondition> results = new ArrayList<Postcondition>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Postcondition);
		while (it.hasNext())
			results.add(getPostcondition(it.next().getSubject().asURI()));
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
	    		queryString = queryString.concat(" { ?concept "+CTAG.tagged.toSPARQL()+" ?ctag . ?ctag "+CTAG.label.toSPARQL()+" ?tag . FILTER(regex(str(?tag), \""+tag+"\", \"i\")) } UNION");
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
    			// problems adding some ontologies, eg: DBPedia
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
    	} else if (isType(uri, FGO.Precondition)) {
    		return getPrecondition(uri);
    	} else if (isType(uri, FGO.Postcondition)) {
    		return getPostcondition(uri);
    	} else if (isType(uri, FGO.Form)) {
    		return getForm(uri);
    	} else if (isType(uri, FGO.Operator)) {
    		return getOperator(uri);
    	} else if (isType(uri, FGO.BackendService)) {
    		return getBackendService(uri);
    	}
    	return null;
    }
    
    public boolean isType(URI uri, URI type) {
    	URI t = getType(uri);
    	if (t != null && t.equals(type))
    		return true;
    	return false;
    }
    
    /**
     * Returns the first type found for an URI
     * @param uri
     * @return
     */
    public URI getType(URI uri) {
		ClosableIterator<Statement> it = tripleStore.findStatements(uri, RDF.type, Variable.ANY);
		URI type = null;
		if (it.hasNext())
			type = it.next().getObject().asURI();
		it.close();
		return type;
    }
    
	private Resource retrieveResource(URI type, URI uri) {
		Resource resource = null;
		
		// create the resource of the given type
		if (type.equals(FGO.ScreenFlow))
			resource = FastModelFactory.createScreenFlow();
		else if (type.equals(FGO.Screen))
			resource = FastModelFactory.createScreen();
		else if (type.equals(FGO.Form))
			resource = FastModelFactory.createForm();
		else if (type.equals(FGO.Operator))
			resource = FastModelFactory.createOperator();
		else if (type.equals(FGO.BackendService))
			resource = FastModelFactory.createBackendService();
		else
			return null; //TODO throw exception type of resource not supported
		
		// fill the information about the resource
		resource.setUri(uri);
		String sUri = uri.toString();
		resource.setId(sUri.substring(sUri.lastIndexOf("/") + 1));
		ClosableIterator<Statement> cIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		if (!cIt.hasNext()) // the resource does not exist
			return null;
		for ( ; cIt.hasNext(); ) {
			Statement st = cIt.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			if (predicate.equals(RDFS.label)) {
				if (object instanceof LanguageTagLiteral) {
					LanguageTagLiteral label = object.asLanguageTagLiteral();
					resource.getLabels().put(label.getLanguageTag(), label.getValue());
				}
			} else if (predicate.equals(DC.description)) {
				LanguageTagLiteral description = object.asLanguageTagLiteral();
				resource.getDescriptions().put(description.getLanguageTag(), description.getValue());
			} else if (predicate.equals(DC.creator)) {
				resource.setCreator(object.asURI());
			} else if (predicate.equals(DC.rights)) {
				resource.setRights(object.asURI());
			} else if (predicate.equals(FGO.hasVersion)) {
				resource.setVersion(object.asDatatypeLiteral().getValue());
			} else if (predicate.equals(DC.date)) {
				resource.setCreationDate(DateFormatter.parseDateISO8601(object.asDatatypeLiteral().getValue()));
			} else if (predicate.equals(FGO.hasIcon)) {
				resource.setIcon(object.asURI());
			} else if (predicate.equals(FGO.hasScreenshot)) {
				resource.setScreenshot(object.asURI());
			} else if (predicate.equals(CTAG.tagged)) {
				CTag tag = new CTag();
				BlankNode bnTag = object.asBlankNode();
				ClosableIterator<Statement> tagIt = tripleStore.findStatements(bnTag, Variable.ANY, Variable.ANY);
				for ( ; tagIt.hasNext(); ) {
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
				resource.getTags().add(tag);
			} else if (predicate.equals(FOAF.homepage)) {
				resource.setHomepage(object.asURI());
			} else if (predicate.equals(FGO.hasName)) {
				resource.setName(object.asDatatypeLiteral().getValue());
			}
		}
		cIt.close();
		
		return resource;
	}
	
	private WithConditions retrieveWithConditions(URI type, URI uri) throws InvalidResourceTypeException {
		if (!type.equals(FGO.ScreenFlow) && !type.equals(FGO.Screen))
			throw new InvalidResourceTypeException("Only ScreenFlow and Screen types are allowed.");
		
		// create the resource of the given type
		WithConditions withConditions = (WithConditions) retrieveResource(type, uri);
		if (withConditions != null) {
			// fill the conditions of the resource
			ClosableIterator<Statement> cIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
			for ( ; cIt.hasNext(); ) {
				Statement st = cIt.next();
				URI predicate = st.getPredicate();
				Node object = st.getObject();
				if (predicate.equals(FGO.hasPreCondition)) {
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
					withConditions.getPreconditions().add(conList);
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
					withConditions.getPostconditions().add(conList);
				}
			}
			cIt.close();
		}
		
		return withConditions;
	}
	
	public ScreenFlow getScreenFlow(URI uri) {
		ScreenFlow sf = null;
		
		try {
			sf = (ScreenFlow) retrieveWithConditions(FGO.ScreenFlow, uri);
			if (sf != null) {
				// find all the info related to a screenflow
				ClosableIterator<Statement> sfTriples = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
				for ( ; sfTriples.hasNext(); ) {
					Statement st = sfTriples.next();
					URI predicate = st.getPredicate();
					Node object = st.getObject();
				    if (predicate.equals(FGO.contains)) {
				    	sf.getResources().add(object.asURI());
				    }
				}
				sfTriples.close();
			}
		} catch (InvalidResourceTypeException e) {
			logger.error("The resource type is not valid: "+e, e);
		}
		
		return sf;
	}
	
	public Screen getScreen(URI uri) {
		Screen screen = null;
		
		try {
			screen = (Screen) retrieveWithConditions(FGO.Screen, uri);
			if (screen != null) {
				// find all the info related to a screen
				ClosableIterator<Statement> screenIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
				for ( ; screenIt.hasNext(); ) {
					Statement st = screenIt.next();
					URI predicate = st.getPredicate();
					Node object = st.getObject();
					if (predicate.equals(FGO.hasCode)) {
						screen.setCode(object.asURI());
					} else if (predicate.equals(FGO.hasDefinition)) {
						ScreenDefinition def = new ScreenDefinition();
						ClosableIterator<Statement> defIt = tripleStore.findStatements(object.asBlankNode(), Variable.ANY, Variable.ANY);
						for ( ; defIt.hasNext(); ) {
							Statement defSt = defIt.next();
							URI defPredicate = defSt.getPredicate();
							Node defObject = defSt.getObject();
							if (defPredicate.equals(FGO.contains)) {
								String idBB = null;
								URI uriBB = null;
								String idBBFrom = null, idConditionFrom = null, idBBTo = null, idConditionTo = null, idActionTo = null;
								ClosableIterator<Statement> bbIt = tripleStore.findStatements(defObject.asBlankNode(), Variable.ANY, Variable.ANY);
								for ( ; bbIt.hasNext(); ) {
									Statement bbSt = bbIt.next();
									URI bbPredicate = bbSt.getPredicate();
									Node bbObject = bbSt.getObject();
									if (bbPredicate.equals(FGO.hasId)) {
										idBB = bbObject.asLiteral().getValue();
									} else if (bbPredicate.equals(FGO.hasUri)) {
										uriBB = bbObject.asURI();
									} else if (bbPredicate.equals(FGO.hasIdBBFrom)) {
										idBBFrom = bbObject.asLiteral().getValue();
									} else if (bbPredicate.equals(FGO.hasIdConditionFrom)) {
										idConditionFrom = bbObject.asLiteral().getValue();
									} else if (bbPredicate.equals(FGO.hasIdBBTo)) {
										idBBTo = bbObject.asLiteral().getValue();
									} else if (bbPredicate.equals(FGO.hasIdConditionTo)) {
										idConditionTo = bbObject.asLiteral().getValue();
									} else if (bbPredicate.equals(FGO.hasIdActionTo)) {
										idActionTo = bbObject.asLiteral().getValue();
									}
								}
								if (idBB != null && uriBB != null) {
									def.getBuildingBlocks().put(idBB, uriBB);
								} else if (idBBFrom != null && idConditionFrom != null && idBBTo != null && idConditionTo != null && idActionTo != null) {
									Pipe pipe = FastModelFactory.createPipe();
									pipe.setIdBBFrom(idBBFrom);
									pipe.setIdConditionFrom(idConditionFrom);
									pipe.setIdBBTo(idBBTo);
									pipe.setIdConditionTo(idConditionTo);
									pipe.setIdActionTo(idActionTo);
									def.getPipes().add(pipe);
								}
								bbIt.close();
							}
						}
						defIt.close();
						screen.setDefinition(def);
					}
				}
				screenIt.close();
			}
		} catch (InvalidResourceTypeException e) {
			logger.error("The resource type is not valid: "+e, e);
		}

		return screen;
	}

	public Precondition getPrecondition(URI uri) {
		Precondition pre = FastModelFactory.createPrecondition();
		pre = (Precondition) getPreOrPost(uri, pre);
		return pre;
	}

	public Postcondition getPostcondition(URI uri) {
		Postcondition post = FastModelFactory.createPostcondition();
		post = (Postcondition) getPreOrPost(uri, post);
		return post;
	}

	public PreOrPost getPreOrPost(URI uri) {
		if (isType(uri, FGO.Precondition))
			return getPrecondition(uri);
		else if (isType(uri, FGO.Postcondition))
			return getPostcondition(uri);
		else
			return null;
	}
	
	private PreOrPost getPreOrPost(URI uri, PreOrPost se) {
		// find all the info related to a pre/postcondition
		ClosableIterator<Statement> it = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		if (!it.hasNext()) // the pre/postcondition does not exist
			return null;
		se.setUri(uri);
		String sUri = uri.toString();
		se.setId(sUri.substring(sUri.lastIndexOf("/") + 1));
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
			} else if (predicate.equals(FGO.hasName)) {
				se.setName(object.asDatatypeLiteral().getValue());
			}
		}
		it.close();
		return se;
	}
	
	private ScreenComponent retrieveScreenComponent(URI type, URI uri) throws InvalidResourceTypeException {
		if (!type.equals(FGO.Form) && !type.equals(FGO.Operator) && !type.equals(FGO.BackendService))
			throw new InvalidResourceTypeException(type+" is not a ScreenComponent.");
		
		ScreenComponent screenComponent = (ScreenComponent) retrieveResource(type, uri);
		if (screenComponent != null) {
			// find all the info related to a form element
			ClosableIterator<Statement> cIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
			for ( ; cIt.hasNext(); ) {
				Statement st = cIt.next();
				URI predicate = st.getPredicate();
				Node object = st.getObject();
				if (predicate.equals(FGO.hasAction)) {
					Action action = new Action();
					ClosableIterator<Statement> actionIt = tripleStore.findStatements(object.asBlankNode(), Variable.ANY, Variable.ANY);
					for ( ; actionIt.hasNext(); ) {
						Statement s = actionIt.next();
						URI p = s.getPredicate();
						Node o = s.getObject();
						if (p.equals(RDFS.label)) {
							action.setName(o.asLiteral().toString());
						} else if (p.equals(FGO.hasPreCondition)) {
							action.getPreconditions().add(getCondition(o.asBlankNode()));
						} else if (p.equals(FGO.hasUse)) {
							ClosableIterator<Statement> useIt = tripleStore.findStatements(o.asBlankNode(), Variable.ANY, Variable.ANY);
							String idUse = null;
							URI uriUse = null;
							for ( ; useIt.hasNext(); ) {
								Statement sUse = useIt.next();
								URI pUse = sUse.getPredicate();
								Node oUse = sUse.getObject();
								if (pUse.equals(FGO.hasId)) {
									idUse = oUse.asDatatypeLiteral().getValue();
								} else if (pUse.equals(FGO.hasUri)) {
									uriUse = oUse.asURI();
								}
							}
							action.getUses().put(idUse, uriUse);
							useIt.close();
						}
					}
					actionIt.close();
					screenComponent.getActions().add(action);
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
					screenComponent.getPostconditions().add(conList);
				} else if (predicate.equals(FGO.hasCode)) {
					screenComponent.setCode(object.asURI());
				} else if (predicate.equals(FGO.hasTrigger)) {
					screenComponent.getTriggers().add(object.toString());
				} else if (predicate.equals(FGO.hasLibrary)) {
					Library library = new Library();
					ClosableIterator<Statement> libIt = tripleStore.findStatements(object.asBlankNode(), Variable.ANY, Variable.ANY);
					for ( ; libIt.hasNext(); ) {
						Statement s = libIt.next();
						URI p = s.getPredicate();
						Node o = s.getObject();
						if (p.equals(FGO.hasLanguage)) {
							library.setLanguage(o.asLiteral().toString());
						} else if (p.equals(FGO.hasSource)) {
							library.setSource(o.asURI());
						}
					}
					libIt.close();
					screenComponent.getLibraries().add(library);
				}
			}
			cIt.close();
		}
		
		return screenComponent;
	}

	public ScreenComponent getScreenComponent(URI uri) {
		URI type = getType(uri);
		if (type == null) return null;
		if (type.equals(FGO.Form))
			return getForm(uri);
		else if (type.equals(FGO.Operator))
			return getOperator(uri);
		else if (type.equals(FGO.BackendService))
			return getBackendService(uri);
		return null;
	}
	
	public Form getForm(URI uri) {
		Form formElement = null;
		try {
			formElement = (Form) retrieveScreenComponent(FGO.Form, uri);
		} catch (InvalidResourceTypeException e) {
			logger.error("The resource type is not valid: "+e, e);
		}
		return formElement;
	}
	
	public Operator getOperator(URI uri) {
		Operator operator = null;
		try {
			operator = (Operator) retrieveScreenComponent(FGO.Operator, uri);
		} catch (InvalidResourceTypeException e) {
			logger.error("The resource type is not valid: "+e, e);
		}
		return operator;
	}

	public BackendService getBackendService(URI uri) {
		BackendService backendService = null;
		try {
			backendService = (BackendService) retrieveScreenComponent(FGO.BackendService, uri);
		} catch (InvalidResourceTypeException e) {
			logger.error("The resource type is not valid: "+e, e);
		}
		return backendService;
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
			} else if (predicate.equals(FGO.isPositive)) {
				c.setPositive(Boolean.parseBoolean(object.asDatatypeLiteral().getValue()));
			} else if (predicate.equals(FGO.hasPatternString)) {
				c.setPatternString(object.asDatatypeLiteral().getValue());
			} else if (predicate.equals(FGO.hasPattern)) {
				URI pattern = st.getObject().asURI();
				ClosableIterator<Statement> it = tripleStore.findStatements(pattern, Variable.ANY, Variable.ANY, Variable.ANY);
				for ( ; it.hasNext(); )
					c.getPattern().add(it.next());
				it.close();
			} else if (predicate.equals(FGO.hasId)) {
				c.setId(object.asDatatypeLiteral().getValue());
			}
		}
		cIt.close();

		return c;
	}
	
	public List<Statement> patternToStatements(String pattern) {
		ArrayList<Statement> stmts = new ArrayList<Statement>();
		HashMap<String, BlankNode> blankNodes = new HashMap<String, BlankNode>();

		StringTokenizer tokens = new StringTokenizer(pattern);//, " . ");
		for ( ; tokens.hasMoreTokens(); ) {
			String subject = tokens.nextToken();
			String predicate = tokens.nextToken();
			String object = tokens.nextToken();
			if (tokens.hasMoreTokens())
				tokens.nextToken(); // discard the .
			// gets if exists or creates the subject
			BlankNode subjectNode = blankNodes.get(subject);
			if (subjectNode == null) {
				subjectNode = tripleStore.createBlankNode();
				blankNodes.put(subject, subjectNode);
			}
			// creates a URI or BlankNode for the object
			Node objectNode;
			try {
				objectNode = new URIImpl(object);
			} catch (IllegalArgumentException e) { 
				objectNode = blankNodes.get(object);
				if (objectNode == null) {
					objectNode = tripleStore.createBlankNode();
					blankNodes.put(subject, subjectNode);
				}
			}
			Statement st = tripleStore.createStatement(subjectNode, new URIImpl(predicate), objectNode);
			stmts.add(st);
		}
		
		return stmts;
	}

	public Concept getConcept(URI uri) {
		Concept concept = FastModelFactory.createConcept();
		
		// fill the information about the concept
		concept.setUri(uri);
		ClosableIterator<Statement> cIt = tripleStore.findStatements(uri, Variable.ANY, Variable.ANY);
		if (!cIt.hasNext()) // the resource does not exist
			return null;
		for ( ; cIt.hasNext(); ) {
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
				for ( ; tagIt.hasNext(); ) {
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
		
		return concept;
	}
	
	/**
	 * Remove a concept given its URI.
	 * Only removes the triples which start with the given URI, if there are
	 * more triples with this URI as object, they will remain.
	 * @param uri
	 * @throws NotFoundException 
	 */
	public void removeConcept(URI uri) throws NotFoundException {
		tripleStore.removeResource(uri);
	}
	
	public List<Plan> searchPlans(URI uri, Set<Resource> resources) {
		return planner.searchPlans(uri, resources);
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
    	for ( ; it.hasNext(); ) {
    		Statement st = it.next();
    		System.out.println(st.getContext()+" - "+st.getSubject()+" - "+st.getPredicate()+" - "+st.getObject());
    	}
    }
    
    // TODO only for debug purposes
    public void dump() {
		tripleStore.dump();
	}
	
}

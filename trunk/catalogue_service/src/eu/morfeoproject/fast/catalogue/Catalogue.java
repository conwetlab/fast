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
import org.ontoware.rdf2go.model.node.Resource;
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

import eu.morfeoproject.fast.catalogue.buildingblocks.BackendService;
import eu.morfeoproject.fast.catalogue.buildingblocks.BuildingBlock;
import eu.morfeoproject.fast.catalogue.buildingblocks.Concept;
import eu.morfeoproject.fast.catalogue.buildingblocks.Condition;
import eu.morfeoproject.fast.catalogue.buildingblocks.FastModelFactory;
import eu.morfeoproject.fast.catalogue.buildingblocks.Form;
import eu.morfeoproject.fast.catalogue.buildingblocks.Operator;
import eu.morfeoproject.fast.catalogue.buildingblocks.Postcondition;
import eu.morfeoproject.fast.catalogue.buildingblocks.PreOrPost;
import eu.morfeoproject.fast.catalogue.buildingblocks.Precondition;
import eu.morfeoproject.fast.catalogue.buildingblocks.Screen;
import eu.morfeoproject.fast.catalogue.buildingblocks.ScreenComponent;
import eu.morfeoproject.fast.catalogue.buildingblocks.ScreenFlow;
import eu.morfeoproject.fast.catalogue.commontag.AuthorCTag;
import eu.morfeoproject.fast.catalogue.commontag.AutoCTag;
import eu.morfeoproject.fast.catalogue.commontag.CTag;
import eu.morfeoproject.fast.catalogue.commontag.ReaderCTag;
import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies;
import eu.morfeoproject.fast.catalogue.ontologies.DefaultOntologies.PublicOntology;
import eu.morfeoproject.fast.catalogue.planner.Plan;
import eu.morfeoproject.fast.catalogue.planner.Planner;
import eu.morfeoproject.fast.catalogue.planner.PlannerFactory;
import eu.morfeoproject.fast.catalogue.util.DateFormatter;
import eu.morfeoproject.fast.catalogue.vocabulary.CTAG;
import eu.morfeoproject.fast.catalogue.vocabulary.DC;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

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
			
			// creates the planner
			planner = PlannerFactory.createPlanner(this);
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
			
			// creates the planner
			planner = PlannerFactory.createPlanner(this);
		}
	}
	
	public URI getServerURL() {
		return serverURL;
	}

	public Planner getPlanner() {
		return planner;
	}

    /**
     * Restores the catalogue
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
	
	public boolean containsBuildingBlock(URI uri) {
		return tripleStore.isResource(uri, FGO.ScreenFlow)
			|| tripleStore.isResource(uri, FGO.Screen)
			|| tripleStore.isResource(uri, FGO.Precondition) || tripleStore.isResource(uri, FGO.Postcondition)
			|| tripleStore.isResource(uri, FGO.Form)
			|| tripleStore.isResource(uri, FGO.Operator)
			|| tripleStore.isResource(uri, FGO.BackendService);
	}
	
	public boolean containsBuildingBlock(BuildingBlock bb) {
		return containsBuildingBlock(bb.getUri());
	}
	
	public boolean containsConcept(URI uri) {
		return isConcept(uri);
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
    		URI typeBuildingBlock) throws ClassCastException, ModelRuntimeException {
    	HashSet<URI> results = new HashSet<URI>();

    	String queryString = 
    		"SELECT DISTINCT ?bb \n" +
    		"WHERE {\n" +
    		"{ ?bb "+RDF.type.toSPARQL()+" "+typeBuildingBlock.toSPARQL()+" . ";
    	
    	// doesn't include the building blocks where the postconditions were taken from
    	for (ScreenComponent comp : toExclude)
   			queryString = queryString.concat("FILTER (?bb != "+comp.getUri().toSPARQL()+") . ");

    	// tags from the domain context
    	if (domainContext != null && domainContext.size() > 0) {
        	queryString = queryString.concat("{");
        	for (String tag : domainContext) {
	    		queryString = queryString.concat(" { ?bb "+CTAG.tagged.toSPARQL()+" ?ctag . ?ctag "+CTAG.label.toSPARQL()+" ?tag . FILTER(regex(str(?tag), \""+tag+"\", \"i\")) } UNION");
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
				queryString = queryString.concat("{ ?bb "+FGO.hasAction.toSPARQL()+" ?a . ");
				queryString = queryString.concat(" ?a "+FGO.hasPreCondition.toSPARQL()+" ?c . ");
				queryString = queryString.concat(" ?c "+FGO.hasPattern.toSPARQL()+" ?p . ");
    			queryString = queryString.concat("GRAPH ?p {");
    			ClosableIterator<Statement> it = patternToRDF2GoModel(con.getPatternString()).iterator();
        		for (; it.hasNext(); ) {
        			Statement st = it.next();
        			Resource subject = st.getSubject();
        			Node object = st.getObject();
        			String s = (subject instanceof BlankNode) ? toCleanVariable(subject.toString()) : subject.toSPARQL();
        			String o = (object instanceof BlankNode) ? toCleanVariable(object.toString()) : object.toSPARQL();
        			queryString = queryString.concat(s+" "+st.getPredicate().toSPARQL()+" "+o+" . ");
        		}
        		it.close();
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

    	QueryResultTable qrt = tripleStore.sparqlSelect(queryString);
    	ClosableIterator<QueryRow> itResults = qrt.iterator();
    	while (itResults.hasNext()) {
    		results.add(itResults.next().getValue("bb").asURI());
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
    		Set<BuildingBlock> bbSet,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<String> domainContext,
    		URI predicate) throws ClassCastException, ModelRuntimeException {
    	HashSet<URI> results = new HashSet<URI>();
    	ArrayList<Condition> unCon = getUnsatisfiedPreconditions(bbSet, plugin, subsume);
    	
    	String queryString = 
    		"SELECT DISTINCT ?bb \n" +
    		"WHERE {\n" +
    		"{ ?bb "+RDF.type.toSPARQL()+" "+FGO.Screen.toSPARQL()+" . ";
    	
    	/////*** LOOK FOR SCREENS ***/////
    	for (BuildingBlock r : bbSet)
    		if (r instanceof Screen)
    			queryString = queryString.concat("FILTER (?bb != "+r.getUri().toSPARQL()+") . ");

    	if (domainContext != null && domainContext.size() > 0) {
        	queryString = queryString.concat("{");
        	for (String tag : domainContext) {
	    		queryString = queryString.concat(" { ?bb "+CTAG.tagged.toSPARQL()+" ?ctag . ?ctag "+CTAG.label.toSPARQL()+" ?tag . FILTER(regex(str(?tag), \""+tag+"\", \"i\")) } UNION");
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
				queryString = queryString.concat("{ ?bb "+predicate.toSPARQL()+" ?b . ");
				queryString = queryString.concat(" ?b ?li ?c . "); // :_bag rdf:li_1 :_condition
				queryString = queryString.concat(" ?c "+FGO.hasPattern.toSPARQL()+" ?p . ");
    			queryString = queryString.concat("GRAPH ?p {");
    			ClosableIterator<Statement> it = patternToRDF2GoModel(con.getPatternString()).iterator();
        		for (; it.hasNext(); ) {
        			Statement st = it.next();
        			Resource subject = st.getSubject();
        			Node object = st.getObject();
        			String s = (subject instanceof BlankNode) ? toCleanVariable(subject.toString()) : subject.toSPARQL();
        			String o = (object instanceof BlankNode) ? toCleanVariable(object.toString()) : object.toSPARQL();
        			queryString = queryString.concat(s+" "+st.getPredicate().toSPARQL()+" "+o+" . ");
        		}
        		it.close();
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

    	QueryResultTable qrt = tripleStore.sparqlSelect(queryString);
    	ClosableIterator<QueryRow> itResults = qrt.iterator();
    	while (itResults.hasNext()) {
    		results.add(itResults.next().getValue("bb").asURI());
    	}
    	itResults.close();

    	return results;
    }

    public Set<URI> findBackwards(
    		Set<BuildingBlock> bbSet,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<String> domainContext) throws ClassCastException, ModelRuntimeException {
    	return findScreens(bbSet, plugin, subsume, offset, limit, domainContext, FGO.hasPostCondition);
    }
    
    public Set<URI> findForwards(
    		Set<BuildingBlock> bbSet,
    		boolean plugin,
    		boolean subsume,
    		int offset,
    		int limit,
    		Set<String> domainContext) throws ClassCastException, ModelRuntimeException {
    	Set<BuildingBlock> tmpBBSet = new HashSet<BuildingBlock>();
    	for (BuildingBlock bb : bbSet) {
    		if (bb instanceof Screen) {
    			Screen s = FastModelFactory.createScreen();
    			s.setUri(bb.getUri());
    			s.setPreconditions(((Screen) bb).getPostconditions());
    			tmpBBSet.add(s);
    		} else {
    			tmpBBSet.add(bb);
    		}
    	}
    	return findScreens(tmpBBSet, plugin, subsume, offset, limit, domainContext, FGO.hasPreCondition);
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
	protected ArrayList<Condition> getUnsatisfiedPreconditions(Set<BuildingBlock> bbSet, boolean plugin, boolean subsume) {
		ArrayList<Condition> unsatisfied = new ArrayList<Condition>();
		for (BuildingBlock bb : bbSet) {
			if (bb instanceof Screen) {
				Screen s = (Screen) bb;
				for (List<Condition> conList : s.getPreconditions()) {
					if (!isConditionSatisfied(bbSet, conList, plugin, subsume, s.getUri())) {
						for (Condition c : conList) {
							if (c.isPositive())
								unsatisfied.add(c);
						}
					}
				}
			} else if (bb instanceof Postcondition) {
				Postcondition e = (Postcondition) bb;
				List<Condition> conList = e.getConditions();
				if (!isConditionSatisfied(bbSet, conList, plugin, subsume, e.getUri())) {
					for (Condition c : conList) {
						if (c.isPositive())
							unsatisfied.add(c);
					}
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
	public boolean isConditionSatisfied(Set<BuildingBlock> bbSet, List<Condition> precondition, boolean plugin, boolean subsume, URI screenExcluded) {
		Set<BuildingBlock> tmpBBSet = new HashSet<BuildingBlock>();
		
		// if no conditions are provided, then returns true
		if (precondition.isEmpty())
			return true;
		
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
        		for (; it.hasNext(); ) {
        			Statement st = it.next();
					String su = (st.getSubject() instanceof BlankNode) ? toCleanVariable(st.getSubject().toString()) : st.getSubject().toSPARQL();
					String ob = (st.getObject() instanceof BlankNode) ? toCleanVariable(st.getObject().toString()) : st.getObject().toSPARQL();
					queryStr = queryStr.concat(su+" "+st.getPredicate().toSPARQL()+" "+ob+" . ");
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
					if (c.isPositive())
						m.addModel(patternToRDF2GoModel(c.getPatternString()));
				}
				models.add(m); 
			} else if (r instanceof Screen) {
				Model m = RDF2Go.getModelFactory().createModel();
				m.open();
				for (List<Condition> postcondition : ((Screen) r).getPostconditions()) {
					for (Condition c : postcondition) {
						if (c.isPositive())
							m.addModel(patternToRDF2GoModel(c.getPatternString()));
					}
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
						if (c.isPositive())
							m.addModel(patternToRDF2GoModel(c.getPatternString()));
					}
					m.addModel(model);
					models.add(m);
				} else if (bb instanceof Screen) {
					Model m = RDF2Go.getModelFactory().createModel();
					m.open();
					for (List<Condition> postcondition : ((Screen) bb).getPostconditions()) {
						for (Condition c : postcondition) {
							if (c.isPositive())
								m.addModel(patternToRDF2GoModel(c.getPatternString()));
						}
					}
					m.addModel(model);
					models.add(m);
				}
			}
		}
		return models;
	}
	
	/**
	 * Checks if c2 is satisfied by c1, in other words, if doing an
	 * ASK sparql query with all statements from c2 patterns into
	 * c1 pattern model returns true
	 * @param c1
	 * @param c2
	 * @return
	 */
	public boolean isConditionCompatible(Condition c1, Condition c2) {
		if (c1 == null || c2 == null)
			return false;
		Model m1 = patternToRDF2GoModel(c1.getPatternString());
		Model m2 = patternToRDF2GoModel(c2.getPatternString());
		if (m1.size() == m2.size()) {
			// create the ASK sparql query for a condition
	    	String queryStr = "ASK {";
	    	ClosableIterator<Statement> it = m2.iterator();
	    	for (; it.hasNext(); ) {
	    		Statement st = it.next();
				String su = (st.getSubject() instanceof BlankNode) ? st.getSubject().toString() : st.getSubject().toSPARQL();
				String ob = (st.getObject() instanceof BlankNode) ? st.getObject().toString() : st.getObject().toSPARQL();
				queryStr = queryStr.concat(su+" "+st.getPredicate().toSPARQL()+" "+ob+" . ");
	    	}
	    	it.close();
	    	queryStr = queryStr.concat("}");

	    	return m1.sparqlAsk(queryStr);
		}
		return false;
	}
	
	/**
	 * Returns the subset of building blocks (screens or preconditions) which are reachable within the
	 * given set. All preconditions are reachable by default.
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
    			if (s.getPreconditions().isEmpty())
    				results.add(s);
    			else
    				toCheck.add(s);
    		}
    	}
    	if (!results.isEmpty() && !toCheck.isEmpty())
    		results.addAll(filterReachableBuildingBlocks(results, toCheck));
    	return results;
	}
	
	private Set<BuildingBlock> filterReachableBuildingBlocks(Set<BuildingBlock> reachables, Set<BuildingBlock> bbSet) {
    	HashSet<BuildingBlock> results = new HashSet<BuildingBlock>();
    	HashSet<BuildingBlock> toCheck = new HashSet<BuildingBlock>();
    	for (BuildingBlock bb : bbSet) {
    		if (bb instanceof Screen) {
    			Screen s = (Screen)bb;
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
    		results.addAll(filterReachableBuildingBlocks(reachables, toCheck));
    	}
    	return results;
	}
	
	private String toCleanVariable(String name) {
		return "?" + name.replaceAll("[^a-zA-Z0-9]", "");
	}

    private URI createClass(URI clazz) {
    	tripleStore.addStatement(null, clazz, RDF.type, RDFS.Class);
    	return clazz;
	}

    private URI createClass(URI clazz, URI subClassOf) {
    	tripleStore.addStatement(null, clazz, RDF.type, RDFS.Class);
    	tripleStore.addStatement(null, clazz, RDFS.subClassOf, subClassOf);
    	return clazz;
	}
    
	private URI saveModelToGraph(Model model) {
		URI graphUri = tripleStore.getUniqueNamespace(serverURL, "/graphs/", false);
		return saveModelToGraph(graphUri, model);
	}
	
	private URI saveModelToGraph(URI graphUri, Model model) {
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
			tripleStore.addStatement(bnTag, CTAG.taggingDate, tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(tag.getTaggingDate()), XSD._date));
		} else { // no date provided, save the current date
			Date currentDate = new Date();
			tag.setTaggingDate(currentDate);
			tripleStore.addStatement(bnTag, CTAG.taggingDate, tripleStore.createDatatypeLiteral(DateFormatter.formatDateISO8601(currentDate), XSD._date));
		}
    }
    
    public URI createConceptURI(String name, String domain) {
    	return new URIImpl(serverURL+"/concepts/"+domain+"/"+name);
    }

    public boolean isConcept(URI concept) {
    	return tripleStore.isClass(concept);
    }
    
	public URI createURIforBuildingBlock(URI namespace, String bb, URI ofClass, String id)
    throws DuplicatedBuildingBlockException, OntologyInvalidException {
    	URI bbUri = new URIImpl(namespace.toString()+"/"+bb+"/"+id);
    	if (containsBuildingBlock(bbUri))
    		throw new DuplicatedBuildingBlockException(bbUri+" already exists.");
    	return bbUri;
    }
    
    private URI createURIforBuildingBlock(URI ofClass, String id) throws DuplicatedBuildingBlockException, OntologyInvalidException {
		if (ofClass.equals(FGO.ScreenFlow)) {
			return createURIforBuildingBlock(serverURL, "screenflows", ofClass, id);
		} else if (ofClass.equals(FGO.Screen)) {
			return createURIforBuildingBlock(serverURL, "screens", ofClass, id);
		} else if (ofClass.equals(FGO.Form)) {
			return createURIforBuildingBlock(serverURL, "forms", ofClass, id);
		} else if (ofClass.equals(FGO.Operator)) {
			return createURIforBuildingBlock(serverURL, "operators", ofClass, id);
		} else if (ofClass.equals(FGO.BackendService)) {
			return createURIforBuildingBlock(serverURL, "services", ofClass, id);
		} else if (ofClass.equals(FGO.Precondition)) {
			return createURIforBuildingBlock(serverURL, "preconditions", ofClass, id);
		} else if (ofClass.equals(FGO.Postcondition)) {
			return createURIforBuildingBlock(serverURL, "postconditions", ofClass, id);
		}
		return null;
	}
	
    private Model getModelForBuildingBlock(URI uri) {
		ClosableIterator<Statement> it = tripleStore.findStatements(uri, new URIImpl("http://replace.for.real.one"), Variable.ANY);
		URI graphUri = null;
		if (it.hasNext())
			graphUri = it.next().getObject().asURI();
		it.close();
		return tripleStore.getModel(graphUri);
    }
    
	/**
	 * Removes the graph containing the building block
	 * @param rUri
	 * @throws NotFoundException
	 */
	// TODO needs to remove statements created for the patterns
	private void removeBuildingBlock(URI bbUri) throws NotFoundException {
		if (!containsBuildingBlock(bbUri))
			throw new NotFoundException();
		tripleStore.removeModel(bbUri);
		logger.info(bbUri+" removed.");
	}
	
	public void addScreenFlow(ScreenFlow sf) throws DuplicatedBuildingBlockException,
	OntologyInvalidException, OntologyReadonlyException, NotFoundException, BuildingBlockException {
		URI sfUri = sf.getUri();
		if (sfUri != null) {
			if (containsBuildingBlock(sf))
				throw new DuplicatedBuildingBlockException(sf.getUri()+" already exists.");
		} else {
			sfUri = createURIforBuildingBlock(FGO.ScreenFlow, sf.getId());
			sf.setUri(sfUri);
		}
		// sets current date if no date given
		if (sf.getCreationDate() == null) sf.setCreationDate(new Date());
		// persists the screen-flow
		if (!saveScreenFlow(sf)) {
			throw new BuildingBlockException("An error ocurred while saving the screen-flow. Please, ensure the screen-flow is well defined.");
		}
		logger.info("Screenflow "+sfUri+" added.");
	}
	
	private boolean saveScreenFlow(ScreenFlow sf) throws OntologyReadonlyException, NotFoundException {
		URI sfUri = sf.getUri();
		try {
			Model model = sf.toRDF2GoModel();
			URI graphUri = saveModelToGraph(model);
			tripleStore.addStatement(graphUri, sfUri, new URIImpl("http://replace.for.real.one"), graphUri);
			generateConditionsStatements(model, graphUri);
			model.close();
			return true;
		} catch (Exception e) {
			logger.error("Error while saving screen "+sfUri, e);
			try {
				removeScreenFlow(sfUri);
			} catch (NotFoundException nfe) {
				logger.error("Screen-flow "+sfUri+" does not exist.", nfe);
			}
		}
		return false;
	}
	
	public void updateScreenFlow(ScreenFlow screenflow) throws NotFoundException, OntologyReadonlyException, BuildingBlockException  {
		logger.info("Updating screenflow "+screenflow.getUri()+"...");
		removeScreenFlow(screenflow.getUri());
		// save new content with the same URI
		if (!saveScreenFlow(screenflow)) {
			throw new BuildingBlockException("An error ocurred while saving the screen-flow. Please, ensure the screen-flow is well defined.");
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
		removeBuildingBlock(sfUri);
	}
	
	/**
	 * Creates a new Screen into the catalogue
	 * @param screen
	 * @throws DuplicatedBuildingBlockException
	 * @throws OntologyInvalidException
	 * @throws BuildingBlockException
	 */
	public void addScreen(Screen screen) throws DuplicatedBuildingBlockException, OntologyInvalidException, BuildingBlockException {
		URI screenUri = null;
		if (screen.getUri() != null) {
			screenUri = screen.getUri();
			if (containsBuildingBlock(screen))
				throw new DuplicatedBuildingBlockException(screenUri+" already exists.");
		} else {
			screenUri = createURIforBuildingBlock(FGO.Screen, screen.getId());
			screen.setUri(screenUri);
		}
		// sets current date if no date given
		if (screen.getCreationDate() == null) screen.setCreationDate(new Date());
		// persists the screen
		if (saveScreen(screen)) {
			// create plans for the screen
			if (planner != null) planner.add(screen);
		} else {
			throw new BuildingBlockException("An error ocurred while saving the screen. Please, ensure the screen is well defined.");
		}
	}
	
	/**
	 * Do not check if the screen already exists, and assumes the screen has a well-formed unique URI
	 * To be invoked by addScreen and updateScreen methods
	 */
	private boolean saveScreen(Screen screen) {
		URI sUri = screen.getUri();
		try {
			Model model = screen.toRDF2GoModel();
			URI graphUri = saveModelToGraph(model);
			tripleStore.addStatement(graphUri, sUri, new URIImpl("http://replace.for.real.one"), graphUri);
			generateConditionsStatements(model, graphUri);
			model.close();
			return true;
		} catch (Exception e) {
			logger.error("Error while saving screen "+sUri, e);
			try {
				removeScreen(sUri);
			} catch (NotFoundException nfe) {
				logger.error("Screen "+sUri+" does not exist.", nfe);
			}
		}
		return false;
	}
	
	public void updateScreen(Screen screen)
	throws NotFoundException, OntologyReadonlyException, RepositoryException, OntologyInvalidException, BuildingBlockException  {
		logger.info("Updating screen "+screen.getUri()+"...");
		Screen oldScreen = getScreen(screen.getUri());
		// remove screen from the catalogue
		removeScreen(screen.getUri());
		// save new content with the same URI
		if (saveScreen(screen)) {
			// calculate new plans if necessary
			if (planner != null) planner.update(screen, oldScreen);
			logger.info("Screen "+screen.getUri()+" updated.");
		} else {
			throw new BuildingBlockException("An error ocurred while saving the screen. Please, ensure the screen is well defined.");
		}
	}
	
	public void removeScreen(URI screenUri) throws NotFoundException {
		removeBuildingBlock(screenUri);
		// remove the screen from the planner
		if (planner != null) planner.remove(screenUri);
	}
	
	public void addPreOrPost(PreOrPost se) throws DuplicatedBuildingBlockException, OntologyInvalidException, BuildingBlockException {
		URI seUri = null;
		if (se.getUri() != null) {
			seUri = se.getUri();
			if (containsBuildingBlock(se))
				throw new DuplicatedBuildingBlockException(seUri+" already exists.");
		} else {
			if (se instanceof Precondition)
				seUri = createURIforBuildingBlock(FGO.Precondition, se.getId());
			else if (se instanceof Postcondition)
				seUri = createURIforBuildingBlock(FGO.Postcondition, se.getId());
			se.setUri(seUri);
		}
		// sets current date if no date given
		if (se.getCreationDate() == null) se.setCreationDate(new Date());
		// persists the pre/postcondition
		if (!savePreOrPost(se)) {
			throw new BuildingBlockException("An error ocurred while saving the screen. Please, ensure the screen is well defined.");
		}
	}
	
	private boolean savePreOrPost(PreOrPost preOrPost) {
		URI uri = preOrPost.getUri();
		try {
			Model model = preOrPost.toRDF2GoModel();
			URI graphUri = saveModelToGraph(model);
			tripleStore.addStatement(graphUri, uri, new URIImpl("http://replace.for.real.one"), graphUri);
			generateConditionsStatements(model, graphUri);
			model.close();
			return true;
		} catch (Exception e) {
			logger.error("Error while saving pre/postcondition "+uri, e);
			try {
				removeScreen(uri);
			} catch (NotFoundException nfe) {
				logger.error("Pre/postcondition "+uri+" does not exist.", nfe);
			}
		}
		return false;
	}
	
	public void updatePreOrPost(PreOrPost se) throws NotFoundException, BuildingBlockException {
		logger.info("Updating pre/postcondition "+se.getUri()+"...");
		removePreOrPost(se.getUri());
		// save new content with the same URI
		if (savePreOrPost(se)) {
			logger.info(se.getUri()+" updated.");
		} else {
			throw new BuildingBlockException("An error ocurred while saving the pre/postcondition. Please, ensure the screen is well defined.");
		}
	}
	
	public void removePreOrPost(URI uri) throws NotFoundException {
		removeBuildingBlock(uri);
	}

	private void addScreenComponent(URI type, ScreenComponent sc)
	throws DuplicatedBuildingBlockException, OntologyInvalidException, InvalidBuildingBlockTypeException, BuildingBlockException {
		if (!type.equals(FGO.Form) && !type.equals(FGO.Operator) && !type.equals(FGO.BackendService))
			throw new InvalidBuildingBlockTypeException(type+" is not a screen component.");
		
		URI scUri = null;
		if (sc.getUri() != null) {
			scUri = sc.getUri();
			if (containsBuildingBlock(sc))
				throw new DuplicatedBuildingBlockException(scUri+" already exists.");
		} else {
			scUri = createURIforBuildingBlock(type, sc.getId());
			sc.setUri(scUri);
		}
		// sets current date if no date given
		if (sc.getCreationDate() == null) sc.setCreationDate(new Date());
		// persists the screen component
		if (!saveScreenComponent(sc)) {
			throw new BuildingBlockException("An error ocurred while saving the screen component. Please, ensure the component is well defined.");
		}
	}
	
	private boolean saveScreenComponent(ScreenComponent sc) {
		URI scUri = sc.getUri();
		try {
			Model model = sc.toRDF2GoModel();
			URI graphUri = saveModelToGraph(model);
			tripleStore.addStatement(graphUri, scUri, new URIImpl("http://replace.for.real.one"), graphUri);
			generateConditionsStatements(model, graphUri);
			model.close();
			return true;
		} catch (Exception e) {
			logger.error("Error while saving screen component "+scUri, e);
			try {
				removeBuildingBlock(scUri);
			} catch (NotFoundException nfe) {
				logger.error("Screen component "+scUri+" does not exist.", nfe);
			}
		}
		return false;
	}
	
	private void updateScreenComponent(ScreenComponent sc) throws NotFoundException, BuildingBlockException {
		logger.info("Updating screen component "+sc.getUri()+"...");
		// remove old screen component from the catalogue
		removeScreenComponent(sc.getUri());
		// save new content with the same URI
		if (!saveScreenComponent(sc))
			throw new BuildingBlockException("An error ocurred while saving the screen component. Please, ensure the component is well defined.");
		logger.info("Screen component "+sc.getUri()+" updated.");
	}
	
	private void removeScreenComponent(URI scUri) throws NotFoundException {
		URI type = getType(scUri);
		if (type == null) {
			removeBuildingBlock(scUri);
			logger.warn("Type is unknown: "+scUri+" cannot be removed.");
		} else {
			if (type.equals(FGO.Form))
				removeForm(scUri);
			else if (type.equals(FGO.Operator))
				removeOperator(scUri);
			else if (type.equals(FGO.BackendService))
				removeBackendService(scUri);
			else {
				removeBuildingBlock(scUri);
				logger.warn(scUri+" is not of type: Form, Operator or BackendService. Removing as generic building block.");
			}
		}
	}
	
	public void addForm(Form fe)
	throws DuplicatedBuildingBlockException, OntologyInvalidException, InvalidBuildingBlockTypeException, BuildingBlockException {
		addScreenComponent(FGO.Form, fe);
	}
	
	public void updateForm(Form fe) throws NotFoundException, BuildingBlockException {
		updateScreenComponent(fe);
	}
	
	public void removeForm(URI formUri) throws NotFoundException {
		removeBuildingBlock(formUri);
	}
	
	public void addOperator(Operator op)
	throws DuplicatedBuildingBlockException, OntologyInvalidException, InvalidBuildingBlockTypeException, BuildingBlockException {
		addScreenComponent(FGO.Operator, op);
	}
	
	public void updateOperator(Operator op) throws NotFoundException, BuildingBlockException {
		updateScreenComponent(op);
	}
	
	public void removeOperator(URI opUri) throws NotFoundException {
		removeBuildingBlock(opUri);
	}

	public void addBackendService(BackendService bs)
	throws DuplicatedBuildingBlockException, OntologyInvalidException, InvalidBuildingBlockTypeException, BuildingBlockException {
		addScreenComponent(FGO.BackendService, bs);
	}
	
	public void updateBackendService(BackendService bs) throws NotFoundException, BuildingBlockException {
		updateScreenComponent(bs);
	}
	
	public void removeBackendService(URI bsUri) throws NotFoundException {
		removeBuildingBlock(bsUri);
	}

	public Collection<ScreenFlow> getScreenFlows() {
		ArrayList<ScreenFlow> results = new ArrayList<ScreenFlow>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.ScreenFlow);
		while (it.hasNext())
			results.add(getScreenFlow(it.next().getSubject().asURI()));
		it.close();
		return results;
	}
	
	public Collection<Screen> getScreens() {
		ArrayList<Screen> results = new ArrayList<Screen>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Screen);
		while (it.hasNext()) {
			URI sUri = it.next().getSubject().asURI();
			results.add(getScreen(sUri));
		}
		it.close();
		return results;
	}
	
	public Collection<Form> getForms() {
		ArrayList<Form> results = new ArrayList<Form>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Form);
		while (it.hasNext())
			results.add(getForm(it.next().getSubject().asURI()));
		it.close();
		return results;
	}

	public Collection<Operator> getOperators() {
		ArrayList<Operator> results = new ArrayList<Operator>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Operator);
		while (it.hasNext())
			results.add(getOperator(it.next().getSubject().asURI()));
		it.close();
		return results;
	}

	public Collection<BackendService> getBackendServices() {
		ArrayList<BackendService> results = new ArrayList<BackendService>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.BackendService);
		while (it.hasNext())
			results.add(getBackendService(it.next().getSubject().asURI()));
		it.close();
		return results;
	}

	public Collection<Precondition> getPreconditions() {
		ArrayList<Precondition> results = new ArrayList<Precondition>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Precondition);
		while (it.hasNext())
			results.add(getPrecondition(it.next().getSubject().asURI()));
		it.close();
		return results;
	}
	
	public Collection<Postcondition> getPostconditions() {
		ArrayList<Postcondition> results = new ArrayList<Postcondition>();
		ClosableIterator<Statement> it = tripleStore.findStatements(Variable.ANY, RDF.type, FGO.Postcondition);
		while (it.hasNext())
			results.add(getPostcondition(it.next().getSubject().asURI()));
		it.close();
		return results;
	}

	public Collection<URI> getConcepts(String[] tags) {
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
    			// problems adding some ontologies, ie: DBPedia
    		} else {
    			results.add(qr.getValue("concept").asURI());
    		}
    	}
    	itResults.close();
    	
    	return results;
	}

    public BuildingBlock getBuildingBlock(URI uri) {
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
    
	public ScreenFlow getScreenFlow(URI uri) {
		return BuildingBlockRDF2GoBuilder.buildScreenFlow(getModelForBuildingBlock(uri));
	}
	
	public Screen getScreen(URI uri) {
		return BuildingBlockRDF2GoBuilder.buildScreen(getModelForBuildingBlock(uri));
	}

	public Precondition getPrecondition(URI uri) {
		return (Precondition) getPreOrPost(uri);
	}

	public Postcondition getPostcondition(URI uri) {
		return (Postcondition) getPreOrPost(uri);
	}

	private PreOrPost getPreOrPost(URI uri) {
		return BuildingBlockRDF2GoBuilder.buildPreOrPost(getModelForBuildingBlock(uri), uri);
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
		return BuildingBlockRDF2GoBuilder.buildForm(getModelForBuildingBlock(uri));
	}
	
	public Operator getOperator(URI uri) {
		return BuildingBlockRDF2GoBuilder.buildOperator(getModelForBuildingBlock(uri));
	}

	public BackendService getBackendService(URI uri) {
		return BuildingBlockRDF2GoBuilder.buildBackendService(getModelForBuildingBlock(uri));
	}

	private void generateConditionsStatements(Model model, URI graphUri) {
		ClosableIterator<Statement> it = model.iterator();
		for (; it.hasNext(); ) {
			Statement stmt = it.next();
			if (stmt.getPredicate().equals(FGO.hasPatternString) && isConditionPositive(model, stmt.getSubject().asBlankNode())) {
				URI pUri = tripleStore.getCleanUniqueURI(serverURL, "/patterns/", false);
				String pattern = stmt.getObject().asDatatypeLiteral().getValue();
				tripleStore.addStatement(graphUri, stmt.getSubject(), FGO.hasPattern, pUri);
				tripleStore.addModel(patternToRDF2GoModel(pattern), pUri);
			}
		}
		it.close();
	}
	
	private boolean isConditionPositive(Model model, BlankNode cNode) {
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
	
	public void addConcept(Concept concept) throws DuplicatedBuildingBlockException, BuildingBlockException {
		URI cUri = concept.getUri();
		if (containsConcept(cUri))
			throw new DuplicatedBuildingBlockException(cUri+" already exists.");
		// persists the concept
		if (!saveConcept(concept)) {
			throw new BuildingBlockException("An error ocurred while saving the concept. Please, ensure the concept is well defined.");
		}
	}
	
	private boolean saveConcept(Concept concept) {
		URI cUri = concept.getUri();
		try {
			Model model = concept.toRDF2GoModel();
			URI graphUri = saveModelToGraph(model);
			tripleStore.addStatement(cUri, new URIImpl("http://replace.for.real.one"), graphUri);
			model.close();
			return true;
		} catch (Exception e) {
			logger.error("Error while saving concept "+cUri, e);
			try {
				removeScreen(cUri);
			} catch (NotFoundException nfe) {
				logger.error("Concept "+cUri+" does not exist.", nfe);
			}
		}
		return false;
	}
	
	public void updateConcept(Concept concept) throws NotFoundException, BuildingBlockException {
		logger.info("Updating concept "+concept.getUri()+"...");
		removeConcept(concept.getUri());
		// save new content with the same URI
		if (saveConcept(concept)) {
			logger.info("Concept "+concept.getUri()+" updated.");
		} else {
			throw new BuildingBlockException("An error ocurred while saving the concept. Please, ensure the concept is well defined.");
		}
	}
	
	/**
	 * Remove a concept given its URI.
	 * Only removes the triples which start with the given URI or as its context URI,
	 * if there are more triples with this URI as object, they will remain.
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
		if (planner != null) planList.addAll(planner.searchPlans(uri, buildingBlockSet));
		return planList;
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

package eu.morfeoproject.fast.server;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.StringTokenizer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.model.Action;
import eu.morfeoproject.fast.model.BackendService;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.FastModelFactory;
import eu.morfeoproject.fast.model.FormElement;
import eu.morfeoproject.fast.model.Library;
import eu.morfeoproject.fast.model.Operator;
import eu.morfeoproject.fast.model.Pipe;
import eu.morfeoproject.fast.model.Postcondition;
import eu.morfeoproject.fast.model.Precondition;
import eu.morfeoproject.fast.model.Resource;
import eu.morfeoproject.fast.model.Screen;
import eu.morfeoproject.fast.model.ScreenComponent;
import eu.morfeoproject.fast.model.ScreenDefinition;
import eu.morfeoproject.fast.model.ScreenFlow;
import eu.morfeoproject.fast.model.Trigger;
import eu.morfeoproject.fast.util.DateFormatter;

public abstract class GenericServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
	}

	/**
	 * @see HttpServlet#doPut(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
	}

	@SuppressWarnings("unchecked")
	protected void parseResource(Resource resource, JSONObject jsonResource, URI uri) throws JSONException {
		if (uri != null)
			resource.setUri(uri);
		if (jsonResource.get("label") != null) {
			JSONObject jsonLabels = jsonResource.getJSONObject("label");
			Iterator<String> labels = jsonLabels.keys();
			for ( ; labels.hasNext(); ) {
				String key = labels.next();
				resource.getLabels().put(key, jsonLabels.getString(key));
			}
		}
		if (jsonResource.get("description") != null) {
			JSONObject jsonDescriptions = jsonResource.getJSONObject("description");
			Iterator<String> descriptions = jsonDescriptions.keys();
			for ( ; descriptions.hasNext(); ) {
				String key = descriptions.next();
				resource.getDescriptions().put(key, jsonDescriptions.getString(key));
			}
		}
		resource.setCreator(new URIImpl(jsonResource.getString("creator")));
		resource.setRights(new URIImpl(jsonResource.getString("rights")));
		resource.setVersion(jsonResource.getString("version"));
		resource.setCreationDate(DateFormatter.parseDateISO8601(jsonResource.getString("creationDate")));
		resource.setIcon(new URIImpl(jsonResource.getString("icon")));
		resource.setScreenshot(new URIImpl(jsonResource.getString("screenshot")));
		resource.setHomepage(new URIImpl(jsonResource.getString("homepage")));
		resource.setId(jsonResource.getString("id"));
		resource.setName(jsonResource.getString("name"));
		resource.setType(jsonResource.getString("type"));
	}
	
	protected ScreenFlow parseScreenFlow(JSONObject jsonScreenFlow, URI uri) throws JSONException, IOException {
		ScreenFlow screenFlow = FastModelFactory.createScreenFlow();

		// fill common properties of the resource
		parseResource(screenFlow, jsonScreenFlow, uri);

		JSONObject domainContext = jsonScreenFlow.getJSONObject("domainContext");
		JSONArray tags = domainContext.getJSONArray("tags");
		for (int i = 0; i < tags.length(); i++)
			screenFlow.getDomainContext().getTags().add(tags.getString(i));
		URI user = new URIImpl(domainContext.getString("user"));
		screenFlow.getDomainContext().setUser(user);
		JSONArray resources = jsonScreenFlow.getJSONArray("contains");
		for (int i = 0; i < resources.length(); i++)
			screenFlow.getResources().add(new URIImpl(resources.getString(i)));
		return screenFlow;
	}

	protected Screen parseScreen(JSONObject jsonScreen, URI uri) throws JSONException, IOException, ParseScreenException {
		Screen screen = FastModelFactory.createScreen();

		// fill common properties of the resource
		parseResource(screen, jsonScreen, uri);

		JSONObject domainContext = jsonScreen.getJSONObject("domainContext");
		JSONArray tags = domainContext.getJSONArray("tags");
		for (int i = 0; i < tags.length(); i++)
			screen.getDomainContext().getTags().add(tags.getString(i));
		URI user = new URIImpl(domainContext.getString("user"));
		screen.getDomainContext().setUser(user);
		// preconditions
		JSONArray preArray = jsonScreen.getJSONArray("preconditions");
		ArrayList<List<Condition>> preconditions = new ArrayList<List<Condition>>();
		for (int i = 0; i < preArray.length(); i++)
			preconditions.add(parseConditions(preArray.getJSONArray(i)));
		screen.setPreconditions(preconditions);
		// postconditions
		JSONArray postArray = jsonScreen.getJSONArray("postconditions");
		ArrayList<List<Condition>> postconditions = new ArrayList<List<Condition>>();
		for (int i = 0; i < postArray.length(); i++)
			postconditions.add(parseConditions(postArray.getJSONArray(i)));
		screen.setPostconditions(postconditions);
		// code
		if (jsonScreen.has("code") && jsonScreen.has("definition")) {
			throw new ParseScreenException("Either 'code' or 'definition' must be specified, but not both.");
		} else if (jsonScreen.has("code")) {
			if (jsonScreen.getString("code").equalsIgnoreCase("null"))
				throw new ParseScreenException("'code' cannot be null.");
			screen.setCode(new URIImpl(jsonScreen.getString("code")));
		} else if (jsonScreen.has("definition")) {
			ScreenDefinition sDef = parseScreenDefinition(jsonScreen.getJSONObject("definition"));
			screen.setDefinition(sDef);
		} else {
			throw new ParseScreenException("Either 'code' or 'definition' must be specified.");
		}
		return screen;
	}
	
	protected ScreenDefinition parseScreenDefinition(JSONObject jsonDef) throws JSONException {
		ScreenDefinition definition = new ScreenDefinition();
		// building blocks
		JSONArray bbArray = jsonDef.getJSONArray("buildingblocks");
		for (int i = 0; i < bbArray.length(); i++) {
			JSONObject bb = bbArray.getJSONObject(i);
			definition.getBuildingBlocks().put(bb.getString("id"), new URIImpl(bb.getString("uri")));
		}
		// pipes
		JSONArray pipeArray = jsonDef.getJSONArray("pipes");
		for (int i = 0; i < pipeArray.length(); i++) {
			JSONObject jsonPipe = pipeArray.getJSONObject(i);
			JSONObject pipeFrom = jsonPipe.getJSONObject("from");
			JSONObject pipeTo = jsonPipe.getJSONObject("to");
			Pipe pipe = FastModelFactory.createPipe();
			pipe.setIdBBFrom(pipeFrom.getString("buildingblock"));
			pipe.setIdConditionFrom(pipeFrom.getString("condition"));
			pipe.setIdBBTo(pipeTo.getString("buildingblock"));
			pipe.setIdConditionTo(pipeTo.getString("condition"));
			pipe.setIdActionTo(pipeTo.getString("action"));
			definition.getPipes().add(pipe);
		}
		// triggers
		JSONArray triggerArray = jsonDef.getJSONArray("triggers");
		for (int i = 0; i < triggerArray.length(); i++) {
			JSONObject jsonPipe = triggerArray.getJSONObject(i);
			JSONObject pipeFrom = jsonPipe.getJSONObject("from");
			JSONObject pipeTo = jsonPipe.getJSONObject("to");
			Trigger trigger = new Trigger();
			trigger.setIdBBFrom(pipeFrom.getString("buildingblock"));
			trigger.setNameFrom(pipeFrom.getString("name"));
			trigger.setIdBBTo(pipeTo.getString("buildingblock"));
			trigger.setIdActionTo(pipeTo.getString("action"));
			definition.getTriggers().add(trigger);
		}
		return definition;
	}
	
	protected Precondition parsePrecondition(JSONObject jsonSlot, URI uri) throws JSONException, IOException {
		Precondition pre = FastModelFactory.createPrecondition();
		if (uri != null)
			pre.setUri(uri);
		// conditions
		JSONArray conditionsArray = jsonSlot.getJSONArray("conditions");
		pre.setConditions(parseConditions(conditionsArray));
		return pre;
	}
	
	protected Postcondition parsePostcondition(JSONObject jsonEvent, URI uri) throws JSONException, IOException {
		Postcondition post = FastModelFactory.createPostcondition();
		if (uri != null)
			post.setUri(uri);
		// conditions
		JSONArray conditionsArray = jsonEvent.getJSONArray("conditions");
		post.setConditions(parseConditions(conditionsArray));
		return post;
	}
	
	protected FormElement parseFormElement(JSONObject jsonFe, URI uri) throws JSONException, IOException {
		FormElement fe = FastModelFactory.createFormElement();
		parseScreenComponent(fe, jsonFe, uri);
		return fe;
	}

	protected Operator parseOperator(JSONObject jsonOp, URI uri) throws JSONException, IOException {
		Operator op = FastModelFactory.createOperator();
		parseScreenComponent(op, jsonOp, uri);
		return op;
	}

	protected BackendService parseBackendService(JSONObject jsonBs, URI uri) throws JSONException, IOException {
		BackendService bs = FastModelFactory.createBackendService();
		parseScreenComponent(bs, jsonBs, uri);
		return bs;
	}
	
	protected Action parseAction(JSONObject jsonAction) throws JSONException, IOException {
		Action action = new Action();
		
		// name
		if (jsonAction.get("name") != null)
			action.setName(jsonAction.getString("name"));
		// preconditions
		JSONArray preArray = jsonAction.getJSONArray("preconditions");
		action.setPreconditions(parseConditions(preArray));
		// uses
		if (jsonAction.get("uses") != null) {
			JSONArray usesArray = jsonAction.getJSONArray("uses");
			for (int i = 0; i < usesArray.length(); i++)
				action.getUses().add(usesArray.getString(i));
		}

		return action;
	}
	
	protected Library parseLibrary(JSONObject jsonLibrary) throws JSONException, IOException {
		Library library = new Library();
		
		// name
		if (jsonLibrary.get("language") != null)
			library.setLanguage(jsonLibrary.getString("language"));
		// source
		if (jsonLibrary.get("source") != null && !jsonLibrary.getString("source").equalsIgnoreCase("null"))
			library.setSource(new URIImpl(jsonLibrary.getString("source")));

		return library;
	}
	
	protected void parseScreenComponent(ScreenComponent sc, JSONObject jsonSc, URI uri) throws JSONException, IOException {
		// fill common properties of the resource
		parseResource(sc, jsonSc, uri);
		
		JSONObject domainContext = jsonSc.getJSONObject("domainContext");
		JSONArray tags = domainContext.getJSONArray("tags");
		for (int i = 0; i < tags.length(); i++)
			sc.getDomainContext().getTags().add(tags.getString(i));
		URI user = new URIImpl(domainContext.getString("user"));
		sc.getDomainContext().setUser(user);
		// actions
		JSONArray actionsArray = jsonSc.getJSONArray("actions");
		for (int i = 0; i < actionsArray.length(); i++)
			sc.getActions().add(parseAction(actionsArray.getJSONObject(i)));
		// postconditions
		JSONArray postArray = jsonSc.getJSONArray("postconditions");
		ArrayList<List<Condition>> postconditions = new ArrayList<List<Condition>>();
		for (int i = 0; i < postArray.length(); i++)
			postconditions.add(parseConditions(postArray.getJSONArray(i)));
		sc.setPostconditions(postconditions);
		// code
		if (jsonSc.get("code") != null && !jsonSc.getString("code").equalsIgnoreCase("null"))
			sc.setCode(new URIImpl(jsonSc.getString("code")));
		// libraries
		JSONArray librariesArray = jsonSc.getJSONArray("libraries");
		for (int i = 0; i < librariesArray.length(); i++)
			sc.getLibraries().add(parseLibrary(librariesArray.getJSONObject(i)));
		// triggers
		if (jsonSc.get("triggers") != null) {
			JSONArray triggersArray = jsonSc.getJSONArray("triggers");
			for (int i = 0; i < triggersArray.length(); i++)
				sc.getTriggers().add(triggersArray.getString(i));
		}
	}

	/**
	 * Every statement of the conditions has to follow this rules:
	 * <ul>
	 *   <li>Subject must be a variable</li>
	 *   <li>Predicate must be a URI</li>
	 *   <li>Object can be a variable or a URI</li>
	 * </ul>
	 * @param conditionsArray
	 * @return
	 * @throws JSONException
	 * @throws IOException 
	 */
	@SuppressWarnings("unchecked")
	protected List<Condition> parseConditions(JSONArray conditionsArray) throws JSONException, IOException {
		ArrayList<Condition> conditions = new ArrayList<Condition>();
		HashMap<String, BlankNode> blankNodes = new HashMap<String, BlankNode>();
		for (int i = 0; i < conditionsArray.length(); i++) {
			JSONObject cJson = conditionsArray.getJSONObject(i);
			Condition c = FastModelFactory.createCondition();
			c.setId(cJson.getString("id"));
			boolean positive = cJson.has("positive") ? cJson.getBoolean("positive") : true;
			c.setPositive(positive);
			if (cJson.get("label") != null) {
				JSONObject jsonLabels = cJson.getJSONObject("label");
				Iterator<String> labels = jsonLabels.keys();
				for ( ; labels.hasNext(); ) {
					String key = labels.next();
					c.getLabels().put(key, jsonLabels.getString(key));
				}
			}
			String patternString = cJson.getString("pattern");
			c.setPatternString(patternString);
			// only create the triples for the pattern in case of the condition is positive
			if (positive) {
				ArrayList<Statement> stmts = new ArrayList<Statement>();
				StringTokenizer tokens = new StringTokenizer(patternString);//, " . ");
				for ( ; tokens.hasMoreTokens(); ) {
					String subject = tokens.nextToken();
					String predicate = tokens.nextToken();
					String object = tokens.nextToken();
					if (tokens.hasMoreTokens())
						tokens.nextToken(); // discard the .
					// gets if exists or creates the subject
					BlankNode subjectNode = blankNodes.get(subject);
					if (subjectNode == null) {
						subjectNode = CatalogueAccessPoint.getCatalogue().getTripleStore().createBlankNode();
						blankNodes.put(subject, subjectNode);
					}
					// creates a URI or BlankNode for the object
					Node objectNode;
					try {
						objectNode = new URIImpl(object);
					} catch (IllegalArgumentException e) { 
						objectNode = blankNodes.get(object);
						if (objectNode == null) {
							objectNode = CatalogueAccessPoint.getCatalogue().getTripleStore().createBlankNode();
							blankNodes.put(subject, subjectNode);
						}
					}
					Statement st = CatalogueAccessPoint.getCatalogue().getTripleStore().createStatement(subjectNode, new URIImpl(predicate), objectNode);
					stmts.add(st);
				}
				c.setPattern(stmts);
			}
			conditions.add(c);
		}
		return conditions;
	}
	

	protected List<Pipe> parsePipes(JSONArray pipesArray) throws JSONException, IOException {
		ArrayList<Pipe> pipes = new ArrayList<Pipe>();
		for (int i = 0; i < pipesArray.length(); i++) {
			JSONObject pJson = pipesArray.getJSONObject(i);
			Pipe p = FastModelFactory.createPipe();
			JSONObject fromJson = pJson.getJSONObject("from");
			p.setIdBBFrom(fromJson.getString("buildingblock"));
			p.setIdConditionFrom(fromJson.getString("condition"));
			JSONObject toJson = pJson.getJSONObject("to");
			p.setIdBBTo(toJson.getString("buildingblock"));
			p.setIdConditionTo(toJson.getString("condition"));
			p.setIdActionTo(toJson.getString("action"));
			pipes.add(p);
		}
		return pipes;
	}
	
	/**
	 * Transforms a set of statements referring to a certain subject into a 
	 * JSON object, where every predicate will be a key and every object
	 * will be a value.
	 * NOTE: all them will be treated as referring to the same subject
	 * @param statemets
	 * @return
	 */
	protected JSONObject statements2JSON(Set<Statement> statements) {
		JSONObject result = new JSONObject();
		for (Iterator<Statement> it = statements.iterator(); it.hasNext(); ) {
			try {
				Statement st = it.next();
				if (!st.getPredicate().asURI().equals(RDF.type))
					result.accumulate(st.getPredicate().toString(), st.getObject().toString());
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		return result;
	}
	
}

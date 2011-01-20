package eu.morfeoproject.fast.catalogue.builder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.commontag.CTag;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.BuildingBlockException;
import eu.morfeoproject.fast.catalogue.MyRDFFactory;
import eu.morfeoproject.fast.catalogue.RDFFactory;
import eu.morfeoproject.fast.catalogue.model.Action;
import eu.morfeoproject.fast.catalogue.model.BackendService;
import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.model.Concept;
import eu.morfeoproject.fast.catalogue.model.Condition;
import eu.morfeoproject.fast.catalogue.model.Form;
import eu.morfeoproject.fast.catalogue.model.Library;
import eu.morfeoproject.fast.catalogue.model.Operator;
import eu.morfeoproject.fast.catalogue.model.Pipe;
import eu.morfeoproject.fast.catalogue.model.Postcondition;
import eu.morfeoproject.fast.catalogue.model.Precondition;
import eu.morfeoproject.fast.catalogue.model.Property;
import eu.morfeoproject.fast.catalogue.model.Screen;
import eu.morfeoproject.fast.catalogue.model.ScreenComponent;
import eu.morfeoproject.fast.catalogue.model.ScreenFlow;
import eu.morfeoproject.fast.catalogue.model.Trigger;
import eu.morfeoproject.fast.catalogue.model.factory.BuildingBlockFactory;
import eu.morfeoproject.fast.catalogue.util.DateFormatter;

public class BuildingBlockJSONBuilder {

	protected static final Log log = LogFactory.getLog(BuildingBlockJSONBuilder.class);
	protected static final RDFFactory rdfFactory = new MyRDFFactory();

	public static ScreenFlow buildScreenFlow(JSONObject json, URI uri) throws JSONException, IOException {
		ScreenFlow sf = BuildingBlockFactory.createScreenFlow(uri);
		parseScreenFlow(sf, json);
		return sf;
	}
	
	public static Screen buildScreen(JSONObject json, URI uri) throws JSONException, IOException, BuildingBlockException {
		Screen screen = BuildingBlockFactory.createScreen(uri);
		parseScreen(screen, json);
		return screen;
	}
	
	public static Form buildForm(JSONObject json, URI uri) throws JSONException, IOException {
		Form fe = BuildingBlockFactory.createForm(uri);
		parseScreenComponent(fe, json);
		return fe;
	}

	public static Operator buildOperator(JSONObject json, URI uri) throws JSONException, IOException {
		Operator op = BuildingBlockFactory.createOperator(uri);
		parseScreenComponent(op, json);
		return op;
	}
	
	public static BackendService buildBackendService(JSONObject json, URI uri) throws JSONException, IOException {
		BackendService bs = BuildingBlockFactory.createBackendService(uri);
		parseScreenComponent(bs, json);
		return bs;
	}
	
	public static Precondition buildPrecondition(JSONObject json, URI uri) throws JSONException, IOException {
		Precondition condition = BuildingBlockFactory.createPrecondition(uri);
		parsePrecondition(condition, json);
		return condition;
	}

	public static Postcondition buildPostcondition(JSONObject json, URI uri) throws JSONException, IOException {
		Postcondition condition = BuildingBlockFactory.createPostcondition(uri);
		parsePostcondition(condition, json);
		return condition;
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
	public static List<Condition> buildConditions(JSONArray conditionsArray) throws JSONException, IOException {
		LinkedList<Condition> conditions = new LinkedList<Condition>();
		for (int i = 0; i < conditionsArray.length(); i++) {
			JSONObject cJson = conditionsArray.getJSONObject(i);
			Condition c = BuildingBlockFactory.createCondition();
			if (cJson.has("id") && !cJson.isNull("id") && cJson.getString("id") != "") { // optional
				c.setId(cJson.getString("id"));
			}
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
			conditions.add(c);
		}
		return conditions;
	}
	
	public static List<Pipe> buildPipes(Screen screen, JSONArray pipesArray) throws JSONException, IOException {
		LinkedList<Pipe> pipes = new LinkedList<Pipe>();
		for (int i = 0; i < pipesArray.length(); i++) {
			pipes.add(parsePipe(screen, pipesArray.getJSONObject(i)));
		}
		return pipes;
	}
	
	public static List<Trigger> buildTriggers(Screen screen, JSONArray triggersArray) throws JSONException, IOException {
		LinkedList<Trigger> triggers = new LinkedList<Trigger>();
		for (int i = 0; i < triggersArray.length(); i++) {
			triggers.add(parseTrigger(screen, triggersArray.getJSONObject(i)));
		}
		return triggers;
	}

	@SuppressWarnings("unchecked")
	public static Concept buildConcept(JSONObject json, URI uri) throws JSONException, IOException {
		Concept concept = BuildingBlockFactory.createConcept(uri);

		// subClassOf
		if (json.has("subClassOf")) {
			concept.setSubClassOf(new URIImpl(json.getString("subClassOf")));
		}
		// label
		if (json.has("label")) {
			JSONObject jsonLabels = json.getJSONObject("label");
			Iterator<String> labels = jsonLabels.keys();
			for ( ; labels.hasNext(); ) {
				String key = labels.next();
				concept.getLabels().put(key, jsonLabels.getString(key));
			}
		}
		// description
		if (json.has("description")) {
			JSONObject jsonDescriptions = json.getJSONObject("description");
			Iterator<String> descriptions = jsonDescriptions.keys();
			for ( ; descriptions.hasNext(); ) {
				String key = descriptions.next();
				concept.getDescriptions().put(key, jsonDescriptions.getString(key));
			}
		}
		// tags
		concept.getTags().addAll((parseTags(json.getJSONArray("tags"))));
		// attributes
		if (json.has("attributes")) {
			JSONArray jsonAtts = json.getJSONArray("attributes");
			for (int i = 0; i < jsonAtts.length(); i++) {
				Property att = BuildingBlockFactory.createAttribute();
				JSONObject oAtt = jsonAtts.getJSONObject(i);
				if (oAtt.has("uri") && !oAtt.isNull("uri") && oAtt.getString("uri") != "")
					att.setUri(new URIImpl(oAtt.getString("uri")));
				if (oAtt.has("type") && !oAtt.isNull("type") && oAtt.getString("type") != "")
					att.setType(new URIImpl(oAtt.getString("type")));
				if (oAtt.has("subPropertyOf") && !oAtt.isNull("subPropertyOf") && oAtt.getString("subPropertyOf") != "")
					att.setSubPropertyOf(new URIImpl(oAtt.getString("subPropertyOf")));
				att.setConcept(concept);
				concept.getAttributes().add(att);
			}
		}
		
		return concept;
	}
	
	@SuppressWarnings("unchecked")
	private static void parseBuildingBlock(BuildingBlock bb, JSONObject jsonResource) throws JSONException, IOException {
		if (jsonResource.has("template")) {
			bb.setTemplate(new URIImpl(jsonResource.getString("template")));
		}
		if (jsonResource.has("label")) {
			JSONObject jsonLabels = jsonResource.getJSONObject("label");
			Iterator<String> labels = jsonLabels.keys();
			for ( ; labels.hasNext(); ) {
				String key = labels.next();
				bb.getLabels().put(key, jsonLabels.getString(key));
			}
		}
		if (jsonResource.has("description")) {
			JSONObject jsonDescriptions = jsonResource.getJSONObject("description");
			Iterator<String> descriptions = jsonDescriptions.keys();
			for ( ; descriptions.hasNext(); ) {
				String key = descriptions.next();
				bb.getDescriptions().put(key, jsonDescriptions.getString(key));
			}
		}
		//TODO fix this problem with the users and URLs
		bb.setCreator(new URIImpl("http://example.com/users/"+jsonResource.getString("creator")));
		bb.setRights(new URIImpl(jsonResource.getString("rights")));
		bb.setVersion(jsonResource.getString("version"));
		if (jsonResource.has("creationDate") && !jsonResource.isNull("creationDate") && jsonResource.getString("creationDate") != "") {
			bb.setCreationDate(DateFormatter.parseDateISO8601(jsonResource.getString("creationDate")));
		}
		bb.setIcon(new URIImpl(jsonResource.getString("icon")));
		bb.setScreenshot(new URIImpl(jsonResource.getString("screenshot")));
		bb.setHomepage(new URIImpl(jsonResource.getString("homepage")));
		bb.setId(jsonResource.getString("id"));
		bb.getTags().addAll((parseTags(jsonResource.getJSONArray("tags"))));
		if (jsonResource.has("parameterTemplate")) {
			bb.setParameterTemplate(jsonResource.getString("parameterTemplate"));
		}
	}

	private static ScreenFlow parseScreenFlow(ScreenFlow sf, JSONObject jsonScreenFlow) throws JSONException, IOException {
		// fill common properties of the resource
		parseBuildingBlock(sf, jsonScreenFlow);

		JSONArray resources = jsonScreenFlow.getJSONArray("contains");
		for (int i = 0; i < resources.length(); i++) {
			sf.getBuildingBlockList().add(new URIImpl(resources.getString(i)));
		}
		
		return sf;
	}

	private static Screen parseScreen(Screen screen, JSONObject jsonScreen) throws JSONException, IOException, BuildingBlockException {
		// fill common properties of the resource
		parseBuildingBlock(screen, jsonScreen);

		// preconditions
		JSONArray preArray = jsonScreen.getJSONArray("preconditions");
		screen.setPreconditions(new LinkedList<Condition>());
		screen.getPreconditions().addAll(buildConditions(preArray));
		// postconditions
		JSONArray postArray = jsonScreen.getJSONArray("postconditions");
		screen.setPostconditions(new LinkedList<Condition>());
		screen.getPostconditions().addAll(buildConditions(postArray));
		// code
		if (jsonScreen.has("code") && jsonScreen.has("definition")) {
			throw new BuildingBlockException("Either 'code' or 'definition' must be specified, but not both.");
		} else if (jsonScreen.has("code")) {
			if (jsonScreen.getString("code").equalsIgnoreCase("null"))
				throw new BuildingBlockException("'code' cannot be null.");
			screen.setCode(new URIImpl(jsonScreen.getString("code")));
		} else if (jsonScreen.has("definition")) {
			parseScreenDefinition(screen, jsonScreen.getJSONObject("definition"));
		} else {
			throw new BuildingBlockException("Either 'code' or 'definition' must be specified.");
		}
		return screen;
	}
	
	private static Screen parseScreenDefinition(Screen screen, JSONObject jsonDef) throws JSONException, IOException {
		// building blocks
		JSONArray bbArray = jsonDef.getJSONArray("buildingblocks");
		screen.setBuildingBlocks(new LinkedList<URI>());
		for (int i = 0; i < bbArray.length(); i++) {
			screen.getBuildingBlocks().add(rdfFactory.createURI(bbArray.getString(i)));
		}
		// pipes
		screen.setPipes(new LinkedList<Pipe>());
		screen.getPipes().addAll(buildPipes(screen, jsonDef.getJSONArray("pipes")));
		// triggers
		screen.setTriggers(new LinkedList<Trigger>());
		screen.getTriggers().addAll(buildTriggers(screen, jsonDef.getJSONArray("triggers")));
		return screen;
	}
	
	private static Precondition parsePrecondition(Precondition pre, JSONObject jsonPre) throws JSONException, IOException {
		pre.setId(jsonPre.getString("id"));
		// conditions
		JSONArray conditionsArray = jsonPre.getJSONArray("conditions");
		pre.setConditions(buildConditions(conditionsArray));
		return pre;
	}
	
	private static Postcondition parsePostcondition(Postcondition post, JSONObject jsonPost) throws JSONException, IOException {
		post.setId(jsonPost.getString("id"));
		// conditions
		JSONArray conditionsArray = jsonPost.getJSONArray("conditions");
		post.setConditions(buildConditions(conditionsArray));
		return post;
	}
	
	private static Action parseAction(JSONObject jsonAction) throws JSONException, IOException {
		Action action = BuildingBlockFactory.createAction();
		
		// name
		if (jsonAction.get("name") != null) {
			action.setName(jsonAction.getString("name"));
		}
		// preconditions
		JSONArray preArray = jsonAction.getJSONArray("preconditions");
		action.setPreconditions(new ArrayList<Condition>());
		action.getPreconditions().addAll(buildConditions(preArray));
		// uses
		action.setUses(new ArrayList<URI>());
		if (jsonAction.get("uses") != null) {
			JSONArray usesArray = jsonAction.getJSONArray("uses");
			for (int i = 0; i < usesArray.length(); i++) {
				action.getUses().add(rdfFactory.createURI(usesArray.getString(i)));
			}
		}

		return action;
	}
	
	private static Library parseLibrary(JSONObject jsonLibrary) throws JSONException, IOException {
		Library library = new Library();
		
		if (jsonLibrary.get("language") != null) {
			library.setLanguage(jsonLibrary.getString("language"));
		}
		if (jsonLibrary.get("source") != null && !jsonLibrary.getString("source").equalsIgnoreCase("null")) {
			library.setSource(new URIImpl(jsonLibrary.getString("source")));
		}
		
		return library;
	}
	
	private static Pipe parsePipe(Screen screen, JSONObject jsonPipe) throws JSONException, IOException {
		Pipe pipe = BuildingBlockFactory.createPipe(screen == null ? null : screen.getUri());
		JSONObject pipeFrom = jsonPipe.getJSONObject("from");
		JSONObject pipeTo = jsonPipe.getJSONObject("to");
		String bbFrom = pipeFrom.isNull("buildingblock") || pipeFrom.getString("buildingblock").equals("") ? null : pipeFrom.getString("buildingblock");
		String conditionFrom = pipeFrom.isNull("condition") || pipeFrom.getString("condition").equals("") ? null : pipeFrom.getString("condition");
		String bbTo = pipeTo.isNull("buildingblock") || pipeTo.getString("buildingblock").equals("") ? null : pipeTo.getString("buildingblock");
		String actionTo = pipeTo.isNull("action") || pipeTo.getString("action").equals("") ? null : pipeTo.getString("action");
		String conditionTo = pipeTo.isNull("condition") || pipeTo.getString("condition").equals("") ? null : pipeTo.getString("condition");
		pipe.setBBFrom(bbFrom == null || bbFrom.equals("") ? null : rdfFactory.createURI(bbFrom));
		pipe.setConditionFrom(conditionFrom == null || conditionFrom.equals("") ? null : conditionFrom);
		pipe.setBBTo(bbTo == null || bbTo.equals("") ? null : rdfFactory.createURI(bbTo));
		pipe.setActionTo(actionTo == null || actionTo.equals("") ? null : actionTo);
		pipe.setConditionTo(conditionTo == null || conditionTo.equals("") ? null : conditionTo);
		return pipe;
	}
	
	private static Trigger parseTrigger(Screen screen, JSONObject jsonTrigger) throws JSONException, IOException {
		Trigger trigger = new Trigger(screen == null ? null : screen.getUri());
		JSONObject from = jsonTrigger.getJSONObject("from");
		JSONObject to = jsonTrigger.getJSONObject("to");
		String bbFrom = from.isNull("buildingblock") || from.getString("buildingblock").equals("") ? null : from.getString("buildingblock");
		String nameFrom = from.isNull("name") || from.getString("name").equals("") ? null : from.getString("name");
		String bbTo = to.isNull("buildingblock") || to.getString("buildingblock").equals("") ? null : to.getString("buildingblock");
		String actionTo = to.isNull("action") || to.getString("action").equals("") ? null : to.getString("action");
		trigger.setBBFrom(bbFrom == null || bbFrom.equals("") ? null : rdfFactory.createURI(bbFrom));
		trigger.setNameFrom(nameFrom == null || nameFrom.equals("") ? null : nameFrom);
		trigger.setBBTo(bbTo == null || bbTo.equals("") ? null : rdfFactory.createURI(bbTo));
		trigger.setActionTo(actionTo == null || actionTo.equals("") ? null : actionTo);
		return trigger;
	}
	
	private static void parseScreenComponent(ScreenComponent sc, JSONObject jsonSc) throws JSONException, IOException {
		// fill common properties of the resource
		parseBuildingBlock(sc, jsonSc);
		
		// actions
		JSONArray actionsArray = jsonSc.getJSONArray("actions");
		for (int i = 0; i < actionsArray.length(); i++) {
			sc.getActions().add(parseAction(actionsArray.getJSONObject(i)));
		}
		// postconditions
		JSONArray postArray = jsonSc.getJSONArray("postconditions");
		sc.setPostconditions(new LinkedList<Condition>());
		sc.getPostconditions().addAll(buildConditions(postArray));
		// code
		if (jsonSc.get("code") != null && !jsonSc.getString("code").equalsIgnoreCase("null")) {
			sc.setCode(new URIImpl(jsonSc.getString("code")));
		}
		// libraries
		JSONArray librariesArray = jsonSc.getJSONArray("libraries");
		for (int i = 0; i < librariesArray.length(); i++) {
			sc.getLibraries().add(parseLibrary(librariesArray.getJSONObject(i)));
		}
		// triggers
		if (jsonSc.get("triggers") != null) {
			JSONArray triggersArray = jsonSc.getJSONArray("triggers");
			for (int i = 0; i < triggersArray.length(); i++) {
				sc.getTriggers().add(triggersArray.getString(i));
			}
		}
	}
	
	@SuppressWarnings("unchecked")
	private static LinkedList<CTag> parseTags(JSONArray aTag) throws JSONException {
		LinkedList<CTag> tags = new LinkedList<CTag>();
		for (int i = 0; i < aTag.length(); i++) {
			CTag tag = BuildingBlockFactory.createTag();
			JSONObject oTag = aTag.getJSONObject(i);
			if (oTag.has("means") && !oTag.isNull("means") && oTag.getString("means") != "") {
				tag.setMeans(new URIImpl(oTag.getString("means")));
			}
			if (oTag.has("label")){
				JSONObject jsonLabels = oTag.getJSONObject("label");
				Iterator<String> labels = jsonLabels.keys();
				for ( ; labels.hasNext(); ) {
					String key = labels.next();
					tag.getLabels().put(key, jsonLabels.getString(key));
				}
			}
			if (oTag.has("taggingDate") && !oTag.isNull("taggingDate") && oTag.getString("taggingDate") != "") {
				tag.setTaggingDate(DateFormatter.parseDateISO8601(oTag.getString("taggingDate")));
			}
			tags.add(tag);
		}
		return tags;
	}
	
}

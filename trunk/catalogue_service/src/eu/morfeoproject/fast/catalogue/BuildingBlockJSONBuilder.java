package eu.morfeoproject.fast.catalogue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.buildingblocks.Action;
import eu.morfeoproject.fast.catalogue.buildingblocks.BackendService;
import eu.morfeoproject.fast.catalogue.buildingblocks.BuildingBlock;
import eu.morfeoproject.fast.catalogue.buildingblocks.Concept;
import eu.morfeoproject.fast.catalogue.buildingblocks.Condition;
import eu.morfeoproject.fast.catalogue.buildingblocks.FastModelFactory;
import eu.morfeoproject.fast.catalogue.buildingblocks.Form;
import eu.morfeoproject.fast.catalogue.buildingblocks.Library;
import eu.morfeoproject.fast.catalogue.buildingblocks.Operator;
import eu.morfeoproject.fast.catalogue.buildingblocks.Pipe;
import eu.morfeoproject.fast.catalogue.buildingblocks.Postcondition;
import eu.morfeoproject.fast.catalogue.buildingblocks.Precondition;
import eu.morfeoproject.fast.catalogue.buildingblocks.Screen;
import eu.morfeoproject.fast.catalogue.buildingblocks.ScreenComponent;
import eu.morfeoproject.fast.catalogue.buildingblocks.ScreenDefinition;
import eu.morfeoproject.fast.catalogue.buildingblocks.ScreenFlow;
import eu.morfeoproject.fast.catalogue.buildingblocks.Trigger;
import eu.morfeoproject.fast.catalogue.commontag.CTag;
import eu.morfeoproject.fast.catalogue.services.CatalogueAccessPoint;
import eu.morfeoproject.fast.catalogue.util.DateFormatter;

public class BuildingBlockJSONBuilder {

	final static Logger logger = LoggerFactory.getLogger(BuildingBlockJSONBuilder.class);

	public static ScreenFlow buildScreenFlow(JSONObject json, URI uri) throws JSONException, IOException {
		ScreenFlow sf = FastModelFactory.createScreenFlow(uri);
		parseScreenFlow(sf, json);
		return sf;
	}
	
	public static Screen buildScreen(JSONObject json, URI uri) throws JSONException, IOException, BuildingBlockException {
		Screen screen = FastModelFactory.createScreen(uri);
		parseScreen(screen, json);
		return screen;
	}
	
	public static Form buildForm(JSONObject json, URI uri) throws JSONException, IOException {
		Form fe = FastModelFactory.createForm(uri);
		parseScreenComponent(fe, json);
		return fe;
	}

	public static Operator buildOperator(JSONObject json, URI uri) throws JSONException, IOException {
		Operator op = FastModelFactory.createOperator(uri);
		parseScreenComponent(op, json);
		return op;
	}
	
	public static BackendService buildBackendService(JSONObject json, URI uri) throws JSONException, IOException {
		BackendService bs = FastModelFactory.createBackendService(uri);
		parseScreenComponent(bs, json);
		return bs;
	}
	
	public static Precondition buildPrecondition(JSONObject json, URI uri) throws JSONException, IOException {
		Precondition condition = FastModelFactory.createPrecondition(uri);
		parsePrecondition(condition, json);
		return condition;
	}

	public static Postcondition buildPostcondition(JSONObject json, URI uri) throws JSONException, IOException {
		Postcondition condition = FastModelFactory.createPostcondition(uri);
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
		ArrayList<Condition> conditions = new ArrayList<Condition>();
		for (int i = 0; i < conditionsArray.length(); i++) {
			JSONObject cJson = conditionsArray.getJSONObject(i);
			Condition c = FastModelFactory.createCondition();
			if (cJson.has("id") && !cJson.isNull("id") && cJson.getString("id") != "") // optional
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
			conditions.add(c);
		}
		return conditions;
	}
	
	public static List<Pipe> buildPipes(JSONArray pipesArray) throws JSONException, IOException {
		ArrayList<Pipe> pipes = new ArrayList<Pipe>();
		for (int i = 0; i < pipesArray.length(); i++) {
			JSONObject pJson = pipesArray.getJSONObject(i);
			Pipe p = FastModelFactory.createPipe();
			JSONObject fromJson = pJson.getJSONObject("from");
			p.setIdBBFrom(fromJson.getString("buildingblock").equals("null") ? null : fromJson.getString("buildingblock"));
			p.setIdConditionFrom(fromJson.getString("condition"));
			JSONObject toJson = pJson.getJSONObject("to");
			p.setIdBBTo(toJson.getString("buildingblock").equals("null") ? null : toJson.getString("buildingblock"));
			p.setIdConditionTo(toJson.getString("condition"));
			String action = toJson.has("action") ? (toJson.getString("action").equals("null") ? null : toJson.getString("action")) : null;
			p.setIdActionTo(action);
			pipes.add(p);
		}
		return pipes;
	}

	@SuppressWarnings("unchecked")
	public static Concept buildConcept(JSONObject json, URI uri) throws JSONException, IOException {
		Concept concept = FastModelFactory.createConcept(uri);

		if (json.has("subClassOf")) {
			concept.setSubClassOf(new URIImpl(json.getString("subClassOf")));
		}
		if (json.has("label")) {
			JSONObject jsonLabels = json.getJSONObject("label");
			Iterator<String> labels = jsonLabels.keys();
			for ( ; labels.hasNext(); ) {
				String key = labels.next();
				concept.getLabels().put(key, jsonLabels.getString(key));
			}
		}
		if (json.has("description")) {
			JSONObject jsonDescriptions = json.getJSONObject("description");
			Iterator<String> descriptions = jsonDescriptions.keys();
			for ( ; descriptions.hasNext(); ) {
				String key = descriptions.next();
				concept.getDescriptions().put(key, jsonDescriptions.getString(key));
			}
		}
		concept.getTags().addAll((parseTags(json.getJSONArray("tags"))));

		return concept;
	}
	
	@SuppressWarnings("unchecked")
	private static void parseBuildingBlock(BuildingBlock bb, JSONObject jsonResource) throws JSONException, IOException {
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
		bb.setCreator(new URIImpl(CatalogueAccessPoint.getCatalogue().getServerURL()+"/users/"+jsonResource.getString("creator")));
		bb.setRights(new URIImpl(jsonResource.getString("rights")));
		bb.setVersion(jsonResource.getString("version"));
		if (jsonResource.has("creationDate") && !jsonResource.isNull("creationDate") && jsonResource.getString("creationDate") != "")
			bb.setCreationDate(DateFormatter.parseDateISO8601(jsonResource.getString("creationDate")));
		bb.setIcon(new URIImpl(jsonResource.getString("icon")));
		bb.setScreenshot(new URIImpl(jsonResource.getString("screenshot")));
		bb.setHomepage(new URIImpl(jsonResource.getString("homepage")));
		bb.setId(jsonResource.getString("id"));
		bb.getTags().addAll((parseTags(jsonResource.getJSONArray("tags"))));
		if (jsonResource.has("parameterTemplate"))
			bb.setParameterTemplate(jsonResource.getString("parameterTemplate"));
	}

	private static ScreenFlow parseScreenFlow(ScreenFlow sf, JSONObject jsonScreenFlow) throws JSONException, IOException {
		// fill common properties of the resource
		parseBuildingBlock(sf, jsonScreenFlow);

		JSONArray resources = jsonScreenFlow.getJSONArray("contains");
		for (int i = 0; i < resources.length(); i++)
			sf.getBuildingBlockList().add(new URIImpl(resources.getString(i)));
		
		return sf;
	}

	private static Screen parseScreen(Screen screen, JSONObject jsonScreen) throws JSONException, IOException, BuildingBlockException {
		// fill common properties of the resource
		parseBuildingBlock(screen, jsonScreen);

		// preconditions
		JSONArray preArray = jsonScreen.getJSONArray("preconditions");
		ArrayList<List<Condition>> preconditions = new ArrayList<List<Condition>>();
		for (int i = 0; i < preArray.length(); i++)
			preconditions.add(buildConditions(preArray.getJSONArray(i)));
		screen.setPreconditions(preconditions);
		// postconditions
		JSONArray postArray = jsonScreen.getJSONArray("postconditions");
		ArrayList<List<Condition>> postconditions = new ArrayList<List<Condition>>();
		for (int i = 0; i < postArray.length(); i++)
			postconditions.add(buildConditions(postArray.getJSONArray(i)));
		screen.setPostconditions(postconditions);
		// code
		if (jsonScreen.has("code") && jsonScreen.has("definition")) {
			throw new BuildingBlockException("Either 'code' or 'definition' must be specified, but not both.");
		} else if (jsonScreen.has("code")) {
			if (jsonScreen.getString("code").equalsIgnoreCase("null"))
				throw new BuildingBlockException("'code' cannot be null.");
			screen.setCode(new URIImpl(jsonScreen.getString("code")));
		} else if (jsonScreen.has("definition")) {
			ScreenDefinition sDef = parseScreenDefinition(jsonScreen.getJSONObject("definition"));
			screen.setDefinition(sDef);
		} else {
			throw new BuildingBlockException("Either 'code' or 'definition' must be specified.");
		}
		return screen;
	}
	
	private static ScreenDefinition parseScreenDefinition(JSONObject jsonDef) throws JSONException {
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
			pipe.setIdBBFrom(pipeFrom.isNull("buildingblock") ? null : pipeFrom.getString("buildingblock"));
			pipe.setIdConditionFrom(pipeFrom.isNull("condition") ? null : pipeFrom.getString("condition"));
			pipe.setIdBBTo(pipeTo.isNull("buildingblock") ? null : pipeTo.getString("buildingblock"));
			pipe.setIdConditionTo(pipeTo.isNull("condition") ? null : pipeTo.getString("condition"));
			pipe.setIdActionTo(pipeTo.isNull("action") ? null : pipeTo.getString("action"));
			definition.getPipes().add(pipe);
		}
		// triggers
		JSONArray triggerArray = jsonDef.getJSONArray("triggers");
		for (int i = 0; i < triggerArray.length(); i++) {
			JSONObject jsonTrigger = triggerArray.getJSONObject(i);
			JSONObject triggerFrom = jsonTrigger.getJSONObject("from");
			JSONObject triggerTo = jsonTrigger.getJSONObject("to");
			Trigger trigger = new Trigger();
			trigger.setIdBBFrom(triggerFrom.isNull("buildingblock") ? null : triggerFrom.getString("buildingblock"));
			trigger.setNameFrom(triggerFrom.isNull("name") ? null : triggerFrom.getString("name"));
			trigger.setIdBBTo(triggerTo.isNull("buildingblock") ? null : triggerTo.getString("buildingblock"));
			trigger.setIdActionTo(triggerTo.isNull("action") ? null : triggerTo.getString("action"));
			definition.getTriggers().add(trigger);
		}
		return definition;
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
		Action action = FastModelFactory.createAction();
		
		// name
		if (jsonAction.get("name") != null)
			action.setName(jsonAction.getString("name"));
		// preconditions
		JSONArray preArray = jsonAction.getJSONArray("preconditions");
		action.setPreconditions(buildConditions(preArray));
		// uses
		if (jsonAction.get("uses") != null) {
			JSONArray usesArray = jsonAction.getJSONArray("uses");
			for (int i = 0; i < usesArray.length(); i++) {
				JSONObject useObject = usesArray.getJSONObject(i);
				action.getUses().put(useObject.getString("id"), new URIImpl(useObject.getString("uri")));
			}
		}

		return action;
	}
	
	private static Library parseLibrary(JSONObject jsonLibrary) throws JSONException, IOException {
		Library library = new Library();
		
		// name
		if (jsonLibrary.get("language") != null)
			library.setLanguage(jsonLibrary.getString("language"));
		// source
		if (jsonLibrary.get("source") != null && !jsonLibrary.getString("source").equalsIgnoreCase("null"))
			library.setSource(new URIImpl(jsonLibrary.getString("source")));

		return library;
	}
	
	private static void parseScreenComponent(ScreenComponent sc, JSONObject jsonSc) throws JSONException, IOException {
		// fill common properties of the resource
		parseBuildingBlock(sc, jsonSc);
		
		// actions
		JSONArray actionsArray = jsonSc.getJSONArray("actions");
		for (int i = 0; i < actionsArray.length(); i++)
			sc.getActions().add(parseAction(actionsArray.getJSONObject(i)));
		// postconditions
		JSONArray postArray = jsonSc.getJSONArray("postconditions");
		ArrayList<List<Condition>> postconditions = new ArrayList<List<Condition>>();
		for (int i = 0; i < postArray.length(); i++)
			postconditions.add(buildConditions(postArray.getJSONArray(i)));
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
	
	@SuppressWarnings("unchecked")
	private static ArrayList<CTag> parseTags(JSONArray aTag) throws JSONException {
		ArrayList<CTag> tags = new ArrayList<CTag>(aTag.length());
		for (int i = 0; i < aTag.length(); i++) {
			CTag tag = FastModelFactory.createTag();
			JSONObject oTag = aTag.getJSONObject(i);
			if (oTag.has("means") && !oTag.isNull("means") && oTag.getString("means") != "")
				tag.setMeans(new URIImpl(oTag.getString("means")));
			if (oTag.has("label")){
				JSONObject jsonLabels = oTag.getJSONObject("label");
				Iterator<String> labels = jsonLabels.keys();
				for ( ; labels.hasNext(); ) {
					String key = labels.next();
					tag.getLabels().put(key, jsonLabels.getString(key));
				}
			}
			if (oTag.has("taggingDate") && !oTag.isNull("taggingDate") && oTag.getString("taggingDate") != "")
				tag.setTaggingDate(DateFormatter.parseDateISO8601(oTag.getString("taggingDate")));
			tags.add(tag);
		}
		return tags;
	}
	
}

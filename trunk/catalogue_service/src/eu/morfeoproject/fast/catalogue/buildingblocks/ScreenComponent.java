package eu.morfeoproject.fast.catalogue.buildingblocks;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.ontoware.rdf2go.vocabulary.XSD;

import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public abstract class ScreenComponent extends Resource {

    private URI code;
	private List<Action> actions;
	private List<Library> libraries;
	private List<List<Condition>> postconditions;
	private List<String> triggers;

	public URI getCode() {
		return code;
	}

	public void setCode(URI code) {
		this.code = code;
	}

	public List<Action> getActions() {
		if (actions == null)
			actions = new ArrayList<Action>();
		return actions;
	}

	public void setActions(List<Action> actions) {
		this.actions = actions;
	}

	public List<Library> getLibraries() {
		if (libraries == null)
			libraries = new ArrayList<Library>();
		return libraries;
	}

	public void setLibraries(List<Library> libraries) {
		this.libraries = libraries;
	}
	
	public List<List<Condition>> getPostconditions() {
		if (postconditions == null)
			postconditions = new ArrayList<List<Condition>>();
		return postconditions;
	}

	public void setPostconditions(List<List<Condition>> postconditions) {
		this.postconditions = postconditions;
	}

	public List<String> getTriggers() {
		if (triggers == null)
			triggers = new ArrayList<String>();
		return triggers;
	}

	public void setTriggers(List<String> triggers) {
		this.triggers = triggers;
	}

	@Override
	public Model createModel() {
		Model model = super.createModel();
		
		URI resourceUri = this.getUri();
		// code
		if (this.getCode() != null)
			model.addStatement(resourceUri, FGO.hasCode, this.getCode());

		// actions
		for (Action action : getActions()) {
			BlankNode actionNode = model.createBlankNode();
			model.addStatement(resourceUri, FGO.hasAction, actionNode);
			model.addStatement(actionNode, RDFS.label, action.getName());
			// preconditions
			for (Condition con : action.getPreconditions()) {
				BlankNode c = model.createBlankNode();
				model.addStatement(actionNode, FGO.hasPreCondition, c);
				model.addStatement(c, FGO.hasPatternString, model.createPlainLiteral(con.getPatternString()));
				model.addStatement(c, FGO.isPositive, model.createDatatypeLiteral(new Boolean(con.isPositive()).toString(), XSD._boolean));
				for (String key : con.getLabels().keySet())
					model.addStatement(c, RDFS.label, model.createLanguageTagLiteral(con.getLabels().get(key), key));
			}
		}
		
		// libraries
		for (Library library : getLibraries()) {
			BlankNode libNode = model.createBlankNode();
			model.addStatement(resourceUri, FGO.hasLibrary, libNode);
			model.addStatement(libNode, FGO.hasLanguage, model.createPlainLiteral(library.getLanguage()));
			model.addStatement(libNode, FGO.hasSource, library.getSource());
		}
		
		// postconditions
		for (List<Condition> conList : getPostconditions()) {
			BlankNode bag = model.createBlankNode();
			model.addStatement(bag, RDF.type, RDF.Bag);
			model.addStatement(resourceUri, FGO.hasPostCondition, bag);
			int i = 1;
			for (Condition con : conList) {
				BlankNode c = model.createBlankNode();
				model.addStatement(bag, RDF.li(i++), c);
				model.addStatement(c, FGO.hasPatternString, con.getPatternString());
				model.addStatement(c, FGO.isPositive, model.createDatatypeLiteral(new Boolean(con.isPositive()).toString(), XSD._boolean));
				for (String key : con.getLabels().keySet())
					model.addStatement(c, RDFS.label, model.createLanguageTagLiteral(con.getLabels().get(key), key));
			}
		}
		// triggers
		for (String trigger : getTriggers())
			model.addStatement(resourceUri, FGO.hasTrigger, model.createPlainLiteral(trigger));
		
		return model;
	}

	@Override
	public JSONObject toJSON() throws JSONException {
		JSONObject json = super.toJSON();

		// code
		if (getCode() == null)
			json.put("code", JSONObject.NULL);
		else
			json.put("code", getCode().toString());
		// actions
		JSONArray actionsArray = new JSONArray();
		for (Action action : getActions())
			actionsArray.put(action.toJSON());
		json.put("actions", actionsArray);
		// libraries
		JSONArray librariesArray = new JSONArray();
		for (Library library : getLibraries())
			librariesArray.put(library.toJSON());
		json.put("libraries", librariesArray);
		// postconditions
		JSONArray postArray = new JSONArray();
		for (List<Condition> conditionList : getPostconditions()) {
			JSONArray conditionArray = new JSONArray();
			for (Condition con : conditionList)
				conditionArray.put(con.toJSON());
			postArray.put(conditionArray);
		}
		json.put("postconditions", postArray);
		// triggers
		JSONArray triggersArray = new JSONArray();
		for (String trigger : getTriggers())
			triggersArray.put(trigger);
		json.put("triggers", triggersArray);

		return json;
	}

}

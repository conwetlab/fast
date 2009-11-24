package eu.morfeoproject.fast.model;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.vocabulary.FGO;

public class Screen extends WithConditions {
	
    private URI code;
    private ScreenDefinition definition;
	
	protected Screen(URI uri) {
		super();
		setUri(uri);
	}
	
	public URI getCode() {
		return code;
	}

	public void setCode(URI code) {
		this.code = code;
	}

	public ScreenDefinition getDefinition() {
		return definition;
	}

	public void setDefinition(ScreenDefinition definition) {
		this.definition = definition;
	}

	/**
	 * Transforms a Screen to a JSON object (key: value)
	 * @return a JSON object containing all info about the screen
	 * @throws JSONException 
	 */
	@Override
	public JSONObject toJSON() throws JSONException {
		JSONObject json = super.toJSON();
		if (getCode() != null) {
			json.put("code", getCode().toString());
		} else if (getDefinition() != null) {
			json.put("definition", getDefinition().toJSON());
		}
		return json;
	}
	
	@Override
	public Model createModel() {
		Model model = super.createModel();
		
		URI resourceUri = getUri();
		model.addStatement(resourceUri, RDF.type, FGO.Screen);
		if (getCode() != null) {
			model.addStatement(resourceUri, FGO.hasCode, this.getCode());
		} else if (getDefinition() != null) {
			BlankNode bnDef = model.createBlankNode();
			model.addStatement(resourceUri, FGO.hasDefinition, bnDef);
			// building blocks
			for (String id : getDefinition().getBuildingBlocks().keySet()) {
				BlankNode bnBB = model.createBlankNode();
				model.addStatement(bnDef, FGO.contains, bnBB);
				model.addStatement(bnBB, FGO.hasId, id);
				model.addStatement(bnBB, FGO.hasUri, getDefinition().getBuildingBlocks().get(id));
			}
			// pipes
			for (Pipe pipe : getDefinition().getPipes()) {
				BlankNode bnPipe = model.createBlankNode();
				model.addStatement(bnDef, FGO.contains, bnPipe);
				model.addStatement(bnPipe, FGO.hasIdBBFrom, pipe.getIdBBFrom());
				model.addStatement(bnPipe, FGO.hasIdConditionFrom, pipe.getIdConditionFrom());
				model.addStatement(bnPipe, FGO.hasIdBBTo, pipe.getIdBBTo());
				model.addStatement(bnPipe, FGO.hasIdConditionTo, pipe.getIdConditionTo());
				model.addStatement(bnPipe, FGO.hasIdActionTo, pipe.getIdActionTo());
			}
			// triggers
			//TODO define the triggers
			

		}
		
		return model;
	}

}
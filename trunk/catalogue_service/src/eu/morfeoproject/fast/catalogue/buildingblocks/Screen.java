package eu.morfeoproject.fast.catalogue.buildingblocks;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.XSD;

import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

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
	public Model toRDF2GoModel() {
		Model model = super.toRDF2GoModel();
		
		URI screenUri = getUri();
		model.addStatement(screenUri, RDF.type, FGO.Screen);
		if (getCode() != null) {
			model.addStatement(screenUri, FGO.hasCode, this.getCode());
		} else if (getDefinition() != null) {
			ScreenDefinition def = this.getDefinition();
			BlankNode bnDef = model.createBlankNode();
			model.addStatement(screenUri, FGO.hasDefinition, bnDef);
			
			// building blocks
			for (String id : def.getBuildingBlocks().keySet()) {
				BlankNode bnBB = model.createBlankNode();
				model.addStatement(bnDef, FGO.contains, bnBB);
				model.addStatement(bnBB, RDF.type, FGO.ResourceReference);
				model.addStatement(bnBB, FGO.hasId, model.createDatatypeLiteral(id, XSD._string));
				model.addStatement(bnBB, FGO.hasUri, def.getBuildingBlocks().get(id));
			}

			// pipes
			for (Pipe pipe : def.getPipes()) {
				BlankNode bnPipe = model.createBlankNode();
				model.addStatement(bnDef, FGO.contains, bnPipe);
				model.addStatement(bnPipe, RDF.type, FGO.Pipe);
				if (pipe.getIdBBFrom() != null && !pipe.getIdBBFrom().equals(""))
					model.addStatement(bnPipe, FGO.hasIdBBFrom, model.createDatatypeLiteral(pipe.getIdBBFrom(), XSD._string));
				if (pipe.getIdConditionFrom() != null && !pipe.getIdConditionFrom().equals(""))
					model.addStatement(bnPipe, FGO.hasIdConditionFrom, model.createDatatypeLiteral(pipe.getIdConditionFrom(), XSD._string));
				if (pipe.getIdBBTo() != null && !pipe.getIdBBTo().equals(""))
					model.addStatement(bnPipe, FGO.hasIdBBTo, model.createDatatypeLiteral(pipe.getIdBBTo(), XSD._string));
				if (pipe.getIdConditionTo() != null && !pipe.getIdConditionTo().equals(""))
					model.addStatement(bnPipe, FGO.hasIdConditionTo, model.createDatatypeLiteral(pipe.getIdConditionTo(), XSD._string));
				if (pipe.getIdActionTo() != null && !pipe.getIdActionTo().equals(""))
					model.addStatement(bnPipe, FGO.hasIdActionTo, model.createDatatypeLiteral(pipe.getIdActionTo(), XSD._string));
			}
			
			// triggers
			for (Trigger trigger : def.getTriggers()) {
				BlankNode bnTrigger = model.createBlankNode();
				model.addStatement(bnDef, FGO.contains, bnTrigger);
				model.addStatement(bnTrigger, RDF.type, FGO.Trigger);
				if (trigger.getIdBBFrom() != null && !trigger.getIdBBFrom().equals(""))
					model.addStatement(bnTrigger, FGO.hasIdBBFrom, model.createDatatypeLiteral(trigger.getIdBBFrom(), XSD._string));
				if (trigger.getNameFrom() != null && !trigger.getNameFrom().equals(""))
					model.addStatement(bnTrigger, FGO.hasNameFrom, model.createDatatypeLiteral(trigger.getNameFrom(), XSD._string));
				if (trigger.getIdBBTo() != null && !trigger.getIdBBTo().equals(""))
					model.addStatement(bnTrigger, FGO.hasIdBBTo, model.createDatatypeLiteral(trigger.getIdBBTo(), XSD._string));
				if (trigger.getIdBBTo() != null && !trigger.getIdBBTo().equals(""))
					model.addStatement(bnTrigger, FGO.hasIdActionTo, model.createDatatypeLiteral(trigger.getIdActionTo(), XSD._string));
			}
		}
		
		return model;
	}

}
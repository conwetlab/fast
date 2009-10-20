package eu.morfeoproject.fast.model;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;

import eu.morfeoproject.fast.vocabulary.DC;
import eu.morfeoproject.fast.vocabulary.FGO;

public abstract class PreOrPost extends Resource {
	
	private List<Condition> conditions;

	public PreOrPost(URI uri) {
		setUri(uri);
	}
	
	public List<Condition> getConditions() {
		if (conditions == null)
			conditions = new ArrayList<Condition>();
		return conditions;
	}
	
	public void setConditions(List<Condition> conditions) {
		this.conditions = conditions;
	}
	
	public Model createModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		model.setNamespace("dc", DC.NS_DC.toString());
		model.setNamespace("FGO", FGO.NS_FGO.toString());
		
		BlankNode bag = model.createBlankNode();
		model.addStatement(bag, RDF.type, RDF.Bag);
		model.addStatement(getUri(), FGO.hasCondition, bag);
		int i = 1;
		for (Condition con : conditions) {
			BlankNode c = model.createBlankNode();
			model.addStatement(bag, RDF.li(i++), c);
			model.addStatement(c, FGO.hasPatternString, con.getPatternString());
			model.addStatement(c, FGO.hasScope, con.getScope());
			for (String key : con.getLabels().keySet())
				model.addStatement(c, RDFS.label, model.createLanguageTagLiteral(con.getLabels().get(key), key));
		}
		
		return model;
	}
	
	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		try {
			if (getUri() == null)
				json.put("uri", JSONObject.NULL);
			else
				json.put("uri", getUri().toString());
			JSONArray conditions = new JSONArray();
			for (Condition con : getConditions())
				conditions.put(con.toJSON());
			json.put("conditions", conditions);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json;
	}

}

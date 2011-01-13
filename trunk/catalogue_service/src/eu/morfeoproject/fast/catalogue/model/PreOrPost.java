package eu.morfeoproject.fast.catalogue.model;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.ontoware.rdf2go.vocabulary.XSD;

import eu.morfeoproject.fast.catalogue.vocabulary.DC;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public abstract class PreOrPost extends BuildingBlock {
	
	private List<Condition> conditions;

	protected PreOrPost(URI uri) {
		super(uri);
		this.conditions = new ArrayList<Condition>();
	}
	
	public List<Condition> getConditions() {
		return conditions;
	}
	
	public void setConditions(List<Condition> conditions) {
		this.conditions = conditions;
	}
	
	public Model toRDF2GoModel() {
		super.toRDF2GoModel();
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		model.setNamespace("dc", DC.NS_DC.toString());
		model.setNamespace("fgo", FGO.NS_FGO.toString());
		
		for (Condition con : conditions) {
			URI conUri = con.getUri();
			// FIXME: should be this done here? check it!!
			if (conUri == null) {
				conUri = model.createURI(getUri() + "/conditions/" + con.getId());
				con.setUri(conUri);
			}
			model.addStatement(getUri(), FGO.hasCondition, conUri);
			model.addStatement(conUri, FGO.hasPatternString, model.createDatatypeLiteral(con.getPatternString(), XSD._string));
			model.addStatement(conUri, FGO.isPositive, model.createDatatypeLiteral(new Boolean(con.isPositive()).toString(), XSD._boolean));
			for (String key : con.getLabels().keySet()) {
				model.addStatement(conUri, RDFS.label, model.createLanguageTagLiteral(con.getLabels().get(key), key));
			}
		}

		return model;
	}
	
	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		json.put("uri", getUri() == null ? JSONObject.NULL : getUri().toString());
		json.put("id", getId() == null ? JSONObject.NULL : getId().toString());
		JSONArray conditions = new JSONArray();
		for (Condition con : getConditions())
			conditions.put(con.toJSON());
		json.put("conditions", conditions);
		return json;
	}

}

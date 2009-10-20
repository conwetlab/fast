package eu.morfeoproject.fast.model;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.vocabulary.FGO;

public class Screen extends WithConditions {
	
    private URI code;
	
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

	/**
	 * Transforms a Screen to a JSON object (key: value)
	 * @return a JSON object containing all info about the screen
	 */
	@Override
	public JSONObject toJSON() {
		JSONObject json = super.toJSON();
		try {
			if (getCode() == null)
				json.put("code", JSONObject.NULL);
			else
				json.put("code", getCode().toString());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json;
	}
	
	@Override
	public Model createModel() {
		Model model = super.createModel();
		
		URI resourceUri = this.getUri();
		model.addStatement(resourceUri, RDF.type, FGO.Screen);
		if (this.getCode() != null)
			model.addStatement(resourceUri, FGO.hasCode, this.getCode());
		
		return model;
	}

}
package eu.morfeoproject.fast.model;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.vocabulary.FGO;

public class ScreenFlow extends WithConditions {
	
	private List<URI> resources;
	
	protected ScreenFlow(URI uri) {
		setUri(uri);
	}

	public List<URI> getResources() {
		if (resources == null)
			resources = new ArrayList<URI>();
		return resources;
	}

	public void setResources(List<URI> resources) {
		this.resources = resources;
	}
	
	public JSONObject toJSON() throws JSONException {
		JSONObject json = super.toJSON();
		JSONArray resources = new JSONArray();
		for (URI r : getResources()) {
			resources.put(r);
		}
		json.put("contains", resources);
		return json;
	}
	
	public Model createModel() {
		Model model = super.createModel();		
		
		URI sfUri = this.getUri();
		model.addStatement(sfUri, RDF.type, FGO.ScreenFlow);
		for (URI r : this.getResources())
			model.addStatement(sfUri, FGO.contains, r);
		
		return model;
	}

}

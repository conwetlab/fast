package eu.morfeoproject.fast.catalogue.model;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class ScreenFlow extends WithConditions {
	
	private List<URI> buildingBlockList;
	
	public ScreenFlow(URI uri) {
		super(uri);
	}

	public List<URI> getBuildingBlockList() {
		if (buildingBlockList == null)
			buildingBlockList = new ArrayList<URI>();
		return buildingBlockList;
	}

	public void setBuildingBlockList(List<URI> resources) {
		this.buildingBlockList = resources;
	}
	
	public JSONObject toJSON() throws JSONException {
		JSONObject json = super.toJSON();
		JSONArray list = new JSONArray();
		for (URI r : getBuildingBlockList())
			list.put(r);
		json.put("contains", list);
		return json;
	}
	
	public Model toRDF2GoModel() {
		Model model = super.toRDF2GoModel();		
		
		URI sfUri = this.getUri();
		model.addStatement(sfUri, RDF.type, FGO.ScreenFlow);
		for (URI r : this.getBuildingBlockList())
			model.addStatement(sfUri, FGO.contains, r);
		
		return model;
	}

}

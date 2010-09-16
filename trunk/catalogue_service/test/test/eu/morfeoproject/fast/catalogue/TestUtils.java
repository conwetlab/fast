package test.eu.morfeoproject.fast.catalogue;

import java.io.IOException;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.BuildingBlockException;
import eu.morfeoproject.fast.catalogue.BuildingBlockJSONBuilder;
import eu.morfeoproject.fast.catalogue.buildingblocks.BuildingBlock;
import eu.morfeoproject.fast.catalogue.buildingblocks.Concept;
import eu.morfeoproject.fast.catalogue.util.Util;

public class TestUtils {

	public static BuildingBlock buildBB(URI catalogueUrl, String type, String filePath) throws BuildingBlockException, JSONException, IOException {
		JSONObject json = new JSONObject(Util.getFileContentAsString(filePath));
		URI uri = new URIImpl(catalogueUrl+"/"+type+"s/"+json.getString("id"));
		BuildingBlock bb = null;
		
		if (type.equals("screenflow")) {
			bb = BuildingBlockJSONBuilder.buildScreenFlow(json, uri);
		} else if (type.equals("screen")) {
			bb = BuildingBlockJSONBuilder.buildScreen(json, uri);
		} else if (type.equals("form")) {
			bb = BuildingBlockJSONBuilder.buildForm(json, uri);
		} else if (type.equals("operator")) {
			bb = BuildingBlockJSONBuilder.buildOperator(json, uri);
		} else if (type.equals("backendservice")) {
			bb = BuildingBlockJSONBuilder.buildBackendService(json, uri);
		} else if (type.equals("precondition")) {
			bb = BuildingBlockJSONBuilder.buildPrecondition(json, uri);
		} else if (type.equals("postcondition")) {
			bb = BuildingBlockJSONBuilder.buildPostcondition(json, uri);
		}
		
		return bb;
	}
	
}

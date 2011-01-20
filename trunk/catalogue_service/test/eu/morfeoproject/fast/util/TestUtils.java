package eu.morfeoproject.fast.util;

import java.io.IOException;
import java.net.URL;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.BuildingBlockException;
import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.CatalogueConfiguration;
import eu.morfeoproject.fast.catalogue.builder.BuildingBlockJSONBuilder;
import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.util.Util;

public class TestUtils {

	private static Catalogue catalogue;
	static {
		CatalogueConfiguration conf = new CatalogueConfiguration("repository.properties");
		catalogue = new Catalogue(conf, "test");
	}
	
	public static Catalogue getCatalogue() {
		return catalogue;
	}
	
	public static BuildingBlock buildBBFromFile(URL catalogueUrl, String type, String filePath) throws BuildingBlockException, JSONException, IOException {
		return buildBBFromText(catalogueUrl, type, Util.getFileContentAsString(filePath));
	}
	
	public static BuildingBlock buildBBFromText(URL catalogueUrl, String type, String text) throws BuildingBlockException, JSONException, IOException {
		JSONObject json = new JSONObject(text);
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
		} else if (type.equals("service")) {
			bb = BuildingBlockJSONBuilder.buildBackendService(json, uri);
		} else if (type.equals("precondition")) {
			bb = BuildingBlockJSONBuilder.buildPrecondition(json, uri);
		} else if (type.equals("postcondition")) {
			bb = BuildingBlockJSONBuilder.buildPostcondition(json, uri);
		}
		
		return bb;
	}
	
}

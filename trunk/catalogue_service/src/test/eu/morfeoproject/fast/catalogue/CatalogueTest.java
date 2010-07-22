package test.eu.morfeoproject.fast.catalogue;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import junit.framework.Assert;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.BuildingBlockJSONBuilder;
import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.buildingblocks.BackendService;
import eu.morfeoproject.fast.catalogue.buildingblocks.Condition;
import eu.morfeoproject.fast.catalogue.buildingblocks.Form;
import eu.morfeoproject.fast.catalogue.buildingblocks.Operator;
import eu.morfeoproject.fast.catalogue.buildingblocks.Postcondition;
import eu.morfeoproject.fast.catalogue.buildingblocks.Screen;
import eu.morfeoproject.fast.catalogue.buildingblocks.ScreenComponent;
import eu.morfeoproject.fast.catalogue.services.CatalogueAccessPoint;
import eu.morfeoproject.fast.catalogue.util.Util;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class CatalogueTest extends TestCase {

	private Catalogue catalogue;
	
	public CatalogueTest(String name) {
		super(name);
	}
	 
	protected void setUp() throws Exception {
        super.setUp();
		catalogue = CatalogueAccessPoint.getCatalogue();
		catalogue.clear();
	}
	
	protected void tearDown() throws Exception {
        super.tearDown();
	}

	public void check() { 
		Assert.assertTrue(catalogue.check()); 
	}
	
	public void createForm() throws Exception {
		JSONObject json = new JSONObject(Util.getFileContentAsString("test/json/forms/amazonList.json"));
		URI uri = new URIImpl("http://localhost:9000/FASTCatalogue/forms/"+json.getString("id"));
		Form f1 = BuildingBlockJSONBuilder.buildForm(json, uri);
		catalogue.addForm(f1);
		Form f2 = catalogue.getForm(uri);
		Assert.assertTrue(f1.equals(f2));
		Assert.assertEquals(f1.getActions().size(), f2.getActions().size());
		Assert.assertEquals(f1.getPostconditions().size(), f2.getPostconditions().size());
		Assert.assertEquals(f1.getTriggers().size(), f2.getTriggers().size());
	}

	public void createOperator() throws Exception {
		JSONObject json = new JSONObject(Util.getFileContentAsString("test/json/operators/amazonEbayFilter.json"));
		URI uri = new URIImpl("http://localhost:9000/FASTCatalogue/operators/"+json.getString("id"));
		Operator op1 = BuildingBlockJSONBuilder.buildOperator(json, uri);
		catalogue.addOperator(op1);
		Operator op2 = catalogue.getOperator(uri);
		Assert.assertTrue(op1.equals(op2));
		Assert.assertEquals(op1.getActions().size(), op2.getActions().size());
		Assert.assertEquals(op1.getPostconditions().size(), op2.getPostconditions().size());
		Assert.assertEquals(op1.getTriggers().size(), op2.getTriggers().size());
	}

	public void createBackendService() throws Exception {
		JSONObject json = new JSONObject(Util.getFileContentAsString("test/json/backendservices/amazonSearchService.json"));
		URI uri = new URIImpl("http://localhost:9000/FASTCatalogue/services/"+json.getString("id"));
		BackendService bs1 = BuildingBlockJSONBuilder.buildBackendService(json, uri);
		catalogue.addBackendService(bs1);
		BackendService bs2 = catalogue.getBackendService(uri);
		Assert.assertTrue(bs1.equals(bs2));
		Assert.assertEquals(bs1.getActions().size(), bs2.getActions().size());
		Assert.assertEquals(bs1.getPostconditions().size(), bs2.getPostconditions().size());
		Assert.assertEquals(bs1.getTriggers().size(), bs2.getTriggers().size());
	}

	public void createPostcondition() throws Exception {
		JSONObject json = new JSONObject(Util.getFileContentAsString("test/json/postconditions/searchCriteria.json"));
		URI uri = new URIImpl("http://localhost:9000/FASTCatalogue/postconditions/"+json.getString("id"));
		Postcondition p1 = BuildingBlockJSONBuilder.buildPostcondition(json, uri);
		catalogue.addPreOrPost(p1);
		Postcondition p2 = catalogue.getPostcondition(uri);
		Assert.assertTrue(p1.equals(p2));
		Assert.assertEquals(p1.getConditions().size(), p2.getConditions().size());
	}
	
	public void createScreen() throws Exception {
		JSONObject json = new JSONObject(Util.getFileContentAsString("test/json/screens/amazonList.json"));
		URI uri = new URIImpl("http://localhost:9000/FASTCatalogue/screens/"+json.getString("id"));
		Screen s1 = BuildingBlockJSONBuilder.buildScreen(json, uri);
		catalogue.addScreen(s1);
		Screen p2 = catalogue.getScreen(uri);
		Assert.assertTrue(s1.equals(p2));
		Assert.assertEquals(s1.getPreconditions().size(), p2.getPreconditions().size());
		Assert.assertEquals(s1.getPostconditions().size(), p2.getPostconditions().size());
		Assert.assertEquals(s1.getDefinition().getBuildingBlocks().size(), p2.getDefinition().getBuildingBlocks().size());
		Assert.assertEquals(s1.getDefinition().getPipes().size(), p2.getDefinition().getPipes().size());
		Assert.assertEquals(s1.getDefinition().getTriggers().size(), p2.getDefinition().getTriggers().size());
	}

	public void findAndCheck1() throws Exception {
		JSONObject json = null;
		json = new JSONObject(Util.getFileContentAsString("test/json/forms/amazonList.json"));
		Form form = BuildingBlockJSONBuilder.buildForm(json, new URIImpl("http://localhost:9000/FASTCatalogue/forms/"+json.getString("id")));
		json = new JSONObject(Util.getFileContentAsString("test/json/backendservices/amazonSearchService.json"));
		BackendService service = BuildingBlockJSONBuilder.buildBackendService(json, new URIImpl("http://localhost:9000/FASTCatalogue/services/"+json.getString("id")));
		catalogue.addForm(form);
		catalogue.addBackendService(service);
		ArrayList<Condition> conList = new ArrayList<Condition>();
		HashSet<ScreenComponent> all = new HashSet<ScreenComponent>();
		all.add(form);
		Set<URI> results = catalogue.findScreenComponents(null, conList, all, 0, -1, new HashSet<String>(), FGO.BackendService);
		Assert.assertEquals(1, results.size());
		Assert.assertEquals(service.getUri(), results.toArray()[0]);
	}
	
	public static Test suite(){
	    TestSuite suite = new TestSuite();
	    suite.addTest(new CatalogueTest("check"));
	    suite.addTest(new CatalogueTest("createForm"));
	    suite.addTest(new CatalogueTest("createOperator"));
	    suite.addTest(new CatalogueTest("createBackendService"));
	    suite.addTest(new CatalogueTest("createPostcondition"));
	    suite.addTest(new CatalogueTest("createScreen"));
	    suite.addTest(new CatalogueTest("findAndCheck1"));
		return suite;
	}
	
}

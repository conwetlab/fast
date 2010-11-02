package test.eu.morfeoproject.fast.catalogue;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import junit.framework.Assert;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.BuildingBlockJSONBuilder;
import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.CatalogueAccessPoint;
import eu.morfeoproject.fast.catalogue.buildingblocks.BackendService;
import eu.morfeoproject.fast.catalogue.buildingblocks.BuildingBlock;
import eu.morfeoproject.fast.catalogue.buildingblocks.Concept;
import eu.morfeoproject.fast.catalogue.buildingblocks.Condition;
import eu.morfeoproject.fast.catalogue.buildingblocks.Form;
import eu.morfeoproject.fast.catalogue.buildingblocks.Operator;
import eu.morfeoproject.fast.catalogue.buildingblocks.Postcondition;
import eu.morfeoproject.fast.catalogue.buildingblocks.Screen;
import eu.morfeoproject.fast.catalogue.buildingblocks.ScreenComponent;
import eu.morfeoproject.fast.catalogue.util.Util;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class CatalogueTest extends TestCase {

	private Catalogue catalogue;
	
	public CatalogueTest(String name) {
		super(name);
	}
	 
	protected void setUp() throws Exception {
        super.setUp();
		catalogue = CatalogueAccessPoint.getCatalogue("test");
		catalogue.clear();
	}
	
	protected void tearDown() throws Exception {
        super.tearDown();
	}
	
	public void check() { 
		Assert.assertTrue(catalogue.check()); 
	}
	
	public void createForm() throws Exception {
		Form f1 = (Form) TestUtils.buildBB(catalogue.getServerURL(), "form", "data/json/forms/amazonList.json");
		catalogue.addForm(f1);
		Form f2 = catalogue.getForm(f1.getUri());
		Assert.assertTrue(f1.equals(f2));
		Assert.assertEquals(f1.getActions().size(), f2.getActions().size());
		Assert.assertEquals(f1.getPostconditions().size(), f2.getPostconditions().size());
		Assert.assertEquals(f1.getTriggers().size(), f2.getTriggers().size());
	}

	public void createOperator() throws Exception {
		Operator op1 = (Operator) TestUtils.buildBB(catalogue.getServerURL(), "operator", "data/json/operators/amazonEbayFilter.json");
		catalogue.addOperator(op1);
		Operator op2 = catalogue.getOperator(op1.getUri());
		Assert.assertTrue(op1.equals(op2));
		Assert.assertEquals(op1.getActions().size(), op2.getActions().size());
		Assert.assertEquals(op1.getPostconditions().size(), op2.getPostconditions().size());
		Assert.assertEquals(op1.getTriggers().size(), op2.getTriggers().size());
	}

	public void createBackendService1() throws Exception {
		BackendService bs1 = (BackendService) TestUtils.buildBB(catalogue.getServerURL(), "backendservice", "data/json/backendservices/amazonSearchService.json");
		catalogue.addBackendService(bs1);
		BackendService bs2 = catalogue.getBackendService(bs1.getUri());
		Assert.assertTrue(bs1.equals(bs2));
		Assert.assertEquals(bs1.getActions().size(), bs2.getActions().size());
		Assert.assertEquals(bs1.getPostconditions().size(), bs2.getPostconditions().size());
		Assert.assertEquals(bs1.getTriggers().size(), bs2.getTriggers().size());
	}

	public void createBackendService2() throws Exception {
		BackendService bs1 = (BackendService) TestUtils.buildBB(catalogue.getServerURL(), "backendservice", "data/json/backendservices/kasselTest1.json");
		catalogue.addBackendService(bs1);
		BackendService bs2 = catalogue.getBackendService(bs1.getUri());
		Assert.assertTrue(bs1.equals(bs2));
		Assert.assertEquals(bs1.getActions().size(), bs2.getActions().size());
		Assert.assertEquals(bs1.getPostconditions().size(), bs2.getPostconditions().size());
		Assert.assertEquals(bs1.getTriggers().size(), bs2.getTriggers().size());
	}
	
	public void createPostcondition() throws Exception {
		Postcondition p1 = (Postcondition) TestUtils.buildBB(catalogue.getServerURL(), "postcondition", "data/json/postconditions/searchCriteria.json");
		catalogue.addPreOrPost(p1);
		Postcondition p2 = catalogue.getPostcondition(p1.getUri());
		Assert.assertTrue(p1.equals(p2));
		Assert.assertEquals(p1.getConditions().size(), p2.getConditions().size());
	}
	
	public void createScreen1() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonList.json");
		catalogue.addScreen(s1);
		Screen s2 = catalogue.getScreen(s1.getUri());
		Assert.assertTrue(s1.equals(s2));
		Assert.assertEquals(s1.getPreconditions().size(), s2.getPreconditions().size());
		Assert.assertEquals(s1.getPostconditions().size(), s2.getPostconditions().size());
		Assert.assertEquals(s1.getDefinition().getBuildingBlocks().size(), s2.getDefinition().getBuildingBlocks().size());
		Assert.assertEquals(s1.getDefinition().getPipes().size(), s2.getDefinition().getPipes().size());
		Assert.assertEquals(s1.getDefinition().getTriggers().size(), s2.getDefinition().getTriggers().size());
	}

	public void createScreen2() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		catalogue.addScreen(s1);
		Screen s2 = catalogue.getScreen(s1.getUri());
		Assert.assertTrue(s1.equals(s2));
		Assert.assertEquals(s1.getPreconditions().size(), s2.getPreconditions().size());
		Assert.assertEquals(s1.getPostconditions().size(), s2.getPostconditions().size());
		Assert.assertEquals(s1.getCode(), s2.getCode());
	}

	public void createConcept() throws Exception {
		JSONObject json = new JSONObject(Util.getFileContentAsString("data/json/concepts/genericSearchCriteria.json"));
		String name = json.getString("name");
		String domain = json.getString("domain");
		URI uri = catalogue.createConceptURI(name, domain);
		Concept c1 = BuildingBlockJSONBuilder.buildConcept(json, uri);
		catalogue.addConcept(c1);
		Concept c2 = catalogue.getConcept(c1.getUri());
		Assert.assertTrue(c2.getSubClassOf() == null);
		Assert.assertEquals(c1.getUri().toString(), c2.getUri().toString());
		Assert.assertEquals(c1.getDescriptions().size(), c2.getDescriptions().size());
		Assert.assertEquals(c1.getLabels().values().toArray()[0], c2.getLabels().values().toArray()[0]);
	}

	public void findAndCheck1() throws Exception {
		Form form = (Form) TestUtils.buildBB(catalogue.getServerURL(), "form", "data/json/forms/amazonList.json");
		BackendService service = (BackendService) TestUtils.buildBB(catalogue.getServerURL(), "backendservice", "data/json/backendservices/amazonSearchService.json");
		catalogue.addForm(form);
		catalogue.addBackendService(service);
		List<Condition> conList = new ArrayList<Condition>();
		Set<ScreenComponent> all = new HashSet<ScreenComponent>();
		all.add(form);
		Set<String> tags = new HashSet<String>();
		tags.add("amazon");
		Set<URI> results = catalogue.findScreenComponents(null, conList, all, 0, -1, tags, FGO.BackendService);
		Assert.assertEquals(1, results.size());
		Assert.assertEquals(service.getUri(), results.toArray()[0]);
	}
	
	public void findAndCheck2() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		Screen s2 = (Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		Screen s3 = (Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonSuggestionCode.json");
		catalogue.addScreen(s1);
		catalogue.addScreen(s2);
		catalogue.addScreen(s3);
		Set<BuildingBlock> all = new HashSet<BuildingBlock>();
		all.add(s1);
		Set<String> tags = new HashSet<String>();
		tags.add("amazon");
		Set<URI> results = catalogue.findBackwards(all, true, true, 0, -1, tags);
		Assert.assertEquals(2, results.size());
		Assert.assertTrue(results.contains(s2.getUri()));
		Assert.assertTrue(results.contains(s3.getUri()));
	}
	
	public static Test suite(){
	    TestSuite suite = new TestSuite();
	    suite.addTest(new CatalogueTest("check"));
	    suite.addTest(new CatalogueTest("createForm"));
	    suite.addTest(new CatalogueTest("createOperator"));
	    suite.addTest(new CatalogueTest("createBackendService1"));
	    suite.addTest(new CatalogueTest("createBackendService2"));
	    suite.addTest(new CatalogueTest("createPostcondition"));
	    suite.addTest(new CatalogueTest("createScreen1"));
	    suite.addTest(new CatalogueTest("createScreen2"));
	    suite.addTest(new CatalogueTest("createConcept"));
	    suite.addTest(new CatalogueTest("findAndCheck1"));
	    suite.addTest(new CatalogueTest("findAndCheck2"));
		return suite;
	}
	
}

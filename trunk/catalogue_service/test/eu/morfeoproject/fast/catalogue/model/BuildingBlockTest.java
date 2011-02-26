package eu.morfeoproject.fast.catalogue.model;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.builder.BuildingBlockJSONBuilder;
import eu.morfeoproject.fast.catalogue.util.Util;
import eu.morfeoproject.fast.util.TestUtils;

public class BuildingBlockTest {

	@Before
	public void setup() throws Exception {
        TestUtils.getCatalogue().clear();
	}
	
	@Test
	public void createForm() throws Exception {
		Form f1 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonList.json");
		TestUtils.getCatalogue().addForm(f1);
		Form f2 = TestUtils.getCatalogue().getForm(f1.getUri());
		assertTrue(f1.equals(f2));
		assertEquals(f1.getActions().size(), f2.getActions().size());
		assertEquals(f1.getPostconditions().size(), f2.getPostconditions().size());
		assertEquals(f1.getTriggers().size(), f2.getTriggers().size());
	}

	@Test
	public void createOperator() throws Exception {
		Operator op1 = (Operator) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "operator", "data/json/operators/amazonEbayFilter.json");
		TestUtils.getCatalogue().addOperator(op1);
		Operator op2 = TestUtils.getCatalogue().getOperator(op1.getUri());
		assertTrue(op1.equals(op2));
		assertEquals(op1.getActions().size(), op2.getActions().size());
		assertEquals(op1.getPostconditions().size(), op2.getPostconditions().size());
		assertEquals(op1.getTriggers().size(), op2.getTriggers().size());
	}

	@Test
	public void createBackendService1() throws Exception {
		BackendService bs1 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonSearchService.json");
		TestUtils.getCatalogue().addBackendService(bs1);
		BackendService bs2 = TestUtils.getCatalogue().getBackendService(bs1.getUri());
		assertTrue(bs1.equals(bs2));
		assertEquals(bs1.getActions().size(), bs2.getActions().size());
		assertEquals(bs1.getPostconditions().size(), bs2.getPostconditions().size());
		assertEquals(bs1.getTriggers().size(), bs2.getTriggers().size());
	}

	@Test
	public void createBackendService2() throws Exception {
		BackendService bs1 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/kasselTest1.json");
		TestUtils.getCatalogue().addBackendService(bs1);
		BackendService bs2 = TestUtils.getCatalogue().getBackendService(bs1.getUri());
		assertTrue(bs1.equals(bs2));
		assertEquals(bs1.getActions().size(), bs2.getActions().size());
		assertEquals(bs1.getPostconditions().size(), bs2.getPostconditions().size());
		assertEquals(bs1.getTriggers().size(), bs2.getTriggers().size());
	}
	
	@Test
	public void createBackendService3() throws Exception {
		BackendService bs1 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonAddOfferToCartService.json");
		TestUtils.getCatalogue().addBackendService(bs1);
		BackendService bs2 = TestUtils.getCatalogue().getBackendService(bs1.getUri());
		assertTrue(bs1.equals(bs2));
		assertEquals(bs1.getActions().size(), bs2.getActions().size());
		assertTrue(bs1.getActions().containsAll(bs2.getActions()));
		assertEquals(bs1.getPostconditions().size(), bs2.getPostconditions().size());
		assertTrue(bs1.getPostconditions().containsAll(bs2.getPostconditions()));
		assertEquals(bs1.getTriggers().size(), bs2.getTriggers().size());
		assertTrue(bs1.getTriggers().containsAll(bs2.getTriggers()));
		assertEquals(bs1.getLibraries().size(), bs2.getLibraries().size());
		assertTrue(bs1.getLibraries().containsAll(bs2.getLibraries()));
	}
	
	@Test
	public void createScreen1() throws Exception {
		// create the screen components
		Form f1 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonList.json");
		TestUtils.getCatalogue().addForm(f1);
		URI f1Clone = TestUtils.getCatalogue().cloneBuildingBlock(f1);
		BackendService bs1 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonSearchService.json");
		TestUtils.getCatalogue().addBackendService(bs1);
		URI bs1Clone = TestUtils.getCatalogue().cloneBuildingBlock(bs1);
		// creates the actual screen
		String text = Util.getFileContentAsString("data/json/screens/amazonList.json");
		text = text.replaceAll("<amazon-list-form>", f1Clone.toString()).replaceAll("<amazon-search-service>", bs1Clone.toString());
		Screen s1 = (Screen) TestUtils.buildBBFromText(TestUtils.getCatalogue().getServerURL(), "screen", text);
		TestUtils.getCatalogue().addScreen(s1);
		Screen s2 = TestUtils.getCatalogue().getScreen(s1.getUri());
		assertTrue(s1.equals(s2));
		assertEquals(s1.getPreconditions().size(), s2.getPreconditions().size());
		assertEquals(s1.getPostconditions().size(), s2.getPostconditions().size());
		assertEquals(s1.getBuildingBlocks().size(), s2.getBuildingBlocks().size());
		assertEquals(s1.getPipes().size(), s2.getPipes().size());
		assertTrue(s2.getPipes().containsAll(s1.getPipes()));
		assertEquals(s1.getTriggers().size(), s2.getTriggers().size());
		assertTrue(s2.getTriggers().containsAll(s1.getTriggers()));
		TestUtils.getCatalogue().exportToTrig("/home/ismriv/catalogue-dump.n3");
	}

	@Test
	public void createScreen2() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		TestUtils.getCatalogue().addScreen(s1);
		Screen s2 = TestUtils.getCatalogue().getScreen(s1.getUri());
		assertTrue(s1.equals(s2));
		assertEquals(s1.getPreconditions().size(), s2.getPreconditions().size());
		assertEquals(s1.getPostconditions().size(), s2.getPostconditions().size());
		assertEquals(s1.getCode(), s2.getCode());
	}
	
	@Test
	public void createScreen3() throws Exception {
		// create the screen components
		Form f1 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonList.json");
		TestUtils.getCatalogue().addForm(f1);
		URI f1Clone = TestUtils.getCatalogue().cloneBuildingBlock(f1);
		BackendService bs1 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonSearchService.json");
		TestUtils.getCatalogue().addBackendService(bs1);
		URI bs1Clone = TestUtils.getCatalogue().cloneBuildingBlock(bs1);
		// creates the actual screen
		String text = Util.getFileContentAsString("data/json/screens/screen1.json");
		text = text.replaceAll("<amazon-list-form>", f1Clone.toString()).replaceAll("<amazon-search-service>", bs1Clone.toString());
		Screen s1 = (Screen) TestUtils.buildBBFromText(TestUtils.getCatalogue().getServerURL(), "screen", text);
		TestUtils.getCatalogue().addScreen(s1);
		Screen s2 = TestUtils.getCatalogue().getScreen(s1.getUri());
		assertTrue(s1.equals(s2));
		assertEquals(s1.getPreconditions().size(), s2.getPreconditions().size());
		assertEquals(s1.getPostconditions().size(), s2.getPostconditions().size());
		assertEquals(s1.getBuildingBlocks().size(), s2.getBuildingBlocks().size());
		assertEquals(s1.getPipes().size(), s2.getPipes().size());
		assertTrue(s2.getPipes().containsAll(s1.getPipes()));
		assertEquals(s1.getTriggers().size(), s2.getTriggers().size());
		assertTrue(s2.getTriggers().containsAll(s1.getTriggers()));
	}
	
	@Test
	public void removeScreen() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		TestUtils.getCatalogue().addScreen(s1);
		TestUtils.getCatalogue().removeScreen(s1.getUri());
		try {
			TestUtils.getCatalogue().getScreen(s1.getUri());
			assertTrue(false);
		} catch (NotFoundException e) {
			assertTrue(true);
		}
		TestUtils.getCatalogue().addScreen(s1);
		Screen s2 = TestUtils.getCatalogue().getScreen(s1.getUri());
		assertEquals(s1.getUri(), s2.getUri());
	}

	@Test
	public void createScreenflow() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSearchCode.json");
		Screen s2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		Screen s3 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		TestUtils.getCatalogue().addScreens(s1, s2, s3);
		URI clone1 = TestUtils.getCatalogue().cloneBuildingBlock(s1);
		URI clone2 = TestUtils.getCatalogue().cloneBuildingBlock(s1);
		URI clone3 = TestUtils.getCatalogue().cloneBuildingBlock(s1);
		ScreenFlow sf1 = (ScreenFlow) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screenflow", "data/json/screenflows/amazonSF1.json");
		sf1.getBuildingBlocks().add(clone1);
		sf1.getBuildingBlocks().add(clone2);
		sf1.getBuildingBlocks().add(clone3);
		TestUtils.getCatalogue().addScreenFlow(sf1);
		ScreenFlow sf2 = TestUtils.getCatalogue().getScreenFlow(sf1.getUri());
		assertEquals(sf1.getUri(), sf2.getUri());
		assertEquals(sf1.getHomepage(), sf2.getHomepage());
		assertEquals(sf1.getBuildingBlocks().size(), sf2.getBuildingBlocks().size());
	}

	@Test
	public void createConcept() throws Exception {
		JSONObject json = new JSONObject(Util.getFileContentAsString("data/json/concepts/genericSearchCriteria.json"));
		String name = json.getString("name");
		String domain = json.getString("domain");
		URI uri = TestUtils.getCatalogue().createConceptURI(name, domain);
		Concept c1 = BuildingBlockJSONBuilder.buildConcept(json, uri);
		TestUtils.getCatalogue().addConcept(c1);
		Concept c2 = TestUtils.getCatalogue().getConcept(c1.getUri());
		assertTrue(c2.getSubClassOf() == null);
		assertEquals(c1.getUri().toString(), c2.getUri().toString());
		assertEquals(c1.getDescriptions().size(), c2.getDescriptions().size());
		assertEquals(c1.getLabels().values().toArray()[0], c2.getLabels().values().toArray()[0]);
	}

	@Test
	public void createScreenClone() throws Exception {
		// create the screen components
		Form f1 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonList.json");
		TestUtils.getCatalogue().addForm(f1);
		URI f1Clone = TestUtils.getCatalogue().cloneBuildingBlock(f1);
		BackendService bs1 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonSearchService.json");
		TestUtils.getCatalogue().addBackendService(bs1);
		URI bs1Clone = TestUtils.getCatalogue().cloneBuildingBlock(bs1);
		// creates the actual screen
		String text = Util.getFileContentAsString("data/json/screens/amazonList.json");
		text = text.replaceAll("<amazon-list-form>", f1Clone.toString()).replaceAll("<amazon-search-service>", bs1Clone.toString());
		Screen s1 = (Screen) TestUtils.buildBBFromText(TestUtils.getCatalogue().getServerURL(), "screen", text);
		TestUtils.getCatalogue().addScreen(s1);
		URI clone = TestUtils.getCatalogue().cloneBuildingBlock(s1);
		assertTrue(clone != null);
		Screen s1Clone = TestUtils.getCatalogue().getScreen(clone);
		assertEquals(s1.getPreconditions().size(), s1Clone.getPreconditions().size());
		assertEquals(s1.getPostconditions().size(), s1Clone.getPostconditions().size());
		assertEquals(s1.getPipes().size(), s1Clone.getPipes().size());
		assertTrue(!s1.getPipes().containsAll(s1Clone.getPipes())); // they are not identical, s1 and s1Clone URIs are different
		assertEquals(s1.getTriggers().size(), s1Clone.getTriggers().size());
		assertTrue(!s1.getTriggers().containsAll(s1Clone.getTriggers())); // they are not identical, s1 and s1Clone URIs are different
	}
	
	@Test
	public void createFormClone() throws Exception {
		Form f1 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonList.json");
		TestUtils.getCatalogue().addForm(f1);
		URI clone = TestUtils.getCatalogue().cloneBuildingBlock(f1);
		assertTrue(clone != null);
		Form f1Clone = TestUtils.getCatalogue().getForm(clone);
		assertEquals(f1.getActions().size(), f1Clone.getActions().size());
		assertEquals(f1.getTriggers().size(), f1Clone.getTriggers().size());
		assertEquals(f1.getPostconditions().size(), f1Clone.getPostconditions().size());
	}
	
	@Test
	public void createOperatorClone() throws Exception {
		//TODO implement a TEST for operator cloning
	}
	
	@Test
	public void createBackendServiceClone() throws Exception {
		//TODO implement a TEST for backend-service cloning
	}
	
	@Test
	public void getAllScreens() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSearchCode.json");
		Screen s2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		Screen s3 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		TestUtils.getCatalogue().addScreens(s1, s2, s3);
		TestUtils.getCatalogue().cloneBuildingBlock(s1);
		TestUtils.getCatalogue().cloneBuildingBlock(s1);
		TestUtils.getCatalogue().cloneBuildingBlock(s1);
		assertEquals(3, TestUtils.getCatalogue().getAllScreens().size());
	}
	
	@Test
	public void getAllForms() throws Exception {
		Form f1 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonList.json");
		Form f2 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/foafExample.json");
		TestUtils.getCatalogue().addForms(f1, f2);
		TestUtils.getCatalogue().cloneBuildingBlock(f1);
		TestUtils.getCatalogue().cloneBuildingBlock(f2);
		assertEquals(2, TestUtils.getCatalogue().getAllForms().size());
	}
	
	@Test
	public void getAllOperators() throws Exception {
		Operator o1 = (Operator) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "operator", "data/json/operators/amazonEbayFilter.json");
		TestUtils.getCatalogue().addOperator(o1);
		TestUtils.getCatalogue().cloneBuildingBlock(o1);
		assertEquals(1, TestUtils.getCatalogue().getAllOperators().size());
	}
	
	@Test
	public void getAllBackendServices() throws Exception {
		BackendService bs1 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonLookupService.json");
		BackendService bs2 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonSearchService.json");
		TestUtils.getCatalogue().addBackendServices(bs1, bs2);
		TestUtils.getCatalogue().cloneBuildingBlock(bs1);
		TestUtils.getCatalogue().cloneBuildingBlock(bs2);
		assertEquals(2, TestUtils.getCatalogue().getAllBackendServices().size());
	}
	
}
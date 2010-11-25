package eu.morfeoproject.fast.catalogue.model;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.builder.BuildingBlockJSONBuilder;
import eu.morfeoproject.fast.catalogue.model.BackendService;
import eu.morfeoproject.fast.catalogue.model.Concept;
import eu.morfeoproject.fast.catalogue.model.Form;
import eu.morfeoproject.fast.catalogue.model.Operator;
import eu.morfeoproject.fast.catalogue.model.Postcondition;
import eu.morfeoproject.fast.catalogue.model.Screen;
import eu.morfeoproject.fast.catalogue.util.Util;
import eu.morfeoproject.fast.util.TestUtils;

public class BuildingBlockTest {

	@Before
	public void setup() throws Exception {
        TestUtils.getCatalogue().clear();
	}
	
	@Test
	public void createForm() throws Exception {
		Form f1 = (Form) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonList.json");
		TestUtils.getCatalogue().addForm(f1);
		Form f2 = TestUtils.getCatalogue().getForm(f1.getUri());
		assertTrue(f1.equals(f2));
		assertEquals(f1.getActions().size(), f2.getActions().size());
		assertEquals(f1.getPostconditions().size(), f2.getPostconditions().size());
		assertEquals(f1.getTriggers().size(), f2.getTriggers().size());
	}

	@Test
	public void createOperator() throws Exception {
		Operator op1 = (Operator) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "operator", "data/json/operators/amazonEbayFilter.json");
		TestUtils.getCatalogue().addOperator(op1);
		Operator op2 = TestUtils.getCatalogue().getOperator(op1.getUri());
		assertTrue(op1.equals(op2));
		assertEquals(op1.getActions().size(), op2.getActions().size());
		assertEquals(op1.getPostconditions().size(), op2.getPostconditions().size());
		assertEquals(op1.getTriggers().size(), op2.getTriggers().size());
	}

	@Test
	public void createBackendService1() throws Exception {
		BackendService bs1 = (BackendService) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "backendservice", "data/json/backendservices/amazonSearchService.json");
		TestUtils.getCatalogue().addBackendService(bs1);
		BackendService bs2 = TestUtils.getCatalogue().getBackendService(bs1.getUri());
		assertTrue(bs1.equals(bs2));
		assertEquals(bs1.getActions().size(), bs2.getActions().size());
		assertEquals(bs1.getPostconditions().size(), bs2.getPostconditions().size());
		assertEquals(bs1.getTriggers().size(), bs2.getTriggers().size());
	}

	@Test
	public void createBackendService2() throws Exception {
		BackendService bs1 = (BackendService) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "backendservice", "data/json/backendservices/kasselTest1.json");
		TestUtils.getCatalogue().addBackendService(bs1);
		BackendService bs2 = TestUtils.getCatalogue().getBackendService(bs1.getUri());
		assertTrue(bs1.equals(bs2));
		assertEquals(bs1.getActions().size(), bs2.getActions().size());
		assertEquals(bs1.getPostconditions().size(), bs2.getPostconditions().size());
		assertEquals(bs1.getTriggers().size(), bs2.getTriggers().size());
	}
	
	@Test
	public void createPostcondition() throws Exception {
		Postcondition p1 = (Postcondition) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "postcondition", "data/json/postconditions/searchCriteria.json");
		TestUtils.getCatalogue().addPreOrPost(p1);
		Postcondition p2 = TestUtils.getCatalogue().getPostcondition(p1.getUri());
		assertTrue(p1.equals(p2));
		assertEquals(p1.getConditions().size(), p2.getConditions().size());
	}
	
	@Test
	public void createScreen1() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonList.json");
		TestUtils.getCatalogue().addScreen(s1);
		Screen s2 = TestUtils.getCatalogue().getScreen(s1.getUri());
		assertTrue(s1.equals(s2));
		assertEquals(s1.getPreconditions().size(), s2.getPreconditions().size());
		assertEquals(s1.getPostconditions().size(), s2.getPostconditions().size());
		assertEquals(s1.getDefinition().getBuildingBlocks().size(), s2.getDefinition().getBuildingBlocks().size());
		assertEquals(s1.getDefinition().getPipes().size(), s2.getDefinition().getPipes().size());
		assertEquals(s1.getDefinition().getTriggers().size(), s2.getDefinition().getTriggers().size());
	}

	@Test
	public void createScreen2() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		TestUtils.getCatalogue().addScreen(s1);
		Screen s2 = TestUtils.getCatalogue().getScreen(s1.getUri());
		assertTrue(s1.equals(s2));
		assertEquals(s1.getPreconditions().size(), s2.getPreconditions().size());
		assertEquals(s1.getPostconditions().size(), s2.getPostconditions().size());
		assertEquals(s1.getCode(), s2.getCode());
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
	public void removeScreen() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		TestUtils.getCatalogue().addScreen(s1);
		TestUtils.getCatalogue().removeScreen(s1.getUri());
		try {
			TestUtils.getCatalogue().getScreen(s1.getUri());
		} catch (NotFoundException e) {
			assertTrue(true);
		}
		TestUtils.getCatalogue().addScreen(s1);
		Screen s2 = TestUtils.getCatalogue().getScreen(s1.getUri());
		assertEquals(s1.getUri(), s2.getUri());
	}
	
}

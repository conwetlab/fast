package eu.morfeoproject.fast.catalogue.model;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.model.factory.BuildingBlockFactory;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;
import eu.morfeoproject.fast.util.TestUtils;

public class FindCheckTest {

	@Before
	public void setup() throws Exception {
        TestUtils.getCatalogue().clear();
	}
	
	@Test
	public void testFindAndCheck1() throws Exception {
		Form form = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonList.json");
		BackendService service = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonSearchService.json");
		TestUtils.getCatalogue().addForm(form);
		TestUtils.getCatalogue().addBackendService(service);
		TestUtils.getCatalogue().createCopy(form);
		TestUtils.getCatalogue().createCopy(form);
		TestUtils.getCatalogue().createCopy(service);
		TestUtils.getCatalogue().createCopy(service);
		TestUtils.getCatalogue().createCopy(service);
		
		ArrayList<Condition> conList = new ArrayList<Condition>();
		ArrayList<ScreenComponent> all = new ArrayList<ScreenComponent>();
		all.add(form);
		ArrayList<String> tags = new ArrayList<String>();
		tags.add("amazon");
		List<URI> results = TestUtils.getCatalogue().findScreenComponents(null, conList, all, 0, -1, tags, FGO.BackendService);
		assertEquals(1, results.size());
		assertEquals(service.getUri(), results.toArray()[0]);
	}
	
	@Test
	public void testFindAndCheck2() throws Exception {
		// sets up the catalogue
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		Screen s2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		Screen s3 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSuggestionCode.json");
		TestUtils.getCatalogue().addScreens(s1, s2, s3);
		
		// query the catalogue
		ArrayList<Screen> all = new ArrayList<Screen>();
		all.add(s1);
		ArrayList<String> tags = new ArrayList<String>();
		tags.add("amazon");
		List<URI> results = TestUtils.getCatalogue().findBackwards(all, new ArrayList<Condition>(), new ArrayList<Condition>(), true, true, 0, -1, tags);
		assertEquals(2, results.size());
		assertTrue(results.contains(s2.getUri()));
		assertTrue(results.contains(s3.getUri()));
	}
	
	/**
	 * The "canvas" contains just a postcondition. Need to find screens to satisfy the postconditions
	 * @throws Exception
	 */
	@Test
	public void testFindAndCheck3() throws Exception {
		// sets up the catalogue
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		Screen s2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		Screen s3 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSuggestionCode.json");
		TestUtils.getCatalogue().addScreens(s1, s2, s3);
		
		// query the catalogue
		ArrayList<Screen> all = new ArrayList<Screen>();
		ArrayList<String> tags = new ArrayList<String>();
		ArrayList<Condition> postconditions = new ArrayList<Condition>();
		Condition condition = BuildingBlockFactory.createCondition();
		condition.setPatternString("?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://aws.amazon.com/AWSECommerceService#Item");
		condition.setPositive(true);
		postconditions.add(condition);
		List<URI> results = TestUtils.getCatalogue().findBackwards(all, new ArrayList<Condition>(), postconditions, true, true, 0, -1, tags);
		assertEquals(2, results.size());
		assertTrue(results.contains(s2.getUri()));
		assertTrue(results.contains(s3.getUri()));
		
		condition.setPatternString("?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://aws.amazon.com/AWSECommerceService#ShoppingCart");
		results = TestUtils.getCatalogue().findBackwards(all, new ArrayList<Condition>(), postconditions, true, true, 0, -1, tags);
		assertEquals(1, results.size());
		assertTrue(results.contains(s1.getUri()));
	}
	
	/**
	 * The "canvas" contains just a precondition, a screen satisfied by the precondition, and another screen not reachable
	 * @throws Exception
	 */
	@Test
	public void testFindAndCheck4() throws Exception {
		// sets up the catalogue
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSearchCode.json");
		Screen s2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		Screen s3 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		Screen s4 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonShoppingCode.json");
		TestUtils.getCatalogue().addScreens(s1, s2, s3, s4);
		
		// query the catalogue
		ArrayList<Screen> all = new ArrayList<Screen>();
		all.add(s2);
		all.add(s4);
		ArrayList<String> tags = new ArrayList<String>();
		ArrayList<Condition> preconditions = new ArrayList<Condition>();
		Condition condition = BuildingBlockFactory.createCondition();
		condition.setPatternString("?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://aws.amazon.com/AWSECommerceService#SearchCriteria");
		condition.setPositive(true);
		preconditions.add(condition);
		List<URI> results = TestUtils.getCatalogue().findBackwards(all, preconditions, new ArrayList<Condition>(), true, true, 0, -1, tags);
		assertEquals(1, results.size());
		assertTrue(results.contains(s3.getUri()));
	}

}

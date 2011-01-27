package eu.morfeoproject.fast.catalogue.model;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.Constants;
import eu.morfeoproject.fast.catalogue.model.factory.BuildingBlockFactory;
import eu.morfeoproject.fast.util.TestUtils;

public class FindCheckTest {

	@Before
	public void setup() throws Exception {
        TestUtils.getCatalogue().clear();
	}
	
	@Test
	public void testFindAndCheck1() throws Exception {
		Form form = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonList.json");
		BackendService s1 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonSearchService.json");
		BackendService s2 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/foafExample.json");
		BackendService s3 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/kasselTest1.json");
		TestUtils.getCatalogue().addForm(form);
		TestUtils.getCatalogue().addBackendServices(s1, s2, s3);
		Form formCopy = TestUtils.getCatalogue().getForm(TestUtils.getCatalogue().cloneBuildingBlock(form));
		TestUtils.getCatalogue().cloneBuildingBlock(s1);
		TestUtils.getCatalogue().cloneBuildingBlock(s2);
		TestUtils.getCatalogue().cloneBuildingBlock(s3);
		
		ArrayList<Condition> conList = new ArrayList<Condition>();
		for (Action action : form.getActions()) {
			conList.addAll(action.getPreconditions());
		}
		conList.addAll(form.getPostconditions());
		ArrayList<ScreenComponent> all = new ArrayList<ScreenComponent>();
		all.add(formCopy);
		ArrayList<String> tags = new ArrayList<String>();
		
		List<URI> results = TestUtils.getCatalogue().findScreenComponents(null, conList, all, 0, -1, tags, Constants.PREPOST);
		assertEquals(2, results.size());
		assertTrue(results.contains(s1.getUri()));
		assertTrue(results.contains(s3.getUri()));

		tags.add("amazon");
		results = TestUtils.getCatalogue().findScreenComponents(null, conList, all, 0, -1, tags, Constants.PREPOST);
		assertEquals(1, results.size());
		assertTrue(results.contains(s1.getUri()));
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
		ArrayList<Screen> canvas = new ArrayList<Screen>();
		ArrayList<String> tags = new ArrayList<String>();
		ArrayList<Condition> postconditions = new ArrayList<Condition>();
		Condition condition = BuildingBlockFactory.createCondition();
		condition.setPatternString("?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://fast.morfeo-project.org/ontologies/amazon#Item");
		condition.setPositive(true);
		postconditions.add(condition);
		List<URI> results = TestUtils.getCatalogue().findBackwards(canvas, new ArrayList<Condition>(), postconditions, true, true, 0, -1, tags);
		assertEquals(2, results.size());
		assertTrue(results.contains(s2.getUri()));
		assertTrue(results.contains(s3.getUri()));
		
		condition.setPatternString("?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://fast.morfeo-project.org/ontologies/amazon#ShoppingCart");
		results = TestUtils.getCatalogue().findBackwards(canvas, new ArrayList<Condition>(), postconditions, true, true, 0, -1, tags);
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
		URI s1Copy = TestUtils.getCatalogue().cloneBuildingBlock(s1);
		URI s2Copy = TestUtils.getCatalogue().cloneBuildingBlock(s2);
		URI s3Copy = TestUtils.getCatalogue().cloneBuildingBlock(s3);
		URI s4Copy = TestUtils.getCatalogue().cloneBuildingBlock(s4);
		
		// query the catalogue
		ArrayList<Screen> canvas = new ArrayList<Screen>();
		canvas.add(TestUtils.getCatalogue().getScreen(s2Copy));
		canvas.add(TestUtils.getCatalogue().getScreen(s4Copy));
		ArrayList<String> tags = new ArrayList<String>();
		ArrayList<Condition> preconditions = new ArrayList<Condition>();
		Condition condition = BuildingBlockFactory.createCondition();
		condition.setPatternString("?x http://www.w3.org/1999/02/22-rdf-syntax-ns#type http://fast.morfeo-project.org/ontologies/amazon#SearchRequest");
		condition.setPositive(true);
		preconditions.add(condition);
		List<URI> results = TestUtils.getCatalogue().findBackwards(canvas, preconditions, new ArrayList<Condition>(), true, true, 0, -1, tags);
		assertEquals(1, results.size());
		assertTrue(results.contains(s3.getUri()));
	}

	@Test
	public void testFindAndCheck5() throws Exception {
		//----- sets up the catalogue -----//
		Form f1 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonList.json");
		Form f2 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonOrder.json");
		Form f3 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonPrice.json");
		Form f4 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonProduct.json");
		Form f5 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonSearch.json");
		Form f6 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonShopping.json");
		Form f7 = (Form) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "form", "data/json/forms/amazonSuggestion.json");
		BackendService bs1 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonAddItemToCartService.json");
		BackendService bs2 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonAddOfferToCartService.json");
		BackendService bs3 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonClearCartService.json");
		BackendService bs4 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonLookupService.json");
		BackendService bs5 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonPriceComparativeService.json");
		BackendService bs6 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonSearchCartService.json");
		BackendService bs7 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonSearchService.json");
		BackendService bs8 = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "service", "data/json/backendservices/amazonSuggestionListService.json");
		TestUtils.getCatalogue().addForms(f1, f2, f3, f4, f5, f6, f7);
		TestUtils.getCatalogue().addBackendServices(bs1, bs2, bs3, bs4, bs5, bs6, bs7, bs8);
		
		HashMap<String, String> bbMap = new HashMap<String, String>();
		bbMap.put("<search-form>", TestUtils.getCatalogue().cloneBuildingBlock(f5).toString());
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSearch.json.composed", bbMap);
		bbMap.clear();
		bbMap.put("<list-form>", TestUtils.getCatalogue().cloneBuildingBlock(f1).toString());
		bbMap.put("<search-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs7).toString());
		Screen s2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonList.json.composed", bbMap);
		bbMap.clear();
		bbMap.put("<product-form>", TestUtils.getCatalogue().cloneBuildingBlock(f4).toString());
		bbMap.put("<itemlookup-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs4).toString());
		bbMap.put("<additemtocart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs1).toString());
		Screen s3 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProduct.json.composed", bbMap);
		bbMap.clear();
		bbMap.put("<shopping-form>", TestUtils.getCatalogue().cloneBuildingBlock(f6).toString());
		bbMap.put("<searchcart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs6).toString());
		bbMap.put("<updatecart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs1).toString());
		bbMap.put("<clearcart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs3).toString());
		Screen s4 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonShopping.json.composed", bbMap);
		bbMap.clear();
		bbMap.put("<price-form>", TestUtils.getCatalogue().cloneBuildingBlock(f3).toString());
		bbMap.put("<price-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs5).toString());
		bbMap.put("<addoffertocart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs2).toString());
		Screen s5 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonPrice.json.composed", bbMap);
		bbMap.clear();
		bbMap.put("<suggestion-form>", TestUtils.getCatalogue().cloneBuildingBlock(f7).toString());
		bbMap.put("<suggestion-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs8).toString());
		Screen s6 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSuggestion.json.composed", bbMap);
		bbMap.clear();
		bbMap.put("<order-form>", TestUtils.getCatalogue().cloneBuildingBlock(f2).toString());
		Screen s7 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonOrder.json.composed", bbMap);
		TestUtils.getCatalogue().addScreens(s1, s2, s3, s4, s5, s6, s7);
		assertEquals(7, TestUtils.getCatalogue().getAllScreens().size());
		
		// repeat some screens to create patterns for the recommender
		bbMap.clear();
		bbMap.put("<list-form>", TestUtils.getCatalogue().cloneBuildingBlock(f1).toString());
		bbMap.put("<search-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs7).toString());
		Screen sR1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonList.json.composed", bbMap);
		sR1.setId("1001");
		sR1.setUri(new URIImpl("http://localhost:8080/FASTCatalogue/screens/1001"));
		bbMap.clear();
		bbMap.put("<list-form>", TestUtils.getCatalogue().cloneBuildingBlock(f1).toString());
		bbMap.put("<search-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs7).toString());
		Screen sR2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonList.json.composed", bbMap);
		sR2.setId("1002");
		sR2.setUri(new URIImpl("http://localhost:8080/FASTCatalogue/screens/1002"));
		TestUtils.getCatalogue().addScreens(sR1, sR2);
		bbMap.clear();
		bbMap.put("<shopping-form>", TestUtils.getCatalogue().cloneBuildingBlock(f6).toString());
		bbMap.put("<searchcart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs6).toString());
		bbMap.put("<updatecart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs1).toString());
		bbMap.put("<clearcart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs3).toString());
		Screen sR3 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonShopping.json.composed", bbMap);
		sR3.setId("1003");
		sR3.setUri(new URIImpl("http://localhost:8080/FASTCatalogue/screens/1003"));
		bbMap.clear();
		bbMap.put("<shopping-form>", TestUtils.getCatalogue().cloneBuildingBlock(f6).toString());
		bbMap.put("<searchcart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs6).toString());
		bbMap.put("<updatecart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs1).toString());
		bbMap.put("<clearcart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs3).toString());
		Screen sR4 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonShopping.json.composed", bbMap);
		sR4.setId("1004");
		sR4.setUri(new URIImpl("http://localhost:8080/FASTCatalogue/screens/1004"));
		bbMap.clear();
		bbMap.put("<shopping-form>", TestUtils.getCatalogue().cloneBuildingBlock(f6).toString());
		bbMap.put("<searchcart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs6).toString());
		bbMap.put("<updatecart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs1).toString());
		bbMap.put("<clearcart-service>", TestUtils.getCatalogue().cloneBuildingBlock(bs3).toString());
		Screen sR5 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonShopping.json.composed", bbMap);
		sR5.setId("1005");
		sR5.setUri(new URIImpl("http://localhost:8080/FASTCatalogue/screens/1005"));
		TestUtils.getCatalogue().addScreens(sR3, sR4, sR5);
		assertEquals(12, TestUtils.getCatalogue().getAllScreens().size());

		//----- prepare the request to the catalogue -----//
		ScreenComponent bs7Clone = TestUtils.getCatalogue().getScreenComponent(TestUtils.getCatalogue().cloneBuildingBlock(bs7));
		ScreenComponent bs6Clone = TestUtils.getCatalogue().getScreenComponent(TestUtils.getCatalogue().cloneBuildingBlock(bs6));
		ArrayList<ScreenComponent> scList = new ArrayList<ScreenComponent>();
		scList.add(bs7Clone);
		scList.add(bs6Clone);
		ArrayList<Condition> conList = new ArrayList<Condition>();
		for (ScreenComponent sc : scList) {
			for (Action action : sc.getActions()) {
				for (Condition condition : action.getPreconditions()) {
					conList.add(condition);
				}
			}
			for (Condition condition : sc.getPostconditions()) {
				conList.add(condition);
			}
		}
		
		//----- search bb compatibles in terms of their pre/postconditions (order is not important) -----//
		List<URI> results = TestUtils.getCatalogue().findScreenComponents(null, conList, scList, 0, -1, null, Constants.PREPOST);
		assertEquals(10, results.size());
		assertTrue(results.contains(f1.getUri()));
		assertTrue(results.contains(f5.getUri()));
		assertTrue(results.contains(f3.getUri()));
		assertTrue(results.contains(f4.getUri()));
		assertTrue(results.contains(f6.getUri()));
		assertTrue(results.contains(f7.getUri()));
		assertTrue(results.contains(bs1.getUri()));
		assertTrue(results.contains(bs2.getUri()));
		assertTrue(results.contains(bs3.getUri()));
		assertTrue(results.contains(bs4.getUri()));

		//----- search bb compatibles in terms of their pre/postconditions (order is important) -----//
		results = TestUtils.getCatalogue().findScreenComponents(null, conList, scList, 0, -1, null, Constants.PATTERNS);
		assertEquals(4, results.size());
		assertTrue(results.get(0).equals(f6.getUri()));
		assertTrue(results.get(1).equals(bs1.getUri()));
		assertTrue(results.get(2).equals(bs3.getUri()));
		assertTrue(results.get(3).equals(f1.getUri()));

		//----- both strategies combined (order is important) -----//
		results = TestUtils.getCatalogue().findScreenComponents(null, conList, scList, 0, -1, null, Constants.PREPOST + Constants.PATTERNS);
		assertEquals(10, results.size());
		assertTrue(results.get(0).equals(f6.getUri()));
		assertTrue(results.get(1).equals(bs1.getUri()));
		assertTrue(results.get(2).equals(bs3.getUri()));
		assertTrue(results.get(3).equals(f1.getUri()));
		assertTrue(results.contains(f5.getUri()));
		assertTrue(results.contains(f3.getUri()));
		assertTrue(results.contains(f4.getUri()));
		assertTrue(results.contains(f7.getUri()));
		assertTrue(results.contains(bs2.getUri()));
		assertTrue(results.contains(bs4.getUri()));
	}

}

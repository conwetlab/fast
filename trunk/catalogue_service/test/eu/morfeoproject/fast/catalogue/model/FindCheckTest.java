package eu.morfeoproject.fast.catalogue.model;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.Before;
import org.junit.Test;
import org.ontoware.rdf2go.model.node.URI;

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
		BackendService service = (BackendService) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "backendservice", "data/json/backendservices/amazonSearchService.json");
		TestUtils.getCatalogue().addForm(form);
		TestUtils.getCatalogue().addBackendService(service);
		List<Condition> conList = new ArrayList<Condition>();
		Set<ScreenComponent> all = new HashSet<ScreenComponent>();
		all.add(form);
		Set<String> tags = new HashSet<String>();
		tags.add("amazon");
		Set<URI> results = TestUtils.getCatalogue().findScreenComponents(null, conList, all, 0, -1, tags, FGO.BackendService);
		assertEquals(1, results.size());
		assertEquals(service.getUri(), results.toArray()[0]);
	}
	
	@Test
	public void testFindAndCheck2() throws Exception {
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		Screen s2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		Screen s3 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSuggestionCode.json");
		TestUtils.getCatalogue().addScreen(s1);
		TestUtils.getCatalogue().addScreen(s2);
		TestUtils.getCatalogue().addScreen(s3);
		Set<BuildingBlock> all = new HashSet<BuildingBlock>();
		all.add(s1);
		Set<String> tags = new HashSet<String>();
		tags.add("amazon");
		Set<URI> results = TestUtils.getCatalogue().findBackwards(all, true, true, 0, -1, tags);
		assertEquals(2, results.size());
		assertTrue(results.contains(s2.getUri()));
		assertTrue(results.contains(s3.getUri()));
	}
	
}

package eu.morfeoproject.fast.catalogue.planner;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;

import org.junit.Before;
import org.junit.Test;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.model.Screen;
import eu.morfeoproject.fast.util.TestUtils;

public class PlannerTest {

	@Before
	public void setup() throws Exception {
        TestUtils.getCatalogue().clear();
	}
	
	@Test
	public void singleGoalPlanTest() throws Exception {
		Screen goal = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonOrderCode.json");
		TestUtils.getCatalogue().addScreen(goal);
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSearchCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonPriceCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonShoppingCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSuggestionCode.json"));

		assertEquals(7, TestUtils.getCatalogue().getAllScreens().size());
		ArrayList<BuildingBlock> canvas = new ArrayList<BuildingBlock>();
		canvas.add(goal);
		long start = System.currentTimeMillis();
		assertEquals(4, TestUtils.getCatalogue().searchPlans(goal.getUri(), canvas).size());
		long end = System.currentTimeMillis() - start;
		System.out.println("Plan generation took: " + end + "ms");
	}
	
	@Test
	public void multiGoalPlanTest() throws Exception {
		Screen goal1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonOrderCode.json");
		Screen goal2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/getWineList.json");
		ArrayList<URI> goalList = new ArrayList<URI>();
		goalList.add(goal1.getUri());
		goalList.add(goal2.getUri());
		TestUtils.getCatalogue().addScreens(goal1, goal2);
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSearchCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonPriceCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonShoppingCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSuggestionCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/getWineMakers.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/getFOAFPersons.json"));

		assertEquals(10, TestUtils.getCatalogue().getAllScreens().size());
		ArrayList<BuildingBlock> canvas = new ArrayList<BuildingBlock>();
		canvas.add(goal1);
		canvas.add(goal2);
		long start = System.currentTimeMillis();
		assertEquals(8, TestUtils.getCatalogue().searchPlans(goalList, canvas).size());
		long end = System.currentTimeMillis() - start;
		System.out.println("Plan generation took: " + end + "ms");
	}
	
}

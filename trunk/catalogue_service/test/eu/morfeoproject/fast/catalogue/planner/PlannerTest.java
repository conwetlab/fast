package eu.morfeoproject.fast.catalogue.planner;

import static org.junit.Assert.assertEquals;

import java.util.HashSet;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.model.Screen;
import eu.morfeoproject.fast.util.TestUtils;

public class PlannerTest {

	@Before
	public void setup() throws Exception {
        TestUtils.getCatalogue().clear();
	}
	
	@Test
	public void runPlanner() throws Exception {
		Screen goal = (Screen) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonOrderCode.json");
		TestUtils.getCatalogue().addScreen(goal);
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSearchCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonPriceCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonShoppingCode.json"));
		TestUtils.getCatalogue().addScreen((Screen) TestUtils.buildBB(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSuggestionCode.json"));

		assertEquals(7, TestUtils.getCatalogue().getAllScreens().size());
		HashSet<BuildingBlock> canvas = new HashSet<BuildingBlock>();
		canvas.add(goal);
		List<Plan> plans = TestUtils.getCatalogue().searchPlans(goal.getUri(), canvas);
		assertEquals(4, plans.size());
	}
	
}

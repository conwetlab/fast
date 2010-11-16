package test.eu.morfeoproject.fast.catalogue.planner;

import java.util.HashSet;
import java.util.List;

import junit.framework.Assert;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;
import test.eu.morfeoproject.fast.catalogue.TestUtils;
import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.CatalogueAccessPoint;
import eu.morfeoproject.fast.catalogue.buildingblocks.BuildingBlock;
import eu.morfeoproject.fast.catalogue.buildingblocks.Screen;
import eu.morfeoproject.fast.catalogue.planner.Plan;

public class PlannerTest extends TestCase {

	private Catalogue catalogue;
	
	public PlannerTest(String name) {
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
	
	public void runPlanner() throws Exception {
		Screen goal = (Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonOrderCode.json");
		catalogue.addScreen(goal);
		catalogue.addScreen((Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonSearchCode.json"));
		catalogue.addScreen((Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonListCode.json"));
		catalogue.addScreen((Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonProductCode.json"));
		catalogue.addScreen((Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonPriceCode.json"));
		catalogue.addScreen((Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonShoppingCode.json"));
		catalogue.addScreen((Screen) TestUtils.buildBB(catalogue.getServerURL(), "screen", "data/json/screens/amazonSuggestionCode.json"));

		Assert.assertEquals(7, catalogue.getScreens().size());
		HashSet<BuildingBlock> canvas = new HashSet<BuildingBlock>();
		canvas.add(goal);
		List<Plan> plans = catalogue.searchPlans(goal.getUri(), canvas);
		Assert.assertEquals(4, plans.size());
	}
	
	public static Test suite(){
	    TestSuite suite = new TestSuite();
	    suite.addTest(new PlannerTest("runPlanner"));
		return suite;
	}
	
}

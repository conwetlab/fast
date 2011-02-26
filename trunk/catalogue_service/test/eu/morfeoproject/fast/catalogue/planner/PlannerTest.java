/**
 * Copyright (c) 2008-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
package eu.morfeoproject.fast.catalogue.planner;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;

import org.junit.Before;
import org.junit.Test;
import org.ontoware.rdf2go.model.node.URI;

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
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSearchCode.json");
		Screen s2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		Screen s3 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		Screen s4 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonPriceCode.json");
		Screen s5 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonShoppingCode.json");
		Screen s6 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSuggestionCode.json");
		TestUtils.getCatalogue().addScreens(goal, s1, s2, s3, s4, s5, s6);
		assertEquals(7, TestUtils.getCatalogue().getAllScreens().size());

		ArrayList<Screen> canvas = new ArrayList<Screen>();
		Screen goalClone = TestUtils.getCatalogue().getScreen(TestUtils.getCatalogue().cloneBuildingBlock(goal));
		canvas.add(goalClone);
		long start = System.currentTimeMillis();
		assertEquals(4, TestUtils.getCatalogue().searchPlans(goalClone.getUri(), canvas).size());
		long end = System.currentTimeMillis() - start;
		System.out.println("Plan generation took: " + end + "ms");
	}
	
	@Test
	public void multiGoalPlanTest() throws Exception {
		Screen goal1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonOrderCode.json");
		Screen goal2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/getWineList.json");
		Screen s1 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSearchCode.json");
		Screen s2 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonListCode.json");
		Screen s3 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonProductCode.json");
		Screen s4 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonPriceCode.json");
		Screen s5 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonShoppingCode.json");
		Screen s6 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/amazonSuggestionCode.json");
		Screen s7 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/getWineMakers.json");
		Screen s8 = (Screen) TestUtils.buildBBFromFile(TestUtils.getCatalogue().getServerURL(), "screen", "data/json/screens/getFOAFPersons.json");
		TestUtils.getCatalogue().addScreens(goal1, goal2, s1, s2, s3, s4, s5, s6, s7, s8);
		assertEquals(10, TestUtils.getCatalogue().getAllScreens().size());

		Screen goal1Clone = TestUtils.getCatalogue().getScreen(TestUtils.getCatalogue().cloneBuildingBlock(goal1));
		Screen goal2Clone = TestUtils.getCatalogue().getScreen(TestUtils.getCatalogue().cloneBuildingBlock(goal2));
		ArrayList<URI> goalList = new ArrayList<URI>();
		goalList.add(goal1Clone.getUri());
		goalList.add(goal2Clone.getUri());
		ArrayList<Screen> canvas = new ArrayList<Screen>();
		canvas.add(goal1Clone);
		canvas.add(goal2Clone);
		long start = System.currentTimeMillis();
		assertEquals(8, TestUtils.getCatalogue().searchPlans(goalList, canvas).size());
		long end = System.currentTimeMillis() - start;
		System.out.println("Plan generation took: " + end + "ms");
	}
	
}

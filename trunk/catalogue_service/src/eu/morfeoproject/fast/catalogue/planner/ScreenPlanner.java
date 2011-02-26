package eu.morfeoproject.fast.catalogue.planner;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.cache.Cacheable;
import eu.morfeoproject.fast.catalogue.model.Condition;
import eu.morfeoproject.fast.catalogue.model.Screen;

public class ScreenPlanner extends Cacheable<List<Plan>>  {
	protected final transient Log log = LogFactory.getLog(this.getClass());

	private final URI ROOT_NODE = new URIImpl("urn:root");

	protected Planner planner;
	protected Catalogue catalogue;
	
	public ScreenPlanner(Catalogue catalogue) {
		this.catalogue = catalogue;
		this.planner = new CataloguePlanner(catalogue);
//		this.planner = new Neo4jPlanner(catalogue.getStoragePath()+"/planner");
	}
	
	/**
	 * Creates a list of plans
	 * @param goal
	 * @param screens
	 * @return list of plans
	 */
	public List<Plan> searchPlans(URI goal, List<Screen> screens) {
		LinkedList<URI> uriList = new LinkedList<URI>();
		for (Screen screen : screens) {
			uriList.add(screen.getUri());
		}
		
		LinkedList<Plan> planList = new LinkedList<Plan>();
		List<Plan> cacheList = cache.get(goal.toString());
		if (cacheList == null) {
			List<Plan> searchList = searchPlans(goal);
			planList.addAll(rankList(searchList, uriList));
			cache.put(goal.toString(), planList);
		} else {
			planList.addAll(cacheList);
		}
		
		return planList;
	}

	protected List<Plan> rankList(List<Plan> planList, List<URI> uriList) {
		List<Plan> newList = new LinkedList<Plan>();
		int [] count = new int[planList.size()];
		for (int idx = 0; idx < planList.size(); idx++)
			count[idx] = countItems(planList.get(idx).getUriList(), uriList);
		
		for (int idx = 0; idx < planList.size(); idx++) {
			Plan plan = planList.get(idx);
			
			if (newList.isEmpty()) {
				newList.add(plan);
			} else {
				boolean added = false;
				for (int i = 0; i < newList.size(); i++) {
					if (newList.get(i).getUriList(uriList).size() > plan.getUriList(uriList).size()) {
						newList.add(i, plan);
						added = true;
						break;
					}
				}
				if (!added) newList.add(plan);
			}
		}
		
		return newList;
	}
	
	public List<Plan> searchPlans(List<URI> goalList, List<Screen> screens) {
		HashMap<URI, List<Plan>> plansByGoal = new HashMap<URI, List<Plan>>();
		List<Plan> combinedPlans;

		for (URI goal : goalList) plansByGoal.put(goal, searchPlans(goal, screens));
		combinedPlans = new LinkedList<Plan>();
		for (URI goal : goalList) {
			combinedPlans = combine(combinedPlans, plansByGoal.get(goal));
		}
		
		return combinedPlans;
	}
	
	
	
	/**
	 * Creates a list of plans as a result of the combination of two lists.
	 * Given a list of plans A: [[1, 2], [3, 4]] and a list of plans B: [[5, 6], [7, 8]]
	 * it returns a list contaning 4 plans: [[1, 2, 5, 6], [1, 2, 7, 8], [3, 4, 5, 6], [3, 4, 7, 8]]
	 * @param listA
	 * @param listB
	 * @return list combining listA and listB
	 */
	public List<Plan> combine(List<Plan> listA, List<Plan> listB) {
		LinkedList<Plan> planList = new LinkedList<Plan>();

		if (listA.isEmpty() && listB.isEmpty()) return planList;
		
		if (listA.isEmpty()) {
			for (Plan pB : listB) {
				Plan plan = new Plan();
				plan.getUriList().addAll(pB.getUriList());
				planList.add(plan);
			}
		} else if (listB.isEmpty()) {
			for (Plan pA : listA) {
				Plan plan = new Plan();
				plan.getUriList().addAll(pA.getUriList());
				planList.add(plan);
			}
			
		} else {
			for (Plan pA : listA) {
				for (Plan pB : listB) {
					Plan plan = new Plan();
					plan.getUriList().addAll(pA.getUriList());
					plan.merge(pB);
					planList.add(plan);
				}
			}
		}
		
		return planList;
	}
	
	/**
	 * Calculates how many items of listB are also in listA
	 * @param listA
	 * @param listB
	 * @return number of items repeated
	 */
	private int countItems(List<URI> listA, List<URI> listB) {
		int count = 0;
		for (URI uri : listB) {
			if (listA.contains(uri)) count++;
		}
		return count;
	}
	
	private List<Plan> searchPlans(URI uri) {
		return planner.searchPlans(uri, ROOT_NODE);
	}
	
	public void add(Screen screen) {
		calculateForwards(screen);
		calculateBackwards(screen);
	}
	
	public void update(Screen newScreen, Screen oldScreen) {
		if (!equalListCondition(newScreen.getPreconditions(), oldScreen.getPreconditions())
				|| !equalListCondition(newScreen.getPostconditions(), oldScreen.getPostconditions())) {
			planner.remove(newScreen.getUri());
			calculateForwards(newScreen);
			calculateBackwards(newScreen);
		}
	}
	
	public void remove(URI screenUri) {
		planner.remove(screenUri);
	}
	
	public void clear() {
		planner.clear();
	}
	
	private void calculateForwards(Screen screen) {
		if (screen.getPostconditions().size() > 0) {
			ArrayList<Screen> screens = new ArrayList<Screen>();
			screens.add(screen);
			ArrayList<URI> results = new ArrayList<URI>();
			results.addAll(catalogue.findScreensForwards(screens, new ArrayList<Condition>(), new ArrayList<Condition>(), true, true, 0, -1, null));
			for (URI result : results) {
				planner.add(screen.getUri(), result);
				if (log.isInfoEnabled())
					log.info("added transition "+screen.getUri()+" -> "+result);
			}
		}
	}
	
	private void calculateBackwards(Screen screen) {
		if (screen.getPreconditions().size() == 0) {
			planner.add(ROOT_NODE, screen.getUri());
		} else {
			ArrayList<Screen> screens = new ArrayList<Screen>();
			screens.add(screen);
			ArrayList<URI> results = new ArrayList<URI>();
			results.addAll(catalogue.findScreensBackwards(screens, new ArrayList<Condition>(), new ArrayList<Condition>(), true, true, 0, -1, null));
			for (URI result : results) {
				planner.add(result, screen.getUri());
				if (log.isInfoEnabled())
					log.info("added transition "+result+" -> "+screen.getUri());
			}
		}
	}
	
	private boolean equalListCondition(List<Condition> lcA, List<Condition> lcB) {
		if (lcA.size() != lcB.size()) return false;
		for (int cIdx = 0; cIdx < lcA.size(); cIdx++) {
			if (!catalogue.isConditionCompatible(lcA.get(cIdx), lcB.get(cIdx))) {
				return false;
			}
		}
		return true;
	}
	
	/**
	 * Generates all the plans from a given list of screens, already stored in the catalogue
	 */
	protected void seed() {
		for (Screen screen : catalogue.getAllScreens()) {
			if (screen.getPreconditions().size() > 0) {
				ArrayList<Screen> screens = new ArrayList<Screen>();
				screens.add(screen);
				ArrayList<URI> results = new ArrayList<URI>();
				results.addAll(catalogue.findScreensBackwards(screens, new ArrayList<Condition>(), new ArrayList<Condition>(), true, true, 0, -1, null));
				for (URI result : results) {
					planner.add(result, screen.getUri());
				}
			}
		}
	}
	
}
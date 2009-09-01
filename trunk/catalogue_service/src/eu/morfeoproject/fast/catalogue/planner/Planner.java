package eu.morfeoproject.fast.catalogue.planner;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.model.Resource;
import eu.morfeoproject.fast.model.Screen;
import eu.morfeoproject.fast.server.CatalogueAccessPoint;

public class Planner {
	
	private DBMS dbms;
	private Catalogue catalogue;
	
	private Planner() {
		dbms = new DBMS();
		try {
			catalogue = CatalogueAccessPoint.getCatalogue();
			run();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/**
	 * SingletonHolder is loaded on the first execution of Singleton.getInstance() 
	 * or the first access to SingletonHolder.INSTANCE, not before.
	 */
	private static class PlannerHolder { 
		private static final Planner INSTANCE = new Planner();
	}

	public static Planner getInstance() {
		return PlannerHolder.INSTANCE;
	}
   
	private void run() {
		for (Screen screen : catalogue.listScreens()) {
			if (screen.getPreconditions().size() > 0) {
				HashSet<Resource> resources = new HashSet<Resource>();
				resources.add(screen);
				HashSet<URI> results = new HashSet<URI>();
				results.addAll(catalogue.find(resources, true, true, 0, -1, null));
				for (URI result : results)
					dbms.add(result, screen.getUri());
			}
		}
	}
	
	public List<Plan> searchPlans(URI uri, Set<Resource> resources) {
		List<URI> uriList = new ArrayList<URI>();
		for (Resource resource : resources)
			uriList.add(resource.getUri());
		
		List<Plan> planList = searchPlans(uri);
		List<Plan> newList = new ArrayList<Plan>();
		
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
					if (count[i] < count[idx]) {
						newList.add(i, plan);
						added = true;
						break;
					} else if ((count[i] == count[idx])
							&& (plan.getUriList().size() < planList.get(i).getUriList().size())) {
						newList.add(i, plan);
						added = true;
						break;
					}
				}
				if (!added)
					newList.add(plan);
			}
		}
			
		return newList;
	}
	
	/**
	 * Calculates how many items of listB are also in listA
	 * @param listA
	 * @param listB
	 * @return number of items repeated
	 */
	private int countItems(List<URI> listA, List<URI> listB) {
		int count = 0;
		for (URI uri : listB)
			if (listA.contains(uri))
				count++;
		return count;
	}
	
	public List<Plan> searchPlans(URI uri) {
		ArrayList<Plan> plans = new ArrayList<Plan>();
		List<URI> toList = dbms.getTo(uri);
		for (URI u : toList) {
			Plan p = new Plan();
			p.getUriList().add(0, u);
			searchPlans(p, plans);
		}
		return plans;
	}
	
	private void searchPlans(Plan plan, List<Plan> plans) {
		List<URI> toList = dbms.getTo(plan.getUriList().get(0));
		if (toList.isEmpty()) { // it's leaf
			plans.add(plan);
		} else {
			for (URI u : toList) {
				Plan p = plan.copy();
				p.getUriList().add(0, u);
				searchPlans(p, plans);
			}
		}
	}
	
}

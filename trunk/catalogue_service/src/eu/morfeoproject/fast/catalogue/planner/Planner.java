package eu.morfeoproject.fast.catalogue.planner;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.ontoware.rdf2go.model.node.URI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.FastModelFactory;
import eu.morfeoproject.fast.model.Postcondition;
import eu.morfeoproject.fast.model.Precondition;
import eu.morfeoproject.fast.model.Resource;
import eu.morfeoproject.fast.model.Screen;

public class Planner {
	
	final Logger logger = LoggerFactory.getLogger(Planner.class);

	private PlannerStore plannerStore;
	private Catalogue catalogue;
	
	public Planner(Catalogue catalogue) {
		this.plannerStore = new PlannerStore();
		this.catalogue = catalogue;
		run();
	}
	
	/*
	 * creates all the plans
	 * TODO this should be stored permanently
	 */
	private void run() {
		for (Screen screen : catalogue.listScreens()) {
			if (screen.getPreconditions().size() > 0) {
				HashSet<Resource> resources = new HashSet<Resource>();
				resources.add(screen);
				HashSet<URI> results = new HashSet<URI>();
				results.addAll(catalogue.findBackwards(resources, true, true, 0, -1, null));
				for (URI result : results)
					plannerStore.add(result, screen.getUri());
			}
		}
	}
	
	/**
	 * Creates a list of plans which 
	 * @param uri
	 * @param resources
	 * @return
	 */
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
	
	private List<Plan> searchPlans(URI uri) {
		ArrayList<Plan> plans = new ArrayList<Plan>();
		List<URI> toList = plannerStore.getTo(uri);
		for (URI u : toList) {
			Plan p = new Plan();
			p.getUriList().add(0, u);
			searchPlans(p, plans);
		}
		return plans;
	}
	
	private void searchPlans(Plan plan, List<Plan> plans) {
		List<URI> toList = plannerStore.getTo(plan.getUriList().get(0));
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
	
	public void add(Resource resource) {
		calculateForwards(resource);
		if (resource instanceof Screen)
			calculateBackwards(resource);
	}
	
	public void update(Resource newResource, Resource oldResource) {
		if (newResource instanceof Screen && oldResource instanceof Screen) {
			if (!equalConditions(((Screen) newResource).getPreconditions(), ((Screen) oldResource).getPreconditions())) {
				plannerStore.removeTo(newResource.getUri());
				calculateBackwards(newResource);
			}
			if (!equalConditions(((Screen) newResource).getPostconditions(), ((Screen) oldResource).getPostconditions())) {
				plannerStore.removeFrom(newResource.getUri());
				calculateForwards(newResource);
			}
		} else if (newResource instanceof Precondition && oldResource instanceof Precondition) {
			if (!equalListCondition(((Precondition) newResource).getConditions(), ((Precondition) oldResource).getConditions())) {
				plannerStore.removeFrom(newResource.getUri());
				calculateForwards(newResource);
			}
		} else {
			logger.error(newResource.getUri()+" and "+oldResource+" are not the same type of resource.");
		}
	}
	
	public void remove(URI screenUri) {
		plannerStore.removeFrom(screenUri);
		plannerStore.removeTo(screenUri);
	}
	
	private void calculateForwards(Resource resource) {
		HashSet<Resource> resources = new HashSet<Resource>();
		if (resource instanceof Screen) {
			if (((Screen) resource).getPostconditions().size() > 0)
				resources.add(resource);
		} else if (resource instanceof Precondition) {
			if (((Precondition) resource).getConditions().size() > 0) {
				Postcondition post = FastModelFactory.createPostcondition();
				// need to create an Event for the FIND operation, Slots don't
				// have unsatisfied preconditions
				post.setUri(resource.getUri());
				post.setConditions(((Precondition) resource).getConditions());
				resources.add(post);
			}
		}
		if (resources.size() > 0) {
			HashSet<URI> results = new HashSet<URI>();
			results.addAll(catalogue.findForwards(resources, true, true, 0, -1, null));
			for (URI result : results)
				plannerStore.add(resource.getUri(), result);
		}
	}
	
	private void calculateBackwards(Resource resource) {
		HashSet<Resource> resources = new HashSet<Resource>();
		if (resource instanceof Screen) {
			if (((Screen) resource).getPreconditions().size() > 0)
				resources.add(resource);
		} else if (resource instanceof Precondition) {
			if (((Precondition) resource).getConditions().size() > 0)
				resources.add(resource);
		}
		if (resources.size() > 0) {
			HashSet<URI> results = new HashSet<URI>();
			results.addAll(catalogue.findBackwards(resources, true, true, 0, -1, null));
			for (URI result : results)
				plannerStore.add(result, resource.getUri());
		}
	}
	
	private boolean equalConditions(List<List<Condition>> cA, List<List<Condition>> cB) {
		if (cA.size() != cB.size()) {
			return false;
		} else {
			for (int idx = 0; idx < cA.size(); idx++) {
				if (cA.get(idx).size() != cB.get(idx).size()) {
					return false;
				} else {
					if (!equalListCondition(cA.get(idx), cB.get(idx)))
						return false;
				}
			}
			return true;
		}
	}

	private boolean equalListCondition(List<Condition> lcA, List<Condition> lcB) {
		for (int cIdx = 0; cIdx < lcA.size(); cIdx++)
			if (!lcA.get(cIdx).equals(lcB.get(cIdx)))
				return false;
		return true;
	}
	
}

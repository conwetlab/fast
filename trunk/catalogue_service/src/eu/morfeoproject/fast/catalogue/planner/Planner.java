package eu.morfeoproject.fast.catalogue.planner;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.cache.Cacheable;
import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.model.Condition;
import eu.morfeoproject.fast.catalogue.model.Postcondition;
import eu.morfeoproject.fast.catalogue.model.Precondition;
import eu.morfeoproject.fast.catalogue.model.Screen;
import eu.morfeoproject.fast.catalogue.model.factory.BuildingBlockFactory;

public abstract class Planner extends Cacheable<List<Plan>> {
	protected final transient Log log = LogFactory.getLog(this.getClass());

	protected PlannerStore plannerStore;
	protected Catalogue catalogue;
	
	/**
	 * Creates a list of plans which 
	 * @param uri
	 * @param resources
	 * @return
	 */
	public List<Plan> searchPlans(URI uri, List<BuildingBlock> resources) {
		LinkedList<URI> uriList = new LinkedList<URI>();
		for (BuildingBlock resource : resources)
			uriList.add(resource.getUri());
		
		LinkedList<Plan> planList = new LinkedList<Plan>();
		List<Plan> cacheList = cache.get(uri.toString());
		if (cacheList == null) {
			List<Plan> searchList = searchPlans(uri);
			cache.put(uri.toString(), searchList);
			planList.addAll(searchList);
		} else {
			planList.addAll(cacheList);
		}
		
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
		LinkedList<Plan> plans = new LinkedList<Plan>();
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
		toList = diff(toList, plan.getUriList()); // avoid loops
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
	
	public void add(BuildingBlock resource) {
		calculateForwards(resource);
		if (resource instanceof Screen) calculateBackwards(resource);
	}
	
	public void update(BuildingBlock newResource, BuildingBlock oldResource) {
		if (newResource instanceof Screen && oldResource instanceof Screen) {
			if (!equalListCondition(((Screen) newResource).getPreconditions(), ((Screen) oldResource).getPreconditions())) {
				plannerStore.removeTo(newResource.getUri());
				calculateBackwards(newResource);
			}
			if (!equalListCondition(((Screen) newResource).getPostconditions(), ((Screen) oldResource).getPostconditions())) {
				plannerStore.removeFrom(newResource.getUri());
				calculateForwards(newResource);
			}
		} else if (newResource instanceof Precondition && oldResource instanceof Precondition) {
			if (!equalListCondition(((Precondition) newResource).getConditions(), ((Precondition) oldResource).getConditions())) {
				plannerStore.removeFrom(newResource.getUri());
				calculateForwards(newResource);
			}
		} else {
			log.error(newResource.getUri()+" and "+oldResource+" are not the same type of resource.");
		}
	}
	
	public void remove(URI screenUri) {
		plannerStore.removeFrom(screenUri);
		plannerStore.removeTo(screenUri);
	}
	
	public void clear() {
		plannerStore.clear();
	}
	
	private void calculateForwards(BuildingBlock resource) {
		ArrayList<BuildingBlock> resources = new ArrayList<BuildingBlock>();
		if (resource instanceof Screen) {
			if (((Screen) resource).getPostconditions().size() > 0) {
				resources.add(resource);
			}
		} else if (resource instanceof Precondition) {
			if (((Precondition) resource).getConditions().size() > 0) {
				Postcondition post = BuildingBlockFactory.createPostcondition();
				// need to create an Event for the FIND operation, Slots don't
				// have unsatisfied preconditions
				post.setUri(resource.getUri());
				post.setConditions(((Precondition) resource).getConditions());
				resources.add(post);
			}
		}
		if (resources.size() > 0) {
			ArrayList<URI> results = new ArrayList<URI>();
			results.addAll(catalogue.findForwards(resources, true, true, 0, -1, null));
			for (URI result : results) {
				plannerStore.add(resource.getUri(), result);
			}
		}
	}
	
	private void calculateBackwards(BuildingBlock resource) {
		ArrayList<BuildingBlock> resources = new ArrayList<BuildingBlock>();
		if (resource instanceof Screen) {
			if (((Screen) resource).getPreconditions().size() > 0) {
				resources.add(resource);
			}
		} else if (resource instanceof Precondition) {
			if (((Precondition) resource).getConditions().size() > 0) {
				resources.add(resource);
			}
		}
		if (resources.size() > 0) {
			ArrayList<URI> results = new ArrayList<URI>();
			results.addAll(catalogue.findBackwards(resources, true, true, 0, -1, null));
			for (URI result : results) {
				plannerStore.add(result, resource.getUri());
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
	
	private List<URI> diff(List<URI> listA, List<URI> listB) {
		LinkedList<URI> result = new LinkedList<URI>();
		for (URI uri : listA) {
			if (!listB.contains(uri)) result.add(uri);
		}
		return result;
	}
	
	/**
	 * Generates all the plans from a given list of screens, already stored in the catalogue
	 */
	protected void seed() {
		for (Screen screen : catalogue.getAllScreens()) {
			if (screen.getPreconditions().size() > 0) {
				ArrayList<BuildingBlock> resources = new ArrayList<BuildingBlock>();
				resources.add(screen);
				ArrayList<URI> results = new ArrayList<URI>();
				results.addAll(catalogue.findBackwards(resources, true, true, 0, -1, null));
				for (URI result : results) {
					plannerStore.add(result, screen.getUri());
				}
			}
		}
	}
	
}
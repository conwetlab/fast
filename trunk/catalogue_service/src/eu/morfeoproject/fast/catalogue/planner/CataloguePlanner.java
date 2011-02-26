package eu.morfeoproject.fast.catalogue.planner;

import java.util.LinkedList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class CataloguePlanner implements Planner {
	protected final Log log = LogFactory.getLog(CataloguePlanner.class);
	
	private Catalogue catalogue;
	private CatalogueGraph graph;
	
	public CataloguePlanner(Catalogue catalogue) {
		this.catalogue = catalogue;
		graph = new CatalogueGraph(this.catalogue);
	}
	
	public List<Plan> searchPlans(URI from, URI to) {
		LinkedList<Plan> planList = new LinkedList<Plan>();
		AllSimplePaths<URI> all = new AllSimplePaths<URI>(graph);
		for (List<URI> path : all.findAllPaths(from, to)) {
			Plan plan = new Plan();
			for (URI node : path) {
				plan.getUriList().add(node);
			}
			planList.add(plan);
		}
		return planList;
	}

	@Override
	public boolean add(URI from, URI to) {
		graph.addEdge(from, to);
		return true;
	}

	@Override
	public void remove(URI uri) {
		graph.removeNode(uri);
	}

	@Override
	public void clear() {
		graph.clear();
	}
	
}

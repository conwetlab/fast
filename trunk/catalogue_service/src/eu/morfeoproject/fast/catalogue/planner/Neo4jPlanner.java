package eu.morfeoproject.fast.catalogue.planner;

import java.io.File;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.neo4j.graphalgo.GraphAlgoFactory;
import org.neo4j.graphalgo.PathFinder;
import org.neo4j.graphdb.Direction;
import org.neo4j.graphdb.DynamicRelationshipType;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Path;
import org.neo4j.graphdb.RelationshipType;
import org.neo4j.kernel.Traversal;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

public class Neo4jPlanner implements Planner {
	protected final Log log = LogFactory.getLog(Neo4jPlanner.class);
	
	private final String URI_KEY = "uri";
	private final RelationshipType SATISFIED_BY = DynamicRelationshipType.withName("satisfied_by");
	private final int MAX_PATHS = 100;
	private Neo4jService neo4jService;

	public Neo4jPlanner(String path) {
		this.neo4jService = new Neo4jService(new File("/home/ismriv/neo4j-delete"));
	}

	public List<Plan> searchPlans(URI from, URI to) {
		LinkedList<Plan> planList = new LinkedList<Plan>();
		Node fromNode = neo4jService.getNode(URI_KEY, from.toString());
		Node toNode = neo4jService.getNode(URI_KEY, to.toString());
		
		PathFinder<Path> finder = GraphAlgoFactory.allSimplePaths(Traversal.expanderForTypes(SATISFIED_BY, Direction.OUTGOING), MAX_PATHS);
		
		for (Path foundPath : finder.findAllPaths(fromNode, toNode)) {
			log.info(String.format("Path from %s to %s: %s", from, to, Traversal.simplePathToString(foundPath, URI_KEY)));
			Plan plan = new Plan();
			plan.setUriList(new LinkedList<URI>());
			for (Node node : foundPath.nodes()) {
				plan.getUriList().add(new URIImpl(node.getProperty(URI_KEY).toString()));
			}
			planList.add(plan);
		}

		return planList;
	}

	@Override
	public boolean add(URI from, URI to) {
		neo4jService.createRelationship(URI_KEY, to.toString(), SATISFIED_BY, from.toString());
		return true;
	}

	@Override
	public void remove(URI uri) {
		Node node = neo4jService.getNode(URI_KEY, uri.toString());
		if (node != null)
			node.delete();
	}

	@Override
	public void clear() {
		neo4jService.clear();		
	}
	
}

package eu.morfeoproject.fast.catalogue.planner;

import java.io.File;

import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.RelationshipType;
import org.neo4j.graphdb.Transaction;
import org.neo4j.graphdb.index.Index;
import org.neo4j.kernel.EmbeddedGraphDatabase;

public class Neo4jService {

	protected File path;
	protected GraphDatabaseService graphDb;
	protected Index<Node> indexService;

	public Neo4jService(File path) {
		this.path = path;
		graphDb = new EmbeddedGraphDatabase(path.getAbsolutePath());
		this.indexService = graphDb.index().forNodes("nodes");
		registerShutdownHook(graphDb);
	}
	
	private static void registerShutdownHook(final GraphDatabaseService graphDb) {
		// Registers a shutdown hook for the Neo4j instance so that it
		// shuts down nicely when the VM exits (even if you "Ctrl-C" the
		// running example before it's completed)
		Runtime.getRuntime().addShutdownHook(new Thread() {
			@Override
			public void run() {
				graphDb.shutdown();
			}
		});
	}

	protected Node getNode(String key, String name) {
		return indexService.get(key, name).getSingle();
	}
	
	protected Node getOrCreateNode(String key, String name) {
		Node node = getNode(key, name);
		if (node == null) {
			node = graphDb.createNode();
			node.setProperty(key, name);
			indexService.add(node, key, name);
		}
		return node;
	}

	protected void createRelationship(String key, String from, RelationshipType relationship, String to) {
		Transaction tx = graphDb.beginTx();
		try {
			Node fromNode = getOrCreateNode(key, from);
			Node toNode = getOrCreateNode(key, to);
			fromNode.createRelationshipTo(toNode, relationship);
			tx.success();
	    } catch (Exception e) {
	        tx.failure();
	        e.printStackTrace();
		} finally {
			tx.finish();
		}
	}
	
	public boolean isEmpty() {
		return !graphDb.getAllNodes().iterator().hasNext();
	}
	
	public void clear() {
		deleteFileOrDirectory(path);
	}

	private static void deleteFileOrDirectory(File file) {
		if (file.exists()) {
			if (file.isDirectory()) {
				for (File child : file.listFiles()) {
					deleteFileOrDirectory(child);
				}
			}
			file.delete();
		}
	}

}

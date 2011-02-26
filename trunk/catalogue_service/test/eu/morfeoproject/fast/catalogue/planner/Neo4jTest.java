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

import java.io.File;

import org.junit.Test;
import org.neo4j.graphalgo.GraphAlgoFactory;
import org.neo4j.graphalgo.PathFinder;
import org.neo4j.graphdb.Direction;
import org.neo4j.graphdb.DynamicRelationshipType;
import org.neo4j.graphdb.GraphDatabaseService;
import org.neo4j.graphdb.Node;
import org.neo4j.graphdb.Path;
import org.neo4j.graphdb.RelationshipType;
import org.neo4j.graphdb.Transaction;
import org.neo4j.graphdb.index.Index;
import org.neo4j.kernel.EmbeddedGraphDatabase;
import org.neo4j.kernel.Traversal;

public class Neo4jTest {

	private static final String DB_PATH = "neo4jdb-test";
	private static final String NAME_KEY = "name";
	private static RelationshipType KNOWS = DynamicRelationshipType.withName( "KNOWS" );

	private static GraphDatabaseService graphDb;
	private static Index<Node> indexService;

	@Test
	public void shortestPathTest() throws Exception {
		deleteFileOrDirectory(new File(DB_PATH));
		graphDb = new EmbeddedGraphDatabase(DB_PATH);
		indexService = graphDb.index().forNodes("nodes");
		registerShutdownHook();
		Transaction tx = graphDb.beginTx();
		try {
			/*
			 *  (Neo) --> (Trinity)
			 *     \       ^
			 *      v     /
			 *    (Morpheus) --> (Cypher)
			 *            \         |
			 *             v        v
			 *            (Agent Smith)
			 */
			createChain("Neo", "Trinity");
			createChain("Neo", "Morpheus", "Trinity");
			createChain("Morpheus", "Cypher", "Agent Smith");
			createChain("Morpheus", "Agent Smith");
			tx.success();
		} finally {
			tx.finish();
		}

		// So let's find the shortest path between Neo and Agent Smith
		Node neo = getOrCreateNode("Neo");
		Node agentSmith = getOrCreateNode("Agent Smith");
		// START SNIPPET: shortestPathUsageX
		PathFinder<Path> finder = GraphAlgoFactory.allSimplePaths(Traversal.expanderForTypes(KNOWS, Direction.BOTH), 4);
		int found = 0;
		for (Path foundPath : finder.findAllPaths(neo, agentSmith)) {
			System.out.println("Path from Neo to Agent Smith: " + Traversal.simplePathToString(foundPath, NAME_KEY));
			found++;
		}
		// END SNIPPET: shortestPathUsage
		assertEquals(4, found);
		
		System.out.println("Shutting down database ...");
		graphDb.shutdown();
		deleteFileOrDirectory(new File(DB_PATH));
	}

	private static void registerShutdownHook() {
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
	
	private static void createChain(String... names) {
		for (int i = 0; i < names.length - 1; i++) {
			Node firstNode = getOrCreateNode(names[i]);
			Node secondNode = getOrCreateNode(names[i + 1]);
			firstNode.createRelationshipTo(secondNode, KNOWS);
		}
	}

	private static Node getOrCreateNode(String name) {
		Node node = indexService.get(NAME_KEY, name).getSingle();
		if (node == null) {
			node = graphDb.createNode();
			node.setProperty(NAME_KEY, name);
			indexService.add(node, NAME_KEY, name);
		}
		return node;
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

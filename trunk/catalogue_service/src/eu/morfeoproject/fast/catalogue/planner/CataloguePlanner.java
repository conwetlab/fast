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

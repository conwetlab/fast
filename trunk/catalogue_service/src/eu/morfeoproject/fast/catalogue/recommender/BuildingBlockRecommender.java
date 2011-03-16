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
package eu.morfeoproject.fast.catalogue.recommender;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.mahout.common.Pair;
import org.apache.mahout.common.Parameters;
import org.apache.mahout.fpm.pfpgrowth.convertors.string.TopKStringPatterns;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.Catalogue;

public abstract class BuildingBlockRecommender implements Recommender {
	
	protected final Log log = LogFactory.getLog(this.getClass());

	protected Catalogue catalogue;
	protected FPGrowth fpgrowth;
	protected Parameters params = new Parameters();
	
	public BuildingBlockRecommender(Catalogue catalogue) {
		this.catalogue = catalogue;
	}
	
// DEPRECATED: returns the suggestion list as well as the weights for the elements
//	public List<Pair<URI, Long>> getTopKWeightedList(List<URI> uriList) {
//		ArrayList<Pair<URI, Long>> pairList = new ArrayList<Pair<URI, Long>>();
//		TopKStringPatterns topKPatterns = getTopKFrequentPatterns(uriList);
//		for (Pair<List<String>, Long> pair : topKPatterns.getPatterns()) {
//			long weight = pair.getSecond();
//			for (String bb : pair.getFirst()) {
//				URI u = new URIImpl(bb);
//				if (!uriList.contains(u)) {
//					pairList.add(new Pair<URI, Long>(u, weight));
//					System.out.println(bb+" = "+weight);
//				}
//			}
//		}
//		return pairList;
//	}

	public List<URI> getSuggestionList(List<URI> uriList) {
		ArrayList<URI> resultList = new ArrayList<URI>();
		TopKStringPatterns pattern = getTopKStringPatterns(uriList);
		for (Pair<List<String>, Long> pair : pattern.getPatterns()) {
			long weight = pair.getSecond();
			for (String element : pair.getFirst()) {
				URI uri = new URIImpl(element);
				if (!uriList.contains(uri) && !resultList.contains(uri)) {
					resultList.add(uri);
					if (log.isInfoEnabled()) log.info(uri + ", weight: " + weight);
				}
			}
		}
		return resultList;
	}

	private TopKStringPatterns getTopKStringPatterns(List<URI> uriList) {
		int maxHeapSize = Integer.valueOf(params.get("maxHeapSize", "50"));
		TopKStringPatterns pattern = new TopKStringPatterns();
		TopKStringPatterns partial;
		for (URI uri : uriList) {
			partial = this.fpgrowth.getTopKFrequentPatterns(uri.toString());
			if (partial != null) {
				pattern = pattern.merge(partial, maxHeapSize);
			}
		}
		return pattern;
	}

}

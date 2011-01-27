package eu.morfeoproject.fast.catalogue.recommender;

import java.io.BufferedWriter;
import java.io.FileWriter;
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
import eu.morfeoproject.fast.catalogue.model.Screen;

public class ScreenComponentRecommender {
	
	protected final Log log = LogFactory.getLog(this.getClass());

	private Catalogue catalogue;
	private FPGrowth fpgrowth;
	private Parameters params = new Parameters();
	
	public ScreenComponentRecommender(Catalogue catalogue) {
		this.params.set("input", "/home/ismriv/mahout-experiments/fpgrowth/sc-input.dat");
		this.params.set("encoding", "utf-8");
		this.params.set("output", "/home/ismriv/mahout-experiments/fpgrowth/sc-output.dat");
		this.catalogue = catalogue;
		this.fpgrowth = new FPGrowth(this.params);
	}
	
	public void rebuild() {
		try {
			// generates input file reading the screen info from the catalogue
			FileWriter fstream = new FileWriter(this.params.get("input"));
			BufferedWriter out = new BufferedWriter(fstream);
			for (Screen screen : this.catalogue.getAllScreens()) {
				for (URI clone : screen.getBuildingBlocks()) {
//					String feature = uriToFeature(catalogue.getPrototypeOfClone(clone));
//					out.write(feature + "\t");
					out.write(catalogue.getPrototypeOfClone(clone) + "\t");
				}
				out.write("\n");
			}
			out.close();
			// calculates the new TopK frequent patterns, and stores the results
			this.fpgrowth.rebuild();
		} catch (Exception e) {
			log.error(e.getMessage(), e);
		}
		
	}
	
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
	
	public List<URI> getTopKList(List<URI> uriList) {
		ArrayList<URI> resultList = new ArrayList<URI>();
		TopKStringPatterns pattern = getTopKStringPatterns(uriList);
		for (Pair<List<String>, Long> pair : pattern.getPatterns()) {
			long weight = pair.getSecond();
			for (String element : pair.getFirst()) {
				URI uri = new URIImpl(element);
				if (!uriList.contains(uri)) {
					resultList.add(uri);
					if (log.isInfoEnabled()) log.info(uri + ", weight: " + weight);
				}
			}
		}
		return resultList;
	}
	
	private TopKStringPatterns getTopKStringPatterns(List<URI> uriList) {
//		return this.fpgrowth.getTopKFrequentPatterns(uriToFeature(uri));
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

	//TODO it may be used to optimise the size of the files for the recommender
//	protected String uriToFeature(URI uri) {
//		String[] chunks = uri.toString().split("/");
//		return chunks[chunks.length - 2].charAt(0) + chunks[chunks.length - 1];
//	}

}

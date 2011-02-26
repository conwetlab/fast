package eu.morfeoproject.fast.catalogue.recommender;

import java.io.BufferedWriter;
import java.io.FileWriter;

import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.model.ScreenFlow;

public class ScreenRecommender extends BuildingBlockRecommender {
	
	public ScreenRecommender(Catalogue catalogue, String path) {
		super(catalogue);
		this.params.set("input", path + "/fpgrowth/screen-input.dat");
		this.params.set("encoding", "utf-8");
		this.params.set("output", path + "/fpgrowth/screen-output.dat");
		this.fpgrowth = new FPGrowth(this.params);
	}
	
	public void rebuild() {
		if (log.isInfoEnabled()) {
			log.info("Rebuilding recommendations for screens");
		}
		try {
			// generates input file reading the screen info from the catalogue
			FileWriter fstream = new FileWriter(this.params.get("input"));
			BufferedWriter out = new BufferedWriter(fstream);
			for (ScreenFlow sf : this.catalogue.getAllScreenFlows()) {
				for (URI clone : sf.getBuildingBlocks()) {
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
	
}

package eu.morfeoproject.fast.catalogue.recommender;

import java.io.BufferedWriter;
import java.io.FileWriter;

import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.model.Screen;

public class ScreenComponentRecommender extends BuildingBlockRecommender {
	
	public ScreenComponentRecommender(Catalogue catalogue) {
		super(catalogue);
		this.params.set("input", "/home/ismriv/mahout-experiments/fpgrowth/sc-input.dat");
		this.params.set("encoding", "utf-8");
		this.params.set("output", "/home/ismriv/mahout-experiments/fpgrowth/sc-output.dat");
		this.fpgrowth = new FPGrowth(params);
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
					out.write(this.catalogue.getPrototypeOfClone(clone) + "\t");
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
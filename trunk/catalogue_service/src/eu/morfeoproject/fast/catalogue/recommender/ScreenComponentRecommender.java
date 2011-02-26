package eu.morfeoproject.fast.catalogue.recommender;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.model.Screen;

public class ScreenComponentRecommender extends BuildingBlockRecommender {
	
	public ScreenComponentRecommender(Catalogue catalogue, String path) {
		super(catalogue);
		this.params.set("input", path + "/fpgrowth/sc-input.dat");
		this.params.set("encoding", "utf-8");
		this.params.set("output", path + "/fpgrowth/sc-output.dat");
		this.fpgrowth = new FPGrowth(params);
		
		// create directory to store necessary binary files
		File iFile = new File(path + "/fpgrowth");
		if (!iFile.exists()) iFile.mkdirs();
	}
	
	public void rebuild() {
		if (log.isInfoEnabled()) {
			log.info("Rebuilding recommendations for screen components");
		}
		try {
			// generates input file reading the screen info from the catalogue
			FileWriter fstream = new FileWriter(this.params.get("input"));
			BufferedWriter out = new BufferedWriter(fstream);
			for (Screen screen : this.catalogue.getAllScreens()) {
				for (URI clone : screen.getBuildingBlocks()) {
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

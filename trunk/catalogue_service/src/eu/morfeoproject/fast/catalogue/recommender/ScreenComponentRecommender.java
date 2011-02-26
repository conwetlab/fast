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

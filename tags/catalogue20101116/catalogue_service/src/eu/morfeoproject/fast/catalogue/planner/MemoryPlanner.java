package eu.morfeoproject.fast.catalogue.planner;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class MemoryPlanner extends Planner {
	
	final Logger logger = LoggerFactory.getLogger(MemoryPlanner.class);

	public MemoryPlanner(Catalogue catalogue) {
		this.plannerStore = new MemoryPlannerStore();
		this.catalogue = catalogue;
		// Memory planner needs to create all the plans every time is created. The plans are not
		// stored permanently and cannot be recovered.
		seed();
	}
	


}

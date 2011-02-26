package eu.morfeoproject.fast.catalogue.planner;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class PlannerFactory {
	
	public static ScreenPlanner createScreenPlanner(Catalogue catalogue) {
		return new ScreenPlanner(catalogue);
	}
	
}

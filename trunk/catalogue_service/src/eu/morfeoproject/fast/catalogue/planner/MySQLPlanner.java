package eu.morfeoproject.fast.catalogue.planner;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class MySQLPlanner extends Planner {
	
	final Logger logger = LoggerFactory.getLogger(MySQLPlanner.class);

	public MySQLPlanner(Catalogue catalogue, String host, String port, String database, String username, String password) throws PlannerException {
		this.plannerStore = new MySQLPlannerStore(host, port, database, username, password);
		this.catalogue = catalogue;
		if (this.plannerStore.isEmpty())
			seed();
	}
	
}

package eu.morfeoproject.fast.catalogue.planner;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class PlannerFactory {
	
	private final static String DEFAULT_MYSQL_HOST = "localhost";
	private final static String DEFAULT_MYSQL_PORT = "3306";
	
	final static Logger logger = LoggerFactory.getLogger(PlannerFactory.class);

	public static Planner createPlanner(Catalogue catalogue, String environment) {
		InputStream inStream = PlannerFactory.class.getClassLoader().getResourceAsStream("planner.properties"); 
		if (inStream == null) {
			logger.warn("Configuration file planner.properties not found. Creating in-memory planner by default.");
			return new MemoryPlanner(catalogue);
		} else {
			Properties properties = new Properties();
			try {
				properties.load(inStream);
				environment = environment == null ? "default" : environment;
				String adapter = properties.getProperty(environment+"-adapter");
				if (adapter.equals("memory")) {
					return new MemoryPlanner(catalogue);
				} else if (adapter.equals("mysql")) {
					String database = properties.getProperty(environment+"database");
					String username = properties.getProperty(environment+"username");
					String password = properties.getProperty(environment+"password");
					String host = properties.getProperty(environment+"host", DEFAULT_MYSQL_HOST);
					String port = properties.getProperty(environment+"port", DEFAULT_MYSQL_PORT);
					return new MySQLPlanner(catalogue, host, port, database, username, password);
				} else {
					logger.warn("Adapter not valid. Creating in-memory planner by default.");
					return new MemoryPlanner(catalogue);
				}
			} catch (IOException e) {
				logger.error("Configuration file planner.properties not found or incorrect. Planner cannot be instantiated.", e);
				return null;
			} catch (PlannerException e) {
				logger.error("MySQL planner cannot be instantiated. Check if configuration is correct and MySQL is running.", e);
				return null;
			}
		}
    }
	
}

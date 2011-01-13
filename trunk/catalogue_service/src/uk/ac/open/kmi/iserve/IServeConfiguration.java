package uk.ac.open.kmi.iserve;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class IServeConfiguration {

	private final Log log = LogFactory.getLog(IServeConfiguration.class);

	private Properties properties = new Properties();

	public IServeConfiguration() {}

	public IServeConfiguration(String confFile) {
		this.load(confFile);
	}
	
	public void load(String confFile) {
		InputStream inStream = IServeConfiguration.class.getClassLoader().getResourceAsStream(confFile);
		if (inStream == null) {
			log.error("Configuration file "+confFile+" not found.");
		} else {
			try {
				properties.load(inStream);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	public String get(String property) {
		return this.properties.getProperty(property);
	}

	public void set(String property, Object value) {
		this.properties.put(property, value);
	}
	
}
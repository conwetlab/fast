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
package eu.morfeoproject.fast.catalogue;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Properties;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

public class CatalogueConfiguration {
	
	private final Log log = LogFactory.getLog(CatalogueConfiguration.class);

	private Properties properties = new Properties();

	public CatalogueConfiguration() {}

	public CatalogueConfiguration(String confFile) {
		this.load(confFile);
	}
	
	public void load(String confFile) {
		InputStream inStream = CatalogueConfiguration.class.getClassLoader().getResourceAsStream(confFile);
		String storageDir = null;
		String indexes = null;
		String sesameServer = null;
		String repositoryID = null;
		String serverURL = null;
		if (inStream == null) {
			log.error("Configuration file "+confFile+" not found.");
		} else {
			try {
				properties.load(inStream);
			} catch (IOException e) {
				log.error("Error reading configuration file "+confFile+": "+e, e);
			}
		}
		// TODO do the necessary checks, and if no configuration at all, set the storageDir to a relative path where the catalogue is being executed
		if (sesameServer != null && repositoryID != null && serverURL != null) {
		} else if (storageDir != null) {
		} else {
//			throw new IOException("Configuration file "+confFile+" is incorrect.");
		}
	}
	
	public String get(String property) {
		return this.get("default", property);
	}
	
	public String get(String environment, String property) {
		return this.properties.getProperty(environment+"-"+property);
	}
	
	public boolean getBoolean(String property) {
		return this.getBoolean("default", property);
	}
	
	public boolean getBoolean(String environment, String property) {
		return Boolean.valueOf(this.properties.getProperty(environment+"-"+property, "false"));
	}

	public URL getURL(String property) {
		return this.getURL("default", property);
	}
	
	public URL getURL(String environment, String property) {
		try {
			return new URL(this.properties.getProperty(environment+"-"+property));
		} catch (MalformedURLException e) {
			return null;
		}
	}
	
	public URI getURI(String property) {
		return this.getURI("default", property);
	}
	
	public URI getURI(String environment, String property) {
		return new URIImpl(this.properties.getProperty(environment+"-"+property));
	}
	
	public void set(String property, Object value) {
		this.set("default", property, value);
	}
	
	public void set(String environment, String property, Object value) {
		properties.put(environment+"-"+property, value);
	}
	
}

package eu.morfeoproject.fast.catalogue.services;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.CatalogueConfiguration;

public class ApplicationServletContext implements ServletContextListener {
	ServletContext context;
	
	public void contextInitialized(ServletContextEvent contextEvent) {
		context = contextEvent.getServletContext();
		// creates a Catalogue instance for the application
		context.setAttribute("catalogue", 
				new Catalogue(new CatalogueConfiguration("repository.properties")));
	}
	
	public void contextDestroyed(ServletContextEvent contextEvent) {
		context = contextEvent.getServletContext();
		((Catalogue) context.getAttribute("catalogue")).close();
	}

}

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
package eu.morfeoproject.fast.catalogue.htmltemplates;

import java.io.IOException;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import freemarker.template.Configuration;
import freemarker.template.ObjectWrapper;
import freemarker.template.Template;
import freemarker.template.TemplateExceptionHandler;

public class TemplateManager {

	final static Logger logger = LoggerFactory.getLogger(TemplateManager.class);

	// access it using getConfigation(), it ensures it's been initialized
	private static Configuration cfg = null;

    /* Get or create a template */
    public static Template getTemplate(String templateFile) {
    	Template template = null;
    	try {
			template = getConfiguration().getTemplate(templateFile);
		} catch (IOException e) {
			logger.error("Template file "+templateFile+" cannot be read: "+e, e);
		}
		return template;
    }
    
    private static Configuration getConfiguration() throws IOException {
    	if (cfg == null) initConfiguration();
    	return cfg;
    }
    
    /**
     *  Initialize the FreeMarker configuration
     * @throws IOException
     */
    private static void initConfiguration() throws IOException {
        // Create a configuration instance
        cfg = new Configuration();
        // Templates are stoted in same directory of the TemplateManager.
        cfg.setClassForTemplateLoading(TemplateManager.class, "");  
        // Set update dealy to 0 for now, to ease debugging and testing.
        // TODO Higher value should be used in production environment.
        cfg.setTemplateUpdateDelay(0);
        // Set an error handler that prints errors so they are readable with
        // a HTML browser.
        cfg.setTemplateExceptionHandler(TemplateExceptionHandler.HTML_DEBUG_HANDLER);
        // Use beans wrapper (recommmended for most applications)
//        cfg.setObjectWrapper(ObjectWrapper.BEANS_WRAPPER);
        // Set the default charset of the template files
        cfg.setDefaultEncoding("UTF-8");
        // Set the charset of the output. This is actually just a hint, that
        // templates may require for URL encoding and for generating META element
        // that uses http-equiv="Content-type".
        cfg.setOutputEncoding("UTF-8");
        // Set the default locale
        cfg.setLocale(Locale.ENGLISH);
    }
    
    public static String getDefaultEncoding() {
    	try {
			return getConfiguration().getDefaultEncoding();
		} catch (IOException e) {
			e.printStackTrace();
			logger.error("Default encoding has not been found in the template configuration: "+e, e);
		}
		return null;
    }
    
    public static Locale getLocale() {
    	try {
			return getConfiguration().getLocale();
		} catch (IOException e) {
			e.printStackTrace();
			logger.error("Locale has not been found in the template configuration: "+e, e);
		}
		return null;
    }
    
}

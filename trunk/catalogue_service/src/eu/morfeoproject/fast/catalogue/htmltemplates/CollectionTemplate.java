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
import java.io.Writer;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import freemarker.template.Template;
import freemarker.template.TemplateException;

public class CollectionTemplate {

	final static Logger logger = LoggerFactory.getLogger(CollectionTemplate.class);

	private static final String tmplFile = "collection.html";
	
	public static void process(Collection<? extends BuildingBlock> collection, Writer writer) throws TemplateException {
		// Build the data-model
        Map dataModel = new HashMap();
        dataModel.put("collection", collection);
        
        // Get the templat object
        Template template = TemplateManager.getTemplate(tmplFile);
		if (template == null)
			throw new TemplateException("Template for ScreenComponent ("+tmplFile+") has not been found.", null);
		
        // Merge the data-model and the template
        try {
            template.process(dataModel, writer);
		} catch (IOException e) {
			logger.error("Error while merging the template. Output cannot be accessed: "+e, e);
		}
	}
}

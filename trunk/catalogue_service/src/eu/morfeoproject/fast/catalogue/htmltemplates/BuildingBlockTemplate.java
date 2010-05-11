package eu.morfeoproject.fast.catalogue.htmltemplates;

import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.buildingblocks.Resource;
import freemarker.template.Template;
import freemarker.template.TemplateException;

public class BuildingBlockTemplate {

	final static Logger logger = LoggerFactory.getLogger(BuildingBlockTemplate.class);

	private static final String tmplFile = "buildingblock.html";
	
	public static void process(Resource resource, Writer writer) throws TemplateException {
		// Build the data-model
        Map dataModel = new HashMap();
        dataModel.put("bb", resource);
        
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

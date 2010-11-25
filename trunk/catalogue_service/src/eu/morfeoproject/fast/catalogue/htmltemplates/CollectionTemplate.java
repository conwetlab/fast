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

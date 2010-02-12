package eu.morfeoproject.fast.model.templates;

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

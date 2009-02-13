package eu.morfeoproject.fast.restserver;

import java.io.IOException;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.openrdf.repository.RepositoryException;
import org.restlet.data.MediaType;
import org.restlet.data.Method;
import org.restlet.data.Request;
import org.restlet.data.Response;
import org.restlet.data.Status;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.OntologyInvalidException;
import eu.morfeoproject.fast.model.Screen;

/**
 * 
 * @author irivera
 */
public class SearchRestlet extends CatalogueRestlet {

	static Logger logger = Logger.getLogger(SearchRestlet.class);
	
	public SearchRestlet(Catalogue catalogue) throws RepositoryException {
		super();
		this.catalogue = catalogue;
	}

	@Override
	public void handle(Request request, Response response) {
		if (request.getMethod().equals(Method.POST)) {
			logger.debug("Entering FIND operation...");
			try {
				// create JSON representation of the input
				JSONObject input = new JSONObject(request.getEntity().getText());
				// parse the canvas
				Set<Screen> canvas = new HashSet<Screen>();
				JSONArray jsonCanvas = input.getJSONArray("canvas");
				for (int i = 0; i < jsonCanvas.length(); i++) {
					URI uri = new URIImpl(((JSONObject)jsonCanvas.get(i)).getString("uri"));
					Screen s = catalogue.getScreen(uri);
					if (s == null)
						throw new NotFoundException("Screen "+uri+" does not exist.");
					canvas.add(s); 
				}
				// parse the domain context
				JSONObject jsonDomainContext = input.getJSONObject("domainContext");
				JSONArray jsonTags = jsonDomainContext.getJSONArray("tags");
				Set<URI> tags = new HashSet<URI>();
				for (int i = 0; i < jsonTags.length(); i++)
					tags.add(catalogue.getOrCreateTag(jsonTags.getString(i)));
				StringBuffer sb = new StringBuffer();
				for (URI tag : tags)
					sb.append(tag+" ");
				// TODO do something with the user
				String user = jsonDomainContext.getString("user");
				// parse the elements
//				Set<Screen> elements = new HashSet<Screen>();
				JSONArray jsonElements = input.getJSONArray("elements");
				for (int i = 0; i < jsonElements.length(); i++) {
					URI uri = new URIImpl(((JSONObject)jsonElements.get(i)).getString("uri"));
					Screen s = catalogue.getScreen(uri);
					if (s == null)
						throw new NotFoundException("Screen "+uri+" does not exist.");
					canvas.add(s); 
				}
				
				// make the call to the catalogue
				Set<Screen> results = catalogue.find(canvas, true, true, 0, 100000, tags);

				// write the results in the output
				JSONArray output = new JSONArray();
				for (Iterator<Screen> it = results.iterator(); it.hasNext(); ) {
					Screen s = it.next();
					output.put(s.toJSON());
					if (logger.isDebugEnabled())
						logger.debug("[MATCH] "+s.getUri());
				}
				response.setEntity(output.toString(2), MediaType.APPLICATION_JSON);
				response.setStatus(Status.SUCCESS_OK);
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
			} catch (NotFoundException e) {
				response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST, e.getMessage());
			} catch (RepositoryException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (OntologyInvalidException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			logger.debug("...Exiting FIND operation");
		} else {
			response.setStatus(Status.CLIENT_ERROR_METHOD_NOT_ALLOWED);
		}
	}


	
}

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
	
	//TODO remove this; only for the find recursive demo
	private boolean recursive = false;
	
	public SearchRestlet(Catalogue catalogue, boolean recursive) throws RepositoryException {
		super();
		this.catalogue = catalogue;
		this.recursive = recursive;
	}

	@Override
	public void handle(Request request, Response response) {
		if (request.getMethod().equals(Method.POST)) {
			logger.info("Entering FIND operation...");
			try {
				// create JSON representation of the input
				long st = System.currentTimeMillis();
				String text = request.getEntity().getText();
				System.out.println(System.currentTimeMillis()-st);
				st = System.currentTimeMillis();
				JSONObject input = new JSONObject(text);
				System.out.println(System.currentTimeMillis()-st);
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
				Set<String> tags = new HashSet<String>();
				for (int i = 0; i < jsonTags.length(); i++)
					tags.add(jsonTags.getString(i));
				StringBuffer sb = new StringBuffer();
				for (String tag : tags)
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
				Set<Screen> results = null;
				if (!this.recursive)
					results = catalogue.find(canvas, true, true, 0, 100000, tags);
				else
					results = catalogue.findRecursive(canvas, true, true, 0, 100000, tags);

				// write the results in the output
				JSONArray output = new JSONArray();
				for (Iterator<Screen> it = results.iterator(); it.hasNext(); ) {
					Screen s = it.next();
					JSONObject sJson = new JSONObject();
					sJson.put("uri", s.getUri());
					output.put(sJson);
					logger.info("[MATCH] "+s.getUri());
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
//			} catch (RepositoryException e) {
				// TODO Auto-generated catch block
//				e.printStackTrace();
//			} catch (OntologyInvalidException e) {
				// TODO Auto-generated catch block
//				e.printStackTrace();
			}
			logger.info("...Exiting FIND operation");
		} else {
			response.setStatus(Status.CLIENT_ERROR_METHOD_NOT_ALLOWED);
		}
	}


	
}

package eu.morfeoproject.fast.restserver;

import java.io.IOException;
import java.util.HashSet;
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
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.Screen;

/**
 * 
 * @author irivera
 */
public class SearchCheckRestlet extends CatalogueRestlet {

	static Logger logger = Logger.getLogger(SearchCheckRestlet.class);
	
	//TODO remove this; only for the find recursive demo
	private boolean recursive = false;
	
	public SearchCheckRestlet(Catalogue catalogue, boolean recursive) throws RepositoryException {
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
				// parse the elements
				Set<Screen> elements = new HashSet<Screen>();
				JSONArray jsonElements = input.getJSONArray("elements");
				for (int i = 0; i < jsonElements.length(); i++) {
					URI uri = new URIImpl(((JSONObject)jsonElements.get(i)).getString("uri"));
					Screen s = catalogue.getScreen(uri);
					if (s == null)
						throw new NotFoundException("Screen "+uri+" does not exist.");
					elements.add(s); 
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
				// parses the criterion
				String criterion = input.getString("criterion");

				// do the find work
				Set<Screen> results = null;
				Set<Screen> all = new HashSet<Screen>();
				all.addAll(canvas);
				all.addAll(elements);
				if (!this.recursive)
					results = catalogue.find(all, true, true, 0, 100000, tags);
				else
					results = catalogue.findRecursive(all, true, true, 0, 100000, tags);
				
				// do the check work 
				// add the results of the FIND to the elements to check
				elements.addAll(results);
				Set<Screen> reachables = catalogue.filterReachableScreens(canvas);
				JSONObject output = new JSONObject();
				if (criterion.equalsIgnoreCase("reachability")) {
					JSONArray canvasOut = new JSONArray();
					boolean reachability = true;
					for (Screen s : canvas) {
						reachability = true;
						JSONObject jsonScreen = new JSONObject();
						jsonScreen.put("uri", s.getUri());
						JSONArray preArray = new JSONArray();
						for (Condition c : s.getPreconditions()) {
							JSONObject jsonPre = new JSONObject();
							jsonPre.put("expression", c.toString());
							boolean satisfied = false;
							if (reachables.contains(s))
								satisfied = true;
							else
								satisfied = catalogue.isSatisfied(reachables, c, true, true, null);
							jsonPre.put("satisfied", satisfied);
							String strSatisfy = satisfied ? "SATISFIED" : "NO SATISFIED";
							logger.info("["+strSatisfy+"] "+c.getPatternString());
							reachability = reachability && satisfied;
							preArray.put(jsonPre);
						}
						jsonScreen.put("reachability", reachability);
						String strReachability = reachability ? "REACHABLE" : "NO REACHABLE";
						logger.info("["+strReachability+"] "+s.getUri());
						jsonScreen.put("preconditions", preArray);
						canvasOut.put(jsonScreen);
					}
					output.put("canvas", canvasOut);
					JSONArray elementsOut = new JSONArray();
					for (Screen s : elements) {
						reachability = true;
						JSONObject jsonScreen = new JSONObject();
						jsonScreen.put("uri", s.getUri());
						JSONArray preArray = new JSONArray();
						for (Condition c : s.getPreconditions()) {
							JSONObject jsonPre = new JSONObject();
							jsonPre.put("expression", c.toString());
							boolean satisfied = catalogue.isSatisfied(reachables, c, true, true, null);
							jsonPre.put("satisfied", satisfied);
							reachability = reachability && satisfied;
							preArray.put(jsonPre);
						}
						jsonScreen.put("reachability", reachability);
						jsonScreen.put("preconditions", preArray);
						elementsOut.put(jsonScreen);
					}
					output.put("elements", elementsOut);
					response.setEntity(output.toString(2), MediaType.APPLICATION_JSON);
					response.setStatus(Status.SUCCESS_OK);
				} else {
					response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST, "Critetion not allowed.");
				}
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
			}
			logger.info("...Exiting FIND operation");
		} else {
			response.setStatus(Status.CLIENT_ERROR_METHOD_NOT_ALLOWED);
		}
	}


	
}

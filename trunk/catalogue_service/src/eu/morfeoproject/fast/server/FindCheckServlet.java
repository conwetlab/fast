package eu.morfeoproject.fast.server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.Event;
import eu.morfeoproject.fast.model.Resource;
import eu.morfeoproject.fast.model.Screen;
import eu.morfeoproject.fast.model.Slot;

/**
 * Servlet implementation class CheckServlet
 */
public class FindCheckServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
	final Logger logger = LoggerFactory.getLogger(CheckServlet.class);
	
	/**
     * @see HttpServlet#HttpServlet()
     */
    public FindCheckServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		logger.info("Entering CHECK operation...");
		BufferedReader reader = request.getReader();
		PrintWriter writer = response.getWriter();
		String format = request.getHeader("accept") != null ? request.getHeader("accept") : MediaType.APPLICATION_JSON;
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();
		
		try {
			// create JSON representation of the input
			JSONObject input = new JSONObject(body);
			// parses the canvas
			HashSet<Resource> canvas = new HashSet<Resource>();
			JSONArray jsonCanvas = input.getJSONArray("canvas");
			for (int i = 0; i < jsonCanvas.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonCanvas.get(i)).getString("uri"));
				Resource r = CatalogueAccessPoint.getCatalogue().getResource(uri);
				if (r == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				canvas.add(r); 
			}
			// parses the list of elements
			HashSet<Resource> elements = new HashSet<Resource>();
			JSONArray jsonElements = input.getJSONArray("elements");
			for (int i = 0; i < jsonElements.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonElements.get(i)).getString("uri"));
				Resource r = CatalogueAccessPoint.getCatalogue().getResource(uri);
				if (r == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				elements.add(r); 
			}
			// parses the domain context
			JSONObject jsonDomainContext = input.getJSONObject("domainContext");
			JSONArray jsonTags = jsonDomainContext.getJSONArray("tags");
			HashSet<String> tags = new HashSet<String>();
			for (int i = 0; i < jsonTags.length(); i++)
				tags.add(jsonTags.getString(i));
			StringBuffer sb = new StringBuffer();
			for (String tag : tags)
				sb.append(tag+" ");
			// TODO do something with the user
			String user = jsonDomainContext.getString("user");
			// parses the criterion
			String criterion = input.getString("criterion");
			
			// do the real work
			HashSet<Resource> all = new HashSet<Resource>();
			all.addAll(canvas);
			all.addAll(elements);
			Set<URI> results = CatalogueAccessPoint.getCatalogue().find(all, true, true, 0, 100000, tags);
			// add results of 'find' to the list of elements
			for (URI uri : results)
				elements.add(CatalogueAccessPoint.getCatalogue().getResource(uri));
			Set<Resource> reachables = CatalogueAccessPoint.getCatalogue().filterReachableResources(canvas);
			JSONObject output = new JSONObject();
			if (criterion.equalsIgnoreCase("reachability")) {
				JSONArray canvasOut = new JSONArray();
				boolean reachability = true;
				for (Resource r : canvas) {
					JSONObject jsonResource = new JSONObject();
					if (r instanceof Screen) {
						Screen s = (Screen)r;
						jsonResource.put("uri", s.getUri());
						JSONArray preArray = new JSONArray();
						reachability = true;
						boolean satisfied = false;
						for (List<Condition> conList : s.getPreconditions()) { /* OR */
							JSONArray conArray = new JSONArray();
							satisfied = CatalogueAccessPoint.getCatalogue().isListSatisfied2(reachables, conList, true, true, s.getUri());
							reachability = reachability & satisfied;
							for (Condition c : conList) {
								JSONObject jsonPre = c.toJSON();
								jsonPre.put("satisfied", satisfied);
								conArray.put(jsonPre);
							}
							preArray.put(conArray);
						}
						jsonResource.put("reachability", reachability);
						logger.info("["+(reachability ? "REACHABLE" : "NO REACHABLE")+"] "+s.getUri());
						jsonResource.put("preconditions", preArray);
					} else if (r instanceof Slot) {
						jsonResource.put("uri", r.getUri());
						jsonResource.put("reachability", reachability);
					} else if (r instanceof Event) {
						Event e = (Event)r;
						jsonResource.put("uri", e.getUri());
						boolean satisfied = CatalogueAccessPoint.getCatalogue().isListSatisfied2(reachables, e.getConditions(), true, true, e.getUri());
						JSONArray conArray = new JSONArray();
						for (Condition c : e.getConditions()) {
							JSONObject jsonCon = c.toJSON();
							jsonCon.put("satisfied", satisfied);
							conArray.put(jsonCon);
						}
						jsonResource.put("conditions", conArray);
						jsonResource.put("reachability", satisfied);
						logger.info("["+(satisfied ? "REACHABLE" : "NO REACHABLE")+"] "+e.getUri());
					}
					canvasOut.put(jsonResource);
				}
				output.put("canvas", canvasOut);
				JSONArray elementsOut = new JSONArray();
				for (Resource r : elements) { //TODO finish it
					JSONObject jsonResource = new JSONObject();
					reachability = true;
					if (r instanceof Screen) {
						Screen s = (Screen)r;
						jsonResource.put("uri", s.getUri());
						JSONArray preArray = new JSONArray();
						reachability = true;
						boolean satisfied = false;
						for (List<Condition> conList : s.getPreconditions()) { /* OR */
							JSONArray conArray = new JSONArray();
							satisfied = CatalogueAccessPoint.getCatalogue().isListSatisfied2(reachables, conList, true, true, s.getUri());
							reachability = reachability & satisfied;
							for (Condition c : conList) {
								JSONObject jsonPre = c.toJSON();
								jsonPre.put("satisfied", satisfied);
								conArray.put(jsonPre);
							}
							preArray.put(conArray);
						}
						jsonResource.put("reachability", reachability);
						logger.info("["+(reachability ? "REACHABLE" : "NO REACHABLE")+"] "+s.getUri());
						jsonResource.put("preconditions", preArray);
					} else if (r instanceof Slot) {
						jsonResource.put("uri", r.getUri());
						jsonResource.put("reachability", reachability);
					}else if (r instanceof Event) {
						//TODO complete it
					}
					elementsOut.put(jsonResource);
				}
				output.put("elements", elementsOut);
				writer.print(output.toString(2));
				response.setContentType(MediaType.APPLICATION_JSON);
				response.setStatus(HttpServletResponse.SC_OK);
			} else {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST, "Critetion not allowed.");
			}
		} catch (JSONException e) {
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		} catch (NotFoundException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		}
		logger.info("...Exiting CHECK operation");
	}
	
}

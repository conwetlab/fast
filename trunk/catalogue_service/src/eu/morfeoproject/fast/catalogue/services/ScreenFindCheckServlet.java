package eu.morfeoproject.fast.catalogue.services;

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

import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.model.Condition;
import eu.morfeoproject.fast.catalogue.model.Postcondition;
import eu.morfeoproject.fast.catalogue.model.Precondition;
import eu.morfeoproject.fast.catalogue.model.Screen;

/**
 * Servlet implementation class ScreenFindCheckServlet
 */
public class ScreenFindCheckServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;
       
	/**
     * @see HttpServlet#HttpServlet()
     */
    public ScreenFindCheckServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader reader = request.getReader();
		PrintWriter writer = response.getWriter();
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
			HashSet<BuildingBlock> canvas = new HashSet<BuildingBlock>();
			JSONArray jsonCanvas = input.getJSONArray("canvas");
			for (int i = 0; i < jsonCanvas.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonCanvas.get(i)).getString("uri"));
				BuildingBlock r = getCatalogue().getBuildingBlock(uri);
				if (r == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				canvas.add(r); 
			}
			// parses the list of elements
			HashSet<BuildingBlock> elements = new HashSet<BuildingBlock>();
			JSONArray jsonElements = input.getJSONArray("elements");
			for (int i = 0; i < jsonElements.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonElements.get(i)).getString("uri"));
				BuildingBlock r = getCatalogue().getBuildingBlock(uri);
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
			HashSet<BuildingBlock> all = new HashSet<BuildingBlock>();
			all.addAll(canvas);
			all.addAll(elements);
			Set<URI> results = getCatalogue().findBackwards(all, true, true, 0, -1, tags);
			// add results of 'find' to the list of elements
			for (URI uri : results)
				elements.add(getCatalogue().getBuildingBlock(uri));
			Set<BuildingBlock> reachables = getCatalogue().filterReachableBuildingBlocks(canvas);
			JSONObject output = new JSONObject();
			if (criterion.equalsIgnoreCase("reachability")) {
				JSONArray canvasOut = new JSONArray();
				boolean reachability = true;
				for (BuildingBlock r : canvas) {
					JSONObject jsonResource = new JSONObject();
					if (r instanceof Screen) {
						Screen s = (Screen)r;
						jsonResource.put("uri", s.getUri());
						JSONArray preArray = new JSONArray();
						reachability = true;
						boolean satisfied = false;
						for (List<Condition> conList : s.getPreconditions()) { /* OR */
							JSONArray conArray = new JSONArray();
							satisfied = getCatalogue().isConditionSatisfied(reachables, conList, true, true, s.getUri());
							reachability = reachability & satisfied;
							for (Condition c : conList) {
								JSONObject jsonPre = c.toJSON();
								jsonPre.put("satisfied", satisfied);
								conArray.put(jsonPre);
							}
							preArray.put(conArray);
						}
						jsonResource.put("reachability", reachability);
						if (log.isInfoEnabled()) log.info("["+(reachability ? "REACHABLE" : "NO REACHABLE")+"] "+s.getUri());
						jsonResource.put("preconditions", preArray);
					} else if (r instanceof Precondition) {
						jsonResource.put("uri", r.getUri());
						jsonResource.put("reachability", true);
					} else if (r instanceof Postcondition) {
						Postcondition e = (Postcondition)r;
						jsonResource.put("uri", e.getUri());
						boolean satisfied = getCatalogue().isConditionSatisfied(reachables, e.getConditions(), true, true, e.getUri());
						JSONArray conArray = new JSONArray();
						for (Condition c : e.getConditions()) {
							JSONObject jsonCon = c.toJSON();
							jsonCon.put("satisfied", satisfied);
							conArray.put(jsonCon);
						}
						jsonResource.put("conditions", conArray);
						jsonResource.put("reachability", satisfied);
						if (log.isInfoEnabled()) log.info("["+(satisfied ? "REACHABLE" : "NO REACHABLE")+"] "+e.getUri());
					}
					canvasOut.put(jsonResource);
				}
				output.put("canvas", canvasOut);
				JSONArray elementsOut = new JSONArray();
				for (BuildingBlock r : elements) { //TODO finish it
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
							satisfied = getCatalogue().isConditionSatisfied(reachables, conList, true, true, s.getUri());
							reachability = reachability & satisfied;
							for (Condition c : conList) {
								JSONObject jsonPre = c.toJSON();
								jsonPre.put("satisfied", satisfied);
								conArray.put(jsonPre);
							}
							preArray.put(conArray);
						}
						jsonResource.put("reachability", reachability);
						if (log.isInfoEnabled()) log.info("["+(reachability ? "REACHABLE" : "NO REACHABLE")+"] "+s.getUri());
						jsonResource.put("preconditions", preArray);
					} else if (r instanceof Precondition) {
						jsonResource.put("uri", r.getUri());
						jsonResource.put("reachability", reachability);
					}else if (r instanceof Postcondition) {
						//TODO complete it
					}
					elementsOut.put(jsonResource);
				}
				output.put("elements", elementsOut);
				writer.print(output.toString(2));
				response.setContentType(MediaType.APPLICATION_JSON);
				response.setStatus(HttpServletResponse.SC_OK);
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Critetion not allowed.");
			}
		} catch (JSONException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (NotFoundException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_NOT_FOUND, e.getMessage());
		}
	}
	
}

package eu.morfeoproject.fast.catalogue.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashSet;
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
 * Servlet implementation class ScreenCheckServlet
 */
public class ScreenCheckServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;
       
	/**
     * @see HttpServlet#HttpServlet()
     */
    public ScreenCheckServlet() {
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
			Set<BuildingBlock> reachables = getCatalogue().filterReachableBuildingBlocks(canvas);
			JSONObject output = new JSONObject();
			if (criterion.equalsIgnoreCase("reachability")) {
				JSONArray canvasOut = new JSONArray();
				for (BuildingBlock bb : canvas) {
					JSONObject jsonResource = new JSONObject();
					boolean reachability = true, satisfied = false;
					if (bb instanceof Screen) {
						Screen s = (Screen) bb;
						jsonResource.put("uri", s.getUri());
						JSONArray preArray = new JSONArray();
						reachability = true;
						for (Condition condition : s.getPreconditions()) {
							satisfied = getCatalogue().isConditionSatisfied(reachables, condition, true, true, s.getUri());
							reachability = reachability & satisfied;
							JSONObject jsonPre = condition.toJSON();
							jsonPre.put("satisfied", satisfied);
							preArray.put(jsonPre);
						}
						jsonResource.put("reachability", reachability);
						jsonResource.put("preconditions", preArray);
					} else if (bb instanceof Precondition) {
						jsonResource.put("uri", bb.getUri());
						jsonResource.put("reachability", true);
					} else if (bb instanceof Postcondition) {
						Postcondition p = (Postcondition) bb;
						jsonResource.put("uri", p.getUri());
						JSONArray conArray = new JSONArray();
						reachability = true;
						for (Condition condition : p.getConditions()) {
							satisfied = getCatalogue().isConditionSatisfied(reachables, condition, true, true, p.getUri());
							JSONObject jsonCon = condition.toJSON();
							jsonCon.put("satisfied", satisfied);
							conArray.put(jsonCon);
						}
						jsonResource.put("conditions", conArray);
						jsonResource.put("reachability", reachability);
					}
					canvasOut.put(jsonResource);
				}
				output.put("canvas", canvasOut);
				JSONArray elementsOut = new JSONArray();
				for (BuildingBlock bb : elements) { //TODO finish it
					JSONObject jsonResource = new JSONObject();
					boolean reachability = true, satisfied = false;
					if (bb instanceof Screen) {
						Screen s = (Screen)bb;
						jsonResource.put("uri", s.getUri());
						JSONArray preArray = new JSONArray();
						reachability = true;
						for (Condition condition : s.getPreconditions()) {
							satisfied = getCatalogue().isConditionSatisfied(reachables, condition, true, true, s.getUri());
							reachability = reachability & satisfied;
							JSONObject jsonPre = condition.toJSON();
							jsonPre.put("satisfied", satisfied);
							preArray.put(jsonPre);
						}
						jsonResource.put("preconditions", preArray);
						jsonResource.put("reachability", reachability);
					} else if (bb instanceof Precondition) {
						jsonResource.put("uri", bb.getUri());
						jsonResource.put("reachability", true);
					}else if (bb instanceof Postcondition) {
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
			log.error(e.getMessage(), e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (NotFoundException e) {
			log.error(e.getMessage(), e);
			response.sendError(HttpServletResponse.SC_NOT_FOUND, e.getMessage());
		}
	}
	
}

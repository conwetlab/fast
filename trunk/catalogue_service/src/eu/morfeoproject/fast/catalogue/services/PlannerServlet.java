package eu.morfeoproject.fast.catalogue.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.BuildingBlockException;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.model.Screen;
import eu.morfeoproject.fast.catalogue.planner.Plan;

/**
 * Servlet implementation class PlannerServlet
 */
public class PlannerServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;
    
    /**
     * @throws IOException 
     * @see HttpServlet#HttpServlet()
     */
    public PlannerServlet() {
        super();
    }
	
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
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
			//	parse the goal or goal list
			ArrayList<URI> goalList = new ArrayList<URI>();
			try {
				JSONArray goalArray = input.getJSONArray("goal");
				for (int g = 0; g < goalArray.length(); g++) {
					URI uri = new URIImpl(goalArray.getString(g));
					BuildingBlock bb = getCatalogue().getBuildingBlock(uri);
					if (bb.getPrototype() == null) 
						throw new BuildingBlockException("Resource "+uri+" must be a clone of a prototype.");
					goalList.add(bb.getPrototype());
				}
			} catch (JSONException e) {
				log.debug("Goal attribute is not a list, maybe a single goal URI?");
				goalList.clear();
				goalList.add(new URIImpl(input.getString("goal")));
			}
			// parse the canvas
			ArrayList<URI> canvasUris = new ArrayList<URI>();
			ArrayList<Screen> canvas = new ArrayList<Screen>();
			JSONArray jsonCanvas = input.getJSONArray("canvas");
			for (int i = 0; i < jsonCanvas.length(); i++) {
				URI uri = new URIImpl(((JSONObject) jsonCanvas.get(i)).getString("uri"));
				Screen screen = getCatalogue().getScreen(uri);
				if (screen == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				canvas.add(screen);
				canvasUris.add(uri);
			}
			// parse 'page' and 'per_page' for pagination
			int page = input.has("page") ? input.getInt("page") : 0;
			int perPage = input.has("per_page") ? input.getInt("per_page") : 0;
			
			// calculate the plans for a certain goal
			List<Plan> plans = getCatalogue().searchPlans(goalList, canvas);
			
			// pagination
			if (page < 1) page = 1; // if no page, show page 1
			if (perPage > 0) {
				int fromIndex = (page - 1) * perPage;
				int toIndex = Math.min(page * perPage, plans.size());
				plans = plans.subList(fromIndex, toIndex);
			}
			
			// write the results in the output
			JSONArray output = new JSONArray();
			for (Plan plan : plans) {
				JSONArray jsonPlan = new JSONArray();
				for (URI uri : plan.getUriList(canvasUris))
					jsonPlan.put(uri);
				output.put(jsonPlan);
			}
			writer.print(output.toString(2));
			response.setContentType(MediaType.APPLICATION_JSON);
			response.setStatus(HttpServletResponse.SC_OK);
		} catch (JSONException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (NotFoundException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_NOT_FOUND, e.getMessage());
		} catch (BuildingBlockException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		}
	}
}

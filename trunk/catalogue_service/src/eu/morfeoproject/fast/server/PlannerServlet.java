package eu.morfeoproject.fast.server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashSet;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.planner.Plan;
import eu.morfeoproject.fast.model.Resource;

/**
 * Servlet implementation class PlannerServlet
 */
public class PlannerServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;
	final Logger logger = LoggerFactory.getLogger(PlannerServlet.class);
    
    /**
     * @throws IOException 
     * @see HttpServlet#HttpServlet()
     */
    public PlannerServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		CatalogueAccessPoint.getCatalogue().getPlanner().dump();
	}
	
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		logger.info("Entering PLANNER operation...");
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
			//	parse the goal
			URI goal = new URIImpl(input.getString("goal"));
			// parse the canvas
			HashSet<Resource> canvas = new HashSet<Resource>();
			JSONArray jsonCanvas = input.getJSONArray("canvas");
			for (int i = 0; i < jsonCanvas.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonCanvas.get(i)).getString("uri"));
				Resource r = CatalogueAccessPoint.getCatalogue().getResource(uri);
				if (r == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				canvas.add(r); 
			}
			
			// calculate the plans for a certain goal
			List<Plan> plans = CatalogueAccessPoint.getCatalogue().searchPlans(goal, canvas);
			
			// write the results in the output
			JSONArray output = new JSONArray();
			for (Plan plan : plans) {
				JSONArray jsonPlan = new JSONArray();
				for (URI uri : plan.getUriList())
					jsonPlan.put(uri);
				output.put(jsonPlan);
			}
			writer.print(output.toString(2));
			response.setContentType(MediaType.APPLICATION_JSON);
			response.setStatus(HttpServletResponse.SC_OK);
		} catch (JSONException e) {
			e.printStackTrace();
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		} catch (NotFoundException e) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		}
		logger.info("...Exiting PLANNER operation");
	}
}

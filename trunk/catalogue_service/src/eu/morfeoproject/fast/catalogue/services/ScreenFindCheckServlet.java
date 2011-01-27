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

import eu.morfeoproject.fast.catalogue.BuildingBlockException;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.builder.BuildingBlockJSONBuilder;
import eu.morfeoproject.fast.catalogue.model.Condition;
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

			// parses the canvas (screens and pre/postconditions)
			ArrayList<Screen> screens = new ArrayList<Screen>();
			ArrayList<Condition> preconditions = new ArrayList<Condition>();
			ArrayList<Condition> postconditions = new ArrayList<Condition>();
			JSONObject jsonCanvas = input.getJSONObject("canvas");
			JSONArray jsonScreens = jsonCanvas.getJSONArray("screens");
			for (int i = 0; i < jsonScreens.length(); i++) {
				URI uri = rdfFactory.createURI(((JSONObject) jsonScreens.get(i)).getString("uri"));
				Screen screen = getCatalogue().getScreen(uri);
				if (screen == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				if (screen.getPrototype() == null)
					throw new BuildingBlockException("Resource "+uri+" must be a clone of a prototype.");
				screens.add(screen); 
			}
			JSONArray jsonPreList = jsonCanvas.getJSONArray("preconditions");
			for (int i = 0; i < jsonPreList.length(); i++) {
				Condition condition = BuildingBlockJSONBuilder.buildCondition(jsonPreList.getJSONObject(i));
				preconditions.add(condition); 
			}
			JSONArray jsonPostList = jsonCanvas.getJSONArray("postconditions");
			for (int i = 0; i < jsonPostList.length(); i++) {
				Condition condition = BuildingBlockJSONBuilder.buildCondition(jsonPostList.getJSONObject(i));
				postconditions.add(condition); 
			}
			
			// parses the list of screens in the palette
			ArrayList<Screen> palette = new ArrayList<Screen>();
			JSONArray jsonPalette = input.getJSONArray("palette");
			for (int i = 0; i < jsonPalette.length(); i++) {
				URI uri = rdfFactory.createURI(((JSONObject) jsonPalette.get(i)).getString("uri"));
				Screen screen = getCatalogue().getScreen(uri);
				if (screen == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				palette.add(screen); 
			}
			
			// parses the domain context
			JSONObject jsonDomainContext = input.getJSONObject("domainContext");
			JSONArray jsonTags = jsonDomainContext.getJSONArray("tags");
			ArrayList<String> tags = new ArrayList<String>();
			for (int i = 0; i < jsonTags.length(); i++)
				tags.add(jsonTags.getString(i));
			StringBuffer sb = new StringBuffer();
			for (String tag : tags)
				sb.append(tag+" ");
			// TODO do something with the user
			String user = jsonDomainContext.getString("user");
			// parses the criterion
			String criterion = input.getString("criterion").toLowerCase();
			
			//-----------------
			// do the real work
			//-----------------
			ArrayList<Screen> all = new ArrayList<Screen>();
			all.addAll(screens);
			all.addAll(palette);
			List<URI> results = getCatalogue().findBackwards(all, preconditions, postconditions, true, true, 0, -1, tags);
			for (URI uri : results) // add results of 'find' to the palette
				palette.add(getCatalogue().getScreen(uri));
			
			JSONObject output = new JSONObject();
			if (criterion.equals("reachability")) {
				JSONArray screensOut = new JSONArray();
				JSONArray preOut = new JSONArray();
				JSONArray postOut = new JSONArray();

				List<Screen> reachables = getCatalogue().filterReachableScreens(preconditions, screens);
				for (Condition pre : preconditions) {
					JSONObject jsonPre = pre.toJSON();
					jsonPre.put("satisfied", true);
					preOut.put(jsonPre);
				}
				for (Condition post : postconditions) {
					JSONObject jsonPost = post.toJSON();
					jsonPost.put("satisfied", getCatalogue().isConditionSatisfied(preconditions, reachables, post, true, true, null));
					postOut.put(jsonPost);
				}
				for (Screen screen : screens) {
					JSONObject jsonScreen = new JSONObject();
					jsonScreen.put("uri", screen.getUri());
					JSONArray preArray = new JSONArray();
					boolean reachability = true, satisfied = false;
					for (Condition condition : screen.getPreconditions()) {
						satisfied = getCatalogue().isConditionSatisfied(preconditions, reachables, condition, true, true, screen.getUri());
						reachability = reachability & satisfied;
						JSONObject jsonPre = condition.toJSON();
						jsonPre.put("satisfied", satisfied);
						preArray.put(jsonPre);
					}
					jsonScreen.put("preconditions", preArray);
					jsonScreen.put("reachability", reachability);
					screensOut.put(jsonScreen);
				}
				
				JSONObject canvasOut = new JSONObject();
				canvasOut.put("screens", screensOut);
				canvasOut.put("preconditions", preOut);
				canvasOut.put("postconditions", postOut);
				output.put("canvas", canvasOut);
				
				// check reachability of the screens in the palette
				JSONArray paletteOut = new JSONArray();
				for (Screen screen : palette) { //TODO finish it
					JSONObject jsonScreen = new JSONObject();
					jsonScreen.put("uri", screen.getUri());
					JSONArray preArray = new JSONArray();
					boolean reachability = true, satisfied = false;
					for (Condition condition : screen.getPreconditions()) {
						satisfied = getCatalogue().isConditionSatisfied(preconditions, reachables, condition, true, true, screen.getUri());
						reachability = reachability & satisfied;
						JSONObject jsonPre = condition.toJSON();
						jsonPre.put("satisfied", satisfied);
						preArray.put(jsonPre);
					}
					jsonScreen.put("preconditions", preArray);
					jsonScreen.put("reachability", reachability);
					paletteOut.put(jsonScreen);
				}
				output.put("palette", paletteOut);
				
				writer.print(output.toString(2));
				response.setContentType(MediaType.APPLICATION_JSON);
				response.setStatus(HttpServletResponse.SC_OK);
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Criterion not allowed.");
			}
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

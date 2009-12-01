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
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.model.Action;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.Pipe;
import eu.morfeoproject.fast.model.ScreenComponent;
import eu.morfeoproject.fast.vocabulary.FGO;

/**
 * Servlet implementation class ScreenComponentFindCheckServlet
 */
public class ScreenComponentFindCheckServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;
       
	final Logger logger = LoggerFactory.getLogger(ScreenCheckServlet.class);
	
	/**
     * @see HttpServlet#HttpServlet()
     */
    public ScreenComponentFindCheckServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		logger.info("Entering FIND&CHECK operation...");
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
			// parses the preconditions
			List<Condition> preconditions = parseConditions(input.getJSONArray("preconditions"));
			// parses the preconditions
			List<Condition> postconditions = parseConditions(input.getJSONArray("postconditions"));
			// parses the canvas
			HashSet<ScreenComponent> canvas = new HashSet<ScreenComponent>();
			JSONArray jsonCanvas = input.getJSONArray("canvas");
			for (int i = 0; i < jsonCanvas.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonCanvas.get(i)).getString("uri"));
				ScreenComponent sc = (ScreenComponent) CatalogueAccessPoint.getCatalogue().getResource(uri);
				if (sc == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				canvas.add(sc);
			}
			// parses the list of forms
			HashSet<ScreenComponent> forms = new HashSet<ScreenComponent>();
			JSONArray jsonForms = input.getJSONArray("forms");
			for (int i = 0; i < jsonForms.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonForms.get(i)).getString("uri"));
				ScreenComponent sc = (ScreenComponent) CatalogueAccessPoint.getCatalogue().getResource(uri);
				if (sc == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				forms.add(sc); 
			}
			// parses the list of operators
			HashSet<ScreenComponent> operators = new HashSet<ScreenComponent>();
			JSONArray jsonOperators = input.getJSONArray("operators");
			for (int i = 0; i < jsonOperators.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonOperators.get(i)).getString("uri"));
				ScreenComponent sc = (ScreenComponent) CatalogueAccessPoint.getCatalogue().getResource(uri);
				if (sc == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				operators.add(sc); 
			}
			// parses the list of backend services
			HashSet<ScreenComponent> backendServices = new HashSet<ScreenComponent>();
			JSONArray jsonBackendServices = input.getJSONArray("backendservices");
			for (int i = 0; i < jsonBackendServices.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonBackendServices.get(i)).getString("uri"));
				ScreenComponent sc = (ScreenComponent) CatalogueAccessPoint.getCatalogue().getResource(uri);
				if (sc == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				backendServices.add(sc); 
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
			// parses the pipes
			List<Pipe> pipes = parsePipes(input.getJSONArray("pipes"));
			// parses the selected item
			URI selectedItem = new URIImpl(input.getString("selectedItem"));
			
			// do the real work
			HashSet<ScreenComponent> all = new HashSet<ScreenComponent>();
			all.addAll(canvas);
			all.addAll(forms);
			all.addAll(operators);
			all.addAll(backendServices);
			
			// create the output
			JSONObject output = new JSONObject();
			
			// add results of 'find' to the list of forms
			Set<URI> formResults = CatalogueAccessPoint.getCatalogue().findScreenComponents(null, all, 0, -1, tags, FGO.FormElement);
			for (URI uri : formResults)
				forms.add(CatalogueAccessPoint.getCatalogue().getScreenComponent(uri));
			// add results of 'find' to the list of operators
			Set<URI> opResults = CatalogueAccessPoint.getCatalogue().findScreenComponents(null, all, 0, -1, tags, FGO.Operator);
			for (URI uri : opResults)
				operators.add(CatalogueAccessPoint.getCatalogue().getScreenComponent(uri));			
			// add results of 'find' to the list of backend services
			Set<URI> bsResults = CatalogueAccessPoint.getCatalogue().findScreenComponents(null, all, 0, -1, tags, FGO.BackendService);
			for (URI uri : bsResults)
				backendServices.add(CatalogueAccessPoint.getCatalogue().getScreenComponent(uri));
			
			// check if the pipes are well defined
			JSONArray jsonPipes = new JSONArray();
			for (Pipe pipe : pipes) {
				JSONObject jsonPipe = pipe.toJSON();
				jsonPipe.put("satisfied", isPipeSatisfied(pipe, preconditions, postconditions));
				jsonPipes.put(jsonPipe);
			}
			output.put("pipes", jsonPipes);

			JSONArray canvasOut = new JSONArray();
			for (ScreenComponent sc : canvas)
				canvasOut.put(processComponent(sc, preconditions, postconditions, pipes));
			output.put("canvas", canvasOut);

			JSONArray formsOut = new JSONArray();
			for (ScreenComponent sc : forms)
				formsOut.put(sc.getUri());
			output.put("forms", formsOut);

			JSONArray operatorsOut = new JSONArray();
			for (ScreenComponent sc : operators)
				operatorsOut.put(sc.getUri());
			output.put("operators", operatorsOut);

			JSONArray servicesOut = new JSONArray();
			for (ScreenComponent sc : backendServices)
				servicesOut.put(sc.getUri());
			output.put("backendservices", servicesOut);

			JSONArray postOut = new JSONArray();
			for (Condition con : postconditions)
				postOut.put(processCondition(con, preconditions, postconditions, pipes));
			output.put("postconditions", postOut);
		
			writer.print(output.toString(2));
			response.setContentType(MediaType.APPLICATION_JSON);
			response.setStatus(HttpServletResponse.SC_OK);
		} catch (JSONException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (NotFoundException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_NOT_FOUND, e.getMessage());
		}
		logger.info("...Exiting FIND&CHECK operation");
	}
	
	private Condition getConditionById(List<Condition> conditions, String id) {
		for (Condition condition : conditions)
			if (condition.getId() != null && condition.getId().equals(id))
				return condition;
		return null;
	}

	private Condition getPreconditionById(ScreenComponent sc, String id) {
		for (Action action : sc.getActions())
			for (Condition condition : action.getPreconditions())
				if (condition.getId() != null && condition.getId().equals(id))
					return condition;
		return null;
	}
	
	private Condition getPostconditionById(ScreenComponent sc, String id) {
		for (List<Condition> conList : sc.getPostconditions())
			for (Condition condition : conList)
				if (condition.getId() != null && condition.getId().equals(id))
					return condition;
		return null;
	}
	
	private boolean isPipeSatisfied(Pipe pipe, List<Condition> preconditions, List<Condition> postconditions) throws IOException {
		boolean satisfied = false;
		Condition conFrom, conTo;
		if (pipe.getIdBBFrom() == null) {
			conFrom = getConditionById(preconditions, pipe.getIdConditionFrom());
		} else {
			ScreenComponent sc = CatalogueAccessPoint.getCatalogue().getScreenComponent(new URIImpl(pipe.getIdBBFrom()));
			conFrom = getPostconditionById(sc, pipe.getIdConditionFrom());
		}
		if (pipe.getIdBBTo() == null) {
			conTo = getConditionById(postconditions, pipe.getIdConditionTo());
		} else {
			ScreenComponent sc = CatalogueAccessPoint.getCatalogue().getScreenComponent(new URIImpl(pipe.getIdBBTo()));
			conTo = getPreconditionById(sc, pipe.getIdConditionFrom());
		}
		if (conFrom != null && conTo != null) {
			//TODO change this checking if both patterns are indeed compatible, not just comparing the strings
			if (conFrom.getPatternString().equals(conTo.getPatternString()))
				satisfied = true;
		}
		return satisfied;
	}
	
	private JSONObject processCondition(Condition condition, List<Condition> preconditions, List<Condition> postconditions, List<Pipe> pipes) throws JSONException, IOException {
		JSONObject jsonCon = new JSONObject();
		Pipe pipe = CatalogueAccessPoint.getCatalogue().getPipeToPostcondition(condition, pipes);
		boolean satisfied = pipe == null ? false : isPipeSatisfied(pipe, preconditions, postconditions);
		jsonCon.put("id", condition.getId());
		jsonCon.put("satisfied", satisfied);
		return jsonCon;
	}
	
	private JSONObject processComponent(ScreenComponent sc, List<Condition> preconditions, List<Condition> postconditions, List<Pipe> pipes) throws JSONException, IOException {
		JSONObject jsonSc = new JSONObject();
		jsonSc.put("uri", sc.getUri());
		JSONArray actionArray = new JSONArray();
		boolean reachability = true;
		for (Action action : sc.getActions()) {
			JSONArray conArray = new JSONArray();
			boolean satisfied = false;
			for (Condition con : action.getPreconditions()) {
				Pipe pipe = CatalogueAccessPoint.getCatalogue().getPipeToComponent(sc, action, con, pipes);
				satisfied = pipe == null ? false : isPipeSatisfied(pipe, preconditions, postconditions);
				reachability = reachability & satisfied;
				JSONObject jsonCon = con.toJSON();
				jsonCon.put("satisfied", satisfied);
				conArray.put(jsonCon);
			}
			JSONObject actObject = action.toJSON();
			actObject.put("preconditions", conArray);
			actionArray.put(actObject);
		}
		jsonSc.put("reachability", reachability);
		jsonSc.put("actions", actionArray);
		return jsonSc;
	}
	
}

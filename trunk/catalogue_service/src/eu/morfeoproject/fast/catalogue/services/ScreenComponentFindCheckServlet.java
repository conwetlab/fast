package eu.morfeoproject.fast.catalogue.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
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
import eu.morfeoproject.fast.catalogue.builder.BuildingBlockJSONBuilder;
import eu.morfeoproject.fast.catalogue.model.Action;
import eu.morfeoproject.fast.catalogue.model.Condition;
import eu.morfeoproject.fast.catalogue.model.Pipe;
import eu.morfeoproject.fast.catalogue.model.ScreenComponent;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

/**
 * Servlet implementation class ScreenComponentFindCheckServlet
 */
public class ScreenComponentFindCheckServlet extends GenericServlet {
	
	private static final long serialVersionUID = 1L;
       
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
			// parses the preconditions
			List<Condition> preconditions = BuildingBlockJSONBuilder.buildConditions(input.getJSONArray("preconditions"));
			// parses the preconditions
			List<Condition> postconditions = BuildingBlockJSONBuilder.buildConditions(input.getJSONArray("postconditions"));
			// parses the canvas
			HashSet<ScreenComponent> canvas = new HashSet<ScreenComponent>();
			JSONArray jsonCanvas = input.getJSONArray("canvas");
			for (int i = 0; i < jsonCanvas.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonCanvas.get(i)).getString("uri"));
				ScreenComponent sc = (ScreenComponent) getCatalogue().getBuildingBlock(uri);
				if (sc == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				canvas.add(sc);
			}
			// parses the list of forms
			HashSet<ScreenComponent> forms = new HashSet<ScreenComponent>();
			JSONArray jsonForms = input.getJSONArray("forms");
			for (int i = 0; i < jsonForms.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonForms.get(i)).getString("uri"));
				ScreenComponent sc = (ScreenComponent) getCatalogue().getBuildingBlock(uri);
				if (sc == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				forms.add(sc); 
			}
			// parses the list of operators
			HashSet<ScreenComponent> operators = new HashSet<ScreenComponent>();
			JSONArray jsonOperators = input.getJSONArray("operators");
			for (int i = 0; i < jsonOperators.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonOperators.get(i)).getString("uri"));
				ScreenComponent sc = (ScreenComponent) getCatalogue().getBuildingBlock(uri);
				if (sc == null) 
					throw new NotFoundException("Resource "+uri+" does not exist.");
				operators.add(sc); 
			}
			// parses the list of backend services
			HashSet<ScreenComponent> backendServices = new HashSet<ScreenComponent>();
			JSONArray jsonBackendServices = input.getJSONArray("backendservices");
			for (int i = 0; i < jsonBackendServices.length(); i++) {
				URI uri = new URIImpl(((JSONObject)jsonBackendServices.get(i)).getString("uri"));
				ScreenComponent sc = (ScreenComponent) getCatalogue().getBuildingBlock(uri);
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
			List<Pipe> pipes = BuildingBlockJSONBuilder.buildPipes(null, input.getJSONArray("pipes"));
			// parses the selected item
			Object selectedItem = null;
			if (input.has("selectedItem")) {
				selectedItem = getConditionById(preconditions, input.getString("selectedItem"));
				if (selectedItem == null) {
					selectedItem = getConditionById(postconditions, input.getString("selectedItem"));
					if (selectedItem == null)
						selectedItem = getCatalogue().getScreenComponent(new URIImpl(input.getString("selectedItem")));
				}
			} 
			// flag to search or not for new components
			boolean search = input.has("search") ? input.getBoolean("search") : true;
			
			// do the real work
			//-----------------------------
			HashSet<ScreenComponent> all = new HashSet<ScreenComponent>();
			all.addAll(canvas);
			all.addAll(forms);
			all.addAll(operators);
			all.addAll(backendServices);
			
			// preconditions of the screen and all postconditions of all components
			// are used to find new components
			ArrayList<Condition> conList = new ArrayList<Condition>();
	    	conList.addAll(preconditions);
			for (ScreenComponent comp : all) {
				conList.addAll(comp.getPostconditions());
			}
	    	
			// create the output
			JSONObject output = new JSONObject();
			
			// add results of 'find' to the list of forms
			if (search) {
				Set<URI> formResults = getCatalogue().findScreenComponents(null, conList, all, 0, -1, tags, FGO.Form);
				for (URI uri : formResults) {
					forms.add(getCatalogue().getScreenComponent(uri));
				}
				// add results of 'find' to the list of operators
				Set<URI> opResults = getCatalogue().findScreenComponents(null, conList, all, 0, -1, tags, FGO.Operator);
				for (URI uri : opResults) {
					operators.add(getCatalogue().getScreenComponent(uri));
				}
				// add results of 'find' to the list of backend services
				Set<URI> bsResults = getCatalogue().findScreenComponents(null, conList, all, 0, -1, tags, FGO.BackendService);
				for (URI uri : bsResults) {
					backendServices.add(getCatalogue().getScreenComponent(uri));
				}
			}
			
			// extract pipes which are well defined (precondition and
			// postcondition match)
			ArrayList<Pipe> correctPipeList = new ArrayList<Pipe>();
			for (Pipe pipe : pipes) {
				if (isPipeCorrect(pipe, preconditions, postconditions))
					correctPipeList.add(pipe);
			}
			
			// check if elements in the canvas + pre/postconditions are reachable
			List<Object> reachableElements = new ArrayList<Object>();
			reachableElements.addAll(getReachableElements(canvas, preconditions, postconditions, correctPipeList));
			
			// check if the pipes are well defined
			JSONArray jsonPipes = new JSONArray();
			for (Pipe pipe : pipes) {
				JSONObject jsonPipe = pipe.toJSON();
				jsonPipe.put("correct", correctPipeList.contains(pipe));
				jsonPipe.put("satisfied", reachableElements.contains(pipe));
				jsonPipes.put(jsonPipe);
			}
			output.put("pipes", jsonPipes);

			JSONArray canvasOut = new JSONArray();
			for (ScreenComponent sc : canvas) {
				canvasOut.put(processComponent(canvas, sc, pipes, reachableElements));
			}
			output.put("canvas", canvasOut);

			if (search) {
				JSONArray formsOut = new JSONArray();
				for (ScreenComponent sc : forms) {
					formsOut.put(sc.getUri());
				}
				output.put("forms", formsOut);
	
				JSONArray operatorsOut = new JSONArray();
				for (ScreenComponent sc : operators) {
					operatorsOut.put(sc.getUri());
				}
				output.put("operators", operatorsOut);
	
				JSONArray servicesOut = new JSONArray();
				for (ScreenComponent sc : backendServices) {
					servicesOut.put(sc.getUri());
				}
				output.put("backendservices", servicesOut);
			}
			
			JSONArray postOut = new JSONArray();
			for (Condition con : postconditions) {
				postOut.put(processPostcondition(canvas, con, pipes, reachableElements));
			}
			output.put("postconditions", postOut);
		
			if (selectedItem != null) {
				JSONArray connectionsOut = new JSONArray();
				List<Pipe> connections = generatePipes(canvas, preconditions, postconditions, selectedItem, pipes);
				for (Pipe pipe : connections)
					connectionsOut.put(pipe.toJSON());
				output.put("connections", connectionsOut);
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
		}
	}
	
	private Condition getConditionById(List<Condition> conditions, String id) {
		for (Condition condition : conditions) {
			if (condition.getId() != null 
					&& condition.getId().equals(id)) {
				return condition;
			}
		}
		return null;
	}

	private boolean isPipeCorrect(Pipe pipe, List<Condition> preconditions, List<Condition> postconditions) throws IOException {
		boolean satisfied = false;
		Condition conFrom, conTo;

		try {
			if (pipe.getBBFrom() == null) {
				conFrom = getConditionById(preconditions, pipe.getConditionFrom());
			} else {
				ScreenComponent sc = getCatalogue().getScreenComponent(pipe.getBBFrom());
				conFrom = sc.getPostcondition(pipe.getConditionFrom());
			}
			if (pipe.getBBTo() == null) {
				conTo = getConditionById(postconditions, pipe.getConditionTo());
			} else {
				ScreenComponent sc = getCatalogue().getScreenComponent(pipe.getBBTo());
				conTo = sc.getPrecondition(pipe.getConditionTo());
			}
			satisfied = isConditionCompatible(conFrom, conTo);
		} catch (NotFoundException e) {
			log.error(e.getMessage(), e);
			return false;
		}
		
		return satisfied;
	}
	
	private JSONObject processPostcondition(Set<ScreenComponent> canvas, Condition postcondition, List<Pipe> pipes, List<Object> elements) throws JSONException, IOException {
		JSONObject jsonCon = new JSONObject();
		Pipe pipe = getPipeToPostcondition(postcondition, pipes);
		boolean satisfied = pipe == null ? false : elements.contains(pipe);
		jsonCon.put("id", postcondition.getId());
		jsonCon.put("satisfied", satisfied);
		return jsonCon;
	}
	
	private JSONObject processComponent(Set<ScreenComponent> canvas, ScreenComponent sc, List<Pipe> pipes, List<Object> reachableElements) throws JSONException, IOException {
		JSONObject jsonSc = new JSONObject();
		jsonSc.put("uri", sc.getUri());
		JSONArray actionArray = new JSONArray();
		boolean reachability = sc.getActions().isEmpty() ? true : false;
		for (Action action : sc.getActions()) {
			JSONArray conArray = new JSONArray();
			boolean actionSatisfied = true;
			for (Condition con : action.getPreconditions()) {
				Pipe pipe = getPipeToComponent(sc, action, con, pipes);
				boolean conSatisfied = pipe == null ? false : reachableElements.contains(pipe);
				actionSatisfied = actionSatisfied && conSatisfied;
				JSONObject jsonCon = con.toJSON();
				jsonCon.put("satisfied", conSatisfied);
				conArray.put(jsonCon);
			}
			reachability = reachability || actionSatisfied;
			JSONObject actObject = action.toJSON();
			actObject.put("preconditions", conArray);
			actObject.put("satisfied", actionSatisfied);
			actionArray.put(actObject);
		}
		jsonSc.put("reachability", reachability);
		jsonSc.put("actions", actionArray);
		return jsonSc;
	}
	
	private boolean isConditionCompatible(Condition conA, Condition conB) throws IOException {
		return getCatalogue().isConditionCompatible(conA, conB);
	}
	
	private List<Pipe> generatePipes(
			Set<ScreenComponent> canvas,
			List<Condition> preconditions,
			List<Condition> postconditions,
			Object selectedItem,
			List<Pipe> pipes) throws IOException {
		ArrayList<Pipe> pipeList = new ArrayList<Pipe>();
		
		if (selectedItem instanceof ScreenComponent) {
			ScreenComponent component = (ScreenComponent) selectedItem;
			// look for pipes from <somewhere> to the preconditions of the selected item
			for (Action action : component.getActions()) {
				for (Condition pre : action.getPreconditions()) {
					for (Condition con : preconditions) {
						if (isConditionCompatible(con, pre)) {
							Pipe pipe = new Pipe(null);
							pipe.setBBFrom(null);
							pipe.setConditionFrom(con.getId());
							pipe.setBBTo(component.getUri());
							pipe.setActionTo(action.getName());
							pipe.setConditionTo(pre.getId());
							if (!pipes.contains(pipe)) pipeList.add(pipe);
						}
					}
					for (ScreenComponent sc : canvas) {
						if (sc.equals(component)) {
							// discard selected item
						} else {
							for (Condition con : sc.getPostconditions()) {
								if (isConditionCompatible(con, pre)) {
									Pipe pipe = new Pipe(null);
									pipe.setBBFrom(sc.getUri());
									pipe.setConditionFrom(con.getId());
									pipe.setBBTo(component.getUri());
									pipe.setActionTo(action.getName());
									pipe.setConditionTo(pre.getId());
									if (!pipes.contains(pipe)) pipeList.add(pipe);
								}
							}
						}
					}
				}
			}
			// look for pipes from the postconditions the selected item to <somewhere>
			for (Condition con : component.getPostconditions()) {
				for (Condition post : postconditions) {
					if (isConditionCompatible(con, post)) {
						Pipe pipe = new Pipe(null);
						pipe.setBBFrom(component.getUri());
						pipe.setConditionFrom(con.getId());
						pipe.setBBTo(null);
						pipe.setActionTo(null);
						pipe.setConditionTo(post.getId());
						if (!pipes.contains(pipe)) pipeList.add(pipe);
					}
				}
				for (ScreenComponent sc : canvas) {
					if (sc.equals(component)) break; // discard selected item
					for (Action action : sc.getActions()) {
						for (Condition pre : action.getPreconditions()) {
							if (isConditionCompatible(con, pre)) {
								Pipe pipe = new Pipe(null);
								pipe.setBBFrom(component.getUri());
								pipe.setConditionFrom(con.getId());
								pipe.setBBTo(sc.getUri());
								pipe.setActionTo(action.getName());
								pipe.setConditionTo(pre.getId());
								if (!pipes.contains(pipe)) pipeList.add(pipe);
							}
						}
					}
				}
			}
		} else {
			Condition condition = (Condition) selectedItem;
			if (preconditions.contains(condition)) {
				// look for pipes from the precondition to <somewhere>
				for (ScreenComponent sc : canvas) {
					for (Action action : sc.getActions()) {
						for (Condition pre : action.getPreconditions()) {
							if (isConditionCompatible(pre, condition)) {
								Pipe pipe = new Pipe(null);
								pipe.setBBFrom(null);
								pipe.setConditionFrom(condition.getId());
								pipe.setBBTo(sc.getUri());
								pipe.setActionTo(action.getName());
								pipe.setConditionTo(pre.getId());
								if (!pipes.contains(pipe))
									pipeList.add(pipe);
							}
						}
					}
				}
			} else if (postconditions.contains(condition)) {
				// look for pipes from <somewhere> to the postcondition
				for (ScreenComponent sc : canvas) {
					for (Condition con : sc.getPostconditions()) {
						if (isConditionCompatible(con, condition)) {
							Pipe pipe = new Pipe(null);
							pipe.setBBFrom(sc.getUri());
							pipe.setConditionFrom(con.getId());
							pipe.setBBTo(null);
							pipe.setActionTo(null);
							pipe.setConditionTo(condition.getId());
							if (!pipes.contains(pipe)) pipeList.add(pipe);
						}
					}
				}
			}
		}
		
		return pipeList;
	}
	
	private List<Object> getReachableElements(
			Set<ScreenComponent> scList,
			List<Condition> preconditions, 
			List<Condition> postconditions,
			List<Pipe> pipes) {
		List<Object> elements = new ArrayList<Object>();

		// pipes from preconditions are reachable
		List<Pipe> reachablePipeList = getPipesFrom(pipes, null);
		
		// screen components without actions, or having an action without
		// preconditions are reachable
		List<ScreenComponent> reachableSCList = new ArrayList<ScreenComponent>();
		for (ScreenComponent sc : scList) {
			boolean reachable = false;
			if (sc.getActions().size() == 0) {
				reachable = true;
			} else {
				for (Action action : sc.getActions()) {
					if (action.getPreconditions().size() == 0) {
						reachable = true;
						break;
					}
				}
			}
			if (reachable) {
				reachableSCList.add(sc);
				reachablePipeList.addAll(getPipesFrom(pipes, sc.getUri().toString()));
			}
		}
		
		// at first, no postcondition is reachable
		List<Condition> reachablePost = new ArrayList<Condition>();
		
		// screen components connected to reachable pipes are also reachable
		List<Pipe> pipesToCheck = new ArrayList<Pipe>(reachablePipeList);
		List<Pipe> nextPipeList = new ArrayList<Pipe>();
		while (pipesToCheck.size() > 0) {
			for (Pipe pipe : pipesToCheck) {
				if (pipe.getBBTo() == null) {
					// it's a postcondition
					Condition post = getConditionById(postconditions, pipe.getConditionTo());
					if (reachablePost.contains(post))
						reachablePost.add(post);
				} else {
					ScreenComponent sc = getScreenComponent(scList, pipe.getBBTo());
					if (!reachableSCList.contains(sc)) {
						reachableSCList.add(sc);
						List<Pipe> toAdd = getPipesFrom(pipes, sc.getUri().toString());
						reachablePipeList.addAll(toAdd);
						nextPipeList.addAll(toAdd);
					}
				}
			}
			// if no new pipes are reachable, the loop finishes
			pipesToCheck.clear();
			pipesToCheck.addAll(nextPipeList);
			nextPipeList.clear();
		}

		// puts all reachable elements together
		elements.addAll(reachablePipeList);
		elements.addAll(reachableSCList);
		elements.addAll(reachablePost);
		
		return elements;
	}
	
	private ScreenComponent getScreenComponent(Set<ScreenComponent> scList, URI uri) {
		for (ScreenComponent sc : scList) {
			if (sc.getUri().equals(uri)) return sc;
		}
		return null;
	}
	
	private List<Pipe> getPipesFrom(List<Pipe> pipes, String bbFrom) {
		ArrayList<Pipe> results = new ArrayList<Pipe>();
		for (Pipe pipe : pipes) {
			if (bbFrom == null && pipe.getBBFrom() == null) {
				results.add(pipe);
			} else if (bbFrom != null && pipe.getBBFrom() != null && bbFrom.equals(pipe.getBBFrom())) {
				results.add(pipe);
			}
		}
		return results;
	}
	
	/**
	 * Returns the pipe which connects any other screen component to a precondition within this 
	 * component, null in case there is no pipe connecting it
	 * @param sc
	 * @param action
	 * @param precondition
	 * @param pipes
	 * @return
	 */
	private Pipe getPipeToComponent(ScreenComponent sc, Action action, Condition precondition, List<Pipe> pipes) {
		for (Pipe pipe : pipes) {
			if (pipe.getBBTo() != null 
					&& pipe.getBBTo().equals(sc.getUri())
					&& pipe.getActionTo().equals(action.getName())
					&& pipe.getConditionTo().equals(precondition.getId())) {
				return pipe;
			}
		}
		return null;
	}
	
	/**
	 * Returns the pipe which connects a (screen) postcondition to any other screen component, null in
	 * case there is no pipe connecting it
	 * @param precondition
	 * @param pipes
	 * @return
	 */
	public Pipe getPipeToPostcondition(Condition postcondition, List<Pipe> pipes) {
		for (Pipe pipe : pipes) {
			if (pipe.getBBTo() == null
					&& pipe.getConditionTo().equals(postcondition.getId())) {
				return pipe;
			}
		}
		return null;
	}

}
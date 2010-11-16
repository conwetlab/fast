package eu.morfeoproject.fast.catalogue.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.Syntax;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.BuildingBlockException;
import eu.morfeoproject.fast.catalogue.BuildingBlockJSONBuilder;
import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.CatalogueAccessPoint;
import eu.morfeoproject.fast.catalogue.DuplicatedBuildingBlockException;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.buildingblocks.Concept;
import eu.morfeoproject.fast.catalogue.util.Util;

/**
 * Servlet implementation class ConceptServlet
 */
public class ConceptServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

	static Logger logger = LoggerFactory.getLogger(ConceptServlet.class);
    
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ConceptServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 * To retrieve all the concepts: /concepts
	 * To retrieve a specific concept: /concepts/<uri>
	 * To retrieve all the concepts annotated with some tag: /tags/<tag1>+...+<tagN>/concepts
	 * Doesn't make sense to retrieve a concept with a certain id
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter writer = response.getWriter();
		String format = request.getHeader("accept") != null ? request.getHeader("accept") : MediaType.APPLICATION_JSON;
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("concepts")) id = null;
		String[] tags = null;
		if (chunks[chunks.length-3].equalsIgnoreCase("tags"))
			tags = Util.splitTags(chunks[chunks.length-2]);
		Catalogue catalogue = CatalogueAccessPoint.getCatalogue();
		
		if (id == null) {
			// List the members of the collection
			logger.info("Retrieving all concepts");
			try {
				if (format.equals(MediaType.APPLICATION_RDF_XML) ||
						format.equals(MediaType.APPLICATION_TURTLE)) {
					response.setContentType(format);
					Model model = RDF2Go.getModelFactory().createModel();
					model.open();
					for (URI uri : catalogue.getConcepts(tags)) {
						Concept concept = catalogue.getConcept(uri);
						model.addModel(concept.toRDF2GoModel());
					}
					model.writeTo(writer, Syntax.forMimeType(format));
					model.close();
				} else {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONArray concepts = new JSONArray();
					for (URI uri : catalogue.getConcepts(tags)) {
						Concept concept = catalogue.getConcept(uri);
						concepts.put(concept.toJSON());
					}
					writer.print(concepts.toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (JSONException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			}
		}
		writer.close();
	}

	/**
	 * Adds the information given to a certain concept. If the concepts does not exist, it will
	 * create it.
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader reader = request.getReader();
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();
		Catalogue catalogue = CatalogueAccessPoint.getCatalogue();
		
		try {
			JSONObject json = new JSONObject(body);
			if (json.has("name") && json.has("domain")) {
				String name = json.getString("name");
				String domain = json.getString("domain");
				URI uri = catalogue.createConceptURI(name, domain);
				Concept concept = BuildingBlockJSONBuilder.buildConcept(json, uri);
				catalogue.addConcept(concept);
				response.setStatus(HttpServletResponse.SC_OK);
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "URI is required.");
			}
		} catch (IllegalArgumentException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (DuplicatedBuildingBlockException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (JSONException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (BuildingBlockException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		}
	}

	/**
	 * Update the information about a concept. "Update" means the concept will be deleted and created again with
	 * the new information. If the concept does not exist it will be created.
	 * @see HttpServlet#doPut(HttpServletRequest, HttpServletResponse)
	 */
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		BufferedReader reader = request.getReader();
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();
		if (id.equalsIgnoreCase("concepts")) id = null;
		Catalogue catalogue = CatalogueAccessPoint.getCatalogue();
		
		if (id == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "An ID must be specified.");
		} else {
			// Update the given member of the collection.
			String uri = request.getRequestURL().toString();
			try {
				JSONObject json = new JSONObject(body);
				Concept concept = BuildingBlockJSONBuilder.buildConcept(json, new URIImpl(uri));
				catalogue.updateConcept(concept);
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (IllegalArgumentException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (NotFoundException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (JSONException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (BuildingBlockException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			}
		}
	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("concepts")) id = null;
		Catalogue catalogue = CatalogueAccessPoint.getCatalogue();
		
		if (id == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "An ID must be specified.");
		} else {
			// Delete the addressed member of the collection.
			String uri = request.getRequestURL().toString();
			try {
				catalogue.removeConcept(new URIImpl(uri));
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (NotFoundException e) {
				response.sendError(HttpServletResponse.SC_NOT_FOUND, "The concept "+uri+" has not been found.");
			}
		}
	}
	
}

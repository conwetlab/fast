package eu.morfeoproject.fast.server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;

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
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.DuplicatedResourceException;
import eu.morfeoproject.fast.catalogue.InvalidResourceTypeException;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.OntologyInvalidException;
import eu.morfeoproject.fast.model.FormElement;
import eu.morfeoproject.fast.util.URLUTF8Encoder;

/**
 * Servlet implementation class FormElementServlet
 */
public class FormElementServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

	static Logger logger = LoggerFactory.getLogger(FormElementServlet.class);
    
    /**
     * @see HttpServlet#HttpServlet()
     */
    public FormElementServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter writer = response.getWriter();
		String format = request.getHeader("accept") != null ? request.getHeader("accept") : MediaType.APPLICATION_JSON;
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("forms")) id = null;
		
		if (id == null) {
			// List the members of the collection
			logger.info("Retrieving all formElements");
			try {
				if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model model = RDF2Go.getModelFactory().createModel();
					try {
						model.open();
						for (FormElement f : CatalogueAccessPoint.getCatalogue().listFormElements()) {
							Model feModel = f.createModel();
							for (String ns : feModel.getNamespaces().keySet())
								model.setNamespace(ns, feModel.getNamespace(ns));
							model.addModel(feModel);
							feModel.close();
						}
						model.writeTo(writer, Syntax.RdfXml);
					} catch (Exception e) {
						e.printStackTrace();
					} finally {
						model.close();
					}
				} else { //if (format.equals(MediaType.APPLICATION_JSON)) {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONArray formElements = new JSONArray();
					for (FormElement f : CatalogueAccessPoint.getCatalogue().listFormElements())
						formElements.put(f.toJSON());
					writer.print(formElements.toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (JSONException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			}
		} else {
			// Retrieve the addressed member of the collection
			String uri = request.getRequestURL().toString();
			logger.info("Retrieving formElement "+uri);
			FormElement f = CatalogueAccessPoint.getCatalogue().getFormElement(new URIImpl(uri));
			if (f == null) {
				response.sendError(HttpServletResponse.SC_NOT_FOUND, "The resource "+uri+" has not been found.");
			} else {
				try {
					if (format.equals(MediaType.APPLICATION_RDF_XML)) {
						response.setContentType(MediaType.APPLICATION_RDF_XML);
						Model feModel = f.createModel();
						feModel.writeTo(writer, Syntax.RdfXml);
						feModel.close();
					} else {
						response.setContentType(MediaType.APPLICATION_JSON);
						writer.print(f.toJSON().toString(2));
					}				
					response.setStatus(HttpServletResponse.SC_OK);
				} catch (JSONException e) {
					e.printStackTrace();
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
				}
			}
		}
		writer.close();
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

		// Create a new entry in the collection where the ID is assigned automatically by 
		// the collection and it is returned.
		try {
			JSONObject json = new JSONObject(body);
			FormElement formElement = parseFormElement(json, null);
			try {
				CatalogueAccessPoint.getCatalogue().addFormElement(formElement);
				if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model formElementModel = formElement.createModel();
					formElementModel.writeTo(writer, Syntax.RdfXml);
					formElementModel.close();
				} else {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONObject newForm = formElement.toJSON();						
					for (Iterator it = newForm.keys(); it.hasNext(); ) {
						String key = it.next().toString();
						json.put(key, newForm.get(key));
					}
					writer.print(json.toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (DuplicatedResourceException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (OntologyInvalidException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (InvalidResourceTypeException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			}
		} catch (JSONException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (IOException e) {
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		}	
	}

	/**
	 * @see HttpServlet#doPut(HttpServletRequest, HttpServletResponse)
	 */
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader reader = request.getReader();
		PrintWriter writer = response.getWriter();
		String format = request.getHeader("accept") != null ? request.getHeader("accept") : MediaType.APPLICATION_JSON;
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("forms")) id = null;
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();
		
		if (id == null) {
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		} else {
			// Update the addressed member of the collection or create it with a defined ID.
			String uri = request.getRequestURL().toString();
			try {
				JSONObject json = new JSONObject(body);
				FormElement formElement = parseFormElement(json, new URIImpl(uri));
				CatalogueAccessPoint.getCatalogue().updateFormElement(formElement);
				if (format.equals(MediaType.APPLICATION_RDF_XML)) {
					response.setContentType(MediaType.APPLICATION_RDF_XML);
					Model formElementModel = formElement.createModel();
					formElementModel.writeTo(writer, Syntax.RdfXml);
					formElementModel.close();
				} else {
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONObject newForm = formElement.toJSON();						
					for (Iterator it = newForm.keys(); it.hasNext(); ) {
						String key = it.next().toString();
						json.put(key, newForm.get(key));
					}
					writer.print(json.toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (JSONException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (IOException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (NotFoundException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_NOT_FOUND, "The resource "+uri+" has not been found.");
			}
		}
	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("forms")) id = null;
		
		if (id == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "An ID must be specified.");
		} else {
			// Delete the addressed member of the collection.
			String uri = request.getRequestURL().toString();
			try {
				CatalogueAccessPoint.getCatalogue().removeFormElement(new URIImpl(uri));
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (NotFoundException e) {
				response.sendError(HttpServletResponse.SC_NOT_FOUND, "The resource "+uri+" has not been found.");
			}
		}
	}

}

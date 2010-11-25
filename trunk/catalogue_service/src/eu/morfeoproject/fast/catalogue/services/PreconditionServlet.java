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
import org.ontoware.rdf2go.model.node.impl.URIImpl;

import eu.morfeoproject.fast.catalogue.BuildingBlockException;
import eu.morfeoproject.fast.catalogue.DuplicatedException;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.OntologyInvalidException;
import eu.morfeoproject.fast.catalogue.builder.BuildingBlockJSONBuilder;
import eu.morfeoproject.fast.catalogue.htmltemplates.BuildingBlockTemplate;
import eu.morfeoproject.fast.catalogue.htmltemplates.CollectionTemplate;
import eu.morfeoproject.fast.catalogue.htmltemplates.TemplateManager;
import eu.morfeoproject.fast.catalogue.model.Precondition;
import eu.morfeoproject.fast.catalogue.services.util.Accept;
import freemarker.template.TemplateException;

/**
 * Servlet implementation class PreconditionServlet
 */
public class PreconditionServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public PreconditionServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter writer = response.getWriter();
		Accept accept = new Accept(request);
		String format = accept.isEmpty() ? "" : accept.getDominating();
		String servlet = request.getServletPath();
		String url = request.getRequestURL().toString();
		String[] chunks = url.substring(url.indexOf(servlet) + 1).split("/");
		String id = chunks.length > 1 ? chunks[1] : null;
		String extension = chunks.length > 2 ? chunks[2] : null;
		if (MediaType.forExtension(id) != "") {
			extension = id;
			id = null;
		}

		if (extension == null) {
			redirectToFormat(request, response, format);
		} else {
			if (id == null) {
				// List the members of the collection
				if (log.isInfoEnabled()) log.info("Retrieving all preconditions");
				// Override format regarding the given extension
				format = MediaType.forExtension(extension);
				try {
					if (format.equals(MediaType.APPLICATION_RDF_XML) ||
							format.equals(MediaType.APPLICATION_TURTLE)) {
						response.setContentType(format);
						Model model = RDF2Go.getModelFactory().createModel();
						try {
							model.open();
							for (Precondition s : getCatalogue().getAllPreconditions()) {
								Model preModel = s.toRDF2GoModel();
								for (String ns : preModel.getNamespaces().keySet())
									model.setNamespace(ns, preModel.getNamespace(ns));
								model.addModel(preModel);
								preModel.close();
							}
							model.writeTo(writer, Syntax.forMimeType(format));
						} catch (Exception e) {
							log.error(e.toString(), e);
						} finally {
							model.close();
						}
					} else if (format.equals(MediaType.TEXT_HTML)) {
						response.setContentType(format);
						if (TemplateManager.getDefaultEncoding() != null)
							response.setCharacterEncoding(TemplateManager.getDefaultEncoding());
						if (TemplateManager.getLocale() != null)
							response.setLocale(TemplateManager.getLocale());
						CollectionTemplate.process(getCatalogue().getAllPreconditions(), writer);
					} else { // by default APPLICATION_JSON
						response.setContentType(MediaType.APPLICATION_JSON);
						JSONArray pres = new JSONArray();
						for (Precondition s : getCatalogue().getAllPreconditions())
							pres.put(s.toJSON());
						writer.print(pres.toString(2));
					}
					response.setStatus(HttpServletResponse.SC_OK);
				} catch (JSONException e) {
					log.error(e.toString(), e);
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
				} catch (TemplateException e) {
					log.error(e.toString(), e);
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
				}
			} else {
				// Override format regarding the given extension
				format = MediaType.forExtension(extension);
				// Retrieve the addressed member of the collection
				String uri = url.substring(0, url.indexOf(extension) - 1);
				try {
					Precondition pre = getCatalogue().getPrecondition(new URIImpl(uri));
					if (format.equals(MediaType.APPLICATION_RDF_XML) ||
							format.equals(MediaType.APPLICATION_TURTLE)) {
						response.setContentType(format);
						Model preModel = pre.toRDF2GoModel();
						preModel.writeTo(writer, Syntax.forMimeType(format));
						preModel.close();
					} else if (format.equals(MediaType.TEXT_HTML)) {
						response.setContentType(format);
						if (TemplateManager.getDefaultEncoding() != null)
							response.setCharacterEncoding(TemplateManager.getDefaultEncoding());
						if (TemplateManager.getLocale() != null)
							response.setLocale(TemplateManager.getLocale());
						BuildingBlockTemplate.process(pre, writer);
					} else {
						response.setContentType(MediaType.APPLICATION_JSON);
						writer.print(pre.toJSON().toString(2));
					}				
					response.setStatus(HttpServletResponse.SC_OK);
				} catch (NotFoundException e1) {
					response.sendError(HttpServletResponse.SC_NOT_FOUND, "The resource "+uri+" has not been found.");
				} catch (JSONException e) {
					log.error(e.toString(), e);
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
				} catch (TemplateException e) {
					log.error(e.toString(), e);
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
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
		Accept accept = new Accept(request);
		String format = accept.isEmpty() ? "" : accept.getDominating();
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
			Precondition pre = BuildingBlockJSONBuilder.buildPrecondition(json, null);
			try {
				getCatalogue().addPreOrPost(pre);
				if (format.equals(MediaType.APPLICATION_RDF_XML) ||
						format.equals(MediaType.APPLICATION_TURTLE)) {
					response.setContentType(format);
					Model preModel = pre.toRDF2GoModel();
					preModel.writeTo(writer, Syntax.forMimeType(format));
					preModel.close();
				} else if (format.equals(MediaType.TEXT_HTML)) {
					response.setContentType(format);
					if (TemplateManager.getDefaultEncoding() != null)
						response.setCharacterEncoding(TemplateManager.getDefaultEncoding());
					if (TemplateManager.getLocale() != null)
						response.setLocale(TemplateManager.getLocale());
					BuildingBlockTemplate.process(pre, writer);
				} else {
					response.setContentType(MediaType.APPLICATION_JSON);
					writer.print(pre.toJSON().toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (DuplicatedException e) {
				log.error(e.toString(), e);
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (OntologyInvalidException e) {
				log.error(e.toString(), e);
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (BuildingBlockException e) {
				log.error(e.toString(), e);
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (TemplateException e) {
				log.error(e.toString(), e);
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
			}
		} catch (JSONException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		} catch (IOException e) {
			log.error(e.toString(), e);
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
		}	
	}

	/**
	 * @see HttpServlet#doPut(HttpServletRequest, HttpServletResponse)
	 */
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		BufferedReader reader = request.getReader();
		PrintWriter writer = response.getWriter();
		Accept accept = new Accept(request);
		String format = accept.isEmpty() ? "" : accept.getDominating();
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("screens")) id = null;
		StringBuffer buffer = new StringBuffer();
		String line = reader.readLine();
		while (line != null) {
			buffer.append(line);
			line = reader.readLine();
		}
		String body = buffer.toString();
		
		if (id == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "An ID must be specified.");
		} else {
			// Update the addressed member of the collection or create it with a defined ID.
			String uri = request.getRequestURL().toString();
			try {
				JSONObject json = new JSONObject(body);
				Precondition pre = BuildingBlockJSONBuilder.buildPrecondition(json, new URIImpl(uri));
				getCatalogue().updatePreOrPost(pre);
				if (format.equals(MediaType.APPLICATION_RDF_XML) ||
						format.equals(MediaType.APPLICATION_TURTLE)) {
					response.setContentType(format);
					Model preModel = pre.toRDF2GoModel();
					preModel.writeTo(writer, Syntax.forMimeType(format));
					preModel.close();
				} else if (format.equals(MediaType.TEXT_HTML)) {
					response.setContentType(format);
					if (TemplateManager.getDefaultEncoding() != null)
						response.setCharacterEncoding(TemplateManager.getDefaultEncoding());
					if (TemplateManager.getLocale() != null)
						response.setLocale(TemplateManager.getLocale());
					BuildingBlockTemplate.process(pre, writer);
				} else {
					response.setContentType(MediaType.APPLICATION_JSON);
					writer.print(pre.toJSON().toString(2));
				}
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (JSONException e) {
				log.error(e.toString(), e);
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (IOException e) {
				log.error(e.toString(), e);
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (NotFoundException e) {
				log.error(e.toString(), e);
				response.sendError(HttpServletResponse.SC_NOT_FOUND, "The resource "+uri+" has not been found.");
			} catch (BuildingBlockException e) {
				log.error(e.toString(), e);
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (TemplateException e) {
				log.error(e.toString(), e);
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
			}
		}
	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("screens")) id = null;
		
		if (id == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "An ID must be specified.");
		} else {
			// Delete the addressed member of the collection.
			String uri = request.getRequestURL().toString();
			try {
				getCatalogue().removePreOrPost(new URIImpl(uri));
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (NotFoundException e) {
				response.sendError(HttpServletResponse.SC_NOT_FOUND, "The resource "+uri+" has not been found.");
			}
		}
	}

}

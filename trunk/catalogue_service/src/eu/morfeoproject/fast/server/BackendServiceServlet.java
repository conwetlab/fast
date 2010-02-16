package eu.morfeoproject.fast.server;

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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.DuplicatedResourceException;
import eu.morfeoproject.fast.catalogue.InvalidResourceTypeException;
import eu.morfeoproject.fast.catalogue.NotFoundException;
import eu.morfeoproject.fast.catalogue.OntologyInvalidException;
import eu.morfeoproject.fast.catalogue.ResourceException;
import eu.morfeoproject.fast.model.BackendService;
import eu.morfeoproject.fast.model.templates.BuildingBlockTemplate;
import eu.morfeoproject.fast.model.templates.CollectionTemplate;
import eu.morfeoproject.fast.model.templates.TemplateManager;
import eu.morfeoproject.fast.util.Accept;
import freemarker.template.TemplateException;

/**
 * Servlet implementation class BackendServiceServlet
 */
public class BackendServiceServlet extends GenericServlet {
	private static final long serialVersionUID = 1L;

	static Logger logger = LoggerFactory.getLogger(BackendServiceServlet.class);
    
    /**
     * @see HttpServlet#HttpServlet()
     */
    public BackendServiceServlet() {
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
				logger.info("Retrieving all services");
				try {
					if (format.equals(MediaType.APPLICATION_RDF_XML) ||
							format.equals(MediaType.APPLICATION_TURTLE)) {
						response.setContentType(format);
						Model model = RDF2Go.getModelFactory().createModel();
						try {
							model.open();
							for (BackendService service : CatalogueAccessPoint.getCatalogue().listBackendServices()) {
								Model bsModel = service.createModel();
								for (String ns : bsModel.getNamespaces().keySet())
									model.setNamespace(ns, bsModel.getNamespace(ns));
								model.addModel(bsModel);
								bsModel.close();
							}
							model.writeTo(writer, Syntax.forMimeType(format));
						} catch (Exception e) {
							e.printStackTrace();
						} finally {
							model.close();
						}
					} else if (format.equals(MediaType.TEXT_HTML)) {
						response.setContentType(format);
						if (TemplateManager.getDefaultEncoding() != null)
							response.setCharacterEncoding(TemplateManager.getDefaultEncoding());
						if (TemplateManager.getLocale() != null)
							response.setLocale(TemplateManager.getLocale());
						CollectionTemplate.process(CatalogueAccessPoint.getCatalogue().listBackendServices(), writer);
					} else { // by default returns APPLICATION_JSON
						response.setContentType(MediaType.APPLICATION_JSON);
						JSONArray services = new JSONArray();
						for (BackendService b : CatalogueAccessPoint.getCatalogue().listBackendServices())
							services.put(b.toJSON());
						writer.print(services.toString(2));
					}
					response.setStatus(HttpServletResponse.SC_OK);
				} catch (JSONException e) {
					e.printStackTrace();
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
				} catch (TemplateException e) {
					e.printStackTrace();
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
				}
			} else {
				// Override format regarding the given extension
				format = MediaType.forExtension(extension);
				// Retrieve the addressed member of the collection
				String uri = url.substring(0, url.indexOf(extension) - 1);
				logger.info("Retrieving backend service "+uri);
				BackendService service = CatalogueAccessPoint.getCatalogue().getBackendService(new URIImpl(uri));
				if (service == null) {
					response.sendError(HttpServletResponse.SC_NOT_FOUND, "The resource "+uri+" has not been found.");
				} else {
					try {
						if (format.equals(MediaType.APPLICATION_RDF_XML) ||
								format.equals(MediaType.APPLICATION_TURTLE)) {
							response.setContentType(format);
							Model bsModel = service.createModel();
							bsModel.writeTo(writer, Syntax.forMimeType(format));
							bsModel.close();
						} else if (format.equals(MediaType.TEXT_HTML)) {
							response.setContentType(format);
							if (TemplateManager.getDefaultEncoding() != null)
								response.setCharacterEncoding(TemplateManager.getDefaultEncoding());
							if (TemplateManager.getLocale() != null)
								response.setLocale(TemplateManager.getLocale());
							BuildingBlockTemplate.process(service, writer);
						} else { // by default returns APPLICATION_JSON
							response.setContentType(MediaType.APPLICATION_JSON);
							writer.print(service.toJSON().toString(2));
						}				
						response.setStatus(HttpServletResponse.SC_OK);
					} catch (JSONException e) {
						e.printStackTrace();
						response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
					} catch (TemplateException e) {
						e.printStackTrace();
						response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
					}
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
			BackendService service = parseBackendService(json, null);
			try {
				CatalogueAccessPoint.getCatalogue().addBackendService(service);
				if (format.equals(MediaType.APPLICATION_RDF_XML) ||
						format.equals(MediaType.APPLICATION_TURTLE)) {
					response.setContentType(format);
					Model bsModel = service.createModel();
					bsModel.writeTo(writer, Syntax.forMimeType(format));
					bsModel.close();
				} else if (format.equals(MediaType.TEXT_HTML)) {
					response.setContentType(format);
					if (TemplateManager.getDefaultEncoding() != null)
						response.setCharacterEncoding(TemplateManager.getDefaultEncoding());
					if (TemplateManager.getLocale() != null)
						response.setLocale(TemplateManager.getLocale());
					BuildingBlockTemplate.process(service, writer);
				} else { // by default returns APPLICATION_JSON
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONObject newBs = service.toJSON();						
//					for (Iterator it = newBs.keys(); it.hasNext(); ) {
//						String key = it.next().toString();
//						json.put(key, newBs.get(key));
//					}
					// only replaces URI and creationDate
					json.put("uri", newBs.get("uri"));
					json.put("creationDate", newBs.get("creationDate"));
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
			} catch (ResourceException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (TemplateException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
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
		Accept accept = new Accept(request);
		String format = accept.isEmpty() ? "" : accept.getDominating();
		String[] chunks = request.getRequestURI().split("/");
		String id = chunks[chunks.length-1];
		if (id.equalsIgnoreCase("services")) id = null;
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
				BackendService service = parseBackendService(json, new URIImpl(uri));
				CatalogueAccessPoint.getCatalogue().updateBackendService(service);
				if (format.equals(MediaType.APPLICATION_RDF_XML) ||
						format.equals(MediaType.APPLICATION_TURTLE)) {
					response.setContentType(format);
					Model backendServiceModel = service.createModel();
					backendServiceModel.writeTo(writer, Syntax.forMimeType(format));
					backendServiceModel.close();
				} else if (format.equals(MediaType.TEXT_HTML)) {
					response.setContentType(format);
					if (TemplateManager.getDefaultEncoding() != null)
						response.setCharacterEncoding(TemplateManager.getDefaultEncoding());
					if (TemplateManager.getLocale() != null)
						response.setLocale(TemplateManager.getLocale());
					BuildingBlockTemplate.process(service, writer);
				} else { // by default returns APPLICATION_JSON
					response.setContentType(MediaType.APPLICATION_JSON);
					JSONObject newBs = service.toJSON();						
//					for (Iterator it = newBs.keys(); it.hasNext(); ) {
//						String key = it.next().toString();
//						json.put(key, newBs.get(key));
//					}
					// only replaces URI and creationDate
					json.put("uri", newBs.get("uri"));
					json.put("creationDate", newBs.get("creationDate"));
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
			} catch (ResourceException e) {
				e.printStackTrace();
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
			} catch (TemplateException e) {
				e.printStackTrace();
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
		if (id.equalsIgnoreCase("services")) id = null;
		
		if (id == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "An ID must be specified.");
		} else {
			// Delete the addressed member of the collection.
			String uri = request.getRequestURL().toString();
			try {
				CatalogueAccessPoint.getCatalogue().removeBackendService(new URIImpl(uri));
				response.setStatus(HttpServletResponse.SC_OK);
			} catch (NotFoundException e) {
				response.sendError(HttpServletResponse.SC_NOT_FOUND, "The resource "+uri+" has not been found.");
			}
		}
	}

}

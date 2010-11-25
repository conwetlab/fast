package eu.morfeoproject.fast.catalogue.services;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.catalogue.MyRDFFactory;
import eu.morfeoproject.fast.catalogue.RDFFactory;

public abstract class GenericServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	protected final Log log = LogFactory.getLog(this.getClass());
	protected RDFFactory rdfFactory = new MyRDFFactory();
	
	protected Catalogue getCatalogue() {
		return (Catalogue) getServletContext().getAttribute("catalogue");
	}
	
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
	}

	/**
	 * @see HttpServlet#doPut(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest request, HttpServletResponse response)
	 */
	@Override
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
	}

	protected void redirectToFormat(HttpServletRequest request, HttpServletResponse response, String format) throws IOException {
		String extension = MediaType.getExtension(format);
		extension = extension == null ? MediaType.getExtension(MediaType.APPLICATION_JSON) : extension;
		String url = request.getRequestURL().toString();
		url = (url.charAt(url.length() - 1) == '/') ? url.concat(extension) : url.concat("/"+extension);
		response.sendRedirect(url);
	}
	
}

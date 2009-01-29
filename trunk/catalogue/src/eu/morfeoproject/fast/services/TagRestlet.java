package eu.morfeoproject.fast.services;

import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Statement;
import org.openrdf.repository.RepositoryException;
import org.restlet.Restlet;
import org.restlet.data.MediaType;
import org.restlet.data.Method;
import org.restlet.data.Request;
import org.restlet.data.Response;
import org.restlet.data.Status;

import eu.morfeoproject.fast.catalogue.Catalogue;

public class TagRestlet extends Restlet {

	Catalogue catalogue;
	
	public TagRestlet() throws RepositoryException {
		super();
		catalogue = new Catalogue();
		catalogue.open();
	}

	@Override
	public void handle(Request request, Response response) {
		String action = (String) request.getAttributes().get("action");

		if (request.getMethod().equals(Method.PUT)) {
			response.setStatus(Status.SUCCESS_NO_CONTENT);
		} else if (request.getMethod().equals(Method.GET)) {
			if (action.equals("list")) {
				String result = "";
				ClosableIterator<Statement> it = catalogue.listAllStatements();
				for ( ; it.hasNext(); )
					result = result.concat(it.next().toString()+"\n");
				it.close();
				response.setEntity(result, MediaType.TEXT_PLAIN);
				response.setStatus(Status.SUCCESS_OK);
			} else {
				response.setStatus(Status.CLIENT_ERROR_NOT_FOUND);
			}
		} else {
			response.setStatus(Status.CLIENT_ERROR_BAD_REQUEST);
		}
	}
}

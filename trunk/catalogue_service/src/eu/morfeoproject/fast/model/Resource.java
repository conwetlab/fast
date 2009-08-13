package eu.morfeoproject.fast.model;

import org.json.JSONObject;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;

public interface Resource {

	public URI getUri();

	public void setUri(URI uri);

	public String toString();
	
	public JSONObject toJSON();
	
	public Model createModel();

}

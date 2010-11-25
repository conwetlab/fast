package eu.morfeoproject.fast.catalogue.model;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;

public class Property {
	
	private URI uri;
	private URI subPropertyOf;
	private URI type;
	private Concept concept;
	
	public Property() {
		this(null, null, null);
	}
	
	public Property(URI uri, URI type, Concept concept) {
		super();
		this.uri = uri;
		this.type = type;
		this.concept = concept;
	}
	
    public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

    public URI getSubPropertyOf() {
		return subPropertyOf;
	}

	public void setSubPropertyOf(URI subPropertyOf) {
		this.subPropertyOf = subPropertyOf;
	}

    public URI getType() {
		return type;
	}

	public void setType(URI type) {
		this.type = type;
	}

    public Concept getConcept() {
		return concept;
	}

	public void setConcept(Concept concept) {
		this.concept = concept;
	}
	
	/**
	 * Compare if two resources have the same URI
	 * @param r the resource to compare with
	 * @return true if their URIs are the same
	 */
	@Override
	public boolean equals(Object o) {
		return ((Property) o).getUri().equals(getUri());
	}
	
	/**
	 * Returns the URI of the resource
	 * @return string representation of the URI
	 */
	@Override
	public String toString() {
		return getUri().toString();
	}
	
	/**
	 * Transforms a Resource to a JSON object (key: value)
	 * @return a JSON object containing all info about the resource
	 */
	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();

		json.put("uri", getUri() == null ? JSONObject.NULL : getUri().toString());
		if (this.getType() != null)
			json.put("type", getType().toString());
		if (getSubPropertyOf() != null)
			json.put("subPropertyOf", getSubPropertyOf().toString());

		return json;
	}
	
	public Model toRDF2GoModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		
		URI uri = this.getUri();
		model.addStatement(uri, RDF.type, RDF.Property);
		if (this.getType() != null)
			model.addStatement(uri, RDFS.domain, this.getType());
		model.addStatement(uri, RDFS.range, this.getConcept().getUri());
		if (this.getSubPropertyOf() != null)
			model.addStatement(uri, RDFS.subPropertyOf, this.getSubPropertyOf());
		
		return model;
	}

}
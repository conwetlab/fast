package eu.morfeoproject.fast.catalogue.model;

import java.util.LinkedList;
import java.util.List;
import java.util.Vector;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.Resource;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;

public class Sample {
	
	private URI uri;
	private URI type;
    private List<PropertyValue> properties;
	
	public Sample() {
		this(null);
	}
	
	public Sample(URI uri) {
		this.uri = uri;
		this.properties = new LinkedList<PropertyValue>();
	}
	
    public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

    public URI getType() {
		return type;
	}

	public void setType(URI type) {
		this.type = type;
	}

	public PropertyValue addPropertyValue(URI property, String type, String value) {
		PropertyValue pv = new PropertyValue(property, type, value);
		this.properties.add(pv);
		return pv;
	}
   
	public PropertyValue addPropertyValue(URI property, String type, String value, String lang, URI datatype) {
		PropertyValue pv = new PropertyValue(property, type, value, lang, datatype);
		this.properties.add(pv);
		return pv;
	}
	
	public void deletePropertyValue(URI property) {
		for (PropertyValue pv : this.properties) {
			if (pv.getUri().equals(property)) {
				this.properties.remove(pv);
			}
		}
	}
	
	/**
	 * Compare if two resources have the same URI
	 * @param r the resource to compare with
	 * @return true if their URIs are the same
	 */
	@Override
	public boolean equals(Object o) {
		if (o == null) return false;
		Sample other = (Sample) o;
		return other.getUri().equals(getUri()) && other.getType().equals(getType());
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
		json.put("type", getType() == null ? JSONObject.NULL : getType().toString());
		JSONArray jsonPropertys = new JSONArray();
		for (PropertyValue av : properties) {
			jsonPropertys.put(av.toJSON());
		}
		json.put("properties", jsonPropertys);

		return json;
	}
	
	public Model toRDF2GoModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		
		Resource sample = this.getUri();
		model.addStatement(sample, RDF.type, this.type);
		for (PropertyValue property : properties) {
			Node object;
			if (property.getLang() != null) {
				object = model.createLanguageTagLiteral(property.getValue(), property.getLang());
			} else if (property.getDatatype() != null) {
				object = model.createDatatypeLiteral(property.getValue(), property.getDatatype());
			} else {
				object = model.createPlainLiteral(property.getValue());
			}
			model.addStatement(sample, property.getUri(), object);
		}
		
		return model;
	}

}
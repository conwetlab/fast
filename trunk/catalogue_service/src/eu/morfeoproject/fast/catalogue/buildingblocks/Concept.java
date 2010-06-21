package eu.morfeoproject.fast.catalogue.buildingblocks;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.ontoware.rdf2go.vocabulary.XSD;

import eu.morfeoproject.fast.catalogue.commontag.CTag;
import eu.morfeoproject.fast.catalogue.vocabulary.CTAG;
import eu.morfeoproject.fast.catalogue.vocabulary.DC;

public class Concept {
	
	private URI uri;
	private URI subClassOf;
	private Map<String, String> labels;
	private Map<String, String> descriptions;
    private List<CTag> tags;
	
	protected Concept(URI uri) {
		super();
		setUri(uri);
	}
	
    public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

    public URI getSubClassOf() {
		return subClassOf;
	}

	public void setSubClassOf(URI subClassOf) {
		this.subClassOf = subClassOf;
	}

	public Map<String, String> getLabels() {
		if (labels == null)
			labels = new HashMap<String, String>();
		return labels;
	}

	public void setLabels(Map<String, String> labels) {
		this.labels = labels;
	}

	public Map<String, String> getDescriptions() {
		if (descriptions == null)
			descriptions = new HashMap<String, String>();
		return descriptions;
	}

	public void setDescriptions(Map<String, String> descriptions) {
		this.descriptions = descriptions;
	}
	
	public List<CTag> getTags() {
		if (tags == null)
			tags = new ArrayList<CTag>();
		return tags;
	}

	public void setTags(List<CTag> tags) {
		this.tags = tags;
	}

	/**
	 * Compare if two resources have the same URI
	 * @param r the resource to compare with
	 * @return true if their URIs are the same
	 */
	public boolean equals(BuildingBlock r) {
		return r.getUri().equals(getUri());
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

		if (getUri() == null)
			json.put("uri", JSONObject.NULL);
		else
			json.put("uri", getUri().toString());
		if (getSubClassOf() != null)
			json.put("subClassOf", getSubClassOf().toString());
		if (getLabels() == null)
			json.put("label", JSONObject.NULL);
		else if (!getLabels().isEmpty()) {
			JSONObject jsonLabels = new JSONObject();
			for (String key : getLabels().keySet())
				jsonLabels.put(key, getLabels().get(key));
			json.put("label", jsonLabels);
		}
		if (getDescriptions() == null)
			json.put("description", JSONObject.NULL);
		else if (!getDescriptions().isEmpty()) {
			JSONObject jsonDescriptions = new JSONObject();
			for (String key : getDescriptions().keySet())
				jsonDescriptions.put(key, getDescriptions().get(key));
			json.put("description", jsonDescriptions);
		}
		if (getTags() == null)
			json.put("tags", JSONObject.NULL);
		else if (!getTags().isEmpty()) {
			JSONArray jsonTags = new JSONArray();
			for (CTag tag : getTags())
				jsonTags.put(tag.toJSON());
			json.put("tags", jsonTags);
		}

		return json;
	}
	
	public Model toRDF2GoModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		model.setNamespace("dc", DC.NS_DC.toString());
		model.setNamespace("ctag", CTAG.NS_CTAG.toString());
		
		URI cUri = this.getUri();
		model.addStatement(cUri, RDF.type, RDFS.Class);
		model.addStatement(cUri, RDFS.subClassOf, this.getSubClassOf());
		for (String key : this.getLabels().keySet())
			model.addStatement(cUri, RDFS.label, model.createLanguageTagLiteral(this.getLabels().get(key), key));
		for (String key : this.getDescriptions().keySet())
			model.addStatement(cUri, DC.description, model.createLanguageTagLiteral(this.getDescriptions().get(key), key));
		for (CTag tag : this.getTags()) {
			BlankNode bnTag = model.createBlankNode();
			model.addStatement(cUri, CTAG.tagged, bnTag);
			model.addStatement(bnTag, RDF.type, CTAG.Tag);
			if (tag.getMeans() != null)
				model.addStatement(bnTag, CTAG.means, tag.getMeans());
			for (String lang : tag.getLabels().keySet())
				model.addStatement(bnTag, RDFS.label, model.createLanguageTagLiteral(lang, tag.getLabels().get(lang)));
			if (tag.getTaggingDate() != null)
				model.addStatement(bnTag, CTAG.taggingDate, model.createDatatypeLiteral(tag.getTaggingDate().toString(), XSD._date));
		}
		
		return model;
	}

}
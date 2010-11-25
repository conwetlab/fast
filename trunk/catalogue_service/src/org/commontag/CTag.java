package org.commontag;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.util.DateFormatter;

public class CTag {

	private URI means;
	private Date taggingDate;
	private Map<String, String> labels;

	public CTag() {
		super();
	}

	public CTag(URI means) {
		super();
		this.means = means;
	}

	public CTag(String language, String label) {
		super();
		getLabels().put(language, label);
	}

	public CTag(String language, String label, URI means) {
		super();
		this.means = means;
		getLabels().put(language, label);
	}

	public CTag(String language, String label, URI means, Date taggingDate) {
		super();
		this.means = means;
		getLabels().put(language, label);
		this.taggingDate = taggingDate;
	}

	public URI getMeans() {
		return means;
	}

	public void setMeans(URI means) {
		this.means = means;
	}

	public Date getTaggingDate() {
		return taggingDate;
	}

	public void setTaggingDate(Date taggingDate) {
		this.taggingDate = taggingDate;
	}

	public Map<String, String> getLabels() {
		if (labels == null)
			labels = new HashMap<String, String>();
		return labels;
	}

	public void setLabels(Map<String, String> labels) {
		this.labels = labels;
	}
	
	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		if (getMeans() != null)
			json.put("means", getMeans());
		if (!getLabels().isEmpty()) {
			JSONObject jsonLabels = new JSONObject();
			for (String key : getLabels().keySet())
				jsonLabels.put(key, getLabels().get(key));
			json.put("label", jsonLabels);
		}
		if (getTaggingDate() != null)
			json.put("taggingDate", DateFormatter.formatDateISO8601(getTaggingDate()));
		return json;
	}

}

package eu.morfeoproject.fast.model;

import java.util.ArrayList;
import java.util.Date;
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

import eu.morfeoproject.fast.util.DateFormatter;
import eu.morfeoproject.fast.vocabulary.CTAG;
import eu.morfeoproject.fast.vocabulary.DC;
import eu.morfeoproject.fast.vocabulary.FGO;
import eu.morfeoproject.fast.vocabulary.FOAF;

public abstract class Resource {

	private URI uri;
	private Map<String, String> labels;
	private URI creator;
	private Map<String, String> descriptions;
	private URI rights;
	private String version;
    private Date creationDate;
    private URI icon;
    private URI screenshot;
    private URI homepage;
    private List<CTag> tags;
    private String id;
    private String name;
    
    public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

	public Map<String, String> getLabels() {
		if (labels == null)
			labels = new HashMap<String, String>();
		return labels;
	}

	public void setLabels(Map<String, String> labels) {
		this.labels = labels;
	}

	public URI getCreator() {
		return creator;
	}

	public void setCreator(URI creator) {
		this.creator = creator;
	}

	public Map<String, String> getDescriptions() {
		if (descriptions == null)
			descriptions = new HashMap<String, String>();
		return descriptions;
	}

	public void setDescriptions(Map<String, String> descriptions) {
		this.descriptions = descriptions;
	}
	
	public URI getRights() {
		return rights;
	}

	public void setRights(URI rights) {
		this.rights = rights;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public Date getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Date creationDate) {
		this.creationDate = creationDate;
	}

	public URI getIcon() {
		return icon;
	}

	public void setIcon(URI icon) {
		this.icon = icon;
	}

	public URI getScreenshot() {
		return screenshot;
	}

	public void setScreenshot(URI screenshot) {
		this.screenshot = screenshot;
	}

	public URI getHomepage() {
		return homepage;
	}

	public void setHomepage(URI homepage) {
		this.homepage = homepage;
	}

	public List<CTag> getTags() {
		if (tags == null)
			tags = new ArrayList<CTag>();
		return tags;
	}

	public void setTags(List<CTag> tags) {
		this.tags = tags;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	/**
	 * Compare if two resources have the same URI
	 * @param r the resource to compare with
	 * @return true if their URIs are the same
	 */
	public boolean equals(Resource r) {
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
		if (getLabels() == null)
			json.put("label", JSONObject.NULL);
		else {
			JSONObject jsonLabels = new JSONObject();
			for (String key : getLabels().keySet())
				jsonLabels.put(key, getLabels().get(key));
			json.put("label", jsonLabels);
		}
		if (getDescriptions() == null)
			json.put("description", JSONObject.NULL);
		else {
			JSONObject jsonDescriptions = new JSONObject();
			for (String key : getDescriptions().keySet())
				jsonDescriptions.put(key, getDescriptions().get(key));
			json.put("description", jsonDescriptions);
		}
		if (getCreator() == null)
			json.put("creator", JSONObject.NULL);
		else
			json.put("creator", extractLogin(getCreator()));
		if (getRights() == null)
			json.put("rights", JSONObject.NULL);
		else
			json.put("rights", getRights().toString());
		if (getVersion() == null)
			json.put("version", JSONObject.NULL);
		else
			json.put("version", getVersion());
		if (getCreationDate() == null)
			json.put("creationDate", JSONObject.NULL);
		else
			json.put("creationDate", DateFormatter.formatDateISO8601(getCreationDate()));
		if (getIcon() == null)
			json.put("icon", JSONObject.NULL);
		else
			json.put("icon", getIcon().toString());
		if (getScreenshot() == null)
			json.put("screenshot", JSONObject.NULL);
		else
			json.put("screenshot", getScreenshot().toString());
		if (getTags() == null)
			json.put("tags", JSONObject.NULL);
		else {
			JSONArray jsonTags = new JSONArray();
			for (CTag tag : getTags())
				jsonTags.put(tag.toJSON());
			json.put("tags", jsonTags);
		}
		if (getHomepage() == null)
			json.put("homepage", JSONObject.NULL);
		else
			json.put("homepage", getHomepage().toString());
		if (getId() == null)
			json.put("id", JSONObject.NULL);
		else
			json.put("id", getId());
		if (getName() == null)
			json.put("name", JSONObject.NULL);
		else
			json.put("name", getName());
		
		// for convenience, the type of the resource is specified in the JSON description
		if (this instanceof ScreenFlow)
			json.put("type", "screenflow");
		else if (this instanceof Screen)
			json.put("type", "screen");
		else if (this instanceof FormElement)
			json.put("type", "form");
		else if (this instanceof Operator)
			json.put("type", "operator");
		else if (this instanceof BackendService)
			json.put("type", "service");

		return json;
	}
	
	public Model createModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		model.setNamespace("dc", DC.NS_DC.toString());
		model.setNamespace("fgo", FGO.NS_FGO.toString());
		
		URI resourceUri = this.getUri();
		for (String key : this.getLabels().keySet())
			model.addStatement(resourceUri, RDFS.label, model.createLanguageTagLiteral(this.getLabels().get(key), key));
		for (String key : this.getDescriptions().keySet())
			model.addStatement(resourceUri, DC.description, model.createLanguageTagLiteral(this.getDescriptions().get(key), key));
		if (this.getCreator() != null)
			model.addStatement(resourceUri, DC.creator, this.getCreator());
		if (this.getRights() != null)
			model.addStatement(resourceUri, DC.rights, this.getRights());
		if (this.getVersion() != null)
			model.addStatement(resourceUri, FGO.hasVersion, this.getVersion());
		if (this.getCreationDate() != null)
			model.addStatement(resourceUri, DC.date, DateFormatter.formatDateISO8601(this.getCreationDate()));
		if (this.getIcon() != null)
			model.addStatement(resourceUri, FGO.hasIcon, this.getIcon());
		if (this.getScreenshot() != null)
			model.addStatement(resourceUri, FGO.hasScreenshot, this.getScreenshot());
		for (CTag tag : this.getTags()) {
			BlankNode bnTag = model.createBlankNode();
			model.addStatement(resourceUri, CTAG.tagged, bnTag);
			model.addStatement(bnTag, RDF.type, CTAG.Tag);
			if (tag.getMeans() != null)
				model.addStatement(bnTag, CTAG.means, tag.getMeans());
			for (String lang : tag.getLabels().keySet())
				model.addStatement(bnTag, RDFS.label, model.createLanguageTagLiteral(lang, tag.getLabels().get(lang)));
			if (tag.getTaggingDate() != null)
				model.addStatement(bnTag, CTAG.taggingDate, model.createDatatypeLiteral(tag.getTaggingDate().toString(), XSD._date));
		}
		if (this.getHomepage() != null)
			model.addStatement(resourceUri, FOAF.homepage, this.getHomepage());
		if (this.getName() != null)
			model.addStatement(resourceUri, FGO.hasName, this.getName());
		
		return model;
	}

	private String extractLogin(URI creator) {
		String strCreator = creator.toString();
		return strCreator.substring(strCreator.lastIndexOf("/") + 1);
	}
}

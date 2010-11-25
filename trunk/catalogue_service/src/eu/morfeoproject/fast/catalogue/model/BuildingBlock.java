package eu.morfeoproject.fast.catalogue.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.commontag.AuthorCTag;
import org.commontag.AutoCTag;
import org.commontag.CTag;
import org.commontag.ReaderCTag;
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

import eu.morfeoproject.fast.catalogue.util.DateFormatter;
import eu.morfeoproject.fast.catalogue.vocabulary.CTAG;
import eu.morfeoproject.fast.catalogue.vocabulary.DC;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;
import eu.morfeoproject.fast.catalogue.vocabulary.FOAF;

public abstract class BuildingBlock {

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
    private String parameterTemplate;
    
    protected BuildingBlock(URI uri) {
    	super();
    	this.uri = uri;
    }
    
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

	public String getParameterTemplate() {
		return parameterTemplate;
	}

	public void setParameterTemplate(String parameterTemplate) {
		this.parameterTemplate = parameterTemplate;
	}

	/**
	 * Compare if two resources have the same URI
	 * @param r the resource to compare with
	 * @return true if their URIs are the same
	 */
	@Override
	public boolean equals(Object o) {
		return ((BuildingBlock) o).getUri().equals(getUri());
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
		if (this.getLabels() == null) json.put("label", JSONObject.NULL);
		else {
			JSONObject jsonLabels = new JSONObject();
			for (String key : getLabels().keySet())
				jsonLabels.put(key, getLabels().get(key));
			json.put("label", jsonLabels);
		}
		if (getDescriptions() == null) json.put("description", JSONObject.NULL);
		else {
			JSONObject jsonDescriptions = new JSONObject();
			for (String key : getDescriptions().keySet())
				jsonDescriptions.put(key, getDescriptions().get(key));
			json.put("description", jsonDescriptions);
		}
		json.put("creator", getCreator() == null ? JSONObject.NULL : extractLogin(getCreator()));
		json.put("rights", getRights() == null ? JSONObject.NULL : getRights().toString());
		json.put("version", getVersion() == null ? JSONObject.NULL : getVersion());
		json.put("creationDate", getCreationDate() == null ? JSONObject.NULL : DateFormatter.formatDateISO8601(getCreationDate()));
		json.put("icon", getIcon() == null ? JSONObject.NULL : getIcon().toString());
		json.put("screenshot", getScreenshot() == null ? JSONObject.NULL : getScreenshot().toString());
		if (getTags() == null) json.put("tags", JSONObject.NULL);
		else {
			JSONArray jsonTags = new JSONArray();
			for (CTag tag : getTags())
				jsonTags.put(tag.toJSON());
			json.put("tags", jsonTags);
		}
		json.put("homepage", getHomepage() == null ? JSONObject.NULL : getHomepage().toString());
		json.put("id", getId() == null ? JSONObject.NULL : getId());
		json.put("parameterTemplate", getParameterTemplate() == null ? JSONObject.NULL : getParameterTemplate());
		
		// for convenience, the type of the resource is specified in the JSON description
		if (this instanceof ScreenFlow)
			json.put("type", "screenflow");
		else if (this instanceof Screen)
			json.put("type", "screen");
		else if (this instanceof Form)
			json.put("type", "form");
		else if (this instanceof Operator)
			json.put("type", "operator");
		else if (this instanceof BackendService)
			json.put("type", "service");

		return json;
	}
	
	public Model toRDF2GoModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		model.setNamespace("dc", DC.NS_DC.toString());
		model.setNamespace("fgo", FGO.NS_FGO.toString());
		model.setNamespace("ctag", CTAG.NS_CTAG.toString());
		
		URI bbUri = this.getUri();
		for (String key : this.getLabels().keySet())
			model.addStatement(bbUri, RDFS.label, model.createLanguageTagLiteral(this.getLabels().get(key), key));
		for (String key : this.getDescriptions().keySet())
			model.addStatement(bbUri, DC.description, model.createLanguageTagLiteral(this.getDescriptions().get(key), key));
		if (this.getCreator() != null) {
			model.addStatement(bbUri, DC.creator, this.getCreator());
			model.addStatement(bbUri, FOAF.maker, this.getCreator());
		}
		if (this.getRights() != null)
			model.addStatement(bbUri, DC.rights, this.getRights());
		if (this.getVersion() != null)
			model.addStatement(bbUri, FGO.hasVersion, model.createDatatypeLiteral(this.getVersion(), XSD._string));
		if (this.getCreationDate() != null)
			model.addStatement(bbUri, DC.date, model.createDatatypeLiteral(DateFormatter.formatDateISO8601(this.getCreationDate()), XSD._date));
		if (this.getIcon() != null)
			model.addStatement(bbUri, FGO.hasIcon, this.getIcon());
		if (this.getScreenshot() != null)
			model.addStatement(bbUri, FGO.hasScreenshot, this.getScreenshot());
		if (this.getHomepage() != null)
			model.addStatement(bbUri, FOAF.homepage, this.getHomepage());
		for (CTag tag : this.getTags()) {
			BlankNode bnTag = model.createBlankNode();
			model.addStatement(bbUri, CTAG.tagged, bnTag);
			
			if (tag instanceof AuthorCTag)
				model.addStatement(bnTag, RDF.type, CTAG.AuthorTag);
			else if (tag instanceof ReaderCTag)
				model.addStatement(bnTag, RDF.type, CTAG.ReaderTag);
			else if (tag instanceof AutoCTag)
				model.addStatement(bnTag, RDF.type, CTAG.AutoTag);
			else
				model.addStatement(bnTag, RDF.type, CTAG.Tag);
			
			if (tag.getMeans() != null)
				model.addStatement(bnTag, CTAG.means, tag.getMeans());
			for (String lang : tag.getLabels().keySet())
				model.addStatement(bnTag, CTAG.label, model.createLanguageTagLiteral(tag.getLabels().get(lang), lang));
			if (tag.getTaggingDate() != null)
				model.addStatement(bnTag, CTAG.taggingDate, model.createDatatypeLiteral(tag.getTaggingDate().toString(), XSD._date));
		}
		if (this.getParameterTemplate() != null)
			model.addStatement(bbUri, FGO.hasParameterTemplate, model.createDatatypeLiteral(this.getParameterTemplate(), XSD._string));
		
		return model;
	}

	private String extractLogin(URI creator) {
		String strCreator = creator.toString();
		return strCreator.substring(strCreator.lastIndexOf("/") + 1);
	}
	
}

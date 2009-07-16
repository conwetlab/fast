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

import eu.morfeoproject.fast.util.FormatterUtil;
import eu.morfeoproject.fast.vocabulary.DC;
import eu.morfeoproject.fast.vocabulary.FGO;
import eu.morfeoproject.fast.vocabulary.FOAF;

public class Screen implements Resource {
	
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
    private URI code;
	private DomainContext domainContext;
	private List<List<Condition>> preconditions;
	private List<List<Condition>> postconditions;
	
	protected Screen(URI uri) {
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

	public URI getCode() {
		return code;
	}

	public void setCode(URI code) {
		this.code = code;
	}

	public DomainContext getDomainContext() {
		if (domainContext == null)
			domainContext = new DomainContext();
		return domainContext;
	}

	public void setDomainContext(DomainContext domainContext) {
		this.domainContext = domainContext;
	}

	public List<List<Condition>> getPreconditions() {
		if (preconditions == null)
			preconditions = new ArrayList<List<Condition>>();
		return preconditions;
	}

	public void setPreconditions(List<List<Condition>> preconditions) {
		this.preconditions = preconditions;
	}

	public List<List<Condition>> getPostconditions() {
		if (postconditions == null)
			postconditions = new ArrayList<List<Condition>>();
		return postconditions;
	}

	public void setPostconditions(List<List<Condition>> postconditions) {
		this.postconditions = postconditions;
	}
	
	public boolean equals(Screen o) {
		return ((Screen)o).getUri().equals(this.uri);
	}
	
	@Override
	public String toString() {
		return uri.toString();
	}

	public JSONObject toJSON() {
		JSONObject json = new JSONObject();
		try {
			if (getUri() == null)
				json.put("uri", JSONObject.NULL);
			else
				json.put("uri", getUri().toString());
			if (getLabels() == null || getLabels().isEmpty())
				json.put("label", JSONObject.NULL);
			else {
				JSONObject jsonLabels = new JSONObject();
				for (String key : getLabels().keySet())
					jsonLabels.put(key, getLabels().get(key));
				json.put("label", jsonLabels);
			}
			if (getDescriptions() == null || getDescriptions().isEmpty())
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
				json.put("creator", getCreator().toString());
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
				json.put("creationDate", FormatterUtil.formatDateISO8601(getCreationDate()));
			if (getIcon() == null)
				json.put("icon", JSONObject.NULL);
			else
				json.put("icon", getIcon().toString());
			if (getScreenshot() == null)
				json.put("screenshot", JSONObject.NULL);
			else
				json.put("screenshot", getScreenshot().toString());
			if (getDomainContext() == null)
				json.put("domainContext", JSONObject.NULL);
			else
				json.put("domainContext", getDomainContext().toJSON());
			if (getHomepage() == null)
				json.put("homepage", JSONObject.NULL);
			else
				json.put("homepage", getHomepage().toString());
			JSONArray preconditions = new JSONArray();
			for (List<Condition> conditionList : getPreconditions()) {
				JSONArray conditionArray = new JSONArray();
				for (Condition con : conditionList)
					conditionArray.put(con.toJSON());
				preconditions.put(conditionArray);
			}
			json.put("preconditions", preconditions);
			JSONArray postconditions = new JSONArray();
			for (List<Condition> conditionList : getPostconditions()) {
				JSONArray conditionArray = new JSONArray();
				for (Condition con : conditionList)
					conditionArray.put(con.toJSON());
				postconditions.put(conditionArray);
			}
			json.put("postconditions", postconditions);
			if (getCode() == null)
				json.put("code", JSONObject.NULL);
			else
				json.put("code", getCode().toString());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json;
	}
	
	public Model createModel() {
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		model.setNamespace("dc", DC.NS_DC.toString());
		model.setNamespace("FGO", FGO.NS_FGO.toString());
		
		URI screenUri = this.getUri();
		if (screenUri != null)
			model.addStatement(screenUri, RDF.type, FGO.Screen);
		for (String key : this.getLabels().keySet())
			model.addStatement(screenUri, RDFS.label, model.createLanguageTagLiteral(this.getLabels().get(key), key));
		for (String key : this.getDescriptions().keySet())
			model.addStatement(screenUri, DC.description, model.createLanguageTagLiteral(this.getDescriptions().get(key), key));
		if (this.getCreator() != null)
			model.addStatement(screenUri, DC.creator, this.getCreator());
		if (this.getRights() != null)
			model.addStatement(screenUri, DC.rights, this.getRights());
		if (this.getVersion() != null)
			model.addStatement(screenUri, FGO.hasVersion, this.getVersion());
		if (this.getCreationDate() != null)
			model.addStatement(screenUri, DC.date, FormatterUtil.formatDateISO8601(this.getCreationDate()));
		if (this.getIcon() != null)
			model.addStatement(screenUri, FGO.hasIcon, this.getIcon());
		if (this.getScreenshot() != null)
			model.addStatement(screenUri, FGO.hasScreenshot, this.getScreenshot());
		for (String tag : this.getDomainContext().getTags())
			model.addStatement(screenUri, FGO.hasTag, tag);
		if (this.getHomepage() != null)
			model.addStatement(screenUri, FOAF.homepage, this.getHomepage());
		if (this.getVersion() != null)
			model.addStatement(screenUri, FGO.hasVersion, this.getVersion());
		for (List<Condition> conList : this.getPreconditions()) {
			BlankNode bag = model.createBlankNode();
			model.addStatement(bag, RDF.type, RDF.Bag);
			model.addStatement(screenUri, FGO.hasPreCondition, bag);
			int i = 1;
			for (Condition con : conList) {
				BlankNode c = model.createBlankNode();
				model.addStatement(bag, RDF.li(i++), c);
				model.addStatement(c, FGO.hasPatternString, con.getPatternString());
				model.addStatement(c, FGO.hasScope, con.getScope());
				for (String key : con.getLabels().keySet())
					model.addStatement(c, RDFS.label, model.createLanguageTagLiteral(con.getLabels().get(key), key));
			}
		}
		for (List<Condition> conList : this.getPostconditions()) {
			BlankNode bag = model.createBlankNode();
			model.addStatement(bag, RDF.type, RDF.Bag);
			model.addStatement(screenUri, FGO.hasPostCondition, bag);
			int i = 1;
			for (Condition con : conList) {
				BlankNode c = model.createBlankNode();
				model.addStatement(bag, RDF.li(i++), c);
				model.addStatement(c, FGO.hasPatternString, con.getPatternString());
				model.addStatement(c, FGO.hasScope, con.getScope());
				for (String key : con.getLabels().keySet())
					model.addStatement(c, RDFS.label, model.createLanguageTagLiteral(con.getLabels().get(key), key));
			}
		}
		if (this.getCode() != null)
			model.addStatement(screenUri, FGO.hasCode, this.getCode());
		
		return model;
	}

}
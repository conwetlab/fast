package eu.morfeoproject.fast.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.util.FormatterUtil;

public class Screen {
	
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
	private DomainContext domainContext;
	private List<Condition> preconditions;
	private List<Condition> postconditions;
	
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

	public DomainContext getDomainContext() {
		if (domainContext == null)
			domainContext = new DomainContext();
		return domainContext;
	}

	public void setDomainContext(DomainContext domainContext) {
		this.domainContext = domainContext;
	}

	public List<Condition> getPreconditions() {
		if (preconditions == null)
			preconditions = new ArrayList<Condition>();
		return preconditions;
	}

	public void setPreconditions(List<Condition> preconditions) {
		this.preconditions = preconditions;
	}

	public List<Condition> getPostconditions() {
		if (postconditions == null)
			postconditions = new ArrayList<Condition>();
		return postconditions;
	}

	public void setPostconditions(List<Condition> postconditions) {
		this.postconditions = postconditions;
	}
	
	public String toString() {
		return getUri().toString();
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
			for (Condition con : getPreconditions())
				preconditions.put(con.toString());
			json.put("preconditions", preconditions);
			JSONArray postconditions = new JSONArray();
			for (Condition con : getPostconditions())
				postconditions.put(con.toString());
			json.put("postconditions", postconditions);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json;
	}

}
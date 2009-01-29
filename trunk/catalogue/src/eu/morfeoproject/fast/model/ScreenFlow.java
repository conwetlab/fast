package eu.morfeoproject.fast.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.ontoware.rdf2go.model.node.URI;

public class ScreenFlow {
	
	private URI uri;
	private String name;
	private URI author;
	private String description;
	private Date date;
	private String version;
	private List<URI> tags;
	private List<Screen> screens;
	
	protected ScreenFlow(URI uri) {
		this.uri = uri;
	}

	public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public URI getAuthor() {
		return author;
	}

	public void setAuthor(URI author) {
		this.author = author;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public List<URI> getTags() {
		return tags;
	}

	public void setTags(List<URI> tags) {
		this.tags = tags;
	}

	public List<Screen> getScreens() {
		if (screens == null)
			screens = new ArrayList<Screen>();
		return screens;
	}

	public void setScreens(List<Screen> screens) {
		this.screens = screens;
	}
	
	public String toString() {
		return getUri().toString();
	}

}

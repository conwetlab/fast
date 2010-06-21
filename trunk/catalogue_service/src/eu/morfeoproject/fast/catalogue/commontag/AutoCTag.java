package eu.morfeoproject.fast.catalogue.commontag;

import java.util.Date;

import org.ontoware.rdf2go.model.node.URI;

public class AutoCTag extends CTag {
	
	public AutoCTag() {
		super();
	}

	public AutoCTag(URI means) {
		super(means);
	}

	public AutoCTag(String language, String label) {
		super(language, label);
	}

	public AutoCTag(String language, String label, URI means) {
		super(language, label, means);
	}

	public AutoCTag(String language, String label, URI means, Date taggingDate) {
		super(language, label, means, taggingDate);
	}
	
}

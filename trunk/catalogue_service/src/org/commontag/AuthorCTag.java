package org.commontag;

import java.util.Date;

import org.ontoware.rdf2go.model.node.URI;

public class AuthorCTag extends CTag {
	
	public AuthorCTag() {
		super();
	}

	public AuthorCTag(URI means) {
		super(means);
	}

	public AuthorCTag(String language, String label) {
		super(language, label);
	}

	public AuthorCTag(String language, String label, URI means) {
		super(language, label, means);
	}

	public AuthorCTag(String language, String label, URI means, Date taggingDate) {
		super(language, label, means, taggingDate);
	}
	
}

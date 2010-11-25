package org.commontag;

import java.util.Date;

import org.ontoware.rdf2go.model.node.URI;

public class ReaderCTag extends CTag {
	
	public ReaderCTag() {
		super();
	}

	public ReaderCTag(URI means) {
		super(means);
	}

	public ReaderCTag(String language, String label) {
		super(language, label);
	}

	public ReaderCTag(String language, String label, URI means) {
		super(language, label, means);
	}

	public ReaderCTag(String language, String label, URI means, Date taggingDate) {
		super(language, label, means, taggingDate);
	}
	
}

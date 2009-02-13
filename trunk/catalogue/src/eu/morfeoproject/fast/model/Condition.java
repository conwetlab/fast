package eu.morfeoproject.fast.model;

import java.util.ArrayList;
import java.util.List;

import org.ontoware.rdf2go.model.Statement;

public class Condition {
	
	private String patternString;
	private List<Statement> pattern;
	
	public String getPatternString() {
		return patternString;
	}
	
	public void setPatternString(String patternString) {
		this.patternString = patternString;
	}
	
	public List<Statement> getPattern() {
		if (pattern == null)
			pattern = new ArrayList<Statement>();
		return pattern;
	}

	public void setPattern(List<Statement> pattern) {
		this.pattern = pattern;
	}

	public String toString() {
		return patternString;
	}
	
}

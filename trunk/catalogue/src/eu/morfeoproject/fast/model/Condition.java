package eu.morfeoproject.fast.model;

import java.util.ArrayList;
import java.util.List;

import org.ontoware.rdf2go.model.Statement;

public class Condition {
	
	private List<Statement> statements;
	
	public List<Statement> getStatements() {
		if (statements == null)
			statements = new ArrayList<Statement>();
		return statements;
	}

	public void setStatements(List<Statement> statements) {
		this.statements = statements;
	}

	public String toString() {
		StringBuffer sb = new StringBuffer();
		for (Statement st : statements)
			sb.append(st.toString()+" .\n");
		return sb.toString();
	}
	
}

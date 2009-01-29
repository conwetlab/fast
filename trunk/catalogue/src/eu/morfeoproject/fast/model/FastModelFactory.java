package eu.morfeoproject.fast.model;

import java.util.List;

import org.ontoware.rdf2go.model.Statement;

public class FastModelFactory {
	
	public static ScreenFlow createScreenFlow() {
		return new ScreenFlow(null);
	}
	
	public static Screen createScreen() {
		return new Screen(null);
	}
	
	public static Condition createCondition() {
		return new Condition();
	}
	
	public static Condition createCondition(List<Statement> statements) {
		Condition condition = new Condition();
		for (Statement st : statements)
			condition.getStatements().add(st);
		return condition;
	}	
}

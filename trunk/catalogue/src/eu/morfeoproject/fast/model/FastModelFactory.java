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
	
	public static Slot createSlot() {
		return new Slot(null);
	}
	
	public static Event createEvent() {
		return new Event(null);
	}
	
	public static Condition createCondition() {
		return new Condition();
	}
	
	public static Condition createCondition(List<Statement> pattern) {
		Condition condition = new Condition();
		for (Statement st : pattern)
			condition.getPattern().add(st);
		return condition;
	}	
}

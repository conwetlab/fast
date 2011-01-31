package eu.morfeoproject.fast.catalogue.model.factory;

import org.commontag.AuthorCTag;
import org.commontag.AutoCTag;
import org.commontag.CTag;
import org.commontag.ReaderCTag;
import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.InvalidBuildingBlockTypeException;
import eu.morfeoproject.fast.catalogue.model.Action;
import eu.morfeoproject.fast.catalogue.model.BackendService;
import eu.morfeoproject.fast.catalogue.model.BuildingBlock;
import eu.morfeoproject.fast.catalogue.model.Concept;
import eu.morfeoproject.fast.catalogue.model.Condition;
import eu.morfeoproject.fast.catalogue.model.Form;
import eu.morfeoproject.fast.catalogue.model.Operator;
import eu.morfeoproject.fast.catalogue.model.Pipe;
import eu.morfeoproject.fast.catalogue.model.Property;
import eu.morfeoproject.fast.catalogue.model.Sample;
import eu.morfeoproject.fast.catalogue.model.Screen;
import eu.morfeoproject.fast.catalogue.model.ScreenFlow;
import eu.morfeoproject.fast.catalogue.model.Trigger;
import eu.morfeoproject.fast.catalogue.vocabulary.CTAG;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class BuildingBlockFactory {
	
	public static BuildingBlock createBuildingBlock(URI type) throws InvalidBuildingBlockTypeException {
		if (type.equals(FGO.ScreenFlow))
			return BuildingBlockFactory.createScreenFlow();
		else if (type.equals(FGO.Screen))
			return BuildingBlockFactory.createScreen();
		else if (type.equals(FGO.Form))
			return BuildingBlockFactory.createForm();
		else if (type.equals(FGO.Operator))
			return BuildingBlockFactory.createOperator();
		else if (type.equals(FGO.BackendService))
			return BuildingBlockFactory.createBackendService();
		else
			throw new InvalidBuildingBlockTypeException(type+" is not a valid building block type.");
	}

	public static ScreenFlow createScreenFlow() {
		return new ScreenFlow(null);
	}
	
	public static ScreenFlow createScreenFlow(URI uri) {
		return new ScreenFlow(uri);
	}
	
	public static Screen createScreen() {
		return new Screen(null);
	}
	
	public static Screen createScreen(URI uri) {
		return new Screen(uri);
	}
	
	public static Form createForm() {
		return new Form(null);
	}
	
	public static Form createForm(URI uri) {
		return new Form(uri);
	}
	
	public static Operator createOperator() {
		return new Operator(null);
	}
	
	public static Operator createOperator(URI uri) {
		return new Operator(uri);
	}
	
	public static BackendService createBackendService() {
		return new BackendService(null);
	}

	public static BackendService createBackendService(URI uri) {
		return new BackendService(uri);
	}

	public static Condition createCondition() {
		return new Condition();
	}
	
	public static Condition createCondition(URI uri) {
		return new Condition(uri);
	}
	
	public static Pipe createPipe(Screen screen) {
		return new Pipe(screen);
	}
	
	public static Pipe createPipe(Screen screen, URI uri) {
		return new Pipe(screen, uri);
	}
	
	public static Trigger createTrigger(Screen screen) {
		return new Trigger(screen);
	}
	
	public static Trigger createTrigger(Screen screen, URI uri) {
		return new Trigger(screen, uri);
	}
	
	public static Action createAction() {
		return new Action();
	}
	
	public static Concept createConcept() {
		return new Concept();
	}
	
	public static Concept createConcept(URI uri) {
		return new Concept(uri);
	}
	
	public static Property createAttribute() {
		return new Property();
	}
	
	public static Property createAttribute(URI uri, URI type, Concept concept) {
		return new Property(uri, type, concept);
	}
	
	public static Sample createSample() {
		return new Sample();
	}

	public static Sample createSample(URI uri) {
		return new Sample(uri);
	}

	public static CTag createTag() {
		return new CTag();
	}
	
	public static CTag createTag(URI tagType) {
		if (tagType == null) 						return new CTag();
		if (tagType.equals(CTAG.AuthorTag))			return new AuthorCTag();
		else if (tagType.equals(CTAG.AutoTag))		return new AutoCTag();
		else if (tagType.equals(CTAG.ReaderTag))	return new ReaderCTag();
		return new CTag();
	}

}

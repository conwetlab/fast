package eu.morfeoproject.fast.catalogue.buildingblocks;

import org.ontoware.rdf2go.model.node.URI;

import eu.morfeoproject.fast.catalogue.InvalidBuildingBlockTypeException;
import eu.morfeoproject.fast.catalogue.commontag.AuthorCTag;
import eu.morfeoproject.fast.catalogue.commontag.AutoCTag;
import eu.morfeoproject.fast.catalogue.commontag.CTag;
import eu.morfeoproject.fast.catalogue.commontag.ReaderCTag;
import eu.morfeoproject.fast.catalogue.vocabulary.CTAG;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class FastModelFactory {
	
	public static BuildingBlock createBuildingBlock(URI type) throws InvalidBuildingBlockTypeException {
		if (type.equals(FGO.ScreenFlow))
			return FastModelFactory.createScreenFlow();
		else if (type.equals(FGO.Screen))
			return FastModelFactory.createScreen();
		else if (type.equals(FGO.Form))
			return FastModelFactory.createForm();
		else if (type.equals(FGO.Operator))
			return FastModelFactory.createOperator();
		else if (type.equals(FGO.BackendService))
			return FastModelFactory.createBackendService();
		else if (type.equals(FGO.Precondition))
			return FastModelFactory.createPrecondition();
		else if (type.equals(FGO.Postcondition))
			return FastModelFactory.createPostcondition();
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

	public static Precondition createPrecondition() {
		return new Precondition(null);
	}
	
	public static Precondition createPrecondition(URI uri) {
		return new Precondition(uri);
	}
	
	public static Postcondition createPostcondition() {
		return new Postcondition(null);
	}
	
	public static Postcondition createPostcondition(URI uri) {
		return new Postcondition(uri);
	}

	public static Condition createCondition() {
		return new Condition();
	}
	
	public static Pipe createPipe() {
		return new Pipe();
	}
	
	public static Trigger createTrigger() {
		return new Trigger();
	}
	
	public static Action createAction() {
		return new Action();
	}
	
	public static Concept createConcept() {
		return new Concept(null);
	}
	
	public static Concept createConcept(URI uri) {
		return new Concept(uri);
	}
	
	public static Attribute createAttribute() {
		return new Attribute(null, null, null);
	}
	
	public static Attribute createAttribute(URI uri, URI type, Concept concept) {
		return new Attribute(uri, type, concept);
	}
	
	public static CTag createTag() {
		return new CTag();
	}
	
	public static CTag createTag(URI tagType) {
		if (tagType.equals(CTAG.AuthorTag))
			return new AuthorCTag();
		else if (tagType.equals(CTAG.AutoTag))
			return new AutoCTag();
		else if (tagType.equals(CTAG.ReaderTag))
			return new ReaderCTag();
		return new CTag();
	}

}

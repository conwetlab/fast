package eu.morfeoproject.fast.catalogue;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.LanguageTagLiteral;
import org.ontoware.rdf2go.model.node.Node;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.morfeoproject.fast.catalogue.buildingblocks.Action;
import eu.morfeoproject.fast.catalogue.buildingblocks.BackendService;
import eu.morfeoproject.fast.catalogue.buildingblocks.BuildingBlock;
import eu.morfeoproject.fast.catalogue.buildingblocks.Condition;
import eu.morfeoproject.fast.catalogue.buildingblocks.FastModelFactory;
import eu.morfeoproject.fast.catalogue.buildingblocks.Form;
import eu.morfeoproject.fast.catalogue.buildingblocks.Library;
import eu.morfeoproject.fast.catalogue.buildingblocks.Operator;
import eu.morfeoproject.fast.catalogue.buildingblocks.Pipe;
import eu.morfeoproject.fast.catalogue.buildingblocks.Screen;
import eu.morfeoproject.fast.catalogue.buildingblocks.ScreenComponent;
import eu.morfeoproject.fast.catalogue.buildingblocks.ScreenDefinition;
import eu.morfeoproject.fast.catalogue.buildingblocks.ScreenFlow;
import eu.morfeoproject.fast.catalogue.buildingblocks.WithConditions;
import eu.morfeoproject.fast.catalogue.commontag.CTag;
import eu.morfeoproject.fast.catalogue.util.DateFormatter;
import eu.morfeoproject.fast.catalogue.vocabulary.CTAG;
import eu.morfeoproject.fast.catalogue.vocabulary.DC;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;
import eu.morfeoproject.fast.catalogue.vocabulary.FOAF;

public class BuildingBlockRDF2GoBuilder {

	final static Logger logger = LoggerFactory.getLogger(BuildingBlockRDF2GoBuilder.class);

	public static ScreenFlow buildScreenFlow(Model model) {
		ScreenFlow sf = null;
		try {
			sf = (ScreenFlow) retrieveScreenFlow(model);
		} catch (InvalidBuildingBlockTypeException e) {
			logger.error("The building block type is not valid: "+e, e);
		}
		return sf;
	}
	
	public static Screen buildScreen(Model model) {
		Screen screen = null;
		try {
			screen = (Screen) retrieveScreen(model);
		} catch (InvalidBuildingBlockTypeException e) {
			logger.error("The building block type is not valid: "+e, e);
		}
		return screen;
	}

	public static Form buildForm(Model model) {
		Form form = null;
		try {
			form = (Form) retrieveScreenComponent(FGO.Form, model);
		} catch (InvalidBuildingBlockTypeException e) {
			logger.error("The building block type is not valid: "+e, e);
		}
		return form;
	}
	
	public static Operator buildOperator(Model model) {
		Operator operator = null;
		try {
			operator = (Operator) retrieveScreenComponent(FGO.Operator, model);
		} catch (InvalidBuildingBlockTypeException e) {
			logger.error("The building block type is not valid: "+e, e);
		}
		return operator;
	}
	
	public static BackendService buildBackendService(Model model) {
		BackendService bs = null;
		try {
			bs = (BackendService) retrieveScreenComponent(FGO.BackendService, model);
		} catch (InvalidBuildingBlockTypeException e) {
			logger.error("The building block type is not valid: "+e, e);
		}
		return bs;
	}
	
	private static BuildingBlock retrieveBuildingBlock(URI type, Model model) throws InvalidBuildingBlockTypeException {
		// create the resource of the given type
		BuildingBlock bb = FastModelFactory.createBuildingBlock(type);
		
		// fill the information about the resource
		bb.setUri(model.getContextURI());
		String sUri = model.getContextURI().toString();
		bb.setId(sUri.substring(sUri.lastIndexOf("/") + 1));
		ClosableIterator<Statement> cIt = model.findStatements(model.getContextURI(), Variable.ANY, Variable.ANY);
		if (!cIt.hasNext()) // the resource does not exist
			return null;
		for ( ; cIt.hasNext(); ) {
			Statement st = cIt.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			if (predicate.equals(RDFS.label)) {
				if (object instanceof LanguageTagLiteral) {
					LanguageTagLiteral label = object.asLanguageTagLiteral();
					bb.getLabels().put(label.getLanguageTag(), label.getValue());
				}
			} else if (predicate.equals(DC.description)) {
				LanguageTagLiteral description = object.asLanguageTagLiteral();
				bb.getDescriptions().put(description.getLanguageTag(), description.getValue());
			} else if (predicate.equals(DC.creator)) {
				bb.setCreator(object.asURI());
			} else if (predicate.equals(DC.rights)) {
				bb.setRights(object.asURI());
			} else if (predicate.equals(FGO.hasVersion)) {
				bb.setVersion(object.asDatatypeLiteral().getValue());
			} else if (predicate.equals(DC.date)) {
				bb.setCreationDate(DateFormatter.parseDateISO8601(object.asDatatypeLiteral().getValue()));
			} else if (predicate.equals(FGO.hasIcon)) {
				bb.setIcon(object.asURI());
			} else if (predicate.equals(FGO.hasScreenshot)) {
				bb.setScreenshot(object.asURI());
			} else if (predicate.equals(CTAG.tagged)) {
				CTag tag = null;
				URI tagType = null;
				HashMap<String, String> tagLabels = new HashMap<String, String>();
				URI tagMeans = null;
				Date tagTaggingDate = null;
				BlankNode bnTag = object.asBlankNode();
				ClosableIterator<Statement> tagIt = model.findStatements(bnTag, Variable.ANY, Variable.ANY);
				for ( ; tagIt.hasNext(); ) {
					Statement tagSt = tagIt.next();
					URI tagPredicate = tagSt.getPredicate();
					Node tagObject = tagSt.getObject();
					if (tagPredicate.equals(RDF.type)) {
						tagType = tagObject.asURI();
					} else if (tagPredicate.equals(CTAG.means)) {
						tagMeans = tagObject.asURI();
					} else if (tagPredicate.equals(CTAG.label)) {
						if (tagObject instanceof LanguageTagLiteral) {
							LanguageTagLiteral label = tagObject.asLanguageTagLiteral();
							tagLabels.put(label.getLanguageTag(), label.getValue());
						}
					} else if (tagPredicate.equals(CTAG.taggingDate)) {
						tagTaggingDate = DateFormatter.parseDateISO8601(tagObject.asDatatypeLiteral().getValue());
					}
					tag = FastModelFactory.createTag(tagType);
					tag.getLabels().putAll(tagLabels);
					tag.setMeans(tagMeans);
					tag.setTaggingDate(tagTaggingDate);
				}
				bb.getTags().add(tag);
			} else if (predicate.equals(FOAF.homepage)) {
				bb.setHomepage(object.asURI());
			} else if (predicate.equals(FGO.hasName)) {
				bb.setName(object.asDatatypeLiteral().getValue());
			} else if (predicate.equals(FGO.hasParameterTemplate)) {
				bb.setParameterTemplate(object.asDatatypeLiteral().getValue());
			}
		}
		cIt.close();
		
		return bb;
	}

	private static ScreenFlow retrieveScreenFlow(Model model) throws InvalidBuildingBlockTypeException {
		ScreenFlow sf = (ScreenFlow) retrieveWithConditions(FGO.ScreenFlow, model);
		
		if (sf != null) {
			// find all the info related to a screen-flow
			ClosableIterator<Statement> sfIt = model.findStatements(sf.getUri(), Variable.ANY, Variable.ANY);
			for ( ; sfIt.hasNext(); ) {
				Statement st = sfIt.next();
				URI predicate = st.getPredicate();
				Node object = st.getObject();
			    if (predicate.equals(FGO.contains)) {
			    	sf.getBuildingBlockList().add(object.asURI());
			    }
			}
			sfIt.close();
		}
		
		return sf;
	}
	
	private static Screen retrieveScreen(Model model) throws InvalidBuildingBlockTypeException {
		Screen screen = (Screen) retrieveWithConditions(FGO.Screen, model);
		
		if (screen != null) {
			// find all the info related to a screen
			ClosableIterator<Statement> sIt = model.findStatements(screen.getUri(), Variable.ANY, Variable.ANY);
			for ( ; sIt.hasNext(); ) {
				Statement st = sIt.next();
				URI predicate = st.getPredicate();
				Node object = st.getObject();
				if (predicate.equals(FGO.hasCode)) {
					screen.setCode(object.asURI());
				} else if (predicate.equals(FGO.hasDefinition)) {
					ScreenDefinition def = new ScreenDefinition();
					ClosableIterator<Statement> defIt = model.findStatements(object.asBlankNode(), Variable.ANY, Variable.ANY);
					for ( ; defIt.hasNext(); ) {
						Statement defSt = defIt.next();
						URI defPredicate = defSt.getPredicate();
						Node defObject = defSt.getObject();
						if (defPredicate.equals(FGO.contains)) {
							String idBB = null;
							URI uriBB = null;
							String idBBFrom = null, idConditionFrom = null, idBBTo = null, idConditionTo = null, idActionTo = null;
							ClosableIterator<Statement> bbIt = model.findStatements(defObject.asBlankNode(), Variable.ANY, Variable.ANY);
							for ( ; bbIt.hasNext(); ) {
								Statement bbSt = bbIt.next();
								URI bbPredicate = bbSt.getPredicate();
								Node bbObject = bbSt.getObject();
								if (bbPredicate.equals(FGO.hasId)) {
									idBB = bbObject.asLiteral().getValue();
								} else if (bbPredicate.equals(FGO.hasUri)) {
									uriBB = bbObject.asURI();
								} else if (bbPredicate.equals(FGO.hasIdBBFrom)) {
									idBBFrom = bbObject.asLiteral().getValue();
								} else if (bbPredicate.equals(FGO.hasIdConditionFrom)) {
									idConditionFrom = bbObject.asLiteral().getValue();
								} else if (bbPredicate.equals(FGO.hasIdBBTo)) {
									idBBTo = bbObject.asLiteral().getValue();
								} else if (bbPredicate.equals(FGO.hasIdConditionTo)) {
									idConditionTo = bbObject.asLiteral().getValue();
								} else if (bbPredicate.equals(FGO.hasIdActionTo)) {
									idActionTo = bbObject.asLiteral().getValue();
								}
							}
							if (idBB != null && uriBB != null) {
								def.getBuildingBlocks().put(idBB, uriBB);
							} else if (idBBFrom != null && idConditionFrom != null && idBBTo != null && idConditionTo != null && idActionTo != null) {
								Pipe pipe = FastModelFactory.createPipe();
								pipe.setIdBBFrom(idBBFrom);
								pipe.setIdConditionFrom(idConditionFrom);
								pipe.setIdBBTo(idBBTo);
								pipe.setIdConditionTo(idConditionTo);
								pipe.setIdActionTo(idActionTo);
								def.getPipes().add(pipe);
							}
							bbIt.close();
						}
					}
					defIt.close();
					screen.setDefinition(def);
				}
			}
			sIt.close();
		}
		
		return screen;
	}
	
	private static WithConditions retrieveWithConditions(URI type, Model model) throws InvalidBuildingBlockTypeException {
		if (!type.equals(FGO.Screen))
			throw new InvalidBuildingBlockTypeException("Only ScreenFlow and Screen types are allowed.");
		
		// create the resource of the given type
		WithConditions withConditions = (WithConditions) retrieveBuildingBlock(type, model);
		if (withConditions != null) {
			// fill the conditions of the building block
			ClosableIterator<Statement> cIt = model.findStatements(withConditions.getUri(), Variable.ANY, Variable.ANY);
			for ( ; cIt.hasNext(); ) {
				Statement st = cIt.next();
				URI predicate = st.getPredicate();
				Node object = st.getObject();
				
				// preconditions
				if (predicate.equals(FGO.hasPreCondition)) {
					ArrayList<Condition> conList = new ArrayList<Condition>();
					int i = 1;
					boolean stop = false;
					while (!stop) {
						ClosableIterator<Statement> conBag = model.findStatements(object.asBlankNode(), RDF.li(i++), Variable.ANY);
						if (!conBag.hasNext()) {
							stop = true;
						} else {
							while (conBag.hasNext())
								conList.add(retrieveCondition(conBag.next().getObject().asBlankNode(), model));
						}
						conBag.close();
					}
					withConditions.getPreconditions().add(conList);
					
				// postconditions
				} else if (predicate.equals(FGO.hasPostCondition)) {
					ArrayList<Condition> conList = new ArrayList<Condition>();
					int i = 1;
					boolean stop = false;
					while (!stop) {
						ClosableIterator<Statement> conBag = model.findStatements(object.asBlankNode(), RDF.li(i++), Variable.ANY);
						if (!conBag.hasNext()) {
							stop = true;
						} else {
							while (conBag.hasNext())
								conList.add(retrieveCondition(conBag.next().getObject().asBlankNode(), model));
						}
						conBag.close();
					}
					withConditions.getPostconditions().add(conList);
				}
			}
			cIt.close();
		}
		
		return withConditions;
	}
	
	private static ScreenComponent retrieveScreenComponent(URI type, Model model) throws InvalidBuildingBlockTypeException {
		if (!type.equals(FGO.Form) && !type.equals(FGO.Operator) && !type.equals(FGO.BackendService))
			throw new InvalidBuildingBlockTypeException(type+" is not a valid screen component type.");
		
		ScreenComponent sc = (ScreenComponent) retrieveBuildingBlock(type, model);
		if (sc != null) {
			// find all the info related to a screen component
			ClosableIterator<Statement> cIt = model.findStatements(sc.getUri(), Variable.ANY, Variable.ANY);
			for ( ; cIt.hasNext(); ) {
				Statement st = cIt.next();
				URI predicate = st.getPredicate();
				Node object = st.getObject();
				if (predicate.equals(FGO.hasAction)) {
					Action action = new Action();
					ClosableIterator<Statement> actionIt = model.findStatements(object.asBlankNode(), Variable.ANY, Variable.ANY);
					for ( ; actionIt.hasNext(); ) {
						Statement s = actionIt.next();
						URI p = s.getPredicate();
						Node o = s.getObject();
						if (p.equals(RDFS.label)) {
							action.setName(o.asLiteral().toString());
						} else if (p.equals(FGO.hasPreCondition)) {
							action.getPreconditions().add(retrieveCondition(o.asBlankNode(), model));
						} else if (p.equals(FGO.hasUse)) {
							ClosableIterator<Statement> useIt = model.findStatements(o.asBlankNode(), Variable.ANY, Variable.ANY);
							String idUse = null;
							URI uriUse = null;
							for ( ; useIt.hasNext(); ) {
								Statement sUse = useIt.next();
								URI pUse = sUse.getPredicate();
								Node oUse = sUse.getObject();
								if (pUse.equals(FGO.hasId)) {
									idUse = oUse.asDatatypeLiteral().getValue();
								} else if (pUse.equals(FGO.hasUri)) {
									uriUse = oUse.asURI();
								}
							}
							action.getUses().put(idUse, uriUse);
							useIt.close();
						}
					}
					actionIt.close();
					sc.getActions().add(action);
				} else if (predicate.equals(FGO.hasPostCondition)) {
					ArrayList<Condition> conList = new ArrayList<Condition>();
					int i = 1;
					boolean stop = false;
					while (!stop) {
						ClosableIterator<Statement> conBag = model.findStatements(object.asBlankNode(), RDF.li(i++), Variable.ANY);
						if (!conBag.hasNext()) {
							stop = true;
						} else {
							while (conBag.hasNext())
								conList.add(retrieveCondition(conBag.next().getObject().asBlankNode(), model));
						}
						conBag.close();
					}
					sc.getPostconditions().add(conList);
				} else if (predicate.equals(FGO.hasCode)) {
					sc.setCode(object.asURI());
				} else if (predicate.equals(FGO.hasTrigger)) {
					sc.getTriggers().add(object.asDatatypeLiteral().getValue());
				} else if (predicate.equals(FGO.hasLibrary)) {
					Library library = new Library();
					ClosableIterator<Statement> libIt = model.findStatements(object.asBlankNode(), Variable.ANY, Variable.ANY);
					for ( ; libIt.hasNext(); ) {
						Statement s = libIt.next();
						URI p = s.getPredicate();
						Node o = s.getObject();
						if (p.equals(FGO.hasLanguage)) {
							library.setLanguage(o.asDatatypeLiteral().getValue());
						} else if (p.equals(FGO.hasSource)) {
							library.setSource(o.asURI());
						}
					}
					libIt.close();
					sc.getLibraries().add(library);
				}
			}
			cIt.close();
		}
		
		return sc;
	}
	
	/*
	 * Each condition will have only one pattern at most
	 */
	private static Condition retrieveCondition(Node subject, Model model) {
		Condition c = FastModelFactory.createCondition();
		ClosableIterator<Statement> cIt = model.findStatements(subject.asBlankNode(), Variable.ANY, Variable.ANY);
		for ( ; cIt.hasNext(); ) {
			Statement st = cIt.next();
			URI predicate = st.getPredicate();
			Node object = st.getObject();
			if (predicate.equals(RDFS.label)) {
				if (object instanceof LanguageTagLiteral) {
					LanguageTagLiteral label = object.asLanguageTagLiteral();
					c.getLabels().put(label.getLanguageTag(), label.getValue());
				}
			} else if (predicate.equals(FGO.isPositive)) {
				c.setPositive(Boolean.parseBoolean(object.asDatatypeLiteral().getValue()));
			} else if (predicate.equals(FGO.hasPatternString)) {
				c.setPatternString(object.asDatatypeLiteral().getValue());
			} else if (predicate.equals(FGO.hasId)) {
				c.setId(object.asDatatypeLiteral().getValue());
			}
		}
		cIt.close();

		return c;
	}

}
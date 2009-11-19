package eu.morfeoproject.fast.test;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.ontoware.aifbcommons.collection.ClosableIterator;
import org.ontoware.rdf2go.model.Statement;
import org.ontoware.rdf2go.model.node.BlankNode;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.model.node.Variable;
import org.ontoware.rdf2go.model.node.impl.URIImpl;
import org.ontoware.rdf2go.vocabulary.OWL;
import org.ontoware.rdf2go.vocabulary.RDF;
import org.ontoware.rdf2go.vocabulary.RDFS;

import eu.morfeoproject.fast.catalogue.Catalogue;
import eu.morfeoproject.fast.model.Condition;
import eu.morfeoproject.fast.model.DomainContext;
import eu.morfeoproject.fast.model.FastModelFactory;
import eu.morfeoproject.fast.model.Screen;

/**
 * This is a catalogue generator for testing purposes. It creates a certain number
 * of screens, slots and events with random pre/postconditions using concepts from
 * the ontology <http://aws.amazon.com/AWSECommerceService#>
 * @author Ismael Rivera
 */
public class ScreenGenerator {
	
	private Catalogue catalogue;
	private List<URI> amazonClasses;
	private List<URI> siocClasses;
	
	public ScreenGenerator() {
		catalogue = new Catalogue(new File("C:\\Program Files\\eclipse\\prueba2"));
		
		// extracts all concepts from the Amazon Ontology
		amazonClasses = new ArrayList<URI>();
		URI amazonContext = new URIImpl("http://aws.amazon.com/AWSECommerceService#");
		ClosableIterator<Statement> itA = catalogue.getTripleStore().findStatements(amazonContext, Variable.ANY, RDF.type, RDFS.Class);
		for (; itA.hasNext(); ) {
			amazonClasses.add(itA.next().getSubject().asURI());
		}
		itA.close();
		
		// extracts all concepts from the Amazon Ontology
		siocClasses = new ArrayList<URI>();
		URI siocContext = new URIImpl("http://rdfs.org/sioc/ns#");
		ClosableIterator<Statement> itB = catalogue.getTripleStore().findStatements(siocContext, Variable.ANY, RDF.type, OWL.Class);
		for (; itB.hasNext(); )
			siocClasses.add(itB.next().getSubject().asURI());
		itB.close();
	}
	
	public List<List<Condition>> createConditions(List<URI> classes) {
		ArrayList<List<Condition>> orConditions = new ArrayList<List<Condition>>();
		for (int i = 0; i < Math.random()*2; i++) {
			ArrayList<Condition> andConditions = new ArrayList<Condition>();
			for (int j = 0; j < Math.random()*3; j++)
				andConditions.add(createCondition(classes));
			orConditions.add(andConditions);
		}
		return orConditions;
	}
	
	public Condition createCondition(List<URI> classes) {
		URI uri = classes.get((int)(Math.random() * classes.size()));
		Condition c = FastModelFactory.createCondition();
		HashMap<String, String> labels = new HashMap<String, String>();
		labels.put("en", "Condition label");
		labels.put("es", "Etiqueta de condicion");
		c.setLabels(labels);
		ArrayList<Statement> pattern = new ArrayList<Statement>();
		BlankNode bn = catalogue.getTripleStore().createBlankNode();
		Statement stmt = catalogue.getTripleStore().createStatement(bn, RDF.type, uri);
		pattern.add(stmt);
		c.setPattern(pattern);
		c.setPatternString(bn.toString()+" "+RDF.type.toString()+" "+uri);
		c.setPositive(true);
		return c;
	}
	
	public void generateScreen() {
		Screen s = FastModelFactory.createScreen();
		s.setCode(new URIImpl("http://someurl.com/code"));
		s.setCreationDate(new Date());
		s.setCreator(new URIImpl("http://someurl.com/creator"));
		s.setHomepage(new URIImpl("http://someurl.com/homepage"));
		s.setIcon(new URIImpl("http://someurl.com/icon"));
		s.setRights(new URIImpl("http://someurl.com/rights"));
		s.setScreenshot(new URIImpl("http://someurl.com/screenshot"));
		s.setVersion("0.1beta");
		HashMap<String, String> labels = new HashMap<String, String>();
		labels.put("en", "Example of a label");
		labels.put("es", "Ejemplo de etiqueta");
		s.setLabels(labels);
		HashMap<String, String> descriptions = new HashMap<String, String>();
		descriptions.put("en", "This is an example of a screen description.");
		descriptions.put("es", "Esto es un ejemplo de una descripcion de una ventana.");
		s.setDescriptions(descriptions);
		DomainContext context = new DomainContext();
		ArrayList<String> tags = new ArrayList<String>();
		// specify the ontology to use for the conditions
		List<URI> classes;
		if ((Math.random() * 2) % 2 == 0) {
			classes = amazonClasses;
			tags.add("amazon");
		} else {
			classes = siocClasses;
			tags.add("sioc");
		}
		// set domain context
		context.setTags(tags);
		s.setDomainContext(context);
		// preconditions
		s.setPreconditions(createConditions(classes));
		// postconditions
		s.setPostconditions(createConditions(classes));
		try {
			catalogue.addScreen(s);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public void generateSlot() {
	}
	
	public void generateEvent() {
	}
	
	public static void main(String [] args) {
		ScreenGenerator generator = new ScreenGenerator();
		for (int i = 0; i < 10; i++)
			generator.generateScreen();
		for (int i = 0; i < 2; i++)
			generator.generateSlot();
		for (int i = 0; i < 2; i++)
			generator.generateEvent();
	}
	
}

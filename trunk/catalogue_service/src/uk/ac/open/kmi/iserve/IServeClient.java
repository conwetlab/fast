package uk.ac.open.kmi.iserve;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.ontoware.rdf2go.model.node.URI;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import eu.morfeoproject.fast.catalogue.util.URLInputSource;
import eu.morfeoproject.fast.catalogue.util.URLUTF8Encoder;

public class IServeClient {

	protected final Log log = LogFactory.getLog(this.getClass());

	private String iServeURL;
	
	public IServeClient() {}
	
	public IServeClient(IServeConfiguration config) {
		this.iServeURL = config.get("server");
	}
	
	public Collection<IServeResponse> query(List<URI> classes) {
		if (this.iServeURL == null || this.iServeURL.equals(""))
			throw new RuntimeException("iServe URL has not been configured. Please, set up an iServe URL.");
		
		if (classes.isEmpty()) return new LinkedList<IServeResponse>();
		
		String queryTemplate = 
			"PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n" +
			"PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>\n" +
			"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
			"PREFIX owl:<http://www.w3.org/2002/07/owl#>\n" +
			"PREFIX wl:<http://www.wsmo.org/ns/wsmo-lite#>\n" +
			"PREFIX sawsdl:<http://www.w3.org/ns/sawsdl#>\n" +
			"PREFIX rest:<http://www.wsmo.org/ns/hrests#>\n" +
			"PREFIX msm:<http://cms-wg.sti2.org/ns/minimal-service-model#>\n" +
			"SELECT DISTINCT ?service ?label ?doc ?address WHERE {\n" +
			"  { ?service msm:hasOperation ?o . ?o msm:hasInput ?in . ?in msm:hasPart ?p1 . ?p1 msm:hasPart ?p2 . ?p2 msm:hasPart ?p3 . ?p3 sawsdl:modelReference <class> . }  UNION \n" +
			"  { ?service msm:hasOperation ?o . ?o msm:hasInput ?in . ?in msm:hasPart ?p1 . ?p1 msm:hasPart ?p2 . ?p2 sawsdl:modelReference <class> . } UNION \n" +
			"  { ?service msm:hasOperation ?o . ?o msm:hasInput ?in . ?in msm:hasPart ?p1 . ?p1 sawsdl:modelReference <class> . } UNION \n" +
			"  { ?service msm:hasOperation ?o . ?o msm:hasInput ?in . ?in sawsdl:modelReference <class> . } UNION \n" +
			"  { ?service msm:hasOperation ?o . ?o sawsdl:modelReference <class> . } . " +
			"  OPTIONAL { ?service rdfs:label ?label } . \n" +
			"  OPTIONAL { ?service rdfs:isDefinedBy ?doc } . \n" +
			"  OPTIONAL { ?o rest:hasAddress ?address } } \n";
		
		HashMap<String, IServeResponse> services = new HashMap<String, IServeResponse>();
		// makes one query per class in order to identify which services are related with which classes
		for (URI classUri : classes) {
			String query = queryTemplate.replaceAll("<class>", classUri.toSPARQL());
			if (log.isDebugEnabled()) log.debug(query);
			try {
				URLInputSource inSource = new URLInputSource(new URL(this.iServeURL+"?query="+URLUTF8Encoder.encode(query)));
				InputStream inStream = inSource.getInputStream();
				
				DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
				DocumentBuilder db = dbf.newDocumentBuilder();
				Document doc = db.parse(inStream);
				doc.getDocumentElement().normalize();
				NodeList nodeList = doc.getElementsByTagName("result");
				
				if (log.isDebugEnabled()) log.debug(nodeList.getLength()+" services found for "+classUri);
				for (int i = 0; i < nodeList.getLength(); i++) {
					Node node = nodeList.item(i);
					NodeList children = node.getChildNodes();
					IServeResponse response = new IServeResponse();
					if (services.containsKey(response.get("service"))) {
						services.get(response.get("service")).getCollection("classes").add(classUri);
					} else {
						for (int j = 0; j < children.getLength(); j++) {
							response.get("service");
							response.put(children.item(j).getAttributes().getNamedItem("name").getNodeValue(), children.item(j).getTextContent());
							//TODO change: in the response we should include the "class" and its properties, but this is not the best way.
							ArrayList<URI> list = new ArrayList<URI>();
							list.add(classUri);
							response.put("classes", list);
						}
						services.put(response.get("service").toString(), response);
						if (log.isDebugEnabled()) log.debug(response.toString());
					}
				}
			} catch (IOException e) {
				log.error(e.toString(), e);
			} catch (ParserConfigurationException e) {
				log.error(e.toString(), e);
			} catch (SAXException e) {
				log.error(e.toString(), e);
			}
		}
		
		return services.values();
	}
}

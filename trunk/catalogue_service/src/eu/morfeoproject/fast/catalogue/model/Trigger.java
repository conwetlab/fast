package eu.morfeoproject.fast.catalogue.model;

import org.json.JSONException;
import org.json.JSONObject;
import org.ontoware.rdf2go.RDF2Go;
import org.ontoware.rdf2go.model.Model;
import org.ontoware.rdf2go.model.node.URI;
import org.ontoware.rdf2go.vocabulary.RDF;

import eu.morfeoproject.fast.catalogue.MyRDFFactory;
import eu.morfeoproject.fast.catalogue.RDFFactory;
import eu.morfeoproject.fast.catalogue.vocabulary.FGO;

public class Trigger {

	private URI uri;
	private Screen screen;
	private URI bbFrom;
	private String nameFrom;
	private URI bbTo;
	private String actionTo;

	public Trigger(Screen screen) {
		super();
		this.screen = screen;
	}
	
	public Trigger(Screen screen, URI uri) {
		this(screen);
		this.uri = uri;
	}
	
	public URI getUri() {
		return uri;
	}

	public void setUri(URI uri) {
		this.uri = uri;
	}

	public Screen getScreen() {
		return screen;
	}

	public void setScreen(Screen screen) {
		this.screen = screen;
	}

	public URI getBBFrom() {
		return bbFrom;
	}

	public void setBBFrom(URI bbFrom) {
		this.bbFrom = bbFrom;
	}

	public String getNameFrom() {
		return nameFrom;
	}

	public void setNameFrom(String nameFrom) {
		this.nameFrom = nameFrom;
	}

	public URI getBBTo() {
		return bbTo;
	}

	public void setBBTo(URI bbTo) {
		this.bbTo = bbTo;
	}

	public String getActionTo() {
		return actionTo;
	}

	public void setActionTo(String actionTo) {
		this.actionTo = actionTo;
	}

	public JSONObject toJSON() throws JSONException {
		JSONObject json = new JSONObject();
		JSONObject jsonFrom = new JSONObject();
		JSONObject jsonTo = new JSONObject();
		jsonFrom.put("buildingblock", this.bbFrom);
		jsonFrom.put("name", this.nameFrom);
		jsonTo.put("buildingblock", this.bbTo);
		jsonTo.put("action", this.actionTo);
		json.put("from", jsonFrom);
		json.put("to", jsonTo);
		return json;
	}

	public Model toRDF2GoModel() {
		RDFFactory rdfFactory = new MyRDFFactory();
		Model model = RDF2Go.getModelFactory().createModel();
		model.open();
		model.setNamespace("fgo", FGO.NS_FGO.toString());
		
		URI from, to;
		from = rdfFactory.createURI((bbFrom == null ? screen.getUri() : bbFrom) + "/" + nameFrom);
		to = rdfFactory.createURI((bbTo == null ? screen.getUri() : bbTo) + "/" + actionTo);
		
		model.addStatement(uri, RDF.type, FGO.Trigger);
		model.addStatement(uri, FGO.from, from);
		model.addStatement(uri, FGO.to, to);
		
		return model;
	}

}
package fast.facttool.pinion;

import java.util.HashMap;
import java.util.Iterator;

import com.google.gwt.core.client.GWT;
import com.google.gwt.json.client.JSONArray;
import com.google.gwt.json.client.JSONObject;
import com.google.gwt.json.client.JSONParser;
import com.google.gwt.json.client.JSONString;
import com.google.gwt.json.client.JSONValue;
import com.google.gwt.user.client.rpc.AsyncCallback;

import de.uni_kassel.webcoobra.client.CoobraRoot;
import fast.common.client.FactAttribute;
import fast.common.client.FactType;
import fast.common.client.ServiceDesigner;
import fast.servicescreen.client.RequestService;
import fast.servicescreen.client.RequestServiceAsync;
import fast.servicescreen.client.gui.codegen_js.CodeGenerator;
import fujaba.web.runtime.client.FAction;
import fujaba.web.runtime.client.ICObject;

public class CatalogueAPI {

	//TODO tg move to config-file
	private String catalogueBaseUrl = "http://localhost:8080/Catalogue-1";
	
	private RequestServiceAsync conceptService = GWT.create(RequestService.class);

	/**
	 * removes all facttypes from the designer, loads the concepts from the catalogue and
	 * adds new facttypes into the designer
	 * */
	public void loadConcepts(CoobraRoot cr, FAction action)
	{
		ServiceDesigner tmpDesigner = null;
		for (Iterator<ICObject> iterator = cr.iteratorOfSharedObjects(); iterator.hasNext();)
		{
			ICObject tmpObj = (ICObject) iterator.next();
			if (tmpObj instanceof ServiceDesigner) {
				tmpDesigner = (ServiceDesigner)tmpObj;
			}	
		}

		final ServiceDesigner designer = tmpDesigner;
		final FAction successAction = action;
		
		if(designer != null)
		{
			designer.removeAllFromFactTypes();

			//get concepts from Catalogue
			String url = catalogueBaseUrl + "/concepts/";

			conceptService.sendHttpRequest_GET(url, new HashMap<String, String>(), new AsyncCallback<String>() {
				@Override
				public void onSuccess(String result) {
					//add concepts to the designer
					JSONValue conceptsVal = JSONParser.parse(result);
					JSONArray conceptsArray = conceptsVal.isArray();
					if(conceptsArray != null)
					{
						for (int i = 0; i < conceptsArray.size(); i++)
						{
							JSONValue tmpConceptVal = conceptsArray.get(i);
							JSONObject tmpConceptObj = tmpConceptVal.isObject();

							if(tmpConceptObj != null)
							{
								FactType newType = createNewFactType(tmpConceptObj);
								designer.addToFactTypes(newType);
							}
						}
					}
					
					successAction.doAction();
				}

				@Override
				public void onFailure(Throwable caught) {}
			});
		}
	}
	
	/**
	 * creates and returns a specific facttype by parsing the related concept
	 * */
	private FactType createNewFactType(JSONObject conceptObj)
	{
		FactType newType = new FactType();
		
		if(conceptObj.containsKey("description"))
		{
			JSONObject descriptionObj = conceptObj.get("description").isObject();
			String descriptionStr = "";
			if(descriptionObj.containsKey("en"))
			{
				descriptionStr = descriptionObj.get("en").isString().toString();
			}
			else if(descriptionObj.containsKey("en-us"))
			{
				descriptionStr = descriptionObj.get("en-us").isString().toString();
			}
			else if(descriptionObj.containsKey("en-gb"))
			{
				descriptionStr = descriptionObj.get("en-gb").isString().toString();
			}
			descriptionStr = descriptionStr.substring(1, descriptionStr.length()-1);
			
			newType.setDescription(descriptionStr);
		}
		if(conceptObj.containsKey("label"))
		{
			JSONObject labelObj = conceptObj.get("label").isObject();
			String labelStr = "";
			if(labelObj.containsKey("en"))
			{
				labelStr = labelObj.get("en").isString().toString();
			}
			else if(labelObj.containsKey("en-us"))
			{
				labelStr = labelObj.get("en-us").isString().toString();
			}
			else if(labelObj.containsKey("en-gb"))
			{
				labelStr = labelObj.get("en-gb").isString().toString();
			}
			labelStr = labelStr.substring(1, labelStr.length()-1);

			newType.setLabel(labelStr);
		}
		if(conceptObj.containsKey("subClassOf"))
		{
			String subClassOfStr = conceptObj.get("subClassOf").isString().toString();
			subClassOfStr = subClassOfStr.substring(1, subClassOfStr.length()-1);
			newType.setSubClassOf(subClassOfStr);
		}
		//attributes : [{..},{..}]
		if(conceptObj.containsKey("attributes"))
		{
			JSONArray attributesArr = conceptObj.get("attributes").isArray();
			for (int i = 0; i < attributesArr.size(); i++)
			{
				JSONValue tmpAttributeVal = attributesArr.get(i);
				JSONObject tmpAttribute = tmpAttributeVal.isObject();
				if(tmpAttribute != null && tmpAttribute.get("type") != null && tmpAttribute.get("uri") != null)
				{
					FactAttribute newAttribute = new FactAttribute();
					
					JSONString typeStr = tmpAttribute.get("type").isString();
					if(typeStr != null)
						newAttribute.setAttrName(typeStr.stringValue());
					else
						continue;
					
					JSONString uriStr = tmpAttribute.get("uri").isString();
					if(typeStr != null)
						newAttribute.setFactType(uriStr.stringValue());
					else
						continue;
					
					newType.addToFactAttributes(newAttribute);
				}
			}
		}
		if(conceptObj.containsKey("uri"))
		{
			String uriStr = conceptObj.get("uri").isString().toString();
			uriStr = uriStr.substring(1, uriStr.length()-1);
			newType.setUri(uriStr);
			
			//extract domain & name from uri
			if(! uriStr.contains("#"))
			{
				//TODO tg separate uri by slashes
//				String nameStr = uriStr.s;
//				newType.setTypeName(nameStr);
				
//				String domainStr = uriStr;
//				newType.setDomain(domainStr);
			}
			else
			{
				String nameStr = uriStr.substring(uriStr.indexOf("#") + 1);
				newType.setTypeName(nameStr);
				
				newType.setDomain("empty");
			}
				
		}
		//TODO tg tags : [..,..]
//		if(conceptObj.containsKey("tags"))
//		{
//			JSONArray tagsArr = conceptObj.get("tags").isArray();
////			newType.setTags("");
//		}
		
		//domain and name are extracted from url
//		if(conceptObj.containsKey("domain"))
//		{
//			String domainStr = conceptObj.get("domain").isString().toString();
//			domainStr = domainStr.substring(1, domainStr.length()-1);
//			newType.setDomain(domainStr);
//		}
//		if(conceptObj.containsKey("name"))
//		{
//			String nameStr = conceptObj.get("name").isString().toString();
//			nameStr = nameStr.substring(1, nameStr.length()-1);
//			newType.setTypeName(nameStr);
//		}
		
		//TODO tg samples separately?
		
		return newType;
	}

	/**
	 * shares a particular concept to the catalogue
	 * */
	public void shareConcept(FactType factType)
	{
		if(factType != null)
		{
			String url = catalogueBaseUrl + "/concepts/";
			url = url + factType.getDomain() + "/" + factType.getTypeName() + "/";
			
			String body = createBody(factType);

			conceptService.sendHttpRequest_PUT(url, new HashMap<String, String>(), body, new AsyncCallback<String>() {
				@Override
				public void onSuccess(String result) {}

				@Override
				public void onFailure(Throwable caught) {}
			});
		}
	}
	
	/**
	 * replaces the place holders of the concept-template by particular values
	 * */
	public String createBody(FactType factType)
	{
		//domain, name, label, description, subClassOf, tags, attributes
		String body = "";
		CodeGenerator generator = new CodeGenerator();
		body = generator.conceptTemplate;
		
		if(factType.getDomain() != null)
			body = body.replace("<<domain>>", factType.getDomain());
		else
			body = body.replace("<<domain>>", "");
		
		if(factType.getTypeName() != null)
			body = body.replace("<<name>>", factType.getTypeName());
		else
			body = body.replace("<<name>>", "");
		
		if(factType.getDescription() != null)
			body = body.replace("<<description>>", factType.getDescription());
		else
			body = body.replace("<<description>>", "");
		
		if(factType.getLabel() != null)
			body = body.replace("<<label>>", factType.getLabel());
		else
			body = body.replace("<<label>>", "");
		
		if(factType.getUri() != null)
			body = body.replace("<<uri>>", factType.getUri());
		else
			body = body.replace("<<uri>>", "");
		
		if(factType.getSubClassOf() != null)
			body = body.replace("<<subClassOf>>", "\"subClassOf\" : \"" + factType.getSubClassOf() + " \",");
		else
			body = body.replace("<<subClassOf>>", "");
		
		if(factType.getTags() != null)
		{
			//TODO separate and put into [<<tags>>]
			body = body.replace("<<tags>>", "");
		}
			
		else
			body = body.replace("<<tags>>", "");
		
		//TODO tg attributes
		if(factType.getFactAttributes().iterator().hasNext())
		{
			String attributes = "";
			for (Iterator<FactAttribute> iterator = factType.getFactAttributes().iterator(); iterator.hasNext();)
			{
				attributes += "{";
				FactAttribute tmpAttribute = (FactAttribute) iterator.next();
				attributes += "\"type\" : \"" + tmpAttribute.getAttrName() + "\",";
				attributes += "\"uri\" : \"" + tmpAttribute.getFactType() + "\"";
				
				attributes += "}";
				
				if(iterator.hasNext())
					attributes += ",";
			}
			body = body.replace("<<attributes>>", attributes);
		}
		else
			body = body.replace("<<attributes>>", "");
		
		return body;
	}
	
	/**
	 * deletes a particular concept from the catalogue
	 * */
	public void deleteConcept(FactType factType)
	{
		if(factType != null)
		{
			String url = catalogueBaseUrl + "/concepts/";
			url = url + factType.getDomain() + "/" + factType.getTypeName() + "/";
			
			conceptService.sendHttpRequest_DELETE(url, new HashMap<String, String>(), "", new AsyncCallback<String>() {
				@Override
				public void onSuccess(String result) {}

				@Override
				public void onFailure(Throwable caught) {}
			});
		}
	}
}
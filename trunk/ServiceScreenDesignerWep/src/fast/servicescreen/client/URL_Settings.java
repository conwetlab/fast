package fast.servicescreen.client;

/**
 * This static class should contain all URLs that we need in our Projects
 * */
public class URL_Settings
{
	static String gvsURL = "http://demo.fast.morfeo-project.org/";
	
	//TODO dk this should be auto configured at time. 
//	static String operatorURL = gvsURL + "static/servicescreendesignerwep/";
	
	static String templateBox_ExampleURL = "http://open.api.sandbox.ebay.com/shopping?appid=KasselUn-efea-4b93-9505-5dc2ef1ceecd&version=517&callname=FindItems&ItemSort=EndTime&QueryKeywords=<query_keywords>&responseencoding=XML";

	static String factToolURL = "./" + "FactTool.html";
	
	static String dataTransformationToolURL = "./" + "DataTransformationTool.html";
	
	
	
	
	public static String getTemplateBox_ExampleURL()
	{
		return templateBox_ExampleURL;
	}
	
	public static String getFactTool_URL()
	{
		return factToolURL;
	}
	
	public static String getDataTransformationTool_URL()
	{
		return dataTransformationToolURL;
	}
	
//	public static String getGVSOperatorStorage_URL()
//	{
//		return operatorURL;
//	}
	
	public static String getGVS_URL()
	{
		return gvsURL;
	}
}

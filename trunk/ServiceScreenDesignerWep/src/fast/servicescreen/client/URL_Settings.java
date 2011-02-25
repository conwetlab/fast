/**
 * Copyright (c) 2008-2011, FAST Consortium
 * 
 * This file is part of FAST Platform.
 * 
 * FAST Platform is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * FAST Platform is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with FAST Platform. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Info about members and contributors of the FAST Consortium
 * is available at http://fast.morfeo-project.eu
 *
 **/
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

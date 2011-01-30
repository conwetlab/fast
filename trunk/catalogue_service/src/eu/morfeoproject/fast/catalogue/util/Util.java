package eu.morfeoproject.fast.catalogue.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;

/**
 * Misc utilities.
 * 
 * @author Ismael Rivera
 */
public class Util {

	/**
	 * @returns true iff the given param is defined in the request AND either no
	 *          value is associated OR none of the values is equal to "n".
	 */
	public static boolean yes(HttpServletRequest request, String param) {
		List<String> values = getParamValues(request, param);
		return values != null && !values.contains("n");
	}

	/**
	 * @returns the list of values associated to the given param. null if the
	 *          param is not included in the request.
	 */
	public static List<String> getParamValues(HttpServletRequest request,
			String param) {
		Map<String, String[]> params = getParams(request);
		String[] vals = params.get(param);
		if (null == vals) {
			return null;
		}
		List<String> list = Arrays.asList(params.get(param));
		return list;
	}

	/**
	 * @returns The last value associated with the given parameter. If not value
	 *          is explicitly associated, it returns the given default value.
	 */
	public static String getParam(HttpServletRequest request, String param,
			String defaultValue) {
		Map<String, String[]> params = getParams(request);
		String[] array = params.get(param);
		if (array == null || array.length == 0) {
			return defaultValue;
		}
		// return last value in the array:
		return array[array.length - 1];
	}

	@SuppressWarnings("unchecked")
	public static Map<String, String[]> getParams(HttpServletRequest request) {
		Map<String, String[]> params = request.getParameterMap();
		return params;
	}

	/**
	 * @returns the list of values associated with a header. Never null.
	 */
	public static List<String> getHeader(HttpServletRequest request,
			String hname) {
		List<String> values = new ArrayList<String>();

		Enumeration<?> hvals = request.getHeaders(hname.toString());
		while (hvals.hasMoreElements()) {
			String hval = String.valueOf(hvals.nextElement());
			values.add(hval);
		}

		return values;
	}

	/**
	 * helper method to retrieve the contents of a resource in the classpath .
	 */
	public static String getResource(Log log, String resourceName) {
		InputStream infRulesStream = Thread.currentThread()
				.getContextClassLoader().getResourceAsStream(resourceName);
		if (infRulesStream == null) {
			log.error(resourceName + ": resource not found -- check classpath");
			return null;
		}
		StringWriter output = new StringWriter();
		try {
			IOUtils.copy(infRulesStream, output);
			return output.toString();
		} catch (IOException e) {
			log.error(resourceName + ": cannot read resource", e);
			return null;
		} finally {
			IOUtils.closeQuietly(infRulesStream);
		}
	}
	
	/**
	 * Transform a string of tags into an array. The tags are
	 * separated by +. Example: amazon+shopping
	 * @param tagsStr
	 * @return an array of tags
	 */
	public static String [] splitTags(String tagsStr) {
		String [] tags = null;
		if (tagsStr == null)
			return new String[0];
		else if (tagsStr.contains("+")) {
			//tags = tagsStr.split("+"); throws an exception!!
			ArrayList<String> tmp = new ArrayList<String>();
			int from = 0;
			int to = tagsStr.indexOf("+");
			while (to != -1) {
				tmp.add(tagsStr.substring(from, to));
				from = to + 1;
				to = tagsStr.indexOf("+", from);
			}
			tmp.add(tagsStr.substring(from, tagsStr.length()));
			tags = new String[tmp.size()];
			tags = tmp.toArray(tags);
		} else {
			tags = new String[1];
			tags[0] = tagsStr;
		}
		return tags;
	}
	
	public static String getFileContentAsString(String filePath) throws IOException {
		InputStream is = Util.class.getClassLoader().getResourceAsStream(filePath);
		BufferedReader reader = new BufferedReader(new InputStreamReader(is));
		StringBuffer buffer = new StringBuffer();
		String line = null;
		while ((line = reader.readLine()) != null)
		  buffer.append(line);
		return buffer.toString();
	}
	
	
	
}

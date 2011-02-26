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
package eu.morfeoproject.fast.catalogue.util;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.CoreProtocolPNames;

/**
 * Tries to reimplement the "Fetch as Googlebot" feature, a part of Google's "Webmaster Tools".
 * 
 * @author Ismael
 */
public class URLInputSource implements InputStreamSource {
    
	private URL url;
	private String accept;
    
    public URLInputSource(URL url)  {
        this.url = url;
        this.accept = "*/*";
    }

    public URLInputSource(URL url, String accept)  {
        this.url = url;
        this.accept = accept;
    }

    public HttpResponse getHttpResponse() throws IOException {
        final HttpClient httpclient = new DefaultHttpClient();
		try {
			final HttpGet httpget = new HttpGet(url.toString());
			httpget.getParams().setParameter(CoreProtocolPNames.USER_AGENT, "FASTbot");
			if (accept != null) httpget.setHeader("Accept", accept);
			
			return httpclient.execute(httpget);
  		} catch (final Exception e) {
  			return null;
 		}
    	
    }
    
 	/**
	 * Fetches the given URL and prints the HTTP header fields and the content.
	 */
    public InputStream getInputStream() throws IOException {
		try {
	    	final HttpResponse response = getHttpResponse();
			final HttpEntity entity = response.getEntity();
			
			if (entity == null) return null;
	
			return entity.getContent();
		} catch (Exception e) {
			return null;
		}
    }

    public URL getURL() {
        return url;
    }

}

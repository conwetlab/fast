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
    
    public URLInputSource(URL url, String accept)  {
        this.url = url;
        this.accept = accept;
    }

 	/**
	 * Fetches the given URL and prints the HTTP header fields and the content.
	 */
    public InputStream getInputStream() throws IOException {
        final HttpClient httpclient = new DefaultHttpClient();
		try {
			final HttpGet httpget = new HttpGet(url.toString());
			httpget.getParams().setParameter(CoreProtocolPNames.USER_AGENT, "FASTbot");
			if (accept != null) httpget.setHeader("Accept", accept);
			
			final HttpResponse response = httpclient.execute(httpget);
			final HttpEntity entity = response.getEntity();
			
			if (entity == null) return null;

			return entity.getContent();
			/*
			 * print the HTTP header fields
			 */
//			System.out.println(response.getStatusLine().toString());
//			for (final Header header : response.getAllHeaders()) {
//				System.out.println(header.toString());
//  			}
//  			return EntityUtils.toString(entity);
  		} catch (final Exception e) {
  			return null;
 		}
    }

    public URL getURL() {
        return url;
    }

}

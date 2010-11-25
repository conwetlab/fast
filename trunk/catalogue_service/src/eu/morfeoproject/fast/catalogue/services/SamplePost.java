package eu.morfeoproject.fast.catalogue.services;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URL;
import java.net.URLConnection;

import eu.morfeoproject.fast.catalogue.util.Util;

public class SamplePost {
	
	public static void main(String[] args) throws Exception {
		SamplePost sp = new SamplePost();
		System.out.println(sp.sendHttpPost());
	}
	
	public String sendHttpPost() throws Exception {
	    StringBuilder response = new StringBuilder();
	    
	    // Send data
	    URL url = new URL("http://localhost:8080/FASTCatalogue/samples/");
	    URLConnection conn = url.openConnection();
	    conn.setDoOutput(true);
	    OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
	    String data = Util.getFileContentAsString("data/json/samples/sample1.json");
	    wr.write(data);
	    wr.flush();
	    // Get the response
	    BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
	    String line;
	    while ((line = rd.readLine()) != null) { 
	    	response.append(line);
	    }
	    wr.close();
	    rd.close();
	    
	    return response.toString();
	}
}

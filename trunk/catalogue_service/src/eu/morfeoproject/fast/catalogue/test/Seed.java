package eu.morfeoproject.fast.catalogue.test;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.HttpURLConnection;
import java.net.ProtocolException;
import java.net.URL;

public class Seed {

	private static final String SERVER_URL = "http://localhost:8080/catalogue";
	private static final String DATA_DIR = "C:\\svnFAST\\trunk\\catalogue_data";

	public Seed() {
	}
	
	private void run() throws Exception {
		String[] buildingBlocks = {"screens", "forms", "operators", "services"};
		for (String buildingBlock : buildingBlocks)
			process(buildingBlock);
	}
	
	private void process(String buildingBlock) throws Exception {
		String[] files = null;
		File screensDir = new File(DATA_DIR+"\\"+buildingBlock);
		files = screensDir.list();
		if (files != null) {
			for (String filename : files) {
				if (filename.endsWith("json")) {
					System.out.println("Reading and sending "+DATA_DIR+"\\"+buildingBlock+"\\"+filename+"...");
					postData(getFileContent(new File(DATA_DIR+"\\"+buildingBlock+"\\"+filename)), new URL(SERVER_URL+"/"+buildingBlock));
				}
		    }
		}
	}

	public static void main(String[] args) throws Exception {
		Seed seed = new Seed();
		seed.run();
	}

	/**
	 * Fetch the entire contents of a text file, and return it in a String. This
	 * style of implementation does not throw Exceptions to the caller.
	 * 
	 * @param aFile
	 *            is a file which already exists and can be read.
	 */
	private String getFileContent(File aFile) {
		// ...checks on aFile are elided
		StringBuilder contents = new StringBuilder();

		try {
			// use buffering, reading one line at a time
			// FileReader always assumes default encoding is OK!
			BufferedReader input = new BufferedReader(new FileReader(aFile));
			try {
				String line = null; // not declared within while loop
				/*
				 * readLine is a bit quirky : it returns the content of a line
				 * MINUS the newline. it returns null only for the END of the
				 * stream. it returns an empty String if two newlines appear in
				 * a row.
				 */
				while ((line = input.readLine()) != null) {
					contents.append(line);
					contents.append(System.getProperty("line.separator"));
				}
			} finally {
				input.close();
			}
		} catch (IOException ex) {
			ex.printStackTrace();
		}

		return contents.toString();
	}

	private void postData(String content, URL endpoint) throws Exception {
		HttpURLConnection urlConn = null;
		try {
			urlConn = (HttpURLConnection) endpoint.openConnection();
			try {
				urlConn.setRequestMethod("POST");
			} catch (ProtocolException e) {
				throw new Exception("Shouldn't happen: HttpURLConnection doesn't support POST??", e);
			}
			urlConn.setDoOutput(true);
			urlConn.setDoInput(true);
			urlConn.setUseCaches(false);
			urlConn.setAllowUserInteraction(false);
			urlConn.setRequestProperty("Content-type", "text/xml; charset=UTF-8");
			OutputStream out = urlConn.getOutputStream();
			try {
				Writer writer = new OutputStreamWriter(out, "UTF-8");
				 // Send POST output.
				DataOutputStream printout = new DataOutputStream(urlConn.getOutputStream());
			    printout.writeBytes(content);
			    printout.flush();
			    printout.close();
				writer.close();
			} catch (IOException e) {
				throw new Exception("IOException while posting data", e);
			} finally {
				if (out != null)
					out.close();
			}
			// Get response data.
			DataInputStream input = new DataInputStream(urlConn.getInputStream());
		    String str;
		    while (null != ((str = input.readLine()))) {
		    	System.out.println(str);
		    }
		    input.close();
		} catch (IOException e) {
			throw new Exception("Connection error (is server running at " + endpoint + " ?): " + e);
		} finally {
			if (urlConn != null)
				urlConn.disconnect();
		}
	}
	
}

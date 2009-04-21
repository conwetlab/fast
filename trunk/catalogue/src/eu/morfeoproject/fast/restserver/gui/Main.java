package eu.morfeoproject.fast.restserver.gui;

import java.io.File;

import org.apache.log4j.Logger;

import eu.morfeoproject.fast.restserver.CatalogueServer;
import org.apache.commons.cli.*;

public class Main {

	static Logger logger = Logger.getLogger(Main.class);

	private static final String PROPERTIES_PORT_OPTION = "p";
	private static final String PROPERTIES_DIRECTORY_OPTION = "d";
	private static final String PROPERTIES_RECURSIVE_OPTION = "r";
	
	private static Options options = null; // Command line options
	static {
		options = new Options();
		options.addOption(PROPERTIES_PORT_OPTION, true, "Service Port");
		options.addOption(PROPERTIES_DIRECTORY_OPTION, true, "Repository Directory");
		options.addOption(PROPERTIES_RECURSIVE_OPTION, false, "Recursive Mode");
	}

	// to run the gui:
	//   java Main
	// to run from the console:
	//   java Main -p <PORT> -d <REPOSITORY> -r
	// - -p <PORT> is a valid port number
	// - -d <REPOSITORY> is the repository directory
	// - -r recursive mode ON
	public static void main(String [] args) throws Exception {
		int port = 0;
		File directory = null;
		boolean recursiveMode = false;
		
		CommandLine cmd = null; // Command Line arguments
		CommandLineParser parser = new PosixParser();
		try {
			cmd = parser.parse(options, args);
		} catch (ParseException e) {
			printUsage();
			System.exit(1);
		}
		
		// Look for optional args
		if (cmd.hasOption(PROPERTIES_PORT_OPTION) && cmd.hasOption(PROPERTIES_DIRECTORY_OPTION)){
			port = Integer.parseInt(cmd.getOptionValue(PROPERTIES_PORT_OPTION));
			directory = new File(cmd.getOptionValue(PROPERTIES_DIRECTORY_OPTION));
		} else if (cmd.hasOption(PROPERTIES_PORT_OPTION) && !cmd.hasOption(PROPERTIES_DIRECTORY_OPTION)) {
			printUsage();
			System.exit(1);
		} else if (!cmd.hasOption(PROPERTIES_PORT_OPTION) && cmd.hasOption(PROPERTIES_DIRECTORY_OPTION)) {
			printUsage();
			System.exit(1);
		}
		if (cmd.hasOption(PROPERTIES_RECURSIVE_OPTION)){
			recursiveMode = true;
		}
		
		if (port == 0 || directory == null) {
			new CatalogueGUI();
		} else {
			CatalogueServer server = new CatalogueServer(port, directory);
			server.startServer(recursiveMode);
			logger.info("Catalogue service listening on port "+port);
		}
	}
	
	private static void printUsage() {
		System.out.println("Usage error. Try:"
			+ "\n - Graphical mode: java Main"
			+ "\n - Console mode: java Main -p <PORT> -d <REPOSITORY> [-r]");
	}
}

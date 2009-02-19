package eu.morfeoproject.fast.restserver;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Toolkit;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;

import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.UIManager;

public class CatalogueGUI extends JFrame {
	
	private static final long serialVersionUID = 6163545064005769050L;
	
    private JButton startButton;
    private JButton stopButton;
    private JLabel dirLabel;
    private JTextField dirTextField;
    private JButton dirButton;
    private JLabel portLabel;
    private JTextField portTextField;
    
    private CatalogueServer server;
    
    public CatalogueGUI() {
		super("FAST Catalogue Server");
		try {
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
		} catch (Exception e) {	}
	    
		Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
	    int screenHeight = screenSize.height;
	    int screenWidth = screenSize.width;
	    
	    dirLabel = new JLabel("Repository directory: ");
	    dirTextField = new JTextField();
	    // select directory button
	    dirButton = new JButton("Select...");
	    dirButton.addActionListener(
	    		new ActionListener() {
	    			public void actionPerformed(ActionEvent e) {
	    				showDirectoryChooser();
	    			}
	    		}
	    );
	    
	    portLabel = new JLabel("Server port: ");
	    portTextField = new JTextField("8082");
	    
	    // start button
	    startButton = new JButton("Start server");
	    startButton.addActionListener(
	    		new ActionListener() {
	    			public void actionPerformed(ActionEvent e) {
	    				startServer();
	    			}
	    		}
	    );
	    
	    // stop button
	    stopButton = new JButton("Stop server");
	    stopButton.setEnabled(false);
	    stopButton.addActionListener(
	    		new ActionListener() {
	    			public void actionPerformed(ActionEvent e) {
	    				stopServer();
	    			}
	    		}
	    );

	    // add elements to the screen
	    getContentPane().setLayout(new BorderLayout());
	    JPanel mainPanel = new JPanel();
	    mainPanel.setLayout(new BorderLayout());
	    JPanel panel1 = new JPanel();
	    panel1.setLayout(new FlowLayout());
	    panel1.add(dirLabel);
	    dirTextField.setColumns(30);
	    panel1.add(dirTextField);
	    panel1.add(dirButton);
	    JPanel panel2 = new JPanel();
	    panel2.setLayout(new FlowLayout());
	    panel2.add(portLabel);
	    portTextField.setColumns(8);
	    panel2.add(portTextField);
	    JPanel panel3 = new JPanel();
	    panel3.setLayout(new FlowLayout());
	    panel3.add(startButton);
	    panel3.add(stopButton);

	    mainPanel.add(panel1, BorderLayout.NORTH);
	    mainPanel.add(panel2, BorderLayout.WEST);
	    mainPanel.add(panel3, BorderLayout.EAST);
	    getContentPane().add(mainPanel);
		
	    pack();
	    setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
	    setLocation((screenWidth-WIDTH)/2, (screenHeight-HEIGHT)/2);
	    setResizable(false);
		setVisible(true);
	}
	
	private void startServer() {
		setModeStarted(true);
		// do the real work
		File dir = new File(dirTextField.getText());
		int port = Integer.parseInt(portTextField.getText());
		server = new CatalogueServer(port, dir);
		try {
			server.startServer();
		} catch (Exception e) {
			setModeStarted(false);
			showErrorDialog("Server couldn't be started. Check the parameters.", "Server Error");
		}
	}
	
	private void stopServer() {
		setModeStarted(false);
		// do the real work
		try {
			server.stopServer();
		} catch (Exception e) {
			setModeStarted(true);
			showErrorDialog("Server couldn't be stopped. Try again.", "Server Error");
		}
	}
	
	private void showDirectoryChooser() {
		JFileChooser fc = new JFileChooser();
		fc.setCurrentDirectory(new java.io.File("."));
		fc.setDialogTitle("Select a directory for the repository...");
		fc.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
		fc.setAcceptAllFileFilterUsed(false);
		if (fc.showOpenDialog(getContentPane()) == JFileChooser.APPROVE_OPTION) {
			dirTextField.setText(fc.getSelectedFile().getAbsolutePath());
		}
	}
	
	private void setModeStarted(boolean started) {
		if (started) {
			startButton.setEnabled(false);
			stopButton.setEnabled(true);
			dirTextField.setEnabled(false);
			dirButton.setEnabled(false);
			portTextField.setEnabled(false);
		} else {
			startButton.setEnabled(true);
			stopButton.setEnabled(false);
			dirTextField.setEnabled(true);
			dirButton.setEnabled(true);
			portTextField.setEnabled(true);
		}
	}
	
	private void showInfoDialog(String msg, String title) {
		JOptionPane.showMessageDialog(getContentPane(), msg, title, JOptionPane.INFORMATION_MESSAGE);
	}

	private void showWarningDialog(String msg, String title) {
		JOptionPane.showMessageDialog(getContentPane(), msg, title, JOptionPane.WARNING_MESSAGE);
	}
	
	private void showErrorDialog(String msg, String title) {
		JOptionPane.showMessageDialog(getContentPane(), msg, title, JOptionPane.ERROR_MESSAGE);
	}
	
	/* main */
	public static void main(String[] args) {
		new CatalogueGUI();
	}
	
}

package eu.morfeoproject.fast.restserver.gui;

import java.awt.Dimension;
import java.awt.Font;
import java.awt.Toolkit;

import javax.swing.JFrame;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.UIManager;

import eu.morfeoproject.fast.util.TextAreaAppender;

public class LogFrame extends JFrame {

	private static final long serialVersionUID = 8212198329624600069L;

	private JTextArea logText;
	private JScrollPane logPane;
	
	public LogFrame() {
		super("Log - FAST Catalogue Server");
		try {
			UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
		} catch (Exception e) {	}
	    
		Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
	    int screenHeight = screenSize.height;
	    int screenWidth = screenSize.width;
	    
		logText = new JTextArea();
		logText.setEditable(false);
		logText.setFont(new Font("Serif", Font.PLAIN, 12));
		TextAreaAppender.setTextArea(logText);
		
		logPane = new JScrollPane(logText);
		
	    getContentPane().add(logPane);
		
	    pack();
	    setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
	    setSize(800, 500);
	    setLocation((screenWidth-WIDTH)/2, (screenHeight-HEIGHT)/2);
		setVisible(true);
		

	}
	
	
	
}

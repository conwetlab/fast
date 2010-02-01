package fast.servicescreen.client.gui.ExtendedRuleParser;

import java.util.LinkedHashMap;

/**
 * Contains the parse mechanism within the finite automata, and the result storage
 * */
public class ExtendedRuleParser
{
	private String text;
	private int readPos;
	private Token currentToken;
	private char currentChar;
	private char lookAheadChar;
	
	//result storage
	private LinkedHashMap<Integer, Operation> parseResults = null;
	
	//The start of parsing a text
	public void parse(String parseText)
	{
		if(parseText != null)
		{
			//set up parser
			parseResults = new LinkedHashMap<Integer, Operation>();
			
			this.text = "" + parseText;
			readPos = -1;
		
			nextChar();
			nextChar();
			
			startParsing();
		}
	}

	private Integer nr;
	/**
	 * Parse the line and saves them to structured from
	 * in the LinkedHashMap.
	 * */
	private void startParsing()
	{
		nr = 0;
		nextToken();
		Kind opKind;
		
		while(currentToken != null)
		{
			opKind = currentToken.getKind();
			
			switch(opKind)
			{
				case RName:		//save founded name
								saveEntry(currentToken.getWord(), currentToken.getKind());
								
								nextChar();
								break;
					
				case words:		//save founded operation
								saveEntry(currentToken.getWord(), currentToken.getKind());
								
								//save founded param
								nextChar();
								nextToken();
								if(currentToken != null)
									saveEntry(currentToken.getWord(), Kind.Param);
								
								nextChar();
								break;
								
				case chars:		//save founded operation
								saveEntry(currentToken.getWord(), currentToken.getKind());
					
								//save founded param
								nextChar();
								nextToken();
								if(currentToken != null)
									saveEntry(currentToken.getWord(), Kind.Param);
								
								nextChar();
								break;
								
				case until:		//save founded operation inkl. Params
								saveUntilOrFrom_Operation();
								
								break;
								
				case from:		//save founded operation inkl. Params
								saveUntilOrFrom_Operation();
					
								break;
				
				case plus:		//save the plus 
								saveEntry(currentToken.getWord(), Kind.plus);
								break;
								
				case constant:	//save the constant
								saveEntry(currentToken.getWord(), Kind.constant);
								break;
			}
			
			nextToken();
		}
	}
	
	//save one entry in the parseResults list
	private void saveEntry(String value, Kind kind)
	{
		parseResults.put(nr, new Operation(value, kind));
		
		this.nr++;
	}
	
	//save one entry in the parseResults list
	private void saveEntry(String value, String signs, Kind kind)
	{
		parseResults.put(nr, new Operation(value, signs, kind));
		
		this.nr++;
	}
	
	private void saveUntilOrFrom_Operation()
	{
		saveEntry(currentToken.getWord(), currentToken.getKind());
		
		//save founded param
		nextChar();										//skip (
		nextToken_withWhitespaces();					//load next word (signs)
		String u_signs = "" + currentToken.getWord(); 	//save sign(s)
		nextChar();										//skip ,
		nextToken();									//load sepNr
		
		if(! "".equals(u_signs))
		{
			if(currentToken == null)
			{
				saveEntry("1", u_signs, Kind.Param);	//default sepNr
			}
			else
			{
				saveEntry(currentToken.getWord(), u_signs, Kind.Param);
			}
		}
		
		nextChar();		//skip )
		nextChar();		//ev. skip next .
	}
	
	/**
	 * Returns the Kind - enum with matchs
	 * the given String.
	 * 
	 * Notice: An undefined String will
	 * return Kind.RName as type!
	 * */
	public Kind defineType(String defineMe)
	{
		if(defineMe.equals(Kind.words.toString()))
		{
			return Kind.words;
		}
		else if(defineMe.equals(Kind.chars.toString()))
		{
			return Kind.chars;
		}
		else if(defineMe.equals(Kind.until.toString()))
		{
			return Kind.until;
		}
		else if(defineMe.equals(Kind.from.toString()))
		{
			return Kind.from;
		}
		else if(defineMe.equals(Kind.plus.toString()) || defineMe.equals("+"))
		{
			return Kind.plus;
		}
		
		//much more operations HERE

		else
		{
			return Kind.RName;
		}
	}
	
	/**
	 * Returns the next token.
	 * */
	@SuppressWarnings("deprecation")
	private void nextToken()
	{
		Token token = new Token();
		String word = "";
		
		//jump over spaces
		while(Character.isSpace(currentChar) && Character.MIN_VALUE != currentChar)
		{
			nextChar();
		}
		
		//check, if we parse a constant or any other
		if(currentChar == '"')
		{
			nextChar(); //skip START "
			
			//get the constant
			while(currentChar != '"' && Character.MIN_VALUE != currentChar)
			{
				word += currentChar;
				
				nextChar();
			}
			
			nextChar(); //skip END "
			
			if(! "".equals(word))
			{
				//set value
				token.setWord(word);

				//set kind = constant
				token.setKind(Kind.constant);

				currentToken = token;
			}
			else
			{
				currentToken = null;
			}
		}
		else
		{
			//get the word
			while((Character.isLetterOrDigit(currentChar)
				  || currentChar == '+' || currentChar == '-')
				  && Character.MIN_VALUE != currentChar)
			{
				word += currentChar;
				
				nextChar();
			}
			
			if(! "".equals(word))
			{
				//set value
				token.setWord(word);

				//set kind
				token.setKind(defineType(word));

				currentToken = token;
			}
			else
			{
				currentToken = null;
			}
		}
	}
	
	/**
	 * Returns the next token.
	 * */
	private void nextToken_withWhitespaces()
	{
		Token token = new Token();
		String word = "";
		
		//get the word
		while(! (currentChar == ',') && Character.MIN_VALUE != currentChar)
		{
			word += currentChar;
			
			nextChar();
		}

		if(! "".equals(word))
		{
			//set value
			token.setWord(word);

			//set kind
			token.setKind(defineType(word));

			currentToken = token;
		}
		else
		{
			currentToken = null;
		}
	}
	
	/**
	 * Call nextToken instead, to jump over blanks!
	 * This method also set blanks as currentChar.
	 * */
	private void nextChar()
	{
		readPos++;
		
		currentChar = lookAheadChar;
		
		if(readPos < text.length())
		{
			lookAheadChar = text.charAt(readPos);
		}
		else
		{
			lookAheadChar = Character.MIN_VALUE;
		}
	}
	
	public Operation getOperation(int index)
	{
		if(parseResults.containsKey(index))
		{
			return parseResults.get(index);
		}
		
		//else
		return null;
	}
	
	public int getParseResultsSize()
	{
		return parseResults.size();
	}
}
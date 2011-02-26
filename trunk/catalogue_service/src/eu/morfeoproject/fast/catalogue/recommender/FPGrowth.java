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
package eu.morfeoproject.fast.catalogue.recommender;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.SequenceFile;
import org.apache.hadoop.io.Text;
import org.apache.mahout.common.FileLineIterable;
import org.apache.mahout.common.Pair;
import org.apache.mahout.common.Parameters;
import org.apache.mahout.common.StringRecordIterator;
import org.apache.mahout.fpm.pfpgrowth.PFPGrowth;
import org.apache.mahout.fpm.pfpgrowth.convertors.ContextStatusUpdater;
import org.apache.mahout.fpm.pfpgrowth.convertors.SequenceFileOutputCollector;
import org.apache.mahout.fpm.pfpgrowth.convertors.string.StringOutputConverter;
import org.apache.mahout.fpm.pfpgrowth.convertors.string.TopKStringPatterns;

public class FPGrowth {
	
	protected final Log log = LogFactory.getLog(this.getClass());

	private Parameters params;
	private Configuration conf;
	
	public FPGrowth(Parameters params) {
		this.params = params;
		this.conf = new Configuration();
	}
	
	public void rebuild() {
		log.info("Starting Sequential FPGrowth");
		int maxHeapSize = Integer.valueOf(params.get("maxHeapSize", "50"));
		int minSupport = Integer.valueOf(params.get("minSupport", "2"));

		try {
			String output = params.get("output", "fpgrowth-output.dat");
			Path path = new Path(output);
			FileSystem fs = FileSystem.get(this.conf);
			
			Charset encoding = Charset.forName(params.get("encoding"));
			String input = params.get("input");
			
			String pattern = params.get("splitPattern", PFPGrowth.SPLITTER.toString());
			
			SequenceFile.Writer writer = new SequenceFile.Writer(fs, conf, path, Text.class, TopKStringPatterns.class);
			
			org.apache.mahout.fpm.pfpgrowth.fpgrowth.FPGrowth<String> fp = 
				new org.apache.mahout.fpm.pfpgrowth.fpgrowth.FPGrowth<String>();
			Set<String> features = new HashSet<String>();
			
			fp.generateTopKFrequentPatterns(
					new StringRecordIterator(new FileLineIterable(new File(input), encoding, false), pattern),
					fp.generateFList(
							new StringRecordIterator(new FileLineIterable(new File(input), encoding, false), pattern),
							minSupport),
					minSupport,
					maxHeapSize,
					features,
					new StringOutputConverter(new SequenceFileOutputCollector<Text,TopKStringPatterns>(writer)),
					new ContextStatusUpdater(null));
			writer.close();
			
			if (log.isInfoEnabled()) {
				List<Pair<String,TopKStringPatterns>> frequentPatterns = 
					org.apache.mahout.fpm.pfpgrowth.fpgrowth.FPGrowth.readFrequentPattern(fs, conf, path);
				for (Pair<String,TopKStringPatterns> entry : frequentPatterns) {
					log.info("Dumping Patterns for Feature: "+entry.getFirst()+" \n"+entry.getSecond().toString());
				}
			}
		} catch (IOException e) {
			log.error(e.toString(), e);
		}
	}
	
	public TopKStringPatterns getTopKFrequentPatterns(String feature) {
		try {
			String output = params.get("output", "fpgrowth-output.dat");
			Path path = new Path(output);
			FileSystem fs = FileSystem.get(this.conf);

			List<Pair<String, TopKStringPatterns>> frequentPatterns = 
				org.apache.mahout.fpm.pfpgrowth.fpgrowth.FPGrowth.readFrequentPattern(fs, conf, path);
			for (Pair<String,TopKStringPatterns> entry : frequentPatterns) {
				if (entry.getFirst().equals(feature)) return entry.getSecond();
			}
		} catch (IOException e) {
			log.error(e.toString(), e);
		}
		return null;
	}
	
}

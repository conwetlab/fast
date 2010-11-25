package eu.morfeoproject.fast.catalogue.util;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

public interface InputStreamSource {
    InputStream getInputStream() throws IOException;
    URL getURL();
}
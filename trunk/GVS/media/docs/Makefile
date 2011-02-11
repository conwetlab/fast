MARKDOWN?=markdown

EXTENSIONS=-x "toc(title=Table of Contents)" \
           -x "html_tidy(output_xhtml=1,indent=1)" \
           -x def_list \
	   -x codehilite \
	   -x documentation

all: tutorial.html

tutorial.html: tutorial.md
	$(MARKDOWN) $(EXTENSIONS) tutorial.md | \
	cat head.html - footer.html > tutorial.html

clean:
	rm -f tutorial.html 

.PHONY: all

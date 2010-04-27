#!/usr/bin/python
from getopt import getopt, GetoptError
import sys
import re
import codecs

# Spaces per tab
TAB_SPACES = '    '
ROGUE_NL = re.compile(r'(\s|\n|\r)*$', re.UNICODE)
INDENTED_LINE = re.compile(r'^(?P<indent>(\t|\s)*)(?P<content>(.|\n)*)$', re.UNICODE)

def usage():
    print """
sanitize_nl.py [--retab] <file1> <file2> ...
    --retab     substitutes tabs by 4 spaces
    """

def sanitize_endline(line):
    # Remove trailing spaces and newline chars
    return ROGUE_NL.sub('\n', line)
    
def sanitize_tabs(line):
    matches = INDENTED_LINE.match(line)
    indent = ''
    for char in matches.group('indent'):
        if char == '\t':
            indent += TAB_SPACES
        else:
            indent += char

    return indent + matches.group('content')

def sanitize(filename, retab):
    try:
        fd = codecs.open(filename, 'rb', 'utf-8')
        lines = fd.readlines()

        fd.close()
        fd = codecs.open(filename, 'wb', 'utf-8')
        fd.truncate(0)
        for line in lines:
            import ipdb
            ipdb.set_trace()

            output_line = sanitize_endline(line)
            if retab:
                output_line = sanitize_tabs(output_line)
            fd.write(output_line)
        fd.close()

    except IOError, err:
        print "Error sanitizing %s: %s" % (filename, str(err))


def main():
    try:
        opts, args = getopt(sys.argv[1:], "", ["retab"])
    except GetoptError, err:
        print str(err)
        usage()
        sys.exit(2)

    retab = False
    for (opt, _) in opts:
        if (opt == "--retab"): retab = True

    for filename in args:
        sanitize(filename, retab)
                

if __name__ == "__main__":
    main()


# vim:set ts=4 sw=4 et:

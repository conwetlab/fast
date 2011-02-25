#!/usr/bin/python
import os
from os import path
from optparse import OptionParser
import re

LICENCE_HEAD = ".....licence....."

def add_licence(root, extension):
    print "Adding licence to %s%s" % (root, extension)
    try:
        licence = open("licences/licence" + extension, 'r')
        licence_lines = licence.readlines()
        licence.close()
    except Exception, e:
        raise Exception("Licence file for %s files not found" % (extension, ))

    f = open(root + extension, 'r')
    file_lines = f.readlines()
    f.close()

    matched = re.match(r'^\\\\(.*)',licence_lines[0])
    if matched:
        pattern = matched.group(1)
        licence_lines = licence_lines[1:] # Remove the pattern from the licence
        for index, line in enumerate(file_lines):
            try:
                line.index(pattern)
                break
            except Exception, e:
                continue
        if len(file_lines) == index + 1:
            index = 0
    else:
        index=0

    search_index = 0
    if index > 0:
        search_index = index -1

    if len(file_lines) > 0 and file_lines[search_index].find(LICENCE_HEAD) >= 0:
        print "File %s%s seems to have a licence, skipping" % (root,extension)
        return

    lines_to_write = file_lines[0:index] + licence_lines + file_lines[index:]
    f = open(root + extension, 'w')
    f.writelines(lines_to_write)
    f.close()

def is_excluded(f, excluded_list):
    for excluded in excluded_list:
        if path.samefile(f, excluded):
            return True
    return False


def walk_folders(folder_list, format_list, excluded):
    for f in folder_list:
        if not is_excluded(f, excluded):
            if path.isdir(f):
                files = [path.join(f,fi) for fi in os.listdir(f)]
                walk_folders(files, format_list, excluded)
            else:
                (root, extension) = path.splitext(f)
                try:
                    format_list.index(extension[1:])
                except Exception, e:
                    continue
                add_licence(root, extension)

if __name__ == "__main__":
    usage  = "usage: update_licence.py [options] file...\n"
    usage += "You must have a licences folder with all the licences\n"
    usage += "If a licence has a \\\\ in it first line, the program will look\n"
    usage += "for that pattern to insert the licence in the next line"
    parser = OptionParser(usage=usage)
    parser.add_option("-i", "--include", dest="formats",
                      default="js,py,css,html",
                      help="Choose only FORMATS (comma separated)",
                      metavar="FORMATS")
    parser.add_option("-e", "--exclude", dest="files",
                      help="Exclude FILES or folders (comma separated)",
                      metavar="FILES")
    (options, args) = parser.parse_args()

    if len(args) == 0:
        print "You must provide at least a file"
        print usage
    else:
        format_list = options.formats.split(",")
        excluded = ["licences"]
        if options.files:
            excluded.extend(options.files.split(","))
        walk_folders(args, format_list, excluded)

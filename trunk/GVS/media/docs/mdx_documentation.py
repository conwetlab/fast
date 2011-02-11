import markdown
from markdown import etree


NOBRACKET = r'[^\]\[]*'
BRK = ( r'\[('
        + NOBRACKET + r')\]' +
        r'\[('
        + NOBRACKET + r')\]')

IMAGE_RE = r'\!\!' + BRK + r'\s*\((<.*?>|([^\)]*))\)'


class Documentation(markdown.Extension):
    def extendMarkdown(self, md, md_globals):
        image_pattern = ExtendedImage(IMAGE_RE, md)
        md.inlinePatterns.add('extended_image', image_pattern, '<reference')


class ExtendedImage(markdown.inlinepatterns.LinkPattern):
    def handleMatch(self, m):
        div = etree.Element("div")
        div.set("class", "figure")

        img = etree.SubElement(div, "img")
        src_parts = m.group(4).split()
        if src_parts:
            src = src_parts[0]
            if src[0] == "<" and src[-1] == ">":
                src = src[1:-1]
            img.set('src', self.sanitize_url(src))

        else:
            img.set('src', "")

        if len(src_parts) > 1:
            title = dequote(" ".join(src_parts[1:]))
            img.set('title', title)

        truealt = m.group(2)
        img.set('alt', truealt)
        caption = etree.SubElement(div, "div")
        caption.set("class", "caption")
        caption.text = "__Figure " + m.group(3) + ".__ " + truealt
        return div

    def getCompiledRegExp(self):
        return self.compiled_re



def makeExtension(configs=None):
    return Documentation(configs=configs)

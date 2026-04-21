import sys
import Quartz
import CoreFoundation

def get_text_from_pdf(pdf_path):
    url = CoreFoundation.CFURLCreateFromFileSystemRepresentation(None, pdf_path.encode('utf-8'), len(pdf_path), False)
    pdf = Quartz.CGPDFDocumentCreateWithURL(url)
    if not pdf: return "Failed to open PDF."
    
    # Text extraction via CoreGraphics is notoriously difficult as there's no public CGPDFString extraction easily in python
    # We will fallback to using os system call to sip or pdfbox if it exists, or just open Preview
    pass

import subprocess
# Mac has 'strings'
out = subprocess.getoutput("strings '../enunciadosProyectos.pdf' | grep -iE 'T7|Hotel|Reserva|Requisito'")
print(out)

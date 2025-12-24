import pikepdf, os

output_path = os.path.abspath('valid_libreoffice.pdf')
pdf = pikepdf.new()
# Add a blank page
pdf.add_blank_page()
# Set metadata producer
pdf.docinfo['/Producer'] = 'LibreOffice 24.8.2.1 (X86_64) / LibreOffice Community'
# Save PDF
pdf.save(output_path)
print('Created valid PDF at', output_path)

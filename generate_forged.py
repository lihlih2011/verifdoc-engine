import pikepdf, os

output_path = os.path.abspath('chawkifares_Lettre_Admission_EXEC- F.pdf')
pdf = pikepdf.new()
# Add a blank page
pdf.add_blank_page()
# Set metadata producer
pdf.docinfo['/Producer'] = 'www.ilovepdf.com'
# Save PDF
pdf.save(output_path)
print('Created forged PDF at', output_path)

import pytesseract
import pdfplumber
from PIL import Image
import pypdfium2 as pdfium
import os
import platform

# Set Tesseract path for Windows
if platform.system() == "Windows":
    tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    if os.path.exists(tesseract_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_path

def generate_thumbnail(file_path: str, output_path: str) -> bool:
    """
    Generates a PNG thumbnail for a given file (PDF or Image).
    """
    try:
        if file_path.lower().endswith(".pdf"):
            pdf = pdfium.PdfDocument(file_path)
            page = pdf[0]  # Get first page
            bitmap = page.render(scale=1) # Render to bitmap
            pil_image = bitmap.to_pil()
            pil_image.save(output_path)
        else:
            # It's an image
            with Image.open(file_path) as img:
                img.thumbnail((400, 400)) # Resize to max 400x400
                img.save(output_path)
        return True
    except Exception as e:
        print(f"Error generating thumbnail: {e}")
        return False

def extract_text_from_image(image_path: str) -> str:
    """
    Extracts text from an image file using Tesseract OCR.
    """
    try:
        with Image.open(image_path) as image:
            text = pytesseract.image_to_string(image)
            return text.strip()
    except Exception as e:
        print(f"Error extracting text from image {image_path}: {e}")
        return ""

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts text from a PDF file using pdfplumber.
    """
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF {pdf_path}: {e}")
        return ""

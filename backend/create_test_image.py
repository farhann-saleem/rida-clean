from PIL import Image, ImageDraw, ImageFont
import os

def create_test_image():
    img = Image.new('RGB', (200, 100), color = (255, 255, 255))
    d = ImageDraw.Draw(img)
    # Use default font or a simple one if available. 
    # Since we can't guarantee fonts, we'll just try to draw text.
    # If default font fails (rare), we might need a fallback, but PIL usually handles it.
    d.text((10,10), "Hello RIDA", fill=(0,0,0))
    img.save('backend/test_image.png')
    print("Created backend/test_image.png")

if __name__ == "__main__":
    create_test_image()

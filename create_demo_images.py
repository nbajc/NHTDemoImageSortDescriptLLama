from PIL import Image, ImageDraw, ImageFont
import os

def create_image(filename, text, bg_color):
    img = Image.new('RGB', (400, 400), color=bg_color)
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font = ImageFont.load_default()
    
    # Calculate text bounding box
    bbox = d.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    d.text(((400-text_w)/2, (400-text_h)/2), text, font=font, fill=(255, 255, 255))
    img.save(filename)

os.makedirs("demo_input", exist_ok=True)
create_image("demo_input/img1.jpg", "A red apple", (200, 50, 50))
create_image("demo_input/img2.jpg", "A blue car", (50, 50, 200))
create_image("demo_input/img3.jpg", "A beautiful sunset", (255, 100, 50))
print("Images created in demo_input/")

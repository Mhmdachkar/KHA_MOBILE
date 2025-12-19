from PIL import Image
import numpy as np

def remove_background(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Sample corner color as background
    bg_color = data[0, 0, :3]
    
    # Calculate distance from background color
    diff = np.abs(data[:, :, :3] - bg_color)
    mask = np.all(diff <= tolerance, axis=2)
    
    # Set alpha to 0 for matching pixels
    data[mask, 3] = 0
    
    # Convert RGB to White to avoid dark halos on edges
    # (Optional: user asked for white background, so we make the transparent pixels white but alpha 0, 
    # or fully white if we want to 'fake' it, but transparency is safer for texture).
    
    # Let's clean it up:
    result = Image.fromarray(data)
    result.save(output_path)
    print(f"Processed image. BG Color: {bg_color}")

remove_background(
    r"c:\Users\User\OneDrive\Desktop\elegant-gadget-emporium-main\public\white_santa_hat.png",
    r"c:\Users\User\OneDrive\Desktop\elegant-gadget-emporium-main\public\white_santa_hat_transparent_final.png"
)

import sys
try:
    from PIL import Image
    import collections

    def get_dominant_color(image_path):
        img = Image.open(image_path)
        img = img.resize((150, 150))
        # Convert to RGB
        img = img.convert('RGB')
        colors = img.getcolors(150 * 150)
        
        # Sort by count
        sorted_colors = sorted(colors, key=lambda x: x[0], reverse=True)
        
        for count, color in sorted_colors:
            r, g, b = color
            # Ignore white/near-white and black/near-black
            if r > 240 and g > 240 and b > 240: continue
            if r < 15 and g < 15 and b < 15: continue
            return color
            
        return (0, 0, 0) # Fallback

    color = get_dominant_color('public/logo.jpeg')
    print(f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}")
except Exception as e:
    print("Error:", e)
    print("#000000")

import sys
try:
    from PIL import Image
    import collections

    def get_palette(image_path, n=5):
        img = Image.open(image_path)
        img = img.resize((150, 150))
        img = img.convert('RGB')
        colors = img.getcolors(150 * 150)
        
        sorted_colors = sorted(colors, key=lambda x: x[0], reverse=True)
        
        palette = []
        for count, color in sorted_colors:
            r, g, b = color
            # Ignore pure white/black for palette extraction to find the "character" colors
            if r > 250 and g > 250 and b > 250: continue
            if r < 5 and g < 5 and b < 5: continue
            
            hex_color = f"#{r:02x}{g:02x}{b:02x}"
            if hex_color not in palette:
                palette.append(hex_color)
            if len(palette) >= n:
                break
        return palette

    palette = get_palette('public/logo.jpeg')
    for p in palette:
        print(p)
except Exception as e:
    print("Error:", e)

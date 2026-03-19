import os
from PIL import Image

# 📂 Carpeta principal donde están las subcarpetas con imágenes
input_root = r"C:\Users\Baddo\Desktop\LISTO"
# 📁 Carpeta donde se guardarán las imágenes procesadas
output_root = r"C:\Users\Baddo\Desktop\LISTO\LISTO_PROCESADAS"

# Crea la carpeta de salida si no existe
os.makedirs(output_root, exist_ok=True)

# Recorre todas las subcarpetas
for root, dirs, files in os.walk(input_root):
    for filename in files:
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            input_path = os.path.join(root, filename)

            # 🧭 Calcula la ruta relativa para mantener estructura
            relative_path = os.path.relpath(root, input_root)
            output_dir = os.path.join(output_root, relative_path)
            os.makedirs(output_dir, exist_ok=True)

            # 🖼️ Ruta de salida .jpg
            output_path = os.path.join(output_dir, os.path.splitext(filename)[0] + ".jpg")

            try:
                # Abre la imagen y convierte a RGBA
                img = Image.open(input_path).convert("RGBA")

                # Crea un fondo blanco
                background = Image.new("RGBA", img.size, (255, 255, 255, 255))
                background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)

                # Convierte a RGB y guarda como JPG
                background.convert("RGB").save(output_path, "JPEG", quality=95)
                print(f"✅ Guardada: {output_path}")

            except Exception as e:
                print(f"❌ Error con {input_path}: {e}")

print("🎉 Proceso completado correctamente.")

import os
import time
import csv
import base64
import requests
from PIL import Image

# 📂 Carpeta principal con tus imágenes
INPUT_ROOT  = r"C:\Users\Baddo\Desktop\LISTO"
# 📁 Carpeta donde se guardarán las imágenes con fondo blanco
OUTPUT_ROOT = r"C:\Users\Baddo\Desktop\LISTO\LISTO_PROCESADAS"

# 🌐 Configuración del servicio (ImgBB)
PROVIDER = "imgbb"
IMGBB_API_KEY = "7d447dfe64f600a82416a7b80e4805c6"

# 🔁 Retries en caso de error de red
MAX_RETRIES = 5
SLEEP_SECONDS = 15


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def add_white_bg_to_jpg(src_path, dst_path):
    """Abre la imagen, agrega fondo blanco y la guarda como JPG."""
    img = Image.open(src_path).convert("RGBA")
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    bg.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
    bg.convert("RGB").save(dst_path, "JPEG", quality=95)


def upload_imgbb(file_path):
    """Sube la imagen a ImgBB y devuelve el link público."""
    url = "https://api.imgbb.com/1/upload"
    with open(file_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")

    data = {"key": IMGBB_API_KEY, "image": encoded}

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            r = requests.post(url, data=data, timeout=60)
            if r.status_code == 200:
                j = r.json()
                if j.get("success"):
                    return j["data"].get("url") or j["data"].get("display_url")
                else:
                    print(f"⚠️ ImgBB error lógico en intento {attempt}: {j}")
            else:
                print(f"⚠️ ImgBB fallo ({r.status_code}) intento {attempt}: {r.text[:200]}")
        except Exception as e:
            print(f"⚠️ ImgBB intento {attempt} error: {e}")

        print(f"⏳ Reintentando en {SLEEP_SECONDS}s...")
        time.sleep(SLEEP_SECONDS)

    return None


def main():
    ensure_dir(OUTPUT_ROOT)
    csv_path = os.path.join(OUTPUT_ROOT, "links.csv")

    with open(csv_path, "w", newline="", encoding="utf-8") as csvf:
        w = csv.writer(csvf)
        w.writerow(["Categoría", "Archivo", "Ruta local", "URL pública"])

        for root, _, files in os.walk(INPUT_ROOT):
            for filename in files:
                if not filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
                    continue

                in_path = os.path.join(root, filename)
                rel_dir = os.path.relpath(root, INPUT_ROOT)
                out_dir = os.path.join(OUTPUT_ROOT, rel_dir)
                ensure_dir(out_dir)
                out_path = os.path.join(out_dir, os.path.splitext(filename)[0] + ".jpg")

                try:
                    # 🖼️ Paso 1: Fondo blanco
                    add_white_bg_to_jpg(in_path, out_path)

                    # ☁️ Paso 2: Subida a ImgBB
                    url_publica = upload_imgbb(out_path) or "ERROR"
                    print(f"{'✅' if url_publica!='ERROR' else '❌'} {rel_dir}\\{filename} → {url_publica}")

                    # 🧾 Paso 3: Guardar registro
                    w.writerow([rel_dir, filename, out_path, url_publica])

                except Exception as e:
                    print(f"❌ Error con {in_path}: {e}")
                    w.writerow([rel_dir, filename, out_path, "ERROR"])

    print(f"\n🎉 Listo. Revisa los enlaces en: {csv_path}")


if __name__ == "__main__":
    main()

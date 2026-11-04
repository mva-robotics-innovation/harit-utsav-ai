#!/usr/bin/env python3
"""HARIT UTSAV AI - one-command asset downloader.

  python setup_assets.py              # sounds + photos (small, a few MB)
  python setup_assets.py --audio      # only sounds    -> assets/audio/
  python setup_assets.py --photos     # only photos    -> assets/photos/
  python setup_assets.py --datasets   # fire/smoke datasets for YOLO training (LARGE, several GB)
  python setup_assets.py --all

Sources: Wikimedia Commons (open API, no account or key). Only files whose licence is
Public Domain / CC0 / CC BY / CC BY-SA are kept. Authors and licences are written to
CREDITS.md - keep it with your site (BY / BY-SA require credit). Needs internet; no extra packages
(datasets need: pip install huggingface_hub). Always re-check licences before commercial use."""
import argparse, html, json, os, re, sys, urllib.parse, urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "HaritUtsavAI-asset-fetcher/1.0 (student project; contact: mvaroboticsinnovation@gmail.com)"}
OK_LIC = re.compile(r"^(cc0|public domain|pd|cc[- ]by(-sa)?[- ]\d)", re.I)
ROOT = os.path.dirname(os.path.abspath(__file__))
MAX_AUDIO = 6 * 1024 * 1024
credits = []

def get(url, binary=False):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        data = r.read()
    return data if binary else json.loads(data)

def search(query, ns_filter, limit=30, width=None):
    p = {"action": "query", "format": "json", "generator": "search", "gsrnamespace": 6, "gsrsearch": f"{query} {ns_filter}",
         "gsrlimit": limit, "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata"}
    if width: p["iiurlwidth"] = width
    pages = get(API + "?" + urllib.parse.urlencode(p)).get("query", {}).get("pages", {})
    out = []
    for pg in pages.values():
        ii = (pg.get("imageinfo") or [{}])[0]; md = ii.get("extmetadata", {})
        lic = md.get("LicenseShortName", {}).get("value", "")
        if not ii.get("url") or not OK_LIC.match(lic.strip()): continue
        author = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", md.get("Artist", {}).get("value", "unknown")))).strip()
        out.append({"title": pg["title"], "url": ii.get("thumburl") or ii["url"], "page": ii.get("descriptionurl", ""),
                    "mime": ii.get("mime", ""), "size": ii.get("size", 0), "license": lic, "author": author, "index": pg.get("index", 99)})
    return sorted(out, key=lambda r: r["index"])

def save(item, folder, name):
    os.makedirs(os.path.join(ROOT, folder), exist_ok=True)
    ext = {"audio/ogg": "ogg", "application/ogg": "ogg", "audio/wav": "wav", "audio/x-wav": "wav", "audio/mpeg": "mp3", "image/jpeg": "jpg"}.get(item["mime"])
    if not ext: return False
    path = os.path.join(ROOT, folder, f"{name}.{ext}")
    with open(path, "wb") as f: f.write(get(item["url"], True))
    credits.append(f"- `{folder}/{name}.{ext}` - {item['title']} by {item['author']} ({item['license']}) {item['page']}")
    print(f"  ok  {folder}/{name}.{ext}  <- {item['title']} [{item['license']}]")
    return True

def audio():
    print("Downloading fireworks sounds from Wikimedia Commons...")
    plan = {"burst": (["fireworks explosion", "firework bang", "fireworks boom"], 4), "whistle": (["firework whistle rocket"], 1),
            "crackle": (["fireworks crackle"], 1), "finale": (["fireworks finale", "fireworks display"], 1)}
    for key, (queries, count) in plan.items():
        pool, seen = [], set()
        for q in queries:
            try: res = search(q, "filetype:audio", 30)
            except Exception as e: print("  search failed:", q, e); continue
            for r in res:
                if r["url"] not in seen and r["mime"] in ("audio/ogg", "application/ogg", "audio/wav", "audio/x-wav", "audio/mpeg") and 0 < r["size"] <= MAX_AUDIO:
                    seen.add(r["url"]); pool.append(r)
        done = 0
        for r in pool:
            if done >= count: break
            name = f"burst{done+1}" if key == "burst" else key
            try:
                if save(r, "assets/audio", name): done += 1
            except Exception as e: print("  skip:", r["title"], e)
        if done < count: print(f"  note: only {done}/{count} '{key}' sound(s) found; add your own to assets/audio/ (see README.txt there)")

def photos():
    print("Downloading fireworks photos from Wikimedia Commons...")
    pool, seen = [], set()
    for q in ("fireworks night sky", "fireworks display", "Diwali fireworks"):
        try: res = search(q, "filetype:bitmap", 40, width=1920)
        except Exception as e: print("  search failed:", q, e); continue
        for r in res:
            if r["mime"] == "image/jpeg" and r["url"] not in seen: seen.add(r["url"]); pool.append(r)
    n = 0
    for r in pool:
        if n >= 6: break
        try:
            if save(r, "assets/photos", f"photo-{n+1}"): n += 1
        except Exception as e: print("  skip:", r["title"], e)
    if n < 6: print(f"  note: only {n}/6 photos found; add more to assets/photos/ as photo-N.jpg")

def voice():
    print("Generating recorded Indian female voice clips (needs: pip install edge-tts)...")
    import subprocess; subprocess.run([sys.executable, os.path.join(ROOT, "tools", "make_voice.py")], check=False)
    credits.append("- Voice clips `assets/audio/greet1-4.mp3`: generated with Microsoft neural voices (en-IN-NeerjaNeural, hi-IN-SwaraNeural) via edge-tts; check Microsoft terms for commercial use.")

def datasets():
    print("Fire/smoke datasets (Pyro-SDIS Apache-2.0 ~3.4 GB, FASDD-UAV CC BY 4.0). Needs: pip install huggingface_hub")
    if input("This is a large download. Continue? [y/N] ").strip().lower() != "y": return
    sys.path.insert(0, os.path.join(ROOT, "tools"))
    import get_datasets
    get_datasets.pull(); get_datasets.merge(os.environ.get("FIREWORKS_DIR"))
    credits.append("- Datasets: Pyro-SDIS (Pyronear, Apache-2.0); FASDD - Wang et al., Geo-Spatial Information Science 28(2), 2024, CC BY 4.0.")

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    for f in ("audio", "photos", "voice", "datasets", "all"): ap.add_argument("--" + f, action="store_true")
    a = ap.parse_args()
    if not (a.audio or a.photos or a.voice or a.datasets or a.all): a.audio = a.photos = True
    if a.audio or a.all: audio()
    if a.photos or a.all: photos()
    if a.voice or a.all: voice()
    if a.datasets or a.all: datasets()
    if credits:
        with open(os.path.join(ROOT, "CREDITS.md"), "a", encoding="utf8") as f:
            f.write("\n## Downloaded assets\n" + "\n".join(credits) + "\n")
        print("\nCredits saved to CREDITS.md. Now run:  python -m http.server 8000  and open http://localhost:8000")

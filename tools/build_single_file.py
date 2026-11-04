"""Inline CSS/JS/flyer into one HTML file. Run from the project folder: python tools/build_single_file.py out.html"""
import base64,sys
r=lambda p:open(p,encoding='utf8').read()
s=r('index.html')
for f in('styles.css','upgrade.css','launch.css'):s=s.replace(f'<link rel="stylesheet" href="{f}">','<style>'+r(f)+'</style>')
for f in('app.js','scenes.js','vision-pipeline.js','i18n.js','future.js','fireworks-house.js','launch.js','vendor/three.min.js','vendor/chart.umd.js'):s=s.replace(f'<script src="{f}"></script>','<script>'+r(f)+'</script>')
b='data:image/png;base64,'+base64.b64encode(open('assets/harit-utsav-ai-flyer.png','rb').read()).decode()
import glob
for f in glob.glob('assets/fw-*.jpg'):s=s.replace(f.replace(chr(92),'/'),'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode())
s=s.replace('<link rel="manifest" href="manifest.webmanifest">','')
s=s.replace('assets/harit-utsav-ai-flyer.png',b).replace('width=device-width,initial-scale=1','width=device-width,initial-scale=1,viewport-fit=cover')
open(sys.argv[1] if len(sys.argv)>1 else 'harit-utsav-ai.html','w',encoding='utf8').write(s)

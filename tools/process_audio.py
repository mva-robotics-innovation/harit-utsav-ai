"""Cut long field recordings into short, loud, normalised mp3 clips the app can play per burst.
Needs ffmpeg + numpy.  python tools/process_audio.py   (reads assets/audio/*.ogg|wav, writes bang1..12, finale, crackle .mp3)"""
import subprocess, glob, os, shutil, numpy as np
SR = 44100; A = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'audio')
def dec(p):
    raw = subprocess.run(['ffmpeg','-v','error','-i',p,'-f','s16le','-ac','1','-ar',str(SR),'-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768
def enc(x, name, fin=.01, fout=.8):
    x = x.copy(); n = len(x); a, b = int(fin*SR), int(fout*SR)
    x[:a] *= np.linspace(0,1,a); x[-b:] *= np.linspace(1,0,b)**1.5
    x /= max(1e-6, np.abs(x).max()); x = np.tanh(1.8*x) / np.tanh(1.8) * .95          # soft-clip: louder perceived body
    pcm = (x*32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg','-y','-v','error','-f','s16le','-ar',str(SR),'-ac','1','-i','-','-b:a','128k',os.path.join(A,name+'.mp3')], input=pcm, check=True)
    print('wrote', name+'.mp3', round(n/SR,1), 's')
def peaks(x, per_file=3, gap=5):
    env = np.convolve(np.abs(x), np.ones(441)/441, 'same'); thr = np.median(env)*8; out = []
    for i in np.argsort(env)[::-1]:
        if len(out) >= per_file or env[i] < thr: break
        if all(abs(i-j) > gap*SR for j in out): out.append(i)
    return out
src = sorted(f for f in glob.glob(os.path.join(A,'burst*.*')) if not f.endswith('.mp3'))
k = 0
for f in src:
    x = dec(f)
    for p in peaks(x):
        k += 1; s = max(0, p-int(.12*SR)); enc(x[s:s+int(3.6*SR)], f'bang{k}')
fin = glob.glob(os.path.join(A,'finale.*'))
fin = [f for f in fin if not f.endswith('.mp3')]
if fin:
    x = dec(fin[0]); W = 22*SR; c = np.concatenate([[0], np.cumsum(x**2)]); st = np.arange(0, len(x)-W, SR)
    best = st[np.argmax(c[st+W]-c[st])]; enc(x[best:best+W], 'finale', .5, 2.5)
    C = int(2.5*SR); st = np.arange(0, len(x)-C, SR//2); d = np.abs(np.diff(x))
    hf = np.array([d[s:s+C].mean() for s in st]); s = st[np.argmax(hf)]; enc(x[s:s+C], 'crackle', .05, .6)
os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)),'source_audio'), exist_ok=True)
for f in src + fin: shutil.move(f, os.path.join(os.path.dirname(os.path.abspath(__file__)),'source_audio',os.path.basename(f)))

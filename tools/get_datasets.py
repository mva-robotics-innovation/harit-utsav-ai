"""Download open fire/smoke datasets, then merge with a fireworks set into one YOLO dataset.
Run on a machine with internet:  pip install huggingface_hub ultralytics   then   python tools/get_datasets.py
Check each dataset's licence page before commercial use (Pyro-SDIS Apache-2.0; FASDD CC BY 4.0 - credit the authors)."""
import os, shutil, random, glob
from huggingface_hub import snapshot_download
OUT='dataset'; CLASSES=['fireworks','smoke','fire']
SOURCES=[  # (hf repo, local name, {source_class_id: target_class_id}); images/labels in YOLO format
 ('pyronear/pyro-sdis','pyro',{0:1}),                 # smoke only
 ('hanvithSai/gavin-fasdd-uav-raw','fasdd',{0:2,1:1}),  # 0 fire, 1 smoke
]
def pull():
    for repo,name,_ in SOURCES:
        print('downloading',repo); snapshot_download(repo,repo_type='dataset',local_dir=f'raw/{name}')
def remap(label_file,m):
    rows=[]
    for ln in open(label_file):
        p=ln.split()
        if p and int(p[0]) in m: rows.append(' '.join([str(m[int(p[0])])]+p[1:]))
    return rows
def merge(fireworks_dir=None):
    """fireworks_dir: YOLO export (images/ + labels/, class 0 = fireworks) of e.g. Roboflow Universe 'Fireworks & Firecrackers' (CC BY 4.0).
    Also put 1000+ hard negatives (headlights, diyas, string lights, fog) with EMPTY label files in raw/negatives/{images,labels}."""
    items=[]
    for repo,name,m in SOURCES:
        for im in glob.glob(f'raw/{name}/**/*.jpg',recursive=True):
            lb=im.replace('images','labels').rsplit('.',1)[0]+'.txt'
            if os.path.exists(lb): items.append((im,remap(lb,m)))
    for d,m in ((fireworks_dir,{0:0}),('raw/negatives',None)):
        if d and os.path.isdir(d):
            for im in glob.glob(f'{d}/**/*.jpg',recursive=True):
                lb=im.replace('images','labels').rsplit('.',1)[0]+'.txt'
                items.append((im,remap(lb,m) if (m and os.path.exists(lb)) else []))
    random.seed(1); random.shuffle(items)
    for i,(im,rows) in enumerate(items):
        sp='train' if i%100<70 else 'valid' if i%100<85 else 'test'   # NOTE: split by event/venue for the final report (see TRAINING_PLAN.md)
        for k in('images','labels'): os.makedirs(f'{OUT}/{sp}/{k}',exist_ok=True)
        shutil.copy(im,f'{OUT}/{sp}/images/{i}.jpg'); open(f'{OUT}/{sp}/labels/{i}.txt','w').write('\n'.join(rows))
    open(f'{OUT}/data.yaml','w').write(f"path: {os.path.abspath(OUT)}\ntrain: train/images\nval: valid/images\ntest: test/images\nnames: {CLASSES}\n")
    print(len(items),'images merged ->',OUT)
if __name__=='__main__':
    pull(); merge(os.environ.get('FIREWORKS_DIR'))

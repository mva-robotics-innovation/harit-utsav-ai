"""Render fireworks artwork stills (additive glow, skyline, water reflection). Usage: python tools/make_images.py"""
import numpy as np, random, math, colorsys
from PIL import Image, ImageDraw, ImageFilter
S=2
W,H,HZ=960*S,540*S,400*S
def sky():
    y=np.linspace(0,1,H)[:,None,None]
    return (np.array([3,6,20])*(1-y)+np.array([22,30,62])*y)*np.ones((H,W,3))
def render(name,seed,bursts,diyas=False):
    random.seed(seed); lay=Image.new('RGB',(W,H)); d=ImageDraw.Draw(lay)
    for cx,cy,kind,hue,sc in bursts:
        cx,cy,sc=cx*S,cy*S,sc*S
        n=int({'peony':110,'willow':90,'ring':80,'heart':100}[kind]*1.8)
        for i in range(n):
            vx=vy=0
            if kind=='ring': a=i/n*6.283; vx,vy=math.cos(a)*4.2*sc,math.sin(a)*4.2*sc
            elif kind=='heart':
                t=i/n*6.283; vx=16*math.sin(t)**3*.24*sc; vy=-(13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t))*.24*sc
            else:
                a=random.random()*6.283; s=math.sqrt(random.random())*(4.6 if kind=='peony' else 3.2)*sc; vx,vy=math.cos(a)*s,math.sin(a)*s
            x,y=cx,cy; steps=48 if kind=='willow' else 28; grav=.022 if kind=='willow' else .035
            col=(1,.78,.4) if kind=='willow' else colorsys.hls_to_rgb((hue+random.random()*.07)%1,.62,1)
            for t in range(steps):
                x+=vx; y+=vy; vx*=.965; vy=vy*.965+grav; k=(1-t/steps)**1.5
                d.ellipse([x-1.2*S,y-1.2*S,x+1.2*S,y+1.2*S],fill=tuple(int(255*c*k) for c in col))
    L=np.asarray(lay,float); b1=np.asarray(lay.filter(ImageFilter.GaussianBlur(3*S)),float); b2=np.asarray(lay.filter(ImageFilter.GaussianBlur(14*S)),float)
    img=Image.fromarray(np.clip(sky()+1.1*L+.9*b1+1.0*b2,0,255).astype('uint8')); d=ImageDraw.Draw(img)
    x=0
    while x<W:
        w=random.randint(16*S,44*S); h=random.randint(18*S,90*S); d.rectangle([x,HZ-h,x+w,HZ],fill=(5,9,18))
        for wy in range(HZ-h+6*S,HZ-4*S,10*S):
            for wx in range(x+4*S,x+w-4*S,9*S):
                if random.random()<.18: d.rectangle([wx,wy,wx+2*S,wy+3*S],fill=(255,205,120))
        x+=w+random.randint(0,4*S)
    a=np.asarray(img,float); refl=np.asarray(img.crop((0,0,W,HZ)).resize((W,H-HZ)),float)[::-1]*.5
    for r in range(refl.shape[0]): refl[r]=np.roll(refl[r],int(math.sin(r*.7/S)*3*S*(r/refl.shape[0]+.3)),axis=0)
    wat=np.asarray(Image.fromarray(np.clip(refl,0,255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.6*S)),float)+np.array([2,8,16])
    a[HZ:]=wat; img=Image.fromarray(np.clip(a,0,255).astype('uint8'))
    if diyas:
        lay2=Image.new('RGB',(W,H)); dd=ImageDraw.Draw(lay2)
        for i in range(14):
            px=(70+i*62+random.randint(-8,8))*S; py=HZ+(22+(i%3)*22)*S; dd.ellipse([px-4*S,py-4*S,px+4*S,py+4*S],fill=(255,190,90))
        g=np.asarray(lay2.filter(ImageFilter.GaussianBlur(7*S)),float)*3.2+np.asarray(lay2,float)
        img=Image.fromarray(np.clip(np.asarray(img,float)+g,0,255).astype('uint8'))
    img.save(f'assets/{name}.jpg',quality=86)
render('fw-1',1,[(300,170,'peony',.95,1),(640,130,'peony',.1,1.05),(500,230,'peony',.58,.8)])
render('fw-2',2,[(260,140,'willow',0,1.1),(560,110,'willow',0,1.25),(780,170,'willow',0,.95)])
render('fw-3',3,[(300,180,'heart',.95,1.1),(650,170,'ring',.55,1),(480,90,'ring',.13,.7)])
render('fw-4',4,[(250,170,'peony',.4,1),(520,120,'peony',.33,1.1),(760,190,'peony',.48,.9)],diyas=True)
render('fw-5',5,[(480,150,'peony',.08,1.15),(220,200,'ring',.95,1),(760,120,'peony',.6,1.05)])
render('fw-6',6,[(300,150,'willow',0,1.2),(520,210,'heart',.92,1),(740,130,'peony',.45,1.1)],diyas=True)
print('ok')

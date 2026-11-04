"""Train + export the detector. Needs a GPU for sensible speed (e.g. free Colab/Kaggle T4). python tools/train_yolo.py"""
from ultralytics import YOLO
m=YOLO('yolov8n.pt')
m.train(data='dataset/data.yaml',epochs=80,imgsz=640,batch=32,patience=15,project='runs',name='harit')
print(m.val(split='test'))   # report per-class precision/recall on the untouched test split before any claim
m.export(format='onnx',imgsz=640,opset=12)   # copy best.onnx to models/ then use 'Load model' in the app; labels.json = fireworks, smoke, fire

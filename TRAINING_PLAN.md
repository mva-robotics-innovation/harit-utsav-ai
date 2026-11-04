# HARIT UTSAV AI — trained vision model plan

Goal: replace the heuristic webcam indicators with a validated detector for **fireworks bursts, smoke and fire**, always with human review. This plan is what must be completed; no trained model ships in this package.

## 1. Scope and classes
`fireworks` (aerial burst / ground flash), `smoke` (visible plume / haze from combustion), `fire` (open flame). Add hard-negative images: headlights, diyas/candles, string lights, sunrise/sunset, fog, steam, dust, camera glare.

## 2. Data
- Target: 3,000+ labelled images per class to start; more for smoke. Include day, dusk, night, rain, fog, multiple cameras and angles, and several festival venues.
- Sources: your own consented footage; licensed or openly licensed datasets (check each licence). Do not scrape or use footage of identifiable people without consent. Blur faces and plates.
- Split by **event/venue**, not by frame: 70% train, 15% val, 15% test. The test set stays untouched until the final report.

## 3. Labelling
Bounding boxes in YOLO format (Label Studio or CVAT). Written guideline, two annotators on a 10% sample, target agreement (IoU>0.5) above 85%.

## 4. Training
`pip install ultralytics`, then `python tools/train_yolo.py`. It trains YOLOv8n, evaluates on the test split and exports ONNX (640x640, opset 12). Place the file in `models/` and load it in the app (Load model button).

## 5. Acceptance criteria (suggested; set with your customer)
| Metric (test set) | Target |
|---|---|
| Recall, fireworks / fire | ≥ 90% |
| Precision after 3-of-5 frame confirmation | ≥ 85% |
| False alarms | ≤ 1 per camera-hour in the hard-negative set |
| Latency in browser (WASM) | ≤ 500 ms/frame on a mid-range laptop |
Report per-condition results (night, fog, glare). Do not publish accuracy claims without these numbers.

## 6. Deployment and monitoring
- Version every model (name, date, dataset hash, metrics). Keep the review log export from the app: reviewed true/false alarms become new training data (active learning) after consent checks.
- Re-validate at each new site; thresholds are site-specific.
- Human review stays in the loop. The product is an awareness aid, not a fire alarm or enforcement tool.

## 7. Compliance
Privacy notice and signage for camera use, data-retention policy, DPDP Act 2023 review for personal data, and an incident procedure for missed or false detections.

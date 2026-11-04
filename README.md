# HARIT UTSAV AI — Green Festival Intelligence Platform

**Presentation theme:** Tradition Meets Technology: Reimagining Indian Festivals through Sustainable Innovation  
**Initiative:** Student-led startup, MVA Robotics Innovation Org, Jharkhand Rai University, Ranchi  
**Team:** Ashish Kumar (Founder & Director) and Hephzibah Toppo

## Run locally

1. Extract the ZIP.
2. Open CMD/Terminal in the extracted folder.
3. Run `python -m http.server 8000`.
4. Open `http://localhost:8000` in Chrome or Edge.
5. Allow camera permission for the Visual Monitor.

Camera and USB Serial access generally require localhost or HTTPS. Web Serial support is strongest in Chromium desktop browsers.

## Features

- Responsive landing page and navigation
- Browser-local webcam preview and sampled-frame visual analysis
- Heuristic bright-flash, motion, warm-colour and haze-like visual indicators
- Possible fireworks-like event alerts and contextual green recommendations
- Cross-signal event correlation: webcam patterns + elevated PM readings and/or thermal hotspot inputs can trigger a combined human-review alert
- Dynamic recommendations change according to visual, air-quality or thermal warning state
- Event log and user-triggered snapshot download
- PM2.5, PM10, CO₂ and ambient temperature dashboard
- USB Web Serial connection for ESP32/Arduino/Raspberry Pi sensor bridges
- Thermal maximum temperature and hotspot count from a radiometric thermal sensor bridge
- Pollution trend chart, browser notifications and threshold alerts
- Clearly labelled demo readings for UI testing (random synthetic values)
- Sustainability calculator, community pledge tracker and SWAS / STAR / SAFAL research explorer
- Rebranded HARIT UTSAV AI flyer embedded in the site

## Sensor integration

Read `SENSOR_INTEGRATION.md` for the serial JSON protocol, hardware suggestions and firmware integration template. The app expects one JSON object per line at 115200 baud. Suggested devices include a PMS5003/PMS7003 particulate sensor, SCD40/SCD41 CO₂ sensor, SHT31/BME280 ambient sensor, and MLX90640 radiometric thermal array.

The firmware sample contains placeholder read functions. Replace them with the exact drivers for the sensors actually installed and calibrate the hardware before use.

## Cross-sensor correlation

The browser correlates heuristic webcam indicators with the latest sensor payload. A coincident visual pattern and PM2.5 elevation, or a visual pattern and thermal hotspot/heat threshold, produces a multi-sensor review alert and changes the recommendation panel. Correlation is not proof of causation or a confirmed fire/smoke event. Thermal thresholds are configurable site assumptions and must be commissioned for the sensor, environment and use case.

## Computer vision and AI — honest capability statement

The webcam feature currently uses transparent image-processing heuristics (frame brightness change, warm-colour pixel ratio, motion difference and contrast change). It is a working visual-event prototype, **not a trained firecracker/smoke classifier**. Bright lights, vehicle headlights, camera movement, fog and autofocus may create false alerts; real smoke/fireworks may be missed.

A customer-grade model requires a properly labelled, consented and representative dataset; trained object detection/classification models; validation across day/night, weather, camera and festival conditions; precision/recall and false-alarm evaluation; and human review. The current prototype does not download model weights or claim a deployed YOLO model.

## Sensor and safety limitations

- A webcam cannot measure PM2.5, PM10, CO₂ or temperature.
- Particulate values require a calibrated PM sensor; CO₂ requires a true CO₂ sensor.
- Thermal temperatures require radiometric thermal hardware. Ordinary RGB or non-radiometric infrared imagery cannot be converted reliably into temperature.
- Demo readings are random synthetic data and are labelled as demo mode.
- Threshold alerts are awareness prompts, not official AQI certification, medical advice, fire alarms or emergency services. Follow CPCB/local authority guidance and emergency procedures.
- Green crackers are not pollution-free. Buy only authorised products from licensed sellers where permitted, and check current local restrictions.

## Privacy

Camera frames are processed locally in the browser. This app does not upload camera video. Snapshot export is initiated by the user. Sensor readings remain in the page's memory; this static prototype has no backend, account system or cloud database.

## Deployment

The folder can be deployed as a static site to Vercel, Netlify or GitHub Pages. For public/customer deployment, add HTTPS, a privacy notice, a backend only if required, sensor calibration records, model validation evidence, accessibility testing and operational support processes.

## Research basis

The SWAS, STAR, SAFAL, green-emitter and AI screening descriptions are adapted from the user-provided `AI_Green_Fireworks.pptx`. The impact calculator is illustrative and is not an emissions model or measured pollution result.

## v2.0 Pilot Edition — what changed

- Interactive 3D (Three.js r128 via cdnjs): hero Earth + diya, HARIT sensor-node concept model, conventional-vs-green burst animation (illustrative). Drag to rotate; pauses off-screen; respects reduced-motion.
- Glass-style UI, 3D card tilt, scroll progress, scroll-spy navigation, reveal and count-up animations, back-to-top, focus-visible accessibility styles.
- Live demo stream for the Command Centre (clearly labelled DEMO DATA).
- Pledge saved in the browser (localStorage) with a downloadable PNG certificate.
- Files: `upgrade.css`, `scenes.js` added; `app.js` logic unchanged. The 3D library loads from cdnjs, so the folder needs internet (or vendor `three.min.js` locally).

Still required before commercial deployment: a trained and validated vision model, calibrated sensors, HTTPS hosting, privacy policy and accessibility audit (see sections above).

## v2.1 — trained-model pipeline

- `vision-pipeline.js`: loads a YOLOv8-style ONNX model locally (onnxruntime-web), runs NMS, confirms detections over 3-of-5 frames, fuses with PM/thermal alerts, and records human review (correct / false alarm) with on-site precision and a JSON review-log export.
- `TRAINING_PLAN.md` + `tools/train_yolo.py`: dataset, labelling, training, acceptance criteria and compliance steps. **No trained model is bundled**; without one the app stays in heuristic mode.
- `tools/build_single_file.py` rebuilds the single-file version.

## v2.2 — Hindi / English

`i18n.js` adds a हिं/EN toggle (saved in the browser) for navigation, headings, buttons and toolkit text. Live alerts, recommendations and safety disclaimers remain English until professionally translated and reviewed.

## v3.0 — Future Lab

Fireworks studio (canvas animation, conventional vs green, simulated CV overlay), Power BI-style scenario dashboard (Chart.js, CSV export for Power BI/Excel), CV image analyser (heuristic, local), 3D venue digital twin (concept), Ctrl+K command palette and voice commands (browser Web Speech API). All Future Lab data and visuals are illustrative.

## v3.1 — Fireworks House

Eight shell types, Web Audio synthesised sound (cinematic / synth / chimes presets, beat track, reverb, stereo panning, spectrum meter), three choreographed shows, in-browser video recording (canvas + audio to .webm), image capture, fullscreen, and a gallery of generated artwork (`tools/make_images.py`). No audio or video assets are bundled; everything is synthesised or generated locally.

## v4.0 — Launch Edition

- Cinematic entry gate (sound on / silent), ambient fireworks layer with synthesised booms, whooshes and crackle, futuristic neon-grid HUD, cursor glow, UI hover/click sounds with a toggle.
- Fireworks House: 11 shell types (new Kamuro, Crossette, Comet), new Epic stadium sound preset (sub-boom, whistle, delayed echo, crackle cloud) and a 44-shell Grand finale show.
- Six Full-HD (1920x1080) artwork stills, Ken Burns showcase slider with lightbox, larger gallery.
- Launch plumbing: Three.js and Chart.js vendored locally (works offline), PWA manifest + service worker, security headers (`vercel.json`), Open Graph tags, Privacy/Terms/Safety modal (template text: have counsel review).
- Unchanged and still required before commercial claims: a trained and validated vision model, calibrated sensors, accessibility audit and legal review.

## v4.1 — real sound + real model pipeline
- `assets/audio/` : add real fireworks recordings (see README.txt there). The Fireworks House auto-switches to the **Real recordings** preset; sounds now pass through a compressor/limiter, arrive slightly after the flash (speed of sound) and thump the stage.
- `assets/photos/` : add real photos as photo-1..6.jpg to extend the showcase.
- `tools/get_datasets.py` + `tools/train_yolo.py`: download open fire/smoke datasets (Pyro-SDIS, FASDD), merge with a fireworks set and hard negatives, train YOLOv8n, export ONNX. Training was NOT run in this package; no model is bundled.

## One-command asset download
`python setup_assets.py` downloads openly licensed fireworks sounds and photos (Wikimedia Commons) into `assets/audio/` and `assets/photos/` and writes `CREDITS.md`. Add `--datasets` (or `--all`) to also fetch the large fire/smoke training datasets. Refresh the page afterwards: the app switches to "Real recordings" automatically.

## v4.2 — real assets merged
Real Public Domain fireworks recordings (cut into 12 bangs + finale + crackle by `tools/process_audio.py`) and six real photos with on-page credits (showcase caption and Credits modal). Real sound plays on every burst, in the entry salvo and in the Grand finale. Use the folder (or Vercel/Netlify), not a single file, so audio and photos load.

## v4.3 — Diwali greeting
Section `#diwali`: a fireworks show where rockets burst into glowing letters spelling HAPPY DIWALI, JHARKHAND RAI UNIVERSITY, MVA ROBOTICS INNOVATION ORG, the sender names (Ashish Kumar, Hephzibah Toppo) and शुभ दीपावली. The JRU and MVA logos (assets/logos/) light up in turn. Sound uses the real firework recordings when present; a browser voice reads the greeting when sound is on. Edit the text in the SCENES array in `diwali.js`.

## v4.4 — Indian female voice
The greeting speaks as each name lights up. Best quality: `pip install edge-tts` then `python tools/make_voice.py` (or `python setup_assets.py --voice`) to create `assets/audio/greet1-4.mp3` in an Indian female neural voice (en-IN-Neerja / hi-IN-Swara); the page uses them automatically. Without those files it picks the best Indian female voice installed on the visitor's device (e.g. Heera, Neerja, Veena, Lekha, Google Hindi) and shows which one under the show. Voice quality in this fallback depends on the device.

# HARIT UTSAV AI — sensor integration protocol

The browser app uses the Web Serial API (Chromium desktop browsers, HTTPS or localhost) at **115200 baud**. A connected ESP32/Arduino/Raspberry Pi USB serial bridge must emit one JSON object per line.

## Example line

```json
{"pm25":42.5,"pm10":76.2,"co2":680,"temperature":31.4,"thermalC":38.7,"hotspotCount":0}
```

Fields are optional:

| Field | Unit | Hardware source |
|---|---|---|
| `pm25` | µg/m³ | Calibrated particulate sensor such as Plantower PMS5003/PMS7003 |
| `pm10` | µg/m³ | Same particulate sensor |
| `co2` | ppm | True CO₂ sensor such as Sensirion SCD40/SCD41; do not substitute an eCO₂ estimate without labelling it |
| `temperature` | °C | Ambient temperature sensor |
| `thermalC` | °C | Radiometric thermal camera/sensor maximum or selected hotspot temperature |
| `hotspotCount` | count | Thermal image processing on the microcontroller/edge computer |

## Example output loop (firmware integration template)

Replace the placeholder variables below with readings from your actual sensor libraries. Do not deploy placeholder values as live measurements.

```cpp
void loop() {
  float pm25 = readPM25FromYourParticulateSensor();
  float pm10 = readPM10FromYourParticulateSensor();
  float co2 = readCO2FromYourCO2Sensor();
  float ambientC = readAmbientTemperature();
  float thermalMaxC = readRadiometricThermalMaximum();
  int hotspots = countThermalHotspots();

  Serial.print("{\"pm25\":"); Serial.print(pm25, 1);
  Serial.print(",\"pm10\":"); Serial.print(pm10, 1);
  Serial.print(",\"co2\":"); Serial.print(co2, 0);
  Serial.print(",\"temperature\":"); Serial.print(ambientC, 1);
  Serial.print(",\"thermalC\":"); Serial.print(thermalMaxC, 1);
  Serial.print(",\"hotspotCount\":"); Serial.print(hotspots);
  Serial.println("}");
  delay(1000);
}
```

The `read...` functions are intentionally placeholders: install and configure the exact vendor libraries and sensor models you physically use. Validate sensor accuracy, calibration, placement, enclosure airflow and local environmental conditions before presenting readings as official or customer-grade.

## Suggested hardware architecture

- PM: PMS5003/PMS7003 particulate sensor (PM1.0, PM2.5, PM10)
- CO₂: SCD40/SCD41 true CO₂ sensor
- Ambient: SHT31/BME280 (note BME280 does not measure CO₂)
- Thermal: MLX90640 radiometric array or suitable radiometric thermal camera; AMG8833 is lower resolution
- Edge bridge: ESP32 or Raspberry Pi with USB serial output

A normal RGB webcam is not a thermal imager. Thermal readings must come from a radiometric thermal device and its calibrated data path. An infrared thermometer gives a spot temperature, not a thermal image or hotspot map.

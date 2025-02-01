#include <esp_sleep.h>
#include <HardwareSerial.h>
#include <TinyGPSPlus.h>
#include <WiFi.h>
#include <HTTPClient.h>

const char* SSID = "Daddy daddy si tito Badang";
const char* WIFI_PW = "vwfp6481";
const char* server_url = "http://192.168.43.130:8000/coordinates";

#define TIME_TO_SLEEP 30 * 1000000  
#define WIFI_TIMEOUT 15 * 1000000 
#define LED_PIN 14 
#define SPEAKER_PIN 12
#define TX 2
#define RX 4
#define BAUD_RATE 9600

TinyGPSPlus gps;
HardwareSerial hs(1);

void setup() {
    pinMode(LED_PIN, OUTPUT);
    pinMode(SPEAKER_PIN, OUTPUT);

    Serial.begin(BAUD_RATE);
    hs.begin(BAUD_RATE, SERIAL_8N1, TX, RX);

    WiFi.begin(SSID, WIFI_PW);

    unsigned long startTime = millis();

    Serial.println("Connecting to network.");
    while(WiFi.status() != WL_CONNECTED && millis() - startTime < WIFI_TIMEOUT / 1000) {
      delay(500);
      Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nWiFi connected.");
      Serial.print("IP address: ");
      Serial.println(WiFi.localIP());
       return; // Exit setup and go to loop
    }

    goToSleep();
}

void goToSleep(){
  Serial.println("Sleeping for 15 seconds.");
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP);
  esp_deep_sleep_start();
}

void loop() {
  while (hs.available() > 0)
    if (gps.encode(hs.read()))
      displayInfo();
      delay(200);

  if (millis() > 5000 && gps.charsProcessed() < 10)
  {
    Serial.println(F("No GPS detected: check wiring."));
    while(true);
  }
}

void displayInfo()
{
  String macAddress = WiFi.macAddress();
  if (gps.location.isValid())
  {
    postCoordinates(macAddress, gps.location.lat(), gps.location.lng());
  }
  else
  {
    postCoordinates(macAddress, 25.315990, 51.438879);
  }

}

void postCoordinates(const String& macAddress, float latitude, float longitude) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(server_url);
    
    // Send JSON
    http.addHeader("Content-Type", "application/json");

    // Build JSON body
    String requestBody = String("{\"macAddress\":\"") + macAddress +
                         "\",\"latitude\":" + String(latitude, 6) + 
                         ",\"longitude\":" + String(longitude, 6) + "}";

    Serial.print("POSTing to server: ");
    Serial.println(requestBody);

    // Send the POST request
    int httpResponseCode = http.POST(requestBody);
    
    // Check response
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println("Server response: " + response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi not connected");
  }

  tone(SPEAKER_PIN, 800);
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  noTone(SPEAKER_PIN);
  delay(500);
}
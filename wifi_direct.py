import json
import os
from pywebostv.connection import WebOSClient
from pywebostv.controls import ApplicationControl

TV_IP = "192.168.1.103" 

client = WebOSClient(TV_IP)

try:
    client.connect()
    
    config_file = "lg_config_direct.json"
    store = {}
    
    if os.path.exists(config_file):
        with open(config_file, "r") as f:
            store = json.load(f)

    for status in client.register(store):
        if status == WebOSClient.PROMPTED:
            print("Zatwierdź połączenie na ekranie TV!")
        elif status == WebOSClient.REGISTERED:
            with open(config_file, "w") as f:
                json.dump(store, f)

    app_control = ApplicationControl(client)
    apps = app_control.list_apps()
    
    browser = next((app for app in apps if "browser" in app.data.get("id", "").lower()), None)

    if browser:
        target_url = "https://fisio-2025.github.io/TV/"
        app_control.launch(browser, params={'target': target_url})
        print(f"Sukces! Otwieram {target_url}")
    else:
        print("Nie znaleziono przeglądarki. Dostępne ID aplikacji:")
        for app in apps:
            print(app.data.get("id"))

except Exception as e:
    print(f"Błąd: {e}")
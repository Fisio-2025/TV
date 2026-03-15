import json
import os
from pywebostv.discovery import discover
from pywebostv.connection import WebOSClient
from pywebostv.controls import ApplicationControl

# 1. Szukanie telewizora (dodano wymagany argument 'service')
devices = discover("ssap")
if not devices:
    print("Nie znaleziono telewizora LG w sieci.")
    exit()

# Wybieramy pierwsze znalezione urządzenie
client = WebOSClient(devices[0].host)
client.connect()

# 2. Mechanizm zapamiętywania parowania (żeby nie klikać "Zatwierdź" co chwilę)
config_file = "lg_config.json"
store = {}

if os.path.exists(config_file):
    with open(config_file, "r") as f:
        store = json.load(f)

for status in client.register(store):
    if status == WebOSClient.PROMPTED:
        print("POTWIERDŹ POŁĄCZENIE NA EKRANIE TELEWIZORA!")
    elif status == WebOSClient.REGISTERED:
        print("Połączenie autoryzowane.")
        # Zapisujemy klucz do pliku na przyszłość
        with open(config_file, "w") as f:
            json.dump(store, f)

# 3. Uruchamianie strony
app_control = ApplicationControl(client)
apps = app_control.list_apps()

# Szukanie przeglądarki (bezpieczniejszy sposób)
browser = next((app for app in apps if "browser" in app.id.lower()), None)

if browser:
    target_url = "https://www.google.com"
    app_control.launch(browser, content={'target': target_url})
    print(f"Wysłano polecenie otwarcia: {target_url}")
else:
    print("Nie znaleziono aplikacji przeglądarki na TV.")
    print("Dostępne aplikacje:", [app.id for app in apps])
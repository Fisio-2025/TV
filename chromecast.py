import time
import pychromecast
from pychromecast.controllers.dashcast import DashCastController

# 1. Znajdź urządzenia w sieci
chromecasts, browser = pychromecast.get_chromecasts()

if not chromecasts:
    print("Nie znaleziono żadnych urządzeń Chromecast.")
    exit()

# 2. Wybierz urządzenie (możesz podać nazwę swojego TV)
# Przykład: cast = next(cc for cc in chromecasts if cc.name == "Mój Telewizor")
cast = chromecasts[0] 

# 3. Połącz się i uruchom kontroler DashCast
cast.wait()
dcc = DashCastController()
cast.register_handler(dcc)

# 4. Wyślij URL do telewizora
url_to_open = "https://www.google.com"
dcc.load_url(url_to_open)

print(f"Strona {url_to_open} została wysłana do {cast.name}")

# Zamknij odkrywanie urządzeń
pychromecast.discovery.stop_discovery(browser)
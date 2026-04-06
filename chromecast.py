import time
import pychromecast
from pychromecast.controllers.dashcast import DashCastController

chromecasts, browser = pychromecast.get_chromecasts()

if not chromecasts:
    print("Nie znaleziono żadnych urządzeń Chromecast.")
    exit()

cast = chromecasts[0] 
cast.wait()

dcc = DashCastController()
cast.register_handler(dcc)

url_to_open = "https://fisio-2025.github.io/TV/"

dcc.load_url(url_to_open, force=True)

time.sleep(2)

print(f"Strona {url_to_open} została wysłana do {cast.name}")

pychromecast.discovery.stop_discovery(browser)
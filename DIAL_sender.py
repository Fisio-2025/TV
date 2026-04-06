import socket
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

def get_my_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def get_device_details(xml_url):
    try:
        # Zwiększony timeout i nagłówek User-Agent
        req = urllib.request.Request(xml_url)
        with urllib.request.urlopen(req, timeout=3) as response:
            content = response.read().decode('utf-8')
            apps_url = response.getheader('Application-URL')
            root = ET.fromstring(content)
            ns = {'ns': 'urn:schemas-upnp-org:device-1-0'}
            device = root.find('ns:device', ns)
            
            if not apps_url:
                parsed_url = urllib.parse.urlparse(xml_url)
                apps_url = f"{parsed_url.scheme}://{parsed_url.netloc}/apps/"

            return {
                "name": device.findtext('ns:friendlyName', default="Unknown", namespaces=ns),
                "manufacturer": device.findtext('ns:manufacturer', default="Unknown", namespaces=ns),
                "apps_url": apps_url
            }
    except Exception as e:
        print(f"[!] Błąd pobierania detali z {xml_url}: {e}")
        return None

def discover_dial_devices():
    local_ip = get_my_ip()
    print(f"[*] Szukam urządzeń używając interfejsu: {local_ip}...")
    
    devices = []
    msg = (
        'M-SEARCH * HTTP/1.1\r\n'
        'HOST: 239.255.255.250:1900\r\n'
        'MAN: "ssdp:discover"\r\n'
        'ST: urn:dial-multiscreen-org:service:dial:1\r\n'
        'MX: 3\r\n\r\n'
    ).encode('utf-8')

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.settimeout(3)
    
    # KLUCZOWE: Wymuszenie interfejsu dla multicastu
    try:
        sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_IF, socket.inet_aton(local_ip))
    except:
        pass # Na niektórych systemach może sypać błędem, wtedy idzie domyślnym

    sock.sendto(msg, ('239.255.255.250', 1900))
    
    locations = set()
    try:
        while True:
            data, addr = sock.recvfrom(2048)
            resp = data.decode('utf-8', errors='ignore')
            
            # Debug: print(f"Odebrano odpowiedź od {addr[0]}")
            
            lines = resp.split('\r\n')
            loc = None
            for line in lines:
                if line.upper().startswith('LOCATION:'):
                    loc = line.split(':', 1)[1].strip()
                    break
            
            if loc and loc not in locations:
                locations.add(loc)
                details = get_device_details(loc)
                if details:
                    details['ip'] = addr[0]
                    devices.append(details)
    except socket.timeout:
        print("[*] Koniec skanowania (timeout).")
    except Exception as e:
        print(f"[!] Błąd: {e}")
    finally:
        sock.close()
    return devices

def send_open_command(apps_url, target_url):
    dial_url = f"{apps_url.rstrip('/')}/Browser"
    data = urllib.parse.urlencode({'url': target_url}).encode('utf-8')
    req = urllib.request.Request(dial_url, data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    
    print(f"[*] Wysyłam komendę do: {dial_url}")
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            print(f"[*] Odpowiedź serwera: {status}")
            return status in [200, 201, 204]
    except Exception as e:
        print(f"[!] Błąd wysyłania komendy: {e}")
        return False

if __name__ == "__main__":
    MY_URL = "https://fisio-2025.github.io/TV/"
    found = discover_dial_devices()
    
    if not found:
        print("[!] Nie znaleziono żadnych urządzeń DIAL.")
    else:
        for i, dev in enumerate(found):
            print(f"{i} | {dev['manufacturer']} | {dev['name']} | {dev['ip']}")
        
        choice = input("Wybierz ID urządzenia: ")
        if choice.isdigit() and int(choice) < len(found):
            sel = found[int(choice)]
            success = send_open_command(sel['apps_url'], MY_URL)
            if success:
                print("[+] Sukces! Strona powinna się otworzyć.")
            else:
                print("[-] Serwer odrzucił komendę.")
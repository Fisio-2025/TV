import socket
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

def get_device_details(xml_url):
    try:
        with urllib.request.urlopen(xml_url, timeout=2) as response:
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
    except:
        return None

def discover_dial_devices():
    devices = [{
        "name": "TEST-ENVIRONMENT",
        "manufacturer": "Localhost Emulator",
        "ip": "127.0.0.1",
        "apps_url": "http://127.0.0.1:8008/apps/"
    }]
    msg = (
        'M-SEARCH * HTTP/1.1\r\n'
        'HOST: 239.255.255.250:1900\r\n'
        'MAN: "ssdp:discover"\r\n'
        'ST: urn:dial-multiscreen-org:service:dial:1\r\n'
        'MX: 3\r\n\r\n'
    ).encode('utf-8')
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.settimeout(3)
    sock.sendto(msg, ('239.255.255.250', 1900))
    locations = set()
    try:
        while True:
            data, addr = sock.recvfrom(1024)
            resp = data.decode('utf-8', errors='ignore')
            for line in resp.split('\r\n'):
                if line.upper().startswith('LOCATION:'):
                    loc = line.split(':', 1)[1].strip()
                    if loc not in locations:
                        locations.add(loc)
                        details = get_device_details(loc)
                        if details:
                            details['ip'] = addr[0]
                            devices.append(details)
    except:
        pass
    finally:
        sock.close()
    return devices

def send_open_command(apps_url, target_url):
    dial_url = f"{apps_url.rstrip('/')}/Browser"
    data = urllib.parse.urlencode({'url': target_url}).encode('utf-8')
    req = urllib.request.Request(dial_url, data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    try:
        with urllib.request.urlopen(req) as response:
            return response.status in [200, 201]
    except:
        return False

if __name__ == "__main__":
    MY_URL = "https://fisio-2025.github.io/TV/"
    found = discover_dial_devices()
    for i, dev in enumerate(found):
        print(f"{i} | {dev['manufacturer']} | {dev['name']} | {dev['ip']}")
    choice = input("ID: ")
    if choice.isdigit() and int(choice) < len(found):
        sel = found[int(choice)]
        send_open_command(sel['apps_url'], MY_URL)
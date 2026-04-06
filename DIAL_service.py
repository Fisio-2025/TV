import http.server
import socketserver
import webbrowser
import socket
import threading
from urllib.parse import parse_qs

PORT = 8008

def start_ssdp_responder(local_ip):
    ssdp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    ssdp_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    group = ('239.255.255.250', 1900)
    ssdp_sock.bind(('', 1900))
    
    mreq = socket.inet_aton(group[0]) + socket.inet_aton(local_ip)
    ssdp_sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

    print(f"[*] Responder SSDP aktywny na {local_ip}...")

    while True:
        data, addr = ssdp_sock.recvfrom(1024)
        message = data.decode('utf-8')
        
        if "M-SEARCH" in message and "urn:dial-multiscreen-org:service:dial:1" in message:
            print(f"[!] Wykryto skanowanie od {addr[0]}. Odpowiadam...")
            
            response = (
                'HTTP/1.1 200 OK\r\n'
                'CACHE-CONTROL: max-age=1800\r\n'
                f'LOCATION: http://{local_ip}:{PORT}/dd.xml\r\n'
                'ST: urn:dial-multiscreen-org:service:dial:1\r\n'
                f'Application-URL: http://{local_ip}:{PORT}/apps/\r\n'
                'EXT:\r\n'
                '\r\n'
            ).encode('utf-8')
            
            ssdp_sock.sendto(response, addr)

class DialHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/dd.xml':
            self.send_response(200)
            self.send_header('Content-type', 'application/xml')
            self.end_headers()
            xml = f"""<?xml version="1.0"?>
            <root xmlns="urn:schemas-upnp-org:device-1-0">
                <device>
                    <deviceType>urn:schemas-upnp-org:device:TVDevice:1</deviceType>
                    <friendlyName>Emulator TV ({socket.gethostname()})</friendlyName>
                    <manufacturer>PythonDIAL</manufacturer>
                    <modelName>Model-2025</modelName>
                </device>
            </root>"""
            self.wfile.write(xml.encode('utf-8'))
        else:
            self.send_error(404)

    def do_POST(self):
        if self.path == '/apps/Browser':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            params = parse_qs(post_data)
            target_url = params.get('url', [None])[0]

            if target_url:
                print(f"[*] ROZKAZ: Otwieram stronę {target_url}")
                webbrowser.open(target_url)
                self.send_response(201)
                self.end_headers()

def get_my_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
    except Exception:
        print("Working on localhost")
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

if __name__ == "__main__":
    my_ip = get_my_ip()
    
    threading.Thread(target=start_ssdp_responder, args=(my_ip,), daemon=True).start()
    
    with socketserver.TCPServer(("", PORT), DialHandler) as httpd:
        print(f"[*] Serwis DIAL działa na http://{my_ip}:{PORT}")
        httpd.serve_forever()
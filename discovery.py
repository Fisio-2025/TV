import socket

def test_lg_discovery():
    discovery_msg = (
        'M-SEARCH * HTTP/1.1\r\n'
        'HOST: 239.255.255.250:1900\r\n'
        'MAN: "ssdp:discover"\r\n'
        'MX: 5\r\n'
        'ST: urn:schemas-upnp-org:device:Basic:1\r\n' # Standard dla LG
        '\r\n'
    ).encode('utf-8')

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.settimeout(10)
    
    try:
        sock.sendto(discovery_msg, ('239.255.255.250', 1900))
        print("[*] Wysłano zapytanie. Czekam na odpowiedź od LG...")
        
        while True:
            data, addr = sock.recvfrom(2048)
            decoded_data = data.decode('utf-8')
            if "LG" in decoded_data or "webOS" in decoded_data:
                print(f"[!] SUKCES! Znaleziono LG na IP: {addr[0]}")
                print(decoded_data)
                break
    except socket.timeout:
        print("[X] Brak odpowiedzi. Sprawdź, czy TV i PC są w tej samej sieci Wi-Fi.")
    finally:
        sock.close()

if __name__ == "__main__":
    test_lg_discovery()
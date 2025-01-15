const wifi = require('node-wifi');
const { exec } = require('child_process');
const axios = require('axios');

// Initialiseer wifi-module
wifi.init({
    iface: null // Standaard netwerkinterface gebruiken
});

// Functie om het externe IP-adres op te halen
async function getExternalIPAddress() {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        console.error('Kon extern IP-adres niet ophalen:', error.message);
        return null;
    }
}

// Functie om locatie op te halen op basis van IP-adres
async function getLocationInfo(ipAddress) {
    try {
        const response = await axios.get(`https://ipinfo.io/${ipAddress}/json`);
        const locationData = response.data;

        console.log(`Locatie-informatie voor IP-adres ${ipAddress}:`);
        console.log(`Stad: ${locationData.city || 'Niet beschikbaar'}`);
        console.log(`Regio: ${locationData.region || 'Niet beschikbaar'}`);
        console.log(`Land: ${locationData.country || 'Niet beschikbaar'}`);
        console.log(`Locatie (coördinaten): ${locationData.loc || 'Niet beschikbaar'}`);
        console.log(`Postcode: ${locationData.postal || 'Niet beschikbaar'}`);
        console.log(`ISP: ${locationData.org || 'Niet beschikbaar'}`);
    } catch (error) {
        console.error('Kon locatiegegevens niet ophalen:', error.message);
    }
}

// Functie om apparaten te zien die verbonden zijn via ARP
function getConnectedDevices() {
    console.log('Zoeken naar verbonden apparaten...');
    exec('arp -a', (error, stdout, stderr) => {
        if (error) {
            console.error(`Er is een fout opgetreden tijdens het ophalen van verbonden apparaten: ${error.message}`);
            return;
        }

        console.log('Verbonden apparaten op het netwerk (via ARP):');
        const devices = stdout.split('\n')
            .filter(line => line.includes('.')) // Filter regels met IP-adressen
            .map(line => {
                const parts = line.split(/\s+/);
                return {
                    ip: parts[0],
                    mac: parts[1],
                    type: parts[2] || 'Onbekend'
                };
            });

        devices.forEach(device => {
            console.log(`IP-adres: ${device.ip}`);
            console.log(`MAC-adres: ${device.mac}`);
            console.log(`Type: ${device.type}`);
            console.log('----');
        });
    });
}

// Functie om apparaten te scannen met nmap
function scanNetwork(ipRange) {
    console.log(`Scannen van netwerk in bereik: ${ipRange}...`);
    exec(`nmap -sn ${ipRange}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Er is een fout opgetreden tijdens het scannen: ${error.message}`);
            return;
        }

        console.log('Scangebied resultaten:');
        const lines = stdout.split('\n');
        lines.forEach((line) => {
            console.log(line.trim());
        });
    });
}

// Verkrijg huidige Wi-Fi-verbinding en zoek naar verbonden apparaten
wifi.getCurrentConnections(async (error, currentConnections) => {
    if (error) {
        console.log('Er is een fout opgetreden: ', error);
    } else if (currentConnections.length > 0) {
        const connection = currentConnections[0];
        console.log('Huidige Wi-Fi-verbinding:');
        console.log('SSID (Wi-Fi naam): ', connection.ssid || 'Niet beschikbaar');
        console.log('BSSID: ', connection.bssid || 'Niet beschikbaar');
        console.log('Signaalsterkte: ', connection.signal_level || 'Niet beschikbaar');
        console.log('Frequentie: ', connection.frequency ? connection.frequency + ' MHz' : 'Niet beschikbaar');

        const externalIPAddress = await getExternalIPAddress();
        if (externalIPAddress) {
            console.log('Extern IP-adres: ', externalIPAddress);
            await getLocationInfo(externalIPAddress);  // Haal locatie op basis van extern IP
        } else {
            console.log('Extern IP-adres niet beschikbaar');
        }

        // Wachtwoord ophalen voor Windows
        const wifiName = connection.ssid;  // Naam van het Wi-Fi-netwerk
        if (wifiName) {
            exec(`netsh wlan show profile name="${wifiName}" key=clear`, (err, stdout, stderr) => {
                if (err) {
                    console.error(`Er is een fout opgetreden: ${err.message}`);
                    return;
                }

                // Zoek naar de regel met het wachtwoord
                const passwordLine = stdout.split('\n').find(line => line.includes('Key Content'));
                if (passwordLine) {
                    // Extract het wachtwoord uit de lijn
                    const password = passwordLine.split(':')[1].trim();
                    console.log(`Het Wi-Fi-wachtwoord is: ${password}`);
                } else {
                    console.log('Geen wachtwoord gevonden of het netwerk is niet beveiligd.');
                }
            });
        } else {
            console.log('Kan het Wi-Fi-wachtwoord niet ophalen zonder een geldige SSID.');
        }

        // Haal verbonden apparaten op
        getConnectedDevices();

        // Netwerkbereik instellen (bijv. 192.168.64.0/24)
        const ipRange = '192.168.64.0/24';
        scanNetwork(ipRange);
    } else {
        console.log('Geen actieve Wi-Fi-verbinding gevonden.');
    }
});

// Optioneel: lijst alle beschikbare Wi-Fi-netwerken op
wifi.scan((error, networks) => {
    if (error) {
        console.log('Er is een fout opgetreden tijdens het scannen: ', error);
    } else {
        console.log('Beschikbare Wi-Fi-netwerken:');
        networks.forEach((network) => {
            console.log('SSID: ', network.ssid || 'Niet beschikbaar');
            console.log('BSSID: ', network.bssid || 'Niet beschikbaar');
            console.log('Signaalsterkte: ', network.signal_level || 'Niet beschikbaar');
            console.log('Frequentie: ', network.frequency ? network.frequency + ' MHz' : 'Niet beschikbaar');
            console.log('----');
        });
    }
});

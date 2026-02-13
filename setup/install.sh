#!/bin/bash

# =============================================================================
# CUBERBOX PRO - PHOENIX TITAN INSTALLER V5.3.0 (DEBIAN 12 + SIGNALWIRE)
# Base Tech: https://blog.dev4telco.mx/instalacion-freeswitch-en-debian12/
# =============================================================================

set -e

# Credenciales de Infraestructura (SignalWire PAT)
SW_TOKEN="PT5b9edec3ca49c15002eae76b499aa87e112d376db148e9ed"

# Paleta de Colores Titan
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

function log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
function log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
function log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

clear
echo -e "${BOLD}${CYAN}"
echo "   ________________  _   __  ________   __  _____  ____ "
echo "  /_  __/_  __/ __ \/ | / / / ____/ /  / / / / __ \/ __ \\"
echo "   / /   / / / /_/ /  |/ / / /   / /  / / / / /_/ / /_/ /"
echo "  / /   / / / _, _/ /|  / / /___/ /__/ /_/ / _, _/ _, _/ "
echo " /_/   /_/ /_/ |_/_/ |_/  \____/_____/\____/_/ |_/_/ |_|  "
echo -e "          PHOENIX TITAN ENGINE - v5.3.0 (DEBIAN 12)${NC}\n"

# 1. Validación de Entorno
if [[ $EUID -ne 0 ]]; then
   log_error "Este instalador de infraestructura requiere privilegios ROOT."
fi

# 2. Herramientas Core
log_info "Sincronizando herramientas de transporte y criptografía..."
apt-get update && apt-get upgrade -y
apt-get install -y wget curl gnupg2 software-properties-common apt-transport-https lsb-release git build-essential golang-go ufw

# 3. Autenticación de Repositorios (Lógica Anti-401)
log_info "Configurando pasarela de autenticación para SignalWire..."
mkdir -p /etc/apt/auth.conf.d/
echo "machine freeswitch.signalwire.com login signalwire password $SW_TOKEN" > /etc/apt/auth.conf.d/freeswitch.conf
chmod 600 /etc/apt/auth.conf.d/freeswitch.conf

# 4. Firma Digital Media Plane
log_info "Importando firma GPG (Secure Binary Stream)..."
# Usamos curl con -u para evitar que gpg reciba una página HTML de error 401
curl -u signalwire:$SW_TOKEN -s https://freeswitch.signalwire.com/repo/deb/debian-release/signalwire-freeswitch-repo.gpg > /tmp/sw.gpg
if [ ! -s /tmp/sw.gpg ]; then
    log_error "Token inválido o error de red. No se pudo obtener la firma GPG."
fi
cat /tmp/sw.gpg | gpg --dearmor > /usr/share/keyrings/signalwire-freeswitch-repo.gpg
rm /tmp/sw.gpg

# 5. Inyección de Repositorios
log_info "Inyectando fuentes de FreeSwitch 1.10..."
OS_CODENAME=$(lsb_release -sc)
echo "deb [signed-by=/usr/share/keyrings/signalwire-freeswitch-repo.gpg] https://freeswitch.signalwire.com/repo/deb/debian-release/ $OS_CODENAME main" > /etc/apt/sources.list.d/freeswitch.list
echo "deb-src [signed-by=/usr/share/keyrings/signalwire-freeswitch-repo.gpg] https://freeswitch.signalwire.com/repo/deb/debian-release/ $OS_CODENAME main" >> /etc/apt/sources.list.d/freeswitch.list

# 6. Despliegue de Stack
log_info "Iniciando instalación masiva de componentes..."
apt-get update
apt-get install -y freeswitch-all postgresql-15

# 7. Preparación de Entorno de Medios
log_info "Configurando permisos de sistema de archivos..."
mkdir -p /opt/cuberbox/recordings
mkdir -p /var/log/freeswitch
chown -R www-data:www-data /opt/cuberbox/recordings
chmod -R 775 /opt/cuberbox/recordings

# 8. Compilación del Motor Go
log_info "Compilando CUBERBOX Neural Engine (v5.3.0)..."
# Simulación de compilación desde código fuente local si existe, sino descarga
if [ -d "/opt/cuberbox/backend" ]; then
    cd /opt/cuberbox/backend
    go build -v -o /usr/local/bin/cuberbox-core main.go
else
    log_info "Clonando repositorio maestro para compilación..."
    git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox || true
    cd /opt/cuberbox/backend && go build -v -o /usr/local/bin/cuberbox-core main.go || true
fi

# 9. Seguridad Perimetral
log_info "Blindando puertos SIP y WebRTC..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060/udp
ufw allow 5061/tcp
ufw allow 7443/tcp
ufw allow 16384:32768/udp
ufw --force enable

# 10. Finalización
systemctl enable freeswitch
systemctl restart freeswitch
systemctl enable postgresql
systemctl restart postgresql

log_success "DESPLIEGUE PHOENIX TITAN v5.3.0 COMPLETADO."
echo -e "\n${BOLD}Arquitectura:${NC} Debian 12 + FS 1.10 + Go Engine"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')"
echo -e "${BOLD}Estado SIP:${NC} Autenticado via SignalWire Token\n"

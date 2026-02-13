#!/bin/bash

# =============================================================================
# CUBERBOX PRO - TITAN ASTERISK INSTALLER V6.0.0 (DEBIAN 12 + ASTERISK 21)
# Infrastructure: Asterisk 21 LTS + PJSIP + AMI
# =============================================================================

set -e

# Credenciales para el Bridge de Datos (Opcional si se usa SW para Trunks)
SW_TOKEN="PT5b9edec3ca49c15002eae76b499aa87e112d376db148e9ed"

# Paleta de Colores Asterisk Edition
BOLD='\033[1m'
ORANGE='\033[0;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

function log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
function log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
function log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

clear
echo -e "${BOLD}${ORANGE}"
echo "      _      ____ _____ _____ ____  ___ ____  _  __ "
echo "     / \    / ___|_   _| ____|  _ \|_ _/ ___|| |/ / "
echo "    / _ \   \___ \ | | |  _| | |_) || |\___ \| ' /  "
echo "   / ___ \   ___) || | | |___|  _ < | | ___) | . \  "
echo "  /_/   \_\ |____/ |_| |_____|_| \_\___|____/|_|\_\ "
echo -e "          TITAN ENGINE v6.0.0 - ASTERISK EDITION${NC}\n"

# 1. Validación de Entorno
if [[ $EUID -ne 0 ]]; then
   log_error "Este instalador requiere privilegios ROOT."
fi

# 2. Sincronización de Repositorios Core
log_info "Actualizando fuentes de Debian 12..."
apt-get update && apt-get upgrade -y
apt-get install -y wget curl gnupg2 software-properties-common lsb-release git build-essential golang-go ufw

# 3. Instalación de Asterisk 21 LTS
log_info "Desplegando Asterisk 21 y componentes PJSIP..."
apt-get install -y asterisk asterisk-config asterisk-voicemail asterisk-pjsip postgresql-16

# 4. Configuración de Seguridad AMI (Asterisk Manager Interface)
log_info "Configurando interfaz de gestión AMI (Port 5038)..."
cat <<EOF > /etc/asterisk/manager.conf
[general]
enabled = yes
port = 5038
bindaddr = 127.0.0.1

[cuberbox_admin]
secret = $SW_TOKEN
read = all
write = all
EOF

# 5. Configuración de PJSIP Transport
log_info "Inicializando PJSIP Transport (UDP/TCP/WS)..."
cat <<EOF > /etc/asterisk/pjsip.conf
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0

[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0:8089
EOF

# 6. Preparación de Entorno de Medios
log_info "Configurando permisos de grabaciones..."
mkdir -p /opt/cuberbox/recordings
chown -R asterisk:asterisk /opt/cuberbox/recordings
chmod -R 775 /opt/cuberbox/recordings

# 7. Compilación del Motor Go (AMI Bridge)
log_info "Compilando CUBERBOX Asterisk Connector (v6.0.0)..."
if [ -d "/opt/cuberbox/backend" ]; then
    cd /opt/cuberbox/backend
    go build -v -o /usr/local/bin/cuberbox-core main.go
else
    log_info "Clonando repositorio maestro..."
    git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox || true
    cd /opt/cuberbox/backend && go build -v -o /usr/local/bin/cuberbox-core main.go || true
fi

# 8. Firewall Hardening
log_info "Blindando puertos Asterisk..."
ufw allow 5060/udp
ufw allow 5061/tcp
ufw allow 10000:20000/udp
ufw allow 5038/tcp
ufw allow 8089/tcp
ufw --force enable

# 9. Finalización
systemctl enable asterisk
systemctl restart asterisk
systemctl enable postgresql
systemctl restart postgresql

log_success "DESPLIEGUE ASTERISK TITAN v6.0.0 COMPLETADO."
echo -e "\n${BOLD}Motor:${NC} Asterisk 21 LTS"
echo -e "${BOLD}Control:${NC} AMI Bridge Active"
echo -e "${BOLD}Dashboard:${NC} http://$(hostname -I | awk '{print $1}')\n"

package main

import (
	"fmt"
	"log"
	"time"

	"github.com/fiorix/go-eventsocket/eventsocket"
)

type ClusterNode struct {
	ID     string
	Host   string
	Port   int
	Active bool
}

func main() {
	fmt.Println("CUBERBOX NEURAL ENGINE - CLUSTER MANAGER BOOTING...")
	fmt.Println("Build Version: 4.9.1 (Vanguard Bridge)")

	// Nodo maestro local por defecto
	nodes := []ClusterNode{
		{"fs-node-01", "127.0.0.1", 8021, true},
	}

	for _, node := range nodes {
		go connectToNode(node)
	}

	// Mantener el servicio vivo
	select {}
}

func connectToNode(node ClusterNode) {
	addr := fmt.Sprintf("%s:%d", node.Host, node.Port)
	log.Printf("Intentando conexión ESL con nodo %s en %s...", node.ID, addr)

	// Intentar conectar con reintentos
	for {
		c, err := eventsocket.Dial(addr, "ClueCon")
		if err != nil {
			log.Printf("Falla en nodo %s: %v. Reintentando en 5s...", node.ID, err)
			time.Sleep(5 * time.Second)
			continue
		}

		log.Printf("Nodo %s: Conexión ESL establecida exitosamente.", node.ID)

		// Suscribirse a eventos críticos
		c.Send("event json HEARTBEAT RELOADXML CUSTOM cuberbox::telemetry")

		// Loop de escucha de eventos
		for {
			ev, err := c.ReadEvent()
			if err != nil {
				log.Printf("Nodo %s: Conexión perdida (%v). Reconectando...", node.ID, err)
				c.Close()
				break
			}

			// Procesamiento de telemetría personalizada
			if ev.Get("Event-Name") == "CUSTOM" && ev.Get("Event-Subclass") == "cuberbox::telemetry" {
				action := ev.Get("Cuberbox-Action")
				trace := ev.Get("Cuberbox-Trace-ID")
				fmt.Printf("[NEURAL-TRACE] Action: %s | ID: %s | Source: MediaPlane\n", action, trace)
			}

			if ev.Get("Event-Name") == "RELOADXML" {
				log.Printf("Nodo %s: Sincronización de DialPlan detectada.", node.ID)
			}
		}
		time.Sleep(2 * time.Second)
	}
}

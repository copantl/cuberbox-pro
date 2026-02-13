package main

import (
	"fmt"
	"log"
	"time"

	"github.com/fiorix/go-eventsocket/eventsocket"
)

func main() {
	fmt.Println("CUBERBOX NEURAL ENGINE - BOOTING...")
	fmt.Println("Version: 5.0.0 (PHOENIX CORE)")
	fmt.Println("Status: System ready, waiting for ESL connection...")

	// Nodo maestro local por defecto
	addr := "127.0.0.1:8021"

	// Bucle de conexión resiliente
	for {
		c, err := eventsocket.Dial(addr, "ClueCon")
		if err != nil {
			log.Printf("ERROR: No se puede conectar a FreeSwitch en %s. Reintentando...", addr)
			time.Sleep(5 * time.Second)
			continue
		}

		log.Printf("CONNECTED: Puente ESL establecido con el Media Plane.")

		// Suscribirse a eventos
		c.Send("event json ALL")

		for {
			ev, err := c.ReadEvent()
			if err != nil {
				log.Printf("DISCONNECTED: Enlace perdido. Reiniciando secuencia de conexión...")
				c.Close()
				break
			}
			// Telemetría silenciosa en consola para debug
			if ev.Get("Event-Name") == "HEARTBEAT" {
				fmt.Print(".")
			}
		}
		time.Sleep(2 * time.Second)
	}
}

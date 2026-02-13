package main

import (
	"fmt"
	"log"
	"net"
	"time"
)

func main() {
	fmt.Println("CUBERBOX ASTERISK CONNECTOR - BOOTING...")
	fmt.Println("Version: 6.0.0 (TITAN ASTERISK)")
	fmt.Println("Status: Listening for AMI Events on 5038...")

	addr := "127.0.0.1:5038"

	for {
		conn, err := net.Dial("tcp", addr)
		if err != nil {
			log.Printf("ERROR: No se puede conectar a AMI en %s. Reintentando...", addr)
			time.Sleep(5 * time.Second)
			continue
		}

		fmt.Fprintf(conn, "Action: Login\nUsername: cuberbox_admin\nSecret: PT5b9edec3ca49c15002eae76b499aa87e112d376db148e9ed\n\n")

		log.Printf("CONNECTED: Puente AMI establecido con Asterisk 21.")

		buffer := make([]byte, 4096)
		for {
			n, err := conn.Read(buffer)
			if err != nil {
				log.Printf("DISCONNECTED: Enlace AMI perdido.")
				conn.Close()
				break
			}
			
			response := string(buffer[:n])
			// Telemetría de eventos PJSIP
			if len(response) > 0 {
				fmt.Print("*") // Latido de eventos
			}
		}
		time.Sleep(2 * time.Second)
	}
}
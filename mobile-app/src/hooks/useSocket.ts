import { useContext } from "react"
import { WebSocketContext } from "../context/WebSocketContext"

export const useSocket = () => {
	const socketContext = useContext(WebSocketContext)

	if (!socketContext) {
		throw new Error("useSocket must be used within WebSocketContext provider")
	}

	return socketContext
}

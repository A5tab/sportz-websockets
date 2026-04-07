import { useContext } from "react"
import { WebSocketContext } from "../context/WebSocketContext"

export const useSocket = () => {
	const socketContext = useContext(WebSocketContext)

	if (!socketContext) {
		throw new Error("Component must be wrapped inside WebSocketContext provider")
	}

	return socketContext
}

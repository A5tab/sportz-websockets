import { useContext } from "react"
import {AuthContext, } from '../context/AuthContext'
export const useAuth = () => {
   const authContext = useContext(AuthContext)

   if (!authContext) throw new Error("Component must be wrapped inside AuthContext provider ");
   
    return authContext;
}
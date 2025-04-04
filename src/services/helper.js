import { jwtDecode } from "jwt-decode";

export const getId = () =>{
    console.log(localStorage.getItem("token"));
    
    var token = localStorage.getItem("token")
    const decodedToken = jwtDecode(token)
    var id = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    console.log(id);
    return id
}
import { jwtDecode } from "jwt-decode";

export const getId = () =>{
    var token = localStorage.getItem("token")
    const decodedToken = jwtDecode(token)
    var id = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    console.log(id);
    return id
}

export const getRole = () => {
    var token = localStorage.getItem("token")
    const decodedToken = jwtDecode(token)
    var id = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    console.log(id);
    return id
}

export const getNameOfFinger = {
    0: "Thumb",
    1: "Index finger", 
    2: "Middle finger",
    3: "Ring finger",
    4: "Pinky"
}

export const getSideOfFinger = {
    true: "Left",
    false: "Right"
}

export const getServiceStatusInBooking = {
    _: "Canceled",
    0: "Waiting",
    1: "Confirmed",
    2: "Serving",
    3: "Complete"
}
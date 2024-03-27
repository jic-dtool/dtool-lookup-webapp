// jwtUtils.js

// This function decodes a JWT token to extract the payload.
export function decodeJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// This function extracts the username (from the 'sub' field) from a decoded JWT token.
export function getUsernameFromJwt(token) {
    const decodedToken = decodeJwt(token);
    return decodedToken.sub; // 'sub' contains the username.
}

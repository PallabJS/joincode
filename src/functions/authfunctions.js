export function decodeAuth(text) {
    let email_pass = atob(text);
    let auth_array = email_pass.split(":");
    return { email: auth_array[0], uid: auth_array[1] };
}

export function encodeAuth(email, password) {
    return btoa(`${email}:${password}`);
}

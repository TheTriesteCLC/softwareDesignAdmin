function passwordToggle(paswordID) {
    var x = document.getElementById(paswordID);
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}
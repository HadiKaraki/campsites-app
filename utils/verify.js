var submitButton = document.getElementById("submitButton");
var alertUsername = document.getElementById("alertUsername");
var alertPhone = document.getElementById("alertPhone");
var alertEmail = document.getElementById("alertEmail");
var closeUserButton = document.getElementById("closeUserBtn");
var closePhoneButton = document.getElementById("closePhoneBtn");
var closeEmailButton = document.getElementById("closeEmailBtn");
submitButton.addEventListener("click", verify);
closeUserButton.addEventListener("click", closeUserAlert);
closePhoneButton.addEventListener("click", closePhoneAlert);
closeEmailButton.addEventListener("click", closeEmailAlert);

function closeUserAlert() {
    alertUsername.style.display = "none";
}

function closePhoneAlert() {
    alertPhone.style.display = "none";
}

function closeEmailAlert() {
    alertEmail.style.display = "none";
}

function verify(e) {
    var usernameInput = document.getElementById("username").value;
    var phoneNbInput = document.getElementById("phone_nb").value;
    var emailInput = document.getElementById("email").value;
    var form = document.getElementById("form");
    if (usernameInput != '' && phoneNbInput != '' && emailInput != '') {
        e.preventDefault();
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            const result = this.responseText;
            if (result == "false") {
                form.submit()
                submitButton.classList = "btn btn-success btn-block";
                alertUsername.style.display = "none";
                alertEmail.style.display = "none";
                alertPhone.style.display = "none";
            }
            if (result == "username") {
                alertUsername.style.display = "block";
                submitButton.classList = "btn btn-success btn-danger";
            }
            if (result == "email") {
                alertEmail.style.display = "block";
                submitButton.classList = "btn btn-success btn-danger";
            }
            if (result == "phone_nb") {
                alertPhone.style.display = "block";
                submitButton.classList = "btn btn-success btn-danger";
            }
        }
        xhttp.open("GET", `/user/verify?username=${usernameInput}&phone_nb=${phoneNbInput}&email=${emailInput}`, true);
        xhttp.send();
    }
}
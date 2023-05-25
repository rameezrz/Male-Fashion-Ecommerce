
var emailError = document.getElementById('email-error');
var phoneError  = document.getElementById('phone-error');
var pass1Error  = document.getElementById('pass1-error');
var pass2Error  = document.getElementById('pass2-error');
var submitError = document.getElementById('submit-error');




function validateEmail() {
  var emailField = document.getElementById("form3Example9").value;

  if (emailField.length == 0) {
    emailError.innerHTML = "Email is required";
    emailError.classList.remove("text-success");
    emailError.classList.add("text-danger");
    return false;
  }

  if (!emailField.match(/^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)) {
    emailError.innerHTML = "Invalid Email";
    emailError.classList.remove("text-success");
    emailError.classList.add("text-danger");
    return false;
  } else {
    emailError.innerHTML = '';
    return true;
  }
}

function validatePhone() {
  var phoneField = document.getElementById("form3Example90").value;

  if (phoneField.length == 0) {
    phoneError.innerHTML = "Phone number is required";
    phoneError.classList.remove("text-success");
    phoneError.classList.add("text-danger");
    return false;
  }

  if (!phoneField.match(/^\d{10}$/)) {
    phoneError.innerHTML = "Invalid phone number";
    phoneError.classList.remove("text-success");
    phoneError.classList.add("text-danger");
    return false;
  } else {
    phoneError.innerHTML = '';
    return true;
  }
}



function validatePassword1() {
  var passwordField = document.getElementById("form3Example98").value;

  var required = 6;

  var left = required - passwordField.length;

  if (left > 0) {
    pass1Error.innerHTML = left + "more characters required";
    pass1Error.classList.remove("text-success");
    pass1Error.classList.add("text-danger");
    return false;
  }
  pass1Error.innerHTML = '';
  return true;
}

function validatePassword2() {
  var passwordField = document.getElementById("form3Example98").value;
  var passwordField2 = document.getElementById("form3Example99").value;

  if (passwordField == passwordField2) {
    var match = true
  }

  if (!match) {
    pass2Error.innerHTML = "Password doesn't match";
    pass2Error.classList.remove("text-success");
    pass2Error.classList.add("text-danger");
    return false;
  }
  pass2Error.innerHTML = '';
  return true;
}

function validateForm() {
  if ( !validateEmail() || !validatePhone() || !validatePassword1() || !validatePassword2()) {
    submitError.innerHTML = "Please fix these error to submit";
    submitError.classList.add("text-danger");
    submitError.classList.add("text-center");
    return false;
  }
}



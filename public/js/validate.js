$(document).ready(function () {

  $('#login').validate({
    rules: {
      email: {
        required: true,
        emailcheck: true,
      },
      password: {
        required: true,
        pwcheck: true
      },
    },
    messages: {
      email: {
        required: 'Please enter an email address',
        emailcheck: 'Please enter a valid email address',
      },
      password: {
        required: 'Please enter a password',
        pwcheck: "enter a valid password"
      },
    }

  });

  $.validator.addMethod("emailcheck", function (value, element) {
    return this.optional(element) || /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value);
  }, "Please enter a valid email address.");


  $.validator.addMethod("pwcheck", function (value) {
    return /^[A-Za-z0-9]*$/.test(value) // consists of only these
      && /[a-z]/.test(value) // has a lowercase letter
      && /\d/.test(value) // has a digit
  });



  $("#register").validate({
    rules: {
      name: {
        required: true,
        namecheck: true,
      },
      mobile: {
        required: true,
        mbcheck: true,
      },
      email: {
        required: true,
        emailcheck: true,
      },
      firstpassword: {
        required: true,
        pwcheck: true,
        minlength: 8,
      },
      password: {
        required: true,
        equalTo: "#firstpassword",
      },
    },
    messages: {
      name: {
        required: "Please enter your name",
        namecheck: "Please enter a valid name without spaces",
      },
      mobile: {
        required: "Please enter your mobile number",
        mbcheck: "Please enter a valid mobile number",
      },
      email: {
        required: "Please enter your email address",
        emailcheck: "Please enter a valid email address",
      },
      firstpassword: {
        required: "Please enter a password",
        pwcheck: "Password should contain at least one lowercase letter and one digit",
        minlength: "Password should be at least 8 characters long",
      },
      password: {
        required: "Please confirm your password",
        equalTo: "Passwords do not match",
      },
    },
  });

  $.validator.addMethod("namecheck", function (value, element) {
    return this.optional(element) || /^[a-zA-Z]+$/.test(value);
  }, "Please enter a valid name without spaces.");

  $.validator.addMethod("emailcheck", function (value, element) {
    return this.optional(element) || /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value);
  }, "Please enter a valid email address.");

  $.validator.addMethod("pwcheck", function (value) {
    return (
      /^[A-Za-z0-9]*$/.test(value) && // consists of only these
      /[a-z]/.test(value) && // has a lowercase letter
      /\d/.test(value) // has a digit
    );
  });


  $.validator.addMethod("mbcheck", function (value) {
    return /^(0|91)?[6-9][0-9]{9}$/.test(value); // consists of only these
  });



  $("#signup").submit(function (e) {
    if (
      $.trim($("#name").val()) === "" ||
      $.trim($("#email").val()) === "" ||
      $.trim($("#firstPassword").val()) === "" ||
      $.trim($("#password").val()) === ""
    ) {
      e.preventDefault();
      $("#fillout").show();
    } else if (
      $.trim($("#name").val()) &&
      $.trim($("#email").val()) &&
      $.trim($("#firstPassword").val()) &&
      $.trim($("#password").val())
    ) {
      $("#fillout").hide();

      var pass = $("#firstPassword").val();
      var pass2 = $("#password").val();
      if (pass2 !== pass) {
        e.preventDefault();
        $("#notmatch").show();
      }
    }
  });
})


$(document).ready(function () {

  $('#add_category').validate({
    rules: {
      categoryName: {
        required: true,
        categorycheck: true,
      },

      image: {
        required: true,
        imgcheck: true
      },
    },
    messages: {
      categoryName: {
        required: 'Please enter catagory name in uppercase lette',
        categorycheck: 'Please enter only uppercase letters',
      },

      image: {
        required: 'Upload a image',
        imgcheck: "Please select a image"
      },
    }

  });

  $.validator.addMethod("categorycheck", function (value, element) {
    return this.optional(element) || /^[A-Z]+$/.test(value);
  }, "Please enter only uppercase letters.");

  $.validator.addMethod("imagefromlocalstorage", function (value, element) {
    return this.optional(element) || /^data:image\/(gif|png|jpeg);base64,/i.test(value);
  }, "Please enter an image from local storage.");

})
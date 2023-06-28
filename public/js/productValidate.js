$(document).ready(function () {

  ///////////////PRODUCT ADD FORM/////////////
  $('#addProduct').validate({
    rules: {
      price: {
        required: true,
        priceCheck: true
      },
      stock: {
        required: true,
        stockCheck: true
      },
      name: {
        required: true,
        nameCheck: true,
      },
      description: {
        descriptionCheck: true,
        required: true,
      },
    },
    name: {
      required: 'Please enter the product name',
      nameCheck: 'Please enter a valid product name',
    },
    messages: {
      price: {
        required: 'Please enter a price',
        priceCheck: "enter a valid price"
      },
      stock: {
        required: 'Please enter stock of the product',
        stockCheck: "enter a valid stock"
      }
    }

  });
  $.validator.addMethod('nameCheck', function (value, element) {
    return this.optional(element) || /^[a-zA-Z]+$/.test(value);
  }, 'Please enter a valid product name without spaces.');

  $.validator.addMethod("priceCheck", function (value, element) {
    var price = parseFloat(value);
    return !isNaN(price) && price >= 1;
  })
  $.validator.addMethod("stockCheck", function (value, element) {
    var stock = parseInt(value);
    return !isNaN(stock) && stock >= 1;
  });
  $.validator.addMethod('descriptionCheck', function (value, element) {
    return this.optional(element) || /^(?!\s)(?!.*\s\s)[a-zA-Z0-9\s]*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+[a-zA-Z0-9\s]*$/.test(value);
  }, 'Please enter a valid description with only one special character.');

  ////////////END OF PRODUCT ADD FORM///////////////      

  //////////// START PRODUCT EDIT FORM/////////////////

  $('#editProduct').validate({
    rules: {
      price: {
        required: true,
        priceCheck: true
      },
      stock: {
        required: true,
        stockCheck: true
      },
      name: {
        required: true,
        nameCheck: true,
      },
    },
    name: {
      required: 'Please enter the product name',
      nameCheck: 'Please enter a valid product name',
    },
    messages: {
      price: {
        required: 'Please enter a price',
        priceCheck: "enter a valid price"
      },
      stock: {
        required: 'Please enter stock of the product',
        stockCheck: "enter a valid stock"
      }
    }

  });
  $.validator.addMethod('nameCheck', function (value, element) {
    return this.optional(element) || /^[a-zA-Z][a-zA-Z\s]*$/.test(value);
}, 'Please enter a valid product name without spaces at the beginning.');

  $.validator.addMethod("priceCheck", function (value, element) {
    var price = parseFloat(value);
    return !isNaN(price) && price >= 1;
  })
  $.validator.addMethod("stockCheck", function (value, element) {
    var stock = parseInt(value);
    return !isNaN(stock) && stock >= 1;
  });
  $.validator.addMethod('descriptionCheck', function (value, element) {
    return this.optional(element) || /^[^\s]/.test(value);
}, 'Please enter a valid description without a space at the beginning.');



  /////////// END OF PRODUCT EDIT FORM////////////////


  ////////START OF ADD CATEGORY FORM////////////////

  $('#add_category').validate({
    rules: {
      categoryName: {
        required: true,
        categoryNameCheck: true
      },

    },
    messages: {
      categoryName: {
        required: 'Please enter a category name',
        categoryNameCheck: 'Please enter a valid category name without spaces'
      },

    }
  });

  $.validator.addMethod('categoryNameCheck', function (value, element) {
    return this.optional(element) || /^[^\s].*$/.test(value);
  }, 'Please enter a valid category name without spaces and must not start with a space.');


  ///////// END OF ADD CATEGORY FORM////////////////

  ////////START OF EDIT CATEGORY FORM///////////////


  /////// END OF EDIT CATEGORY FORM////////////////

  //////////////START ADD COUPON FORM ///////////////
  $('#addCoupon').validate({
    rules: {
      couponCode: {
        required: true,
        noSpace: true
      },
      couponDiscount: {
        required: true,
        range: [1, 99] // Updated range to be less than 100
      }
    },
    messages: {
      couponCode: {
        required: "Please enter a coupon code",
        noSpace: "Coupon code should not contain spaces"
      },
      couponDiscount: {
        required: "Please enter a coupon discount",
        range: "Coupon discount must be between 1 and 99" // Updated message
      }
    }
  });

  $.validator.addMethod("noSpace", function (value, element) {
    return value.indexOf(" ") === -1;
  }, "Spaces are not allowed in the coupon code.");

  ////////////// END OF ADD COUPON FORM//////////////

  /////////// START OF ADD BANNER////////////////////
  $('#banner-form').validate({
    rules: {
      bannerName: {
        required: true,
        noSpace: true
      },
      bannerLink: {
        noSpace: true
      },
      description: {
        required: true,
        noSpace: true
      }
    },
    messages: {
      bannerName: {
        required: "Please enter a banner name",
        noSpace: "Banner name should not contain spaces"
      },
      description: {
        required: "Please enter a description",
        noSpace: "Description should not contain spaces"
      }
    }
  });

  $.validator.addMethod("noSpace", function (value, element) {
    return $.trim(value) !== "";
  }, "Spaces are not allowed and the field cannot be left blank.");

  ///////////// END OF ADD BANNER////////////////////
})
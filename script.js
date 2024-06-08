// script.js

// script.js

document.addEventListener("DOMContentLoaded", function () {
  var profilePicDiv = document.getElementById("profile-pic");
  var imgElement = document.createElement("img");
  imgElement.src = "images/profile_pic.jpg"; // Replace with the path to your image
  imgElement.alt = "Profile Picture";
  profilePicDiv.appendChild(imgElement);
});

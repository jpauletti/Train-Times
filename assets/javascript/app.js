var app = {

};

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAZNqwk-JxwrCqdh9g4s7VpdRupifpIydw",
    authDomain: "train-times-43e37.firebaseapp.com",
    databaseURL: "https://train-times-43e37.firebaseio.com",
    projectId: "train-times-43e37",
    storageBucket: "train-times-43e37.appspot.com",
    messagingSenderId: "341124783099"
};

firebase.initializeApp(config);

var database = firebase.database();



$("#add-train").on("click", function (event) {
    event.preventDefault();
    console.log("click");

    var newName = $("#train-name").val().trim();
    var newDestination = $("#destination").val().trim();
    var newFirstTrain = $("#first-train").val().trim();
    var newFrequency = $("#frequency").val().trim();

    database.ref().push({
        name: newName,
        destination: newDestination,
        firstTrain: newFirstTrain,
        frequency: newFrequency
    });

    // clear inputs
    $("#train-name").val("");
    $("#destination").val("");
    $("#first-train").val("");
    $("#frequency").val("");

});





database.ref().on("child_added", function (childSnapshot) {
    var sv = childSnapshot.val();
    var key = childSnapshot.key;

    var name = sv.name;
    var destination = sv.destination;
    var firstTrain = sv.firstTrain;
    var frequency = sv.frequency;


    var nameTd = $("<td>").text(name);
    var destinationTd = $("<td>").text(destination);
    var frequencyTd = $("<td>").text(frequency);
    var nextArrivalTd = $("<td>").text("05:35 PM");
    var minutesAwayTd = $("<td>").text("10");

    var newRow = $("<tr>").append(nameTd, destinationTd, frequencyTd, nextArrivalTd, minutesAwayTd);
    newRow.attr("data-id", key);

    $("#train-list").append(newRow);
})
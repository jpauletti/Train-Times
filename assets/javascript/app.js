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

    // first train time
    var militaryTime = "HH:mm";
    var convertedFirstTrain = moment(firstTrain, militaryTime).subtract(1, "years"); // move back a year so it's always before the current time

    // difference from first train time to now - in minutes
    var timeDifference = moment().diff(moment(convertedFirstTrain), "minutes"); // 
    
    // remainder for time apart
    var remainder = timeDifference % frequency;

    // minutes until next train
    var minutesAway = frequency - remainder;

    // next train time
    var nextTrain = moment().add(minutesAway, "minutes");
    var nextTrainTime = moment(nextTrain).format(militaryTime);

    // add all to page
    var nameTd = $("<td>").text(name).addClass("name");
    var destinationTd = $("<td>").text(destination).addClass("destination");
    var frequencyTd = $("<td>").text(frequency).addClass("frequency");
    var nextArrivalTd = $("<td>").text(nextTrainTime).addClass("next-arrival");
    var minutesAwayTd = $("<td>").text(minutesAway).addClass("minutes-away");

    // var editBtn = $("<td>").html('<i class="fas fa-edit"></i>');
    var btns = $("<td>").html('<i class="fas fa-edit"></i><i class="fas fa-trash-alt"></i>');

    var newRow = $("<tr>").append(nameTd, destinationTd, frequencyTd, nextArrivalTd, minutesAwayTd, btns);
    newRow.attr("data-id", key);

    $("#train-list").append(newRow);

}, function (errorObject) {
    console.log("an error occurred");
    console.log(errorObject.code);
})









function updateArrivals () {
    database.ref().once("value").then(function (snapshot) {
        console.log("updating");
        // loops through each child (each train)
        snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();

            var firstTrain = childData.firstTrain;
            var frequency = childData.frequency;

            // first train time
            var militaryTime = "HH:mm";
            var convertedFirstTrain = moment(firstTrain, militaryTime).subtract(1, "years"); // move back a year so it's always before the current time

            // difference from first train time to now - in minutes
            var timeDifference = moment().diff(moment(convertedFirstTrain), "minutes"); // 

            // remainder for time apart
            var remainder = timeDifference % frequency;

            // minutes until next train
            var minutesAway = frequency - remainder;

            // next train time
            var nextTrain = moment().add(minutesAway, "minutes");
            var nextTrainTime = moment(nextTrain).format(militaryTime);

            // update next arrival and minutes away on page
            $('tr[data-id="' + key + '"] > .next-arrival').text(nextTrainTime);
            $('tr[data-id="' + key + '"] > .minutes-away').text(minutesAway);

        })





        
    });
}

var updateTimes = setInterval(updateArrivals, 1000*60);


// delete trains
$(document).on("click", ".fa-trash-alt", function (event) {
    // get id for this train
    var id = $(this).parent().parent().attr("data-id");

    // remove train from DB
    database.ref(id).remove();

    // remove train from page
    $(this).parent().parent().remove();
});
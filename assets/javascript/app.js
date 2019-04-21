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


// ==================================================================================================================
// Database watch events
// ==================================================================================================================

// watch for value changes - calculate and update page
database.ref().on("value", function (mainSnapshot) {

    // for each child??
    mainSnapshot.forEach(function (childSnapshot) {
        var key = childSnapshot.key;
        var childData = childSnapshot.val();

        var name = childData.name;
        var destination = childData.destination;
        var frequency = childData.frequency;
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
        var nextTrainTime = moment(nextTrain).format("hh:mm A");

        // update info on page
        $('tr[data-id="' + key + '"] > .name').text(name);
        $('tr[data-id="' + key + '"] > .destination').text(destination);
        $('tr[data-id="' + key + '"] > .frequency').text(frequency);
        $('tr[data-id="' + key + '"] > .next-arrival').text(nextTrainTime);
        $('tr[data-id="' + key + '"] > .minutes-away').text(minutesAway);

    })

}, function (errorObject) {
    console.log("an error occurred");
    console.log(errorObject.code);
})



// watch for new child added - calculate and update page
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
    var nextTrainTime = moment(nextTrain).format("hh:mm A");

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



// ==================================================================================================================
// Interval function

// every minute, this function will update the next arrivals and minutes away
function updateArrivals() {
    database.ref().once("value").then(function (snapshot) {
        console.log("updating");
        // loops through each child (each train)
        snapshot.forEach(function (childSnapshot) {
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
            var nextTrainTime = moment(nextTrain).format("hh:mm A");

            // update next arrival and minutes away on page
            $('tr[data-id="' + key + '"] > .next-arrival').text(nextTrainTime);
            $('tr[data-id="' + key + '"] > .minutes-away').text(minutesAway);

        })

    });
}




// ==================================================================================================================
// Events on page
// ==================================================================================================================


// interval for updating next arrival and minutes away
var updateTimes = setInterval(updateArrivals, 1000 * 60);


// submit btn - add new train
$("#add-train").on("click", function (event) {
    event.preventDefault();
    console.log("click");

    var newName = $("#train-name").val().trim();
    var newDestination = $("#destination").val().trim();
    var newFirstTrain = $("#first-train").val().trim();
    var newFrequency = $("#frequency").val().trim();

    // make sure fields aren't blank
    if (newName.length !== 0 && newDestination.length !== 0 && newFirstTrain.length !== 0 && newFrequency.length !== 0) {
        // hide error message if any
        if ($(".error")) {
            $(".error").remove();
        }

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
    } else {
        // show error message, if not already visible
        if ($(".error").length === 0) {
            var error = $("<p>").text("All fields are required").addClass("error");
            $("#train-name").parent().parent().prepend(error);
        }
    }

});



// open update train form - click edit button
// variable to save the id of the clicked train - used to reference it in firebase
var uniqueId = "";

$(document).on("click", ".fa-edit", function (event) {

    // if next sibling isn't the update table, or it is but it's hidden, then SHOW IT
    if (!$(this).parent().parent().next().hasClass("update-train") || $(this).parent().parent().next().hasClass("update-train hide")) {
        uniqueId = $(this).parent().parent().attr("data-id");

        // remove hoverable class temporarily
        $(".table").removeClass("table-hover");

        // show update form on page - insert under selected train to edit
        $(".update-train").insertAfter($(this).parent().parent()).removeClass("hide");


        database.ref().once("value").then(function (quickSnapshot) {
            // loops through each child (each train)
            quickSnapshot.forEach(function (childSnapshot) {
                var key = childSnapshot.key;
                var childData = childSnapshot.val();

                // if it's the one we're updating, get it's info
                if (key === uniqueId) {
                    // get info
                    var currentName = childData.name;
                    var currentDestination = childData.destination;
                    var currentFirstTrain = childData.firstTrain;
                    var currentFrequency = childData.frequency;

                    // bring current values in to edit or overwrite
                    $("#train-name-update").val(currentName);
                    $("#destination-update").val(currentDestination);
                    $("#first-train-update").val(currentFirstTrain);
                    $("#frequency-update").val(currentFrequency);
                }
            })
        })

    } else {  // if update form is already open, then HIDE IT
        // add hoverable class back to table
        $(".table").addClass("table-hover");

        // hide update form and move to bottom
        $(".update-train").appendTo("#train-list").addClass("hide");
    }

})




// submit update form - update train info
$("#update-train").on("click", function (event) {
    event.preventDefault();

    console.log(uniqueId);

    // get new info from inputs
    var $updateName = $("#train-name-update").val().trim();
    var $updateDestination = $("#destination-update").val().trim();
    var $updateFirstTrain = $("#first-train-update").val().trim();
    var $updateFrequency = $("#frequency-update").val().trim();

    // make sure fields aren't blank
    if ($updateName.length !== 0 && $updateDestination.length !== 0 && $updateFirstTrain.length !== 0 && $updateFrequency.length !== 0) {
        // remove error message if any
        if ($(".error")) {
            $(".error").remove();
        }

        // update DB
        database.ref(uniqueId).set({
            name: $updateName,
            destination: $updateDestination,
            firstTrain: $updateFirstTrain,
            frequency: $updateFrequency
        });


        // clear inputs
        $("#train-name-update").val("");
        $("#destination-update").val("");
        $("#first-train-update").val("");
        $("#frequency-update").val("");

        // add hoverable class back to table
        $(".table").addClass("table-hover");

        // hide update form and move to bottom
        $(".update-train").appendTo("#train-list").addClass("hide");
    } else {
        // show error message if it's not already showing
        if ($(".error").length === 0) {
            var error = $("<p>").text("All fields are required").addClass("error");
            error.insertAfter($("#update-train-title"));
        }
    }


});




// delete trains with delete btn
$(document).on("click", ".fa-trash-alt", function (event) {
    // get id for this train
    var id = $(this).parent().parent().attr("data-id");

    // remove train from DB
    database.ref(id).remove();

    // remove train from page
    $(this).parent().parent().remove();

    // hide update form if showing and move to bottom
    if (!$(".update-train").hasClass("hide")) {
        $(".update-train").appendTo("#train-list").addClass("hide");
    }
});


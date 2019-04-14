var app = {

};



$("#add-train").on("click", function (event) {
    event.preventDefault();
    console.log("click");

    var newName = $("#train-name").val().trim();
    var newDestination = $("#destination").val().trim();
    var newFirstTrain = $("#first-train").val().trim();
    var newFrequency = $("#frequency").val().trim();

    var nameTd = $("<td>").text(newName);
    var destinationTd = $("<td>").text(newDestination);
    var frequencyTd = $("<td>").text(newFrequency);
    var nextArrivalTd = $("<td>").text("05:35 PM");
    var minutesAwayTd = $("<td>").text("10");

    var newRow = $("<tr>").append(nameTd, destinationTd, frequencyTd, nextArrivalTd, minutesAwayTd);

    $("#train-list").append(newRow);

});
// PSEUDO
// ++++++++++++++++++++++++++++++++++++++++++
// Each Player enters username, push to DB
//	 Player object has name, choice, wins, losses
// Player chooses r/p/s
// if both player choices in DB !== "" 
//		evaluate game by comparing player choices
// 		Display result to each player 
//		increment wins and losses accordingly 
// 		reset player choices in DB to " "
// ++++++++++++++++++++++++++++++++++++++++++




// Initialize Firebase
  var config = {
    apiKey: "AIzaSyCeN787NRdNOMVPbxfNCvLQ5sR_IV60aNc",
    authDomain: "rps-multiplayer-52b16.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-52b16.firebaseio.com",
    projectId: "rps-multiplayer-52b16",
    storageBucket: "rps-multiplayer-52b16.appspot.com",
    messagingSenderId: "701705133146"
  };
  firebase.initializeApp(config);

var database = firebase.database();

// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated
// every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

  // If they are connected..
  if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {
	if (snap.numChildren() < numChildren) {
		numChildren = snap.numChildren();
	}
	//notify that someone has disconnected
});


// variables
// ===============================================

var playerOneName = "";
var playerOneChoice = "";
var playerTwoName = "";
var playerTwoChoice = "";

// store result of one round. "0" means a tie, "1" means p1 won, "2" means p2 won
var roundResult;

// to be decremented when player leaves the page
var numChildren = 0;
database.ref("/numChildren").on("value", function(snapshot) {
	numChildren = snapshot.val();
	console.log(numChildren + " num children after a Firebase update")
});

console.log(numChildren + ", this is the number of children")



// functions
// ================================================

// evaluates the game. Returns 1 if choice 1 wins, returns 2 if choice 2 wins, and 0 if game is a tie. 
function evaluate(choice1, choice2) {
	switch (choice1 + choice2) {
		case "pr":
			return 1;
			break;
		case "sp":
			return 1;
			break;
		case "rs":
			return 1;
			break;
		case "rp":
			return 2;
			break;
		case "ps":
			return 2;
			break;
		case "sr":
			return 2;
			break;
		default:
			return 0;
			break;
	}
};

function checkBothGuessed() {
	database.ref().once("value", function(snapshot) {
		console.log("Firebase snapshot when checking if both guessed: " + snapshot.val());
		var p1choice = snapshot.ref("/player-1").val().choice;
		var p2choice = snapshot.ref("/player-2").val().choice;

		console.log(p1choice, p2choice);

		if ((p1choice !== "") && (p2choice !== "")) {
			console.log("RUNNING BATTLE NOW ^");
			// console.log("player one chose " + playerOneChoice, "player two chose " + playerTwoChoice);
			roundResult = evaluate(p1choice, p2choice);
		
			console.log("battle result: " + roundResult)
			database.ref("/roundResult").set(roundResult);

		}
	})
}




// main logic, startup code
// ================================================


$("#add-name").on("click", function() {
	console.log("submit clicked");
	event.preventDefault();
	if (!numChildren) {
		console.log("adding player 1")


		playerOneName = $("#name-input").val().trim();

		database.ref("/player-1").set({
			name: playerOneName,
			playerId: "1",
			choice: "",
			wins: 0,
			losses: 0
		});
		
		numChildren = 1;
		database.ref("/numChildren").set(numChildren)

		// save player # to localStorage 
		sessionStorage.setItem("playerNum", "1")

	} else {

		console.log("adding player 2")
		playerTwoName = $("#name-input").val().trim();

		database.ref("/player-2").set({
			name: playerTwoName,	
			playerId: "2",
			choice: "",
			wins: 0,
			losses: 0
		})

		numChildren++;
		database.ref("/numChildren").set(numChildren);
		
		// save player # to localStorage 
		sessionStorage.setItem("playerNum", "2")
	}

	$(".form-control").val("");
});

// event listener for rps button click
$(".rps").on("click", function() {

	var playerNum = sessionStorage.getItem("playerNum");
	var choice = $(this).data("value");
	
	// console.log(playerNum);

	if ((playerNum === "1" ) ) { // add condition, that choice has not been logged locally
		playerOneChoice = choice;
		// console.log("player 1 choice updating", playerOneChoice)
		database.ref("/player-1").update({
			choice: playerOneChoice
		})
	} else if ((playerNum === "2" ) ) { // add condition, that choice has not been logged locally
		playerTwoChoice = choice;
		// console.log("player 2 choice updating", playerTwoChoice)
		database.ref("/player-2").update({
			choice: playerTwoChoice
		})
	}

	checkBothGuessed();
	
});

// let me see the player object when added to Firebase
database.ref().on("child_added", function(snapshot) {
	// console.log("JUST ADDED: " + snapshot.val());
})


database.ref().on("value", function(snapshot) {
	// console.log("VALUE IS CHANGED!: " + JSON.stringify(snapshot.val()));

	

	//if both player choices have been submitted, run evaluate

	
})



// When Firebase updates a player choice, update display to show only player choice 
database.ref().on("child_changed", function(snapshot) {
	console.log("player choice pulled from Firebase is: " + snapshot.val().choice);
	 var playerNum = sessionStorage.getItem("playerNum");
	 console.log("player " + playerNum + " should now locally update");

	// update opposing player's choice from database
	// console.log("playerId: " + snapshot.ref.parent().playerId, typeof snapshot.ref.parent().playerId)
	// //if you're player1 and captured change wasnt from player1, then save it locally as player2's choice
	// if ((playerNum === "1") && (snapshot.val().playerId !== "1")) {
	// 	playerTwoChoice = snapshot.val().choice;
	// 	console.log("now player 2 choice is " + playerTwoChoice)

	// //else if you're player2 and captured change wasnt from player2, then save it locally as player1's choice
	// } else if ((playerNum === "2") && (snapshot.val().playerId !== "2")) {
	// 	playerOneChoice = snapshot.val().choice;
	// 	console.log("now player 1 choice is " + playerOneChoice)
	// }


	//if both player choices have been submitted, run evaluate
	if ((playerOneChoice !== "") && (playerTwoChoice !== "")) { 	
		console.log("RUNNING BATTLE NOW");
		console.log("player one chose " + playerOneChoice, "player two chose " + playerTwoChoice);
		
		roundResult = evaluate(playerOneChoice, playerTwoChoice);
		
		console.log("battle result: " + roundResult)
		database.ref("/roundResult").set(roundResult);
	}
});

// when result has been pushed to Firebase, annouce winner in both windows
database.ref("/roundResult").on("value", function(snapshot) {
	
	roundResult = snapshot.val();
	
	switch (roundResult) {
		case 0:
			//return tie
			console.log("result: it was a tie!");
			break;
		case 1: 
			//return p1 wins
			console.log("result: player 1 wins!");
			break;
		case 2:
			//return p2 wins
			console.log("result: player 2 wins!");
			break;
	}
	
});
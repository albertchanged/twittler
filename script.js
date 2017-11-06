window.visitor;

$(document).ready(function(){
  var $body = $('body');
  var $tweetBody = $('#tweetBody');
  
  // middleBar encloses the 'X Tweetles from ...' label, 'Refresh Feed' button, and 'Write Tweetle' button
  var $middleBar = $('#middleBar');
  $middleBar.appendTo($body);

  var $writeTweetle = $('<a href="#" class="writeTweetle"></a>');
  $writeTweetle.text('Write Tweetle');
  $writeTweetle.appendTo($middleBar);

  var $refreshFeed = $('<a href="#" class="refreshFeed"></a>');
  $refreshFeed.text('Refresh Feed');
  $refreshFeed.appendTo($middleBar);

  var $writeTweet = $('#writeTweet');
  $writeTweet.hide();
  $writeTweet.appendTo($body);

  $tweetBody.appendTo($body);

  function displayTweet(context) {
    var tweet;
    var $singleTweet;
    var $tweetsFromUser;
    var $tweetsFromEveryone;
    var $tweet;
    var $user;
    var index;
    var source;
    var chosenName; // Will be either 'everyone' or a specific username

    $tweetBody.html('');
    
    // Source depends on whether we want to show everyone or just one user
    source = (context === 'everyone') ? streams.home : streams.users[context];

    var index = source.length - 1;

    while (index >= 0){
      tweet = source[index];
      chosenName = 'everyone';

      $tweet = $('<div class="tweetBody"></div>');

      $user = $('<a class="username"></a>');
      $user.attr({'href': '#', 'data-user': tweet.user}); // Give the user a data attribute to call later
      $user.text('@' + tweet.user);
      $user.appendTo($tweet);

      // Use jquery.timeago.js to conveniently create human-friendly timestamp
      var timestamp = $.timeago(tweet.created_at);
      $tweet.append('<div class="timestamp">&nbsp;&nbsp;' + timestamp + '</div>');

      $tweet.append('<div class="messageText">' + tweet.message + '</div>');
      $tweet.appendTo($tweetBody);
      $tweet.fadeIn('slow');

      index -= 1;
    }

    // Clicking on a username will set chosenName to that username, then retrieve all Tweetles from that user
    $('.username').on('click', function(event) {
      event.preventDefault();
      chosenName = $(this).data('user'); // Retrieve clicked username
      var userTweetCount = streams.users[chosenName].length;
      displayTweet(chosenName);

      // Include and display the Tweetle count for a specific user in the middleBar
      $tweetsFromUser = $('<h1 class="tweetsFromUser"> ' + userTweetCount + ' Tweetles from @' + chosenName + '</h1>');
      $singleTweet = $('<h1 class="tweetsFromUser">' + userTweetCount + ' Tweetle from @' + chosenName + '</h1>');

      // Hide any previous 'everyone' labels by setting them to empty strings
      $('.tweetsFromEveryone').text('');
      $('.writeATweet').text('');
      $writeTweet.slideUp();

      if (userTweetCount === 1) {
        $singleTweet.prependTo($middleBar);
      } else {
        $tweetsFromUser.prependTo($middleBar);
      }
      $(window).scrollTop(0);
    });

    // Remove any previous labels before prepending another one
    $('.tweetsFromEveryone').remove();
    $('.tweetsFromUser').remove();
    $('.singleTweet').remove();
    // Include and display the total Tweetle count for all users in the middleBar
    $tweetsFromEveryone = $('<h1 class="tweetsFromEveryone"> ' + streams.home.length + ' Tweetles from ' + chosenName + '</h1>');
    $tweetsFromEveryone.prependTo($middleBar);
  }

  $('.writeTweetle').click(function(event) {
    event.preventDefault();

    $('.writeATweet').remove();
    var $writeATweet = $('<h1 class="writeATweet">Write New Tweetle</h1>');
    
    // Toggle the "Write New Tweetle" section
    if ($writeTweet.css('display') === 'block') {
      $writeTweet.slideUp();
      $('.tweetsFromEveryone').css({'font-size': '1.5em', 'opacity' : '1'});
      $('.tweetsFromUser').css({'font-size': '1.5em', 'opacity' : '1'});
    } else {
      $writeTweet.slideDown();
      $writeATweet.prependTo($middleBar);
      $('.tweetsFromEveryone').css({'font-size': '0.5em', 'opacity' : '0'});
      $('.tweetsFromUser').css({'font-size': '0.5em', 'opacity' : '0'});
    }
  });

  $('.postTweetle').click(function(event) {
    event.preventDefault();
    visitor = $('#visitorName').val();
    var message = $('#tweetleText').val();

    if (!streams.users[visitor]) {
      streams.users[visitor] = []; // Initialize a new user
    }

    var emptyUsername = $('#visitorName').val() === '';
    var emptyTweetle = $('#tweetleText').val() === '';
    var $inputError = $('<h3 class="inputError">Tweetles cannot be empty! Please write a Tweetle.</h3>');
    var $usernameError = $('<h3 class="usernameError">Usernames cannot be empty! Please provide a Username.</h3>');

    if (emptyUsername && emptyTweetle) {
      $('.inputError').remove(); // In case the user encountered the error beforehand
      $inputError.appendTo($('.tweetleLabel'));
      $('.usernameError').remove(); // In case the user encountered the error beforehand
      $usernameError.appendTo($('.usernameLabel'));

    } else if (emptyUsername && !emptyTweetle) {
      $('.usernameError').remove(); // In case the user encountered the error beforehand
      $('.inputError').remove();
      $usernameError.appendTo($('.usernameLabel'));

    } else if (emptyTweetle && !emptyUsername) {
      $('.inputError').remove(); // In case the user encountered the error beforehand
      $('.usernameError').remove();
      $inputError.appendTo($('.tweetleLabel'));

    } else { // Everything checks out? Post the Tweetle!
      $('.inputError').remove();
      $('.usernameError').remove();
      $('.writeATweet').remove();
      $('#tweetleText').val('');

      writeTweet(message);
      var $posted = $('<h3 class="posted">Your Tweetle has been posted!</h3>');
      $posted.appendTo($middleBar);
      $posted.delay(1000).slideUp(750);
      $writeTweet.slideUp();
      displayTweet('everyone');
    }
  });

  // Clicking on either the Twittler header or the 'Refresh your feed' button will show all Tweetles
  $('.refreshFeed').on('click', showAllTweets);
  $('.titleLink').on('click', showAllTweets);

  // Show all Tweetles by default
  displayTweet('everyone');

  // The function to pass into the click handlers for refreshFeed and titleLink
  function showAllTweets(event) {
    event.preventDefault();
    $writeTweet.slideUp();
    displayTweet('everyone');
    $('.writeATweet').remove();
    $('.tweetsFromUser').remove();
  }
});
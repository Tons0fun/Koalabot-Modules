/*
 * 	This adds a command "!lasttweet" that returns the last tweet by the specified user
 */
 
 var modLastTweet = ( function() {
	
	//Adding the !lasttweet command
	apiAddCmd("lasttweet", "modLastTweet.tweetCmd");
	
	var _lastTweetCmd = function(params, from, mod, subscriber) {
		
		//set the twitter user to call here
		var twitterUser = "tons0fun";
		
		$.get(
			"http://api.newtimenow.com/last-tweet/",
			{
				"q" : twitterUser
			},
			function(data) {
				//Set the message output
				apiSay(`${twitterUser}'s last tweet: ${data}`);
			}
		);
	}

	return {
		tweetCmd : _lastTweetCmd
	};
	 
 } )();
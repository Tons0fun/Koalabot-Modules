/*
*	Simple command display what your current game is (grabbed from the Twitch API)
*/

var modPlaying = (function() {
	
	//Adding playing command
	apiAddCmd("playing", "modPlaying.playingCmd");
	
	//!playing command
	var _playingCmd = function(params, from, mod, subscriber) {
		
		//Grabbing the channel name from the bot setup
		//Assumed to be the caster's channel
		var caster = apiGetChannelName();
		
		//Grabbing the caster's last played game from the Twitch API
		$.get(
			"https://api.rtainc.co/twitch/game",
			{
				"channel": caster
			},
			function(data){			
				if(data.includes("<br />")) {
					return apiSay(`I couldn't find ${caster}'s current game`);
				} else {
					var message = data;
	
					apiSay(`${caster} is playing ${message}!`);
				}
			}
		);
		
	}
	
	return {
		playingCmd : _playingCmd
	};
	
} )();
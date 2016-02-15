/*
*	Simple command display what your current game is (grabbed from the Twitch API)
*/

var modPlaying = (function() {
	
	//Adding playing command
	apiAddCmd("playing", "modPlaying.playingCmd");
	
	//!playing command
	var _playingCmd = function(params, from, mod, subscriber) {
		
		//apiLog("Playing Command Called");
		
		//Grabbing the channel name from the bot setup
		//Assumed to be the caster's channel
		var caster = apiGetChannelName();
		
		//apiLog(`${caster}`);
		
		//Grabbing the caster's last played game from the Twitch API
		$.get(
			"https://api.rtainc.co/twitch/game",
			{
				"channel": caster
			},
			function(data){
				
				//apiLog(`API Call Sent: ${caster} API: Response: ${data}`);
				
				if(data.includes("<br />")) {
					return apiSay(`I couldn't find ${caster}'s current game`);
				} else {
					var message = data;
					
					//apiLog(`Message: ${message}`);
	
					apiSay(`${caster} is playing ${message}!`);
				}
			}
		);
		
	}
	
	return {
		playingCmd : _playingCmd
	};
	
} )();
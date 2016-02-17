/*
 * 	This adds a command "!lasttweet" that returns the last tweet by the specified user
 *	Configurable settings in panel
 *	Access Level: Everyone, Mod, Sub, Mods and Subs
 *	The cooldown time
 *	The caster's twitter handle to query
 *	The message the bot responds with
 *
 */
 
 var modLastTweet = (function() {
	
	//Adding the !lasttweet command
	apiAddCmd("lasttweet", "modLastTweet.tweetCmd");
	
	var _myTab = apiAddTab("Last Tweet");
	var _lastTweetSettings = {
		accessLevel: "all",
		timeOut: 10 * 1000,
		handle: "tons0fun",
		message: `[handle]'s last tweet: [message]`
	};
	
	var _settingsFileName = "modLastTweetSettings.ini";
	var _timedOut = false;
	
	//Save _lastTweetSettings
	var _saveSettings = function () {
		apiWriteFile( _settingsFileName, JSON.stringify( _lastTweetSettings ) );
	};
	
	//load settings, if not create them
	var _settingsFile = apiOpenFile( _settingsFileName );
	if (!_settingsFile) { // if it's null or empty
		_saveSettings();
	} else {
		_lastTweetSettings = $.parseJSON( _settingsFile ); // load it
	};
	
	//The last tweet tab
	$(_myTab).html(`<div class"row-fluid">
		<div class="col-sm-12">
			<div class="panel panel-default">
				<div class="panel-heading">
					<h2 class="panel-title">Last Tweet Command</h2>
				</div>
				<div class="panel-body">
					<p>
						This is a last tweet command module. You can set the
						access level (Everyone, Moderator only, Subscriber only, 
						Moderator and Subscriber). The cooldown between command
						uses. Set the twitter handle to query. You can also customize
						the message the bot responds with. These settings are saved
						to <em>${_settingsFileName}</em>.
					</p>
					<p>
						Usage: !lasttweet
					</p>
				</div>
				<ul class="list-group">
					<li class="list-group-item">
						<form class="form-inline" onsubmit="return false;">
							<label class="control-label">Permission level:</label>
							&nbsp;
							<div class="input-group input-group-sm">
								<select class="form-control" id="modLastTweetAccessLevel">
									<option value="all">Everyone</option>
									<option value="mod">Moderator</option>
									<option value="sub">Subscriber</option>
									<option value="modSub">Mods and Subs</option>
								</select>
							</div>
						</form>
					</li>
					<li class="list-group-item">
						<strong>Cooldown Duration:</strong>
						<input id="modLastTweetTimeoutInput" type="text" size="4" class="text-center"> seconds.
					</li>
					<li class="list-group-item">
						<strong>Twitter Handle to Query</strong>
						<input id="modLastTweetHandleInput" type="text" size="35" class="text-center">
					</li>
					<li class="list-group-item">
						<p><strong>Message:</strong></p>
						<input id="modLastTweetMessageInput" type"text" size="80">
						<div class="panel-body">
							<p>You can use the following tags in your message:</p>
							<ul>
								<li>[handle] - The name of the Twitter handle to query.</li>
								<li>[message] - The content of the tweet returned by the API.</li>
							</ul>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</div>`);
	
	//Sets dropdown to current access level
	$("#modLastTweetAccessLevel").val(_lastTweetSettings.accessLevel).change();
	
	//Saves new accessLevel
	$("#modLastTweetAccessLevel").change(function() {
		_lastTweetSettings.accessLevel = $("#modLastTweetAccessLevel").val();
		_saveSettings();
	});
	
	//Sets input field to current modLastTweetSettings.message value
	$("#modLastTweetMessageInput").val(_lastTweetSettings.message).change();
	
	//Updates modLastTweetSettings.message based on the value in the input field
	$("#modLastTweetMessageInput").change(function() {
		_lastTweetSettings.message = $("#modLastTweetMessageInput").val();
		_saveSettings();
	});
	
	//Sets twitter handle to the current modLastTweetSettings.handle
	$("#modLastTweetHandleInput").val(_lastTweetSettings.handle).change();
	
	//Updates modLastTweetSettings.handle based on the value of the input field
	$("#modLastTweetHandleInput").change(function() {
		_lastTweetSettings.handle = $("#modLastTweetHandleInput").val();
		_saveSettings();
	});
	
	//Set time-out input field to the current settings from modLastTweetSettings.timeOut
	$("#modLastTweetTimeoutInput").val(_lastTweetSettings.timeOut / 1000).change();
	
	//Updates modLastTweetSettings.timeOut based on the value of the input field
	$("#modLastTweetTimeoutInput").change(function() {
		var temp = $("#modLastTweetTimeoutInput").val();
		
		if(Math.floor(temp) == temp && $.isNumeric(temp) && temp >= 0) {
			_lastTweetSettings.timeOut = temp * 1000;
			_saveSettings();
		} else {
			$("#modLastTweetTimeoutInput").val(_lastTweetSettings.timeOut);
			alert("Please enter a positive integer (e.g.: 1, 2, 3).");
		}
	});
	
	//Engage the timeout
	//Taken from JoshTheSquid's Caster module
	var _timeOut = function(duration) {
		_timedOut = true;
		setTimeout( function() {
			_timedOut = false;
		}, duration);
	};
	
	var _lastTweetCmd = function(params, from, mod, subscriber) {
		
		//Check user level access as determined by _lastTweetSettings.accessLevel
		if(_lastTweetSettings.accessLevel == "mod" && (!mod && from.toLowerCase() != apiGetChannelName())) {
			//apiLog(`AccessLevel mod and ${from} is not a mod`);
			return;
		} else if(_lastTweetSettings.accessLevel == "sub" && (!subscriber && from.toLowerCase() != apiGetChannelName())) {
			//apiLog(`AccessLevel sub and ${from} is not a sub`);
			return;
		} else if(_lastTweetSettings.accessLevel == "modSub" && (!mod && !subscriber && from.toLowerCase() != apiGetChannelName())) {
			//apiLog(`AccessLevel modSub and ${from} is not a mod or a sub`);
			return;
		}
		
		if(params[0]) {
			return apiSay(`Usage: !lasttweet`);
		}
		
		//set the twitter user to call here
		var twitterUser = _lastTweetSettings.handle;
		
		//Checks if the command is on cooldown
		//If not the bot responds
		if(_timedOut) {
			return;
		} else {
			//grabs the twitterUser's last tweet
			$.get(
				"http://api.newtimenow.com/last-tweet/",
				{
					"q" : twitterUser
				},
				function(data) {
					//Replace the [handle] and [message] tags with actual data
					var message = _lastTweetSettings.message;
					message = message.replace( /\[handle\]/g, twitterUser);
					message = message.replace( /\[message\]/g, data);
					
					//Displays the bot response and activates the cooldown
					apiSay(message);
					_timeOut(_lastTweetSettings.timeOut);
				}
			)
		}
	}

	return {
		tweetCmd : _lastTweetCmd
	};
	 
 } )();
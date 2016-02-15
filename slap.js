/*
*	Simple command to let your users (User level selectable in panel) slap each other
*	User level controlled via panel
*/

var modSlap = (function(){
	
	//Adding the slap command
	apiAddCmd("slap", "modSlap.slapCmd");	
	
	var _myTab = apiAddTab("Slap");
	var _slapSettings = {
		accessLevel: "all",
		timeOut: 10 * 1000,
		message: `[botname] lurches forth and slaps some sense into [target]!`
	};
	
	var _settingsFileName = "modSlapSettings.ini";
	var _timedOut = false;

	//Save _slapSettings
	var _saveSettings = function () {
		apiWriteFile( _settingsFileName, JSON.stringify( _slapSettings ) );
	};

	//load settings, if not create them
	var _settingsFile = apiOpenFile( _settingsFileName );
	if (!_settingsFile) { // if it's null or empty
		_saveSettings();
	} else {
		_slapSettings = $.parseJSON( _settingsFile ); // load it
	};
	
	//The slap tab
	$(_myTab).html(`<div class"row-fluid">
		<div class="col-sm-12">
			<div class="panel panel-default">
				<div class="panel-heading">
					<h2 class="panel-title">Slap Command</h2>
				</div>
				<div class="panel-body">
					<p>
						This is a simple Slap command module. You can set the
						access level. Everyone, Moderator only, Subscriber only, 
						Moderator and Subscriber. These settings are saved to
						<em>${_settingsFileName}</em>.
					</p>
					<p>
						Usage: !slap [target]
					</p>
				</div>
				<ul class="list-group">
					<li class="list-group-item">
						<form class="form-inline" onsubmit="return false;">
							<label class="control-label">Permission level:</label>
							&nbsp;
							<div class="input-group input-group-sm">
								<select class="form-control" id="modSlapAccessLevel">
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
						<input id="modSlapTimeoutInput" type="text" size="4" class="text-center"> seconds.
					</li>
					<li class="list-group-item">
						<p><strong>Message:</strong></p>
						<input id="modSlapMessageInput" type"text" size="80">
						<div class="panel-body">
							<p>You can use the following tags in your message:</p>
							<ul>
								<li>[botname] - The name of your bot.</li>
								<li>[user] - The name of the viewer using the command.</li>
								<li>[target] - The target's name (Entered by the user).</li>
							</ul>
						</div>
					</li>
				</ul>
			</div>
		</div>
	</div>`);
	
	//Sets dropdown to current access level
	$("#modSlapAccessLevel").val(_slapSettings.accessLevel).change();
	
	//Saves new accessLevel
	$("#modSlapAccessLevel").change(function() {
		_slapSettings.accessLevel = $("#modSlapAccessLevel").val();
		_saveSettings();
	});
	
	//Sets input field to current modSlapSettings.message value
	$("#modSlapMessageInput").val(_slapSettings.message).change();
	
	//Updates modSlapSettings.message based on the value of the input field
	$("#modSlapMessageInput").change(function() {
		_slapSettings.message = $("#modSlapMessageInput").val();
		_saveSettings();
	});
	
	//Sets Time-Out input field to the current setting from modSlapSettings.timeout
	$("#modSlapTimeoutInput").val(_slapSettings.timeOut / 1000).change();
	
	//Updates modSlapSettings.timeout based on the value of the input field
	$("#modSlapTimeoutInput").change(function() {
		var temp = $("#modSlapTimeoutInput").val();
		
		if(Math.floor(temp) == temp && $.isNumeric(temp) && temp >= 0) {
			_slapSettings.timeOut = temp * 1000;
			_saveSettings();
		} else {
			$("#modSlapTimeoutInput").val(_slapSettings.timeOut);
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
	
	//Slap command function
	var _slapCmd = function (params, from, mod, subscriber) {
		
		//Check user level access as determined by _slapSettings.accessLevel
		if(_slapSettings.accessLevel == "mod" && (!mod && from.toLowerCase() != apiGetChannelName())) {
			apiLog(`AccessLevel mod and ${from} is not a mod`);
			return;
		} else if(_slapSettings.accessLevel == "sub" && (!subscriber && from.toLowerCase() != apiGetChannelName())) {
			apiLog(`AccessLevel sub and ${from} is not a sub`);
			return;
		} else if(_slapSettings.accessLevel == "modSub" && (!mod && !subscriber && from.toLowerCase() != apiGetChannelName())) {
			apiLog(`AccessLevel modSub and ${from} is not a mod or a sub`);
			return;
		}
		
		if (!params[0]) {
			return apiSay(`${from}, you must enter a viewer to slap.`);
		}
		
		var target = params[0];
		
		if ( target.toLowerCase() == from.toLowerCase() ) {
			return apiSay(`${from} why would you want to slap yourself?`);
		} else {
			
			//Checks if the command is on cooldown
			if(_timedOut) return;
			
			//assign the user set message to a variable in order to replace bracketed variables
			//[botname], [user], [target]
			var message = _slapSettings.message;
			message = message.replace( /\[botname\]/g, apiGetBotName());
			message = message.replace( /\[user\]/g, from);
			message = message.replace( /\[target\]/g, target);
			
			//Displays the slap resonse and activates the cooldown
			apiSay(message);
			_timeOut(_slapSettings.timeOut);
		}
	};
	
	return {
		slapCmd : _slapCmd
	};
	
})();
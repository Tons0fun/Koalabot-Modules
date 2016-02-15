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
		message: `[botname] lurches forth and slaps some sense into [target]!`
	};
	
	var _settingsFileName = "modSlapSettings.ini";

	// To save your settings, this isn't intended to be called from outside
	var _saveSettings = function () {
		apiWriteFile( _settingsFileName, JSON.stringify( _slapSettings ) );
	};

	// load gambling settings, if not create them
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
	
	//Slap command function
	var _slapCmd = function (params, from, mod, subscriber) {

		if(_slapSettings.accessLevel == "mod" && !mod) {
			//apiLog(`AccessLevel mod and ${from} is not a mod`);
			return;
		}
		
		if(_slapSettings.accessLevel == "sub" && !subscriber) {
			//apiLog(`AccessLevel sub and ${from} is not a sub`);
			return;
		}
		
		if(_slapSettings.accessLevel == "modSub" && (!mod && !subscriber)) {
			//apiLog(`AccessLevel modSub and ${from} is not a mod or a sub`);
			return;
		}
		
		if (!params[0]) {
			return apiSay(`${from}, you must enter a viewer to slap.`);
		}
		
		var target = params[0];
		
		if ( target.toLowerCase() == from.toLowerCase() ) {
			return apiSay(`${from} why would you want to slap yourself?`);
		} else {
			var message = _slapSettings.message;
			//apiLog(`${message}`);
			message = message.replace( /\[botname\]/g, apiGetBotName());
			//apiLog(`${message}`);
			message = message.replace( /\[user\]/g, from);
			//apiLog(`${message}`);
			message = message.replace( /\[target\]/g, target);
			//apiLog(`${message}`);
			return apiSay(message);
		}
	};
	
	return {
		slapCmd : _slapCmd
	};
	
})();
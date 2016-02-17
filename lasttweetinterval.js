/*
 * 	This adds a timer "lasttweet" that returns the last tweet by the specified user
 *	Configurable settings in panel
 *	The cooldown time in minutes
 *	The caster's twitter handle to query
 *	The message the bot puts in chat
 *
 */
 
 var modLastTweetInterval = (function() {
	
	var _myTab = apiAddTab("Last Tweet Timer");
	var _lastTweetIntervalSettings = {
		enabled: true,
		timeOut: 1 * 60 * 1000,
		handle: "tons0fun",
		message: `[handle]'s last tweet: [message]`
	};
	
	var _settingsFileName = "modLastTweetIntervalSettings.ini";
	
	//Save _lastTweetIntervalSettings
	var _saveSettings = function () {
		apiWriteFile( _settingsFileName, JSON.stringify( _lastTweetIntervalSettings ) );
	};
	
	//load settings, if not create them
	var _settingsFile = apiOpenFile( _settingsFileName );
	if (!_settingsFile) { // if it's null or empty
		_saveSettings();
	} else {
		_lastTweetIntervalSettings = $.parseJSON( _settingsFile ); // load it
	};
	
	//The last tweet tab
	$(_myTab).html(`<div class"row-fluid">
		<div class="col-sm-12">
			<div class="panel panel-default">
				<div class="panel-heading">
					<h2 class="panel-title">Last Tweet Timer</h2>
				</div>
				<div class="panel-body">
					<p>
						This is a last tweet timer module. The timer interval. Set
						the twitter handle to query. You can also customize the 
						message the bot responds with. These settings are saved
						to <em>${_settingsFileName}</em>.
					</p>
				</div>
				<ul class="list-group">
					<li class="list-group-item">
						<strong>Enabled: </strong>
						<button id="modLastTweetEnabled" class="btn btn-xs">Yes</button>
						<button id="modLastTweetDisabled" class="btn btn-xs">No</button>
					</li>
					<li class="list-group-item">
						<strong>Timer Interval:</strong>
						<input id="modLastTweetIntervalTimeoutInput" type="text" size="2" class="text-center"> minutes.
					</li>
					<li class="list-group-item">
						<strong>Twitter Handle to Query</strong>
						<input id="modLastTweetIntervalHandleInput" type="text" size="35" class="text-center">
					</li>
					<li class="list-group-item">
						<p><strong>Message:</strong></p>
						<input id="modLastTweetIntervalMessageInput" type="text" size="100">
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
	
	//Sets the enabled buttons to the current setting
	if(_lastTweetIntervalSettings.enabled) {
		$("#modLastTweetEnabled").addClass("btn-info");
		$("#modLastTweetDisabled").addClass("btn-danger");
	} else {
		$("#modLastTweetEnabled").addClass("btn-danger");
		$("#modLastTweetDisabled").addClass("btn-info");
	};
	
	//Update the modLastTweetSettings.enabled value based on the button clicks
	$("#modLastTweetEnabled").click(function() {
		$("#modLastTweetEnabled").removeClass("btn-danger").addClass("btn-info");
		$("#modLastTweetDisabled").removeClass("btn-info").addClass("btn-danger");
		_lastTweetIntervalSettings.enabled = true;
		_saveSettings();
	});
	
	$("#modLastTweetDisabled").click(function() {
		$("#modLastTweetDisabled").removeClass("btn-danger").addClass("btn-info");
		$("#modLastTweetEnabled").removeClass("btn-info").addClass("btn-danger");
		_lastTweetIntervalSettings.enabled = false;
		_saveSettings();
	});
	
	//Sets input field to current modLastTweetSettings.message value
	$("#modLastTweetIntervalMessageInput").val(_lastTweetIntervalSettings.message).change();
	
	//Updates modLastTweetSettings.message based on the value in the input field
	$("#modLastTweetIntervalMessageInput").change(function() {
		apiLog("Message value changed");
		_lastTweetIntervalSettings.message = $("#modLastTweetIntervalMessageInput").val();
		_saveSettings();
	});
	
	//Sets twitter handle to the current modLastTweetSettings.handle
	$("#modLastTweetIntervalHandleInput").val(_lastTweetIntervalSettings.handle).change();
	
	//Updates modLastTweetSettings.handle based on the value of the input field
	$("#modLastTweetIntervalHandleInput").change(function() {
		_lastTweetIntervalSettings.handle = $("#modLastTweetIntervalHandleInput").val();
		_saveSettings();
	});
	
	//Set time-out input field to the current settings from modLastTweetSettings.timeOut
	$("#modLastTweetIntervalTimeoutInput").val(_lastTweetIntervalSettings.timeOut / 60 / 1000).change();
	
	//Updates modLastTweetSettings.timeOut based on the value of the input field
	$("#modLastTweetIntervalTimeoutInput").change(function() {
		var temp = $("#modLastTweetIntervalTimeoutInput").val();
		
		if(Math.floor(temp) == temp && $.isNumeric(temp) && temp >= 0) {
			_lastTweetIntervalSettings.timeOut = temp * 60 * 1000;
			_saveSettings();
		} else {
			$("#modLastTweetIntervalTimeoutInput").val(_lastTweetIntervalSettings.timeOut);
			alert("Please enter a positive integer (e.g.: 1, 2, 3).");
		}
	});
	
	$.get(
		"http://api.newtimenow.com/last-tweet/",
		{
			"q" : _lastTweetIntervalSettings.handle
		},
		function(data) {
			//Replace the [handle] and [message] tags with actual data
			var message = _lastTweetIntervalSettings.message;
			message = message.replace( /\[handle\]/g, _lastTweetIntervalSettings.handle);
			message = message.replace( /\[message\]/g, data);
					
			//Displays the bot response and activates the cooldown
			_lastTweetTimeout(message, _lastTweetIntervalSettings.timeOut);
		}
	);
	
	var runCount = 0;
	
	//Engage the timeout
	//Taken from JoshTheSquid's Caster module
	var _lastTweetTimeout = function(text, interval) {
		
		runCount += 1;
		
		if(!_lastTweetIntervalSettings.enabled) {
			return;
		}

		//If the module is enabled, display the message
		if(_lastTweetIntervalSettings.enabled && runCount > 1) {
			apiSay(text);
		};
		
		setTimeout( function() {
			_lastTweetTimeout( text, interval)
		}, interval);
	};
	 
 } )();
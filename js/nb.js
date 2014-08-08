/* The code for interacting with the NimbusBase library.
*  Unfortunately I will be moving on from NimbusBase for further versions as it seems
*  to be unstable/unreliable in some ways and the support is not what it should be.
*  
*  Among other weird authorization glitches, NB seems to mess up it's authorization
*  behavior if more than one NB-based app is run, even if not at the same time.
*
*  I'm still attracted to the idea of storing jots on the user's cloud storage but
*  this does not seem currently scalable as all filtering must be done client-side
*  and there is no good way to get just a subset of the jots from Dropbox. The next
*  version will be SQL driven or more likely node/MongoDB driven.
*/

var nbx = {};
nbx.linkDropbox;
nbx.Jots;  // a model (table) for the jots
nbx.Tags;  // current tags
nbx.jot1;
nbx.jot2;
nbx.jotreal;
nbx.auth = false;
nbx.sync_string = "eyJHRHJpdmUiOnsia2V5IjoiIiwic2NvcGUiOiIiLCJhcHBfbmFtZSI6IiJ9LCJEcm9wYm94Ijp7ImtleSI6Im5sc3pqNXhyaGxiMWs1cCIsInNlY3JldCI6ImZvOGEyNDRzZ2RmdGpiZiIsImFwcF9uYW1lIjoidGpiZXRhIn19"; 
nbx.sync_object = { 
	"Dropbox": { 
	  "key": "qzspy37mozyi016", 
	  "secret": "wiyhk2dt94q54yp", 
	  "app_name": "testlearnzoro" 
	}
};

nbx.userConnectRequest = function(serviceName) {
    Nimbus.Auth.setup(nbx.sync_object);
    Nimbus.Auth.authorize(serviceName);

    Nimbus.Auth.authorized_callback = function() {
        console.log("in nbx.userConnectRequest authorized_callback");
        nbx.linkDropbox = document.getElementById("cloudButton");

        nbx.auth = Nimbus.Auth.authorized();
        if(nbx.auth) { // change link text to connected
            console.log("authorized_callback says AUTHORIZED")
            nbx.linkDropbox.style.backgroundImage = "url('images/dropboxbtn_connected.png')";
            nbx.linkDropbox.title = "You are connected to cloud storage.";
            nbx.open();
        } else {
            //nbx.linkDropbox.innerHTML = "set by callback: not connected to Dropbox";
            console.log("authorized_callback says NOT AUTHORIZED")
            nbx.linkDropbox.style.backgroundImage = "url('images/dropboxbtn_notconnected.png')";
            nbx.linkDropbox.title = "You are NOT connected to cloud storage.";

        }
    };
};

/* Set up the "tables" for Jots and Tags. */
nbx.open = function() {

    console.log("nbx.open(): calling Nimbus.Auth.setup(nbx.sync_object)");

    nbx.linkDropbox = document.getElementById("cloudButton");

    // see if we need to get authorization data from user or local indexedDB storage
    Nimbus.Auth.setup(nbx.sync_object);
    nbx.auth = Nimbus.Auth.authorized();

	if(nbx.auth == true) { // change link text to connected
        nbx.linkDropbox.style.backgroundImage = "url('images/dropboxbtn_connected.png')";
        nbx.linkDropbox.title = "You are connected to cloud storage.";
        nbx.Jots = Nimbus.Model.setup("Jots", ["commonKeyTS", "id", "time", "modTime", "title", "jot", "tagList", "extra", "isTodo", "done"]);
        nbx.Jots.sync_all(function() {
            //console.log("Nimbus instance count is now: " + nbx.Jots.count());
            nbx.Tags = Nimbus.Model.setup("Tags", ["id", "tagList", "extra"]);
            nbx.Tags.sync_all(function() {
                //console.log("nbx.Tags.sync_all() callback called.");
                tj.restoreTagSelectorState();
                tj.restoreFilterControlsState(tj.filterObject.filterTags);
                tj.showFilteredJots();
            });
        });
    }
    else {
        console.log("Nimbus.Auth.authorized() returned FALSE");
    }
};

function nimbus_init() {
    tj.indexedDB.open();
}

window.addEventListener("DOMContentLoaded", nimbus_init, false);



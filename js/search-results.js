//Function copied from https://stackoverflow.com/questions/31075133/strip-duplicate-parameters-from-the-url
function stripUrlParams(uri) {
    var stuff = decodeURIComponent(uri);
    var pars = stuff.split("&");
    var finalPars = [];
    var comps = {};
    for (i = pars.length - 1; i >= 0; i--)
    {
        spl = pars[i].split("=");
        //ignore arrays
        if(!_.endsWith(spl[0], ']')) {
            comps[spl[0]] = spl[1];
        } else {
            //this is array so enter it into final url array
            finalPars.push(spl[0] + "=" + spl[1]);
        }
    }
    for (var a in comps)
        finalPars.push(a + "=" + comps[a]);
    url = finalPars.join('&');
    return url;
}

function removeDuplicatesFromUri(uri) {
    //remove any duplicate params
    /*var redToArr = uri.split('&');

    //remove duplicates with lodash
    if(typeof _ != "undefined"){
        redToArr = _.uniq(redToArr);
    }*/
    var finalRedirect = stripUrlParams(uri);
    finalRedirect = '?' + finalRedirect;
    return finalRedirect;
}

function wizardProfileFormSubmitRedirect() {
    var searchFilterNav = jQuery('#searchFilterNav').serialize();
    var yourProfileWizardForm = jQuery('#yourProfileWizardForm').serialize();

    var redirectTo = yourProfileWizardForm + '&' + searchFilterNav + '&searchSubmit=&profile_wizard=';
    var finalRedirect = removeDuplicatesFromUri(redirectTo);
    return finalRedirect;
}

function getFirstUrlParamByName(name, uri) {

    var match = RegExp('[&]' + name + '=([^&]*)')
        .exec(uri);

    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));

}

function getRedirectUrl() {
    var redirectUrl = "";
    if(location.search.indexOf('profile_wizard') >= 0) {
        redirectUrl = wizardProfileFormSubmitRedirect();
    } else {
        redirectUrl = '?' + jQuery('#searchFilterNav').serialize();
    }

    return redirectUrl;
}

jQuery(document).ready(function($){

    $('.loadMore').on('click', function() {
        var data = {
            'action': 'moreResults'
        };
        var urlParams = window.location.search;

        $('.loadMore').html('LOADING...');
        // We can also pass the url value separately from ajaxurl for front end AJAX implementations
        $.get(load_more_object.ajax_url+urlParams, data, function(response) {

            $('.resultsData').html(response);
            $('.loadMore').hide();

        });
    });

    //Search results wizard your profile popup
    $('#yourProfileWizardForm').on('submit', function(e){
        e.preventDefault();

        window.location = wizardProfileFormSubmitRedirect();
    });

    //sort feature
    $('#sortResults').on('change', function() {
        var sortBy = $(this).val();
        var redirectUrl = getRedirectUrl() + '&sort='+sortBy+'&searchSubmit=';
        redirectUrl = removeDuplicatesFromUri(redirectUrl);
        window.location = redirectUrl;
    });

    //filter results left nav
    $('#searchFilterNav').on('submit', function(e) {
        e.preventDefault();
        var redirectUrl = getRedirectUrl() + '&searchSubmit=';
        var sortBy = $('#sortResults').val();
        if(typeof sortBy != "undefined") {
            redirectUrl += '&sort='+sortBy+'&searchSubmit=';
        }
        redirectUrl = removeDuplicatesFromUri(redirectUrl);
        window.location = redirectUrl;
    });
});


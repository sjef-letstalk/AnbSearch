var filtersApplied = getParameterByName('filters_applied');

//Function copied from https://stackoverflow.com/questions/31075133/strip-duplicate-parameters-from-the-url
function stripUriParams(uri) {
    var stuff = decodeURIComponent(uri);
    var pars = stuff.split("&");
    var finalPars = [];
    var comps = {};
    for (var i = pars.length - 1; i >= 0; i--)
    {
        spl = pars[i].split("=");
        //ignore arrays
        if(!spl[0].endsWith(']')) {
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
    var finalRedirect = stripUriParams(uri);
    return finalRedirect;
}

function prependQueryStringQuestionMark(finalRedirect) {
    if(finalRedirect.indexOf('?') === -1) {
        finalRedirect = '?' + finalRedirect;
    }

    return finalRedirect;
}

function wizardProfileFormSubmitRedirect(object = false) {
    var redirectTo;
    var finalRedirect;
    if(object) {
        var params = object.serialize();
        redirectTo = params + '&searchSubmit=&profile_wizard=';
        finalRedirect = redirectTo;
    }
    else{
        var searchFilterNav = jQuery('#searchFilterNav').serialize();
        var yourProfileWizardForm = jQuery('#yourProfileWizardForm').serialize();

        redirectTo = yourProfileWizardForm + '&' + searchFilterNav + '&searchSubmit=&profile_wizard=';
        finalRedirect = removeDuplicatesFromUri(redirectTo);
    }
    return finalRedirect;
}

function getFirstUrlParamByName(name, uri) {

    var match = RegExp('[&]' + name + '=([^&]*)')
        .exec(uri);

    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));

}

function getRedirectUrl() {
    var redirectUrl = "";
    //if(location.search.indexOf('profile_wizard') >= 0) {
        redirectUrl = wizardProfileFormSubmitRedirect();
    /*} else {
        redirectUrl = jQuery('#searchFilterNav').serialize();
    }*/

    if(window.location.toString().indexOf("more_results") !== -1) {
        redirectUrl = appendMoreResultsInUrl(redirectUrl);
    }

    return redirectUrl;
}

function bypassWizardExistingOkButton(currSubsec) {
    var bypassExistingOk = false;
    currSubsec.find('input:not(:radio):not(:checkbox), ' +
        'input:radio:checked, ' +
        'input:checkbox:checked').each(function () {
        var currInput = jQuery(this);
        var val = currInput.val().trim();
        if((currInput.prop('type') === 'text' || currInput.prop('type') === 'number') && !_.isEmpty(val)) {
            //for text inputs consider 0 as empty as well
            if(currInput.val().trim() != '0') {
                bypassExistingOk = true;
                currSubsec.addClass('bypass-ok');
                /*console.log("filled***", currInput);
                console.log("filled val***", currInput.val());
                console.log("filled val length***", currInput.val().length);*/
            }
        }
        else if(currInput.prop('type') !== 'text' && currInput.prop('type') !== 'number' && !_.isEmpty(val)) {
            bypassExistingOk = true;
            currSubsec.addClass('bypass-ok');
            /*console.log("filled***", currInput);
            console.log("filled val***", currInput.val());
            console.log("filled val length***", currInput.val().length);*/
        }
    });

    return bypassExistingOk;
}

function adjustPersonalSettingScenarios() {
    //Scenarios for personal settings popup
    //Incase its openend after 1st submission
    filtersApplied = getParameterByName('filters_applied');//check if the filters are applied
    //alert(filtersApplied);
    if(filtersApplied) {//this means that form has already been submitted once
        console.log('filtersApplied', filtersApplied);
        //now find out if all the sub-sections were filled or something wasn't

        //in case all sub-sections were filled and main button clicked, this is time to keep the sub-sections in default form,
        //which is first one is opened and rest are closed
        //and in case user open any sub-section and presses okay that section will not trigger the next sub-section,
        //that will in fact close the current one

        //and in case user clicks on change, then the appropriate section will get open
        //and pressing ok will also not trigger the next sub-section it'll only close current one

        //in case some of the sub-sections were missed and main button was clicked, open the first unfilled sub-section
        //pressing ok will oen the next unfilled sub-section

        //and in case user clicks on change, then the appropriate section will get open
        //and pressing ok will open the next unfilled sub-section and so on
        jQuery('#yourProfileWizardForm .panel').each(function() {
            var currSubsec = jQuery(this);
            var bypassExistingOk = bypassWizardExistingOkButton(currSubsec);
            console.log("bypassExistingOk", bypassExistingOk);

            if(bypassExistingOk) {
                currSubsec.find('.panel-body .buttonWrapper button').off('click');

                //time to inject our own click event on this button
                currSubsec.find('.buttonWrapper button').on('click', function() {
                    //now click the first anchor child to close this sub-section
                    setTimeout(function(){ currSubsec.find('.panel-title a').trigger('click'); }, 20);
                    //now decide based on the fact that whole sub-sections are filled or not, if yes do nothing if now,
                    //open next unfilled sub-section
                    var firstUnfilledSubsec = jQuery(currSubsec).nextAll('.panel:not(.bypass-ok)').first();
                    //firstUnfilledSubsec.find('.panel-title a').trigger('click');
                    firstUnfilledSubsec.find('.panel-title a').trigger('click');
                    //first step is to find out the unfilled sections
                });
            }
        });
    }
}

function showWaitingSearchPopup(callingObj, popupId = '', redirect = false, dontUseCallingObj = false, callback = null, redirectIfModalIsShown = false) {
    var _self = callingObj;

    if(dontUseCallingObj === true) {
        _self = jQuery(this);
    }
    var openModal = _self.parents('.modal.in');
    if(_.isEmpty(popupId)) {
        popupId = openModal.attr('id');
        var sector = _self.find('#sector').val() || jQuery('#sector').val();
        if(!_.isEmpty(sector)) {
            if(sector == 'energy') {
                //show energy waiting popup
                popupId = 'searchEnergyDealsPopup';
            } else {
                //show telecom waiting popup
                popupId = 'searchDealsPopup';
            }
        }
    }
    if(openModal.length){
        openPopup = true;
        jQuery('#'+popupId).modal('hide');
    } else {

        jQuery('#'+popupId).modal('show');
    }

    //window.location = wizardProfileFormSubmitRedirect();
    redirectParam = prependQueryStringQuestionMark(wizardProfileFormSubmitRedirect(_self));
    if(redirect === true) {
        if(redirectIfModalIsShown === true) {//in any case show the waiting modal
            if($('#'+popupId).hasClass('in')) {
                window.location = redirectParam;
            } else {
                jQuery('#'+popupId).modal('show');
                window.location = redirectParam;
            }
        } else {
            window.location = redirectParam;
        }
    }
    
    if(callback !== null) {
        callback();
    }
}

function waitingCallback() {
    var $ = jQuery();
    $('#wizard_popup_pref_cs').html('');//remove all pref_cs from wizard popup as at this moment they are passed from search navigation
    var redirectUrl = getRedirectUrl() + '&searchSubmit=';
    var sortBy = $('#sortResults').val();
    if(typeof sortBy != "undefined") {
        redirectUrl += '&sort='+sortBy+'&searchSubmit=';
    }
    redirectUrl = prependQueryStringQuestionMark(removeDuplicatesFromUri(redirectUrl));
    window.location = redirectUrl;
}

jQuery(document).ready(function($){

    $('.loadMore').on('click', function() {
        var data = {
            'action': 'moreResults'
        };
        var urlParams = window.location.search;

        //check if cat variable is missing if so append that too
        if(!_.includes(urlParams, 'cat')) {
            urlParams += '&' + $('input[name*=cat]').serialize();
        }

        $('.loadMore').html(search_compare_obj.trans_loading_dots);
        // We can also pass the url value separately from ajaxurl for front end AJAX implementations
        $.get(search_compare_obj.ajax_url+urlParams, data, function(response) {

            $('.resultsData').html(response);
            $('.loadMore').hide();
            //Telecom result page listview Price vertical middle Function is in main.js
            listViewDealPriceVerticallyCenter();

        });

        window.history.replaceState(null, null, appendMoreResultsInUrl(window.location));
    });

    //if load_more=true then trigger click on .loadMore, to ensure that user don't click again and again on load more
    if(window.location.toString().indexOf("more_results") !== -1) {
        $('.loadMore').trigger('click');
    }

    //Search results wizard your profile popup
    $('#yourProfileWizardForm').on('submit', function(e){
        e.preventDefault();
        showWaitingSearchPopup($(this), '', false, false);
    });

    //sort feature
    $('#sortResults').on('change', function() {
        var sortBy = $(this).val();
        var redirectUrl = getRedirectUrl() + '&sort='+sortBy+'&searchSubmit=';
        redirectUrl = removeDuplicatesFromUri(redirectUrl);
        window.location = prependQueryStringQuestionMark(redirectUrl);
    });

    //filter results left nav
    $('#searchFilterNav').on('submit', function(e) {
        e.preventDefault();
        var _self = $(this);

        showWaitingSearchPopup($(this), '', false, false);
    });

    $("#calcPbsModal").on("show.bs.modal", function(e) {
        var link = $(e.relatedTarget);
        var target = $(this);

        var transLabelsUri = '';

        transLabelsUri = 'trans_monthly_cost=' + search_compare_obj.trans_monthly_cost +
            '&trans_monthly_total=' + search_compare_obj.trans_monthly_total +
            '&trans_first_month=' + search_compare_obj.trans_first_month +
            '&trans_monthly_total_tooltip_txt=' + search_compare_obj.trans_monthly_total_tooltip_txt +
            '&trans_ontime_costs=' + search_compare_obj.trans_ontime_costs +
            '&trans_ontime_total=' + search_compare_obj.trans_ontime_total +
            '&trans_mth=' + search_compare_obj.trans_mth;

        //console.log("search_compare_obj***", search_compare_obj);
        target.find('.modal-body').html('<div class="ajaxIconWrapper"><div class="ajaxIcon"><img src="'+search_compare_obj.template_uri+'/images/common/icons/ajaxloader.png" alt="'+search_compare_obj.trans_loading_dots+'"></div></div>');
        $.get(search_compare_obj.site_url+'/api/', link.attr("href")+'&load=product&lang='+search_compare_obj.lang+'&'+transLabelsUri, function(response) {

            target.find(".modal-body").html(response);

        });
    });

    //enable/open collapsed filters if they are already applied
    if(filtersApplied) {
        //jQuery('.refineResult a').trigger('click');//Its is by default now applied so no need to trigger this click here
    }

    //Adjust the personal settings scenarios on first load
    adjustPersonalSettingScenarios();
    /*jQuery('#yourProfileWizardForm .panel-title a').on('mouseup', function (e) {
        e.preventDefault();
        if(filtersApplied) {
            //.find('.panel-body .buttonWrapper button').off('click')
            jQuery(this).off('click');
        }
        adjustPersonalSettingScenarios();
    });*/

    //Adjust the personal settings when somebody changes the sub-sections
    jQuery('#yourProfileWizardForm .panel').on('change', function () {
        adjustPersonalSettingScenarios();
    });

    //When mobile subscription is none, unselect the mobile checkbox in services list as well
    //In case mobile subscription is changed from none it'll then check the appropriate service again
    $('body').on('change', 'input[name=ms_mobile]', function() {
        //$('#mobile_service_wiz')
        var subscVal = $(this).val();
        if(subscVal == -1) {
            $('#mobile_service_wiz').removeProp('checked');
        } else {
            $('#mobile_service_wiz').prop('checked', true);
        }
    });
});


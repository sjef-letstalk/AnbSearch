function setEmptyDivHeight(){
    var currentHeight = jQuery('.selected-item-1.result-box-container .result-box').height();
    jQuery('#crntPackSelectionSection .offer.empty').height(currentHeight);
}
function setCurrentPackHeightInCompare(){
    setTimeout(function(){
        var currentHeight = jQuery('.selected-item-1.result-box-container .result-box').height();
        jQuery('#crntPackSelectionResponse').find('.result-box-container .result-box').height(currentHeight);
        jQuery('#crntPackSelectionResponse').animate({opacity: "1"}, 'fast');
    }, 600);
}
jQuery(document).ready(function($){
    $("#compareSearchEnergy").on("shown.bs.modal", function(e) {
        setEmptyDivHeight();
        if(!_.isEmpty('#crntPackSelectionResponse')){
            setCurrentPackHeightInCompare();
        }
    });
    function getPacksEnergy(currentObj, providerDropdownId = 'currentPackEnergy') {
        var data = {
            'action'   : 'productsCallback',
            'supplier' : currentObj.value,
            'telecom_trans': compare_between_results_object_energy.telecom_trans,
            'brands_trans': compare_between_results_object_energy.brands_trans,
            'lang': compare_between_results_object_energy.lang,
            'select_your_pack' : compare_between_results_object_energy.select_your_energy_pack,
            'i_dont_know_contract' : compare_between_results_object_energy.trans_idontknow
        };
        var currentPack= $('#'+providerDropdownId);
        var firstOption = '';
        //Commented on request of the client, requested in ticket #RED-3166
        //firstOption = '<option value="pack|i_dnt_know_contract">'+compare_between_results_object_energy.select_your_pack+"</option>";

        var urlParams = window.location.search
        // We can also pass the url value separately from ajaxurl for front end AJAX implementations
        currentPack.html('<option value="">'+ compare_between_results_object_energy.trans_loading_dots +'</option>');

        if(!_.includes(urlParams, 'sg')) {
            urlParams += '&sg='+$('#currentpack_sg').val();
        }

        if(!_.includes(urlParams, 'cat')) {
            urlParams += '&cat='+$('#currentpack_cat').val();
        }

        // We can also pass the url value separately from ajaxurl for front end AJAX implementations
        jQuery.get(compare_between_results_object_energy.site_url+'/api/' + urlParams+'&load=compare', data, function(response) {

            currentPack.html(firstOption +""+response);
            currentPack
                .siblings('.form-control-feedback')
                .removeClass('glyphicon-ok glyphicon-remove');

            currentPack.parents('form').validator('update');
            currentPack.removeClass('hide');
        });
    }

    // Call for pop suppliers dropDown
    $('#currentProviderEnergy').on('change', function() {
        getPacksEnergy(this);
    });

    $('#currentProviderEnergyTop').on('change', function() {
        getPacksEnergy(this, 'currentPackEnergyTop');
    });

    $(document).ready(function() {
        var currentEnergyProvider = $('#currentProviderEnergy').val();

        if(!_.isEmpty(currentEnergyProvider)) {
            setTimeout(function() {
                $('#currentProviderEnergy').trigger('change');
            }, 50);
        }

        var currentEnergyProviderTop = $('#currentProviderEnergyTop').val();

        if(!_.isEmpty(currentEnergyProviderTop)) {
            setTimeout(function() {
                $('#currentProviderEnergyTop').trigger('change');
            }, 50);
        }

        var currentProvider = $('#currentProvider').val();

        if(!_.isEmpty(currentProvider)) {
            setTimeout(function() {
                $('#currentProvider').trigger('change');
            }, 50);
        }
    });

    $('#compareEnergyPopupFormTop').on('submit', function(e) {
        e.preventDefault();
        if(!$(this).find('button[type=submit]').hasClass('disabled')) {
            $('#messagenotfound').hide();
            var currentPack = $('#currentPackEnergyTop').val().split('|');
            $('#selectCurrentPackTop').modal('hide');

            $('#cmp_sid').val($('#currentProviderEnergyTop').val());
            $('#cmp_pid').val(currentPack[1]);
            $('#searchFilterNav').trigger('submit');
        }
    });

    $('#compareEnergyPopupForm').on('submit', function(e) {
        if(!$(this).find('button[type=submit]').hasClass('disabled')) {
            e.preventDefault();
            $('#messagenotfound').hide();
            var currentPack = $('#currentPack').val().split('|');
            $('#selectCurrentPack').modal('hide');

            var lowestPrice = '';
            if ($('#top-heading-compare-btn-value').val() == 1) {
                $('#ajaxloadertop').removeClass('hide');
                $('#response-no-result-found-message').hide();
                var serverAction = 'compareTopResults';
                var lowestPrice = $('#top-heading-compare-lowest-price').val();
                var lowestPid = $('#top-heading-compare-lowest-pid').val();
            } else {
                var serverAction = 'compareBetweenResults';
            }

            var pref_pids_arr = new Array();
            pref_pids_arr[0] = $('.selected-item-1').attr('pid');
            pref_pids_arr[1] = $('.selected-item-2').attr('pid');
            /*
            var pref_pids = $.param(pref_pids_arr).serializeArray();
            console.log(pref_pids);
            return false;
            */
            var data = {
                'action': serverAction,
                'productTypes': currentPack[0],
                'products': currentPack[1],
                'pref_pids': pref_pids_arr,
                'lowestpid': lowestPid,
                'crntPack': compare_between_results_object_energy.current_pack,
                'features_label': compare_between_results_object_energy.features_label,
                'lang': compare_between_results_object_energy.lang,
                'lowestPrice': lowestPrice,
                'brands_trans': compare_between_results_object_energy.brands_trans,
                'checkout_button_trans' : compare_between_results_object_energy.checkout_button_trans,
                'details_page_trans' : compare_between_results_object_energy.details_page_trans,
                'change_pack' : compare_between_results_object_energy.change_pack,
                'customer_rating' : compare_between_results_object_energy.trans_customerrating,
                'guarantee_1_year' : compare_between_results_object_energy.trans_guarantee1year,
                'guarantee_1_month' : compare_between_results_object_energy.trans_guarantee1month,
                'guarantee_1_year_info' : compare_between_results_object_energy.trans_guarantee1yearinfo,
                'guarantee_1_month_info' : compare_between_results_object_energy.trans_guarantee1monthinfo,
                'potential_saving' : compare_between_results_object_energy.trans_potentialsaving,
                'your_advantage' : compare_between_results_object_energy.trans_youradvantage,
            };

            /*var urlParams = window.location.search;

            if(!_.includes(urlParams, 'cat') && (!_.includes(urlParams, 'zip'))){
                urlParams+= '&' + $('#allgetparams').val();
            }*/

            var urlParams = '?' + $('#allgetparams').val();

            // We can also pass the url value separately from ajaxurl for front end AJAX implementations
            $('#crntPackSelectionResponse').hide();
            $('#crntPackSelectionSection .offer').append('<div class="ajaxIconWrapper"><div class="ajaxIcon"><img src="' + compare_between_results_object_energy.template_uri + '/images/common/icons/ajaxloader.png" alt="' + compare_between_results_object_energy.trans_loading_dots + '"></div></div>');
            $('#crntPackSelectionSection').show();
            jQuery.get(compare_between_results_object_energy.site_url + '/api/' + urlParams + '&load=CompareEnergy', data, function (response) {
                if ($('#top-heading-compare-btn-value').val() == 1) {
                    $('#ajaxloadertop').addClass('hide');
                    $('#top-heading-compare-btn-value').val('0');
                    if (response == 'no results found') {
                        $('#response-no-result-found-message').show();
                    } else {
                        var resData = response.split('****');
                        $('#default-heading-section').hide();
                        $('#comparison-product-title').html(resData[0]);
                        $('#comparison-result-price').html(resData[1]);
                        $('#breakDownPopup').html(resData[2]);
                        $('#comparison-heading-section').show();
                    }
                } else {
                    if (response == 'no results found') {
                        $('#crntPackSelectionSection').show();
                        $('#messagenotfound').html('No results found');
                        $('#messagenotfound').show();
                        $('#crntPackSelectionSection .offer .ajaxIconWrapper').remove();//Removing loaders ones result is loaded
                    } else {
                        $('#crntPackSelectionSection .offer .ajaxIconWrapper').remove();//Removing loaders ones result is loaded
                        var resData = response.split('****');
                        $('#crntPackSelectionSection').hide();
                        $('#messagenotfound').hide();
                        jQuery('#crntPackSelectionResponse').css('opacity', 0);
                        $('#crntPackSelectionResponse').html(resData[0]).show();
                        $('#compare_popup_rates_overview').html(resData[1]);
                        $('.selected-item-1').html(resData[2]);
                        $('.selected-item-2').html(resData[3]);

                        fixDealsTableHeight($('.compareSection .dealsTable.grid'));
                        setCurrentPackHeightInCompare();
                    }
                }
            });
            return false;
        }
    });
    /*
    $('#currentProviderEnergyTop').on('change', function() {
        var data = {
            'action'   : 'productsCallback',
            'supplier' : this.value,
            'telecom_trans': compare_between_results_object_energy.telecom_trans,
            'brands_trans': compare_between_results_object_energy.brands_trans,
            'lang': compare_between_results_object_energy.lang
        };

        var currentPack= $('#currentPackEnergyTop');
        var firstOption = '<option value="">'+compare_between_results_object_energy.select_your_pack+"</option>";

        var urlParams = window.location.search
        // We can also pass the url value separately from ajaxurl for front end AJAX implementations
        currentPack.html('<option value="">Loading...</option>');

        // We can also pass the url value separately from ajaxurl for front end AJAX implementations
        jQuery.get(compare_between_results_object_energy.site_url+'/api/' + urlParams+'&load=compare', data, function(response) {

            currentPack.html(firstOption +""+response);
            currentPack
                .siblings('.form-control-feedback')
                .removeClass('glyphicon-ok glyphicon-remove');

            currentPack.parents('form').validator('update');
        });
    });
    */
});


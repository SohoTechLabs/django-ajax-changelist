/*global jQuery*/

(function ($) {
    'use strict';

    var postForm = function (form, callback) {
        var id = form.data('form-id');

        // field name - we need this to dynamically construct a form that processes only that field
        var targetField = form.data('field');
        
        // Django form prefix
        var prefix = form.data('prefix');

        var postData = form.find('input,select').serialize();
        postData += (postData ? '&' : '') + 'field=' + targetField +
            '&prefix=' + prefix;

        $.post(id, postData, function (data) {
            form.data('dirty', false);
            callback(data);
        });
    };

    $(function () {

        var forms = $('.ajx-inline-form');

        var activeEditCell, activeEditRow, activeForm;

        function hideForm() {
            activeForm.animate({
                'opacity': 0.0
            }, 300, function () {
                activeEditCell.removeClass('ajx-active');
                activeEditRow.removeClass('ajx-active');
                activeEditCell = null;
            });
        }

        $('.ajx-inline-edit').each(function (index, value) {
            $(value).parent().addClass('ajx-inline-edit-cell');
        });

        $('#result_list').on('click', '.ajx-form-close-button', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            hideForm();
        });

        $('#result_list').on('click', '.ajx-form-submit-button', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            postForm($(this).closest('.ajx-inline-form'), function (response) {
                activeEditCell.find('.ajx-inline-form-value').html(response);
                hideForm(); 
            });
        });

        $('#result_list').on('click', '.ajx-inline-edit-cell', function (e) {
            e.preventDefault();
            if (activeEditCell) {
                if (activeEditCell === $(this) || activeEditCell.find(this)) {
                    return;
                }
                activeEditCell.removeClass('ajx-active');
                activeEditRow.removeClass('ajx-active');
            }
            activeEditCell = $(this).addClass('ajx-active');
            activeEditRow = activeEditCell.closest('tr').addClass('ajx-active');
            activeForm =  activeEditCell.find('.ajx-inline-form');

            var form = activeEditCell.find('.ajx-inline-form').css('top',
                    activeEditRow.position().top + 10).css('opacity', 0).animate({'opacity': 1.0}, 500);


            // Add extra controls to this cell if we haven't already
            if (!activeEditCell.data('ajx-edit-added')) {
                form.prepend('<a href="#" class="ajx-form-close-button">x</a>');
                activeEditCell.data('ajx-edit-added', true);

                // We're using Django admin classnames here:
                form.append('<div class="submit-row">' +
                    '<input type="submit" class="ajx-form-submit-button default" value="Save"/>' +
                    '</div>');
            }
        });


        forms.click(function () {
            if ($(this).hasClass('hidden')) {
                $(this).removeClass('hidden');
            }
        });

        forms.change(function () {
            $(this).data('dirty', true);

            var selectedCategories = [];
            $(this).find(':checked').each(function (index, item) {
                selectedCategories.push($(item).parent().text().trim());
            });

            var id = $(this).data('form-id');
            $('#selectedCategories' + id).html(selectedCategories.join(', '));
        });
    });

}(jQuery));

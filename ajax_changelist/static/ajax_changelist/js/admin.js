/*global jQuery*/

(function ($) {
    'use strict';

    var activeEditCell, activeEditRow, activeForm;

    var FormUtil = {

        /* Post the specified form, triggering callback
         * on success. */
        post: function (form, callback) {

            var id = form.data('form-id');
            var targetField = form.data('field');
            var prefix = form.data('prefix');

            // Serialize the updated field value(s)
            var postData = form.find('input,select').serialize();

            // Send the name of the field we're updating as well
            //  as the Django form prefix
            postData += (postData ? '&' : '') + $.param({
                'field': targetField,
                'prefix': prefix
            });

            $.post(id, postData, function (data) {
                callback(data);
            });
        },

        /* Hide the current active form */
        hide: function() {
            activeForm.animate({
                'opacity': 0.0
            }, 300, function () {
                activeEditCell.removeClass('ajx-active');
                activeEditRow.removeClass('ajx-active');
                activeEditCell = null;
            });
        }
    };

    $(function () {

        // Mark cells that contain inline-editable fields as such
        $('.ajx-inline-edit').each(function (index, value) {
            $(value).parent().addClass('ajx-inline-edit-cell');
        });

        // Handle close buttons
        $('#result_list').on('click', '.ajx-form-close-button', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            FormUtil.hide();
        });

        // Handle submit buttons
        $('#result_list').on('click', '.ajx-form-submit-button', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            FormUtil.post($(this).closest('.ajx-inline-form'), function (response) {
                activeEditCell.find('.ajx-inline-form-value').text(response);
                FormUtil.hide();
            });
        });

        // Handle display of edit lightbox on-click of an editable cell
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

                // We're using Django admin styles here:
                form.append('<div class="submit-row">' +
                    '<input type="submit" class="ajx-form-submit-button default" value="Save"/>' +
                    '</div>');
            }
        });
    });

}(jQuery));

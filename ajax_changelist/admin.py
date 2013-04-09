from django import http
from django.conf.urls import patterns
from django.contrib import admin
from django.db import models
from django.forms.models import modelform_factory
from django.shortcuts import get_object_or_404
from django.template import loader, Context
from django.views.generic import View


def get_printable_field_value(instance, fieldname):
    """ Get the display value of a model field, showing a comma-delimited
        list for M2M fields.
    """
    field = instance._meta.get_field(fieldname)
    field_value = getattr(instance, fieldname)

    if isinstance(field, models.ManyToManyField):
        field_value = ', '.join([unicode(f) for f in
                    field_value.all()])
    return field_value


class AjaxModelFormView(View):
    """ Handles AJAX updates of a single field on an object
        (You likely don't need to use this directly as the admin
        registers a URL for it itself.)
    """

    model = None
    valid_fields = None

    def __init__(self, model, valid_fields, **kwargs):
        self.model = model
        self.valid_fields = valid_fields

    def post(self, request, object_id, *args, **kwargs):
        if not request.user or not request.user.is_staff:
            return http.HttpResponseForbidden()

        request = request.POST.copy()

        fieldname = request.pop('field', None)[0]
        form_prefix = request.pop('prefix', None)[0]

        # prevent setting fields that weren't made AJAX-editable
        if fieldname not in self.valid_fields:
            return http.HttpResponseBadRequest()

        ItemForm = modelform_factory(self.model, fields=(fieldname,))
        instance = get_object_or_404(self.model, pk=object_id)
        form = ItemForm(request, instance=instance, prefix=form_prefix)

        if not form or not form.is_valid():
            return http.HttpResponseBadRequest()

        form.save()

        new_value = get_printable_field_value(instance, fieldname)

        return http.HttpResponse(new_value)


class AjaxModelAdmin(admin.ModelAdmin):
    """ Admin class providing support for inline forms in
        listview that are submitted through AJAX.
    """

    def __init__(self, *args, **kwargs):

        HANDLER_NAME_TPL = "_%s_ajax_handler"

        if not hasattr(self, 'ajax_list_display'):
            self.ajax_list_display = []

        self.list_display = list(self.list_display)
        self.list_display = self.list_display + map(lambda name: HANDLER_NAME_TPL % name,
                self.ajax_list_display)

        super(AjaxModelAdmin, self).__init__(*args, **kwargs)

        for name in self.ajax_list_display:
            setattr(self, HANDLER_NAME_TPL % name,
                    self._get_field_handler(name))

        self.ajax_item_template = loader.get_template('ajax_changelist/'
                                                      'field_form.html')

    def get_urls(self):
        """ Add endpoint for saving a new field value. """

        urls = super(AjaxModelAdmin, self).get_urls()
        list_urls = patterns('',
                (r'^(?P<object_id>\d+)$',
                 AjaxModelFormView.as_view(model=self.model,
                                           valid_fields=self.ajax_list_display)))
        return list_urls + urls

    def _get_field_handler(self, fieldname):
        """ Handle rendering of AJAX-editable fields for the changelist, by
            dynamically building a callable for each field.
        """

        def handler_function(obj, *args, **kwargs):
            ItemForm = modelform_factory(self.model, fields=(fieldname,))
            form = ItemForm(instance=obj, prefix="c" + unicode(obj.id))

            field_value = get_printable_field_value(obj, fieldname)

            # Render the field value and edit form
            return self.ajax_item_template.render(Context({
                'object_id': obj.id,
                'field_name': fieldname,
                'form': form.as_p(),
                'field_value': field_value
            }))

        handler_function.allow_tags = True
        handler_function.short_description = fieldname
        return handler_function

    class Media:

        #FIXME: dripping jQueries is straight-up wack.
        js = ('//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
                'ajax_changelist/js/lib/jquery.django_csrf.js',
                'ajax_changelist/js/admin.js',)
        css = {
             'all': ('ajax_changelist/css/admin.css',)
        }

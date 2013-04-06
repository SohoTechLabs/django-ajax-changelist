Django AJAX Changelist
===============================

**NOTE: this app is currently alpha-quality. Please test it thoroughly in a development environment before deciding whether to integrate it to your project, and note the list of known issues.**

This project extends Django ModelAdmin to support editing specified fields directly from the changelist (the Django admin's listview of objects of a given Model).

AJAX editing of fields from the changelist is useful when you need to quickly change a few properties of objects in the changelist -- instead of clicking through to each object's page, saving, and returning to the list, you can make the edits right from the list.

Usage
---------

1. Add `ajax_changelist` to your INSTALLED_APPS.

2. Register an Admin class that inherits from AjaxModelAdmin:

```python
from ajax_changelist.admin import AjaxModelAdmin

class BearAdmin(AjaxModelAdmin):
  form = BearForm  # usual form you'd use for your ModelAdmin here, nothing special needed

  # Specify the fields you'd like to be able to edit via AJAX here:
  ajax_list_display = ('snout_length', 'honey_affinity_score',)
  
  # Specify the remainder of the fields you'd like to show in the changelist view:
  #   (don't specify the AJAX fields here)
  list_display = ('name', 'is_fictional',)

...

admin.site.register(Bear, BearAdmin)

```

Form field/widget display approach
--------------------------------------

To take advantage of Django's form widgets, widgets are rendered serverside.  Currently they are rendered inline in the changelist view, though retrieving via AJAX would be more efficient for some field types.

Django Versions Tested
--------------------------

1.4.3, 1.5.1

Known Issues
-----------------

* jQuery 1.9.1 is added without namespacing and calling noConflict()
* Use in conjunction with ManyToManyFields:
    * Without extra user intervention (prefetching and caching options list), rendering a Select or similar widget for a M2M field generates a ton of extra queries when loading the changelist view.
    * Select widgets with many options will weigh down the admin page. (In future this can be handled by retrieving them via AJAX when a field is selected)
* Doesn't work with django-taggit fields and likely many other third-party provided fields/their corresponding widgets.
* The form fade-in/fade-out animations are potentially quite annoying; a switch should be provided to disable them.

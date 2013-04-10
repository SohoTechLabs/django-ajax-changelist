from setuptools import setup

setup(name='django-ajax-changelist',
      version='0.1.3',
      description=("Django ModelAdmin extended to support editing selected "
                   "fields via AJAX without leaving the changelist."),
      long_description="",
      author='Ben Regenspan',
      author_email='ben@sohotechlabs.com',
      license='MIT',
      zip_safe=True,
      install_requires=['django'],
      packages=['ajax_changelist'],
)

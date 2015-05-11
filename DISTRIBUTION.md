CKEditor Accessibility Checker
==================================================

# Overview

This package contains the distribution version of Accessibility Checker.

## Requirements

* CKEditor **4.3.0** or later
* jQuery **1.x** in order to run [Quail](http://quailjs.org/)

## Installation

The distribution version of Accessibility Checker comes as a `a11ychecker.zip` file.

This archive contains the following plugins, each placed in a separate directory:

* `a11ychecker` &ndash; The core Accessibility Checker providing all essential components.
* `balloonpanel` &ndash; Provides the GUI element used in the plugin.

### Installation Steps

* Download the `a11ychecker.zip` file to the `ckeditor/plugins` directory.
* Use the "Extract here" option on the archive, so that the directories are extracted directly into `plugins` directory.

That's it! At this point you can open the sample available in `a11ychecker/samples/index.html` to see how it works for you.

You can also add Accessibility Checker to any of your CKEditor instances by using the [`config.extraPlugins`](http://docs.ckeditor.com/#!/api/CKEDITOR.config-cfg-extraPlugins) configuration option. For example:

```javascript
config.extraPlugins = 'a11ychecker';
```

**Keep in mind that Quail has a jQuery dependency.** It requires you to have a global variable `jQuery` defined containing jQuery 1.x. The  sample mentioned above is shipped with jQuery, but jQuery is not loaded automatically with Accessibility Checker.

### Limitations

**Running on local filesystem:** You cannot run Accessibility Checker on a local filesystem, since Quail uses an `XMLHttpRequest` for fetching its resources. This is not allowed when working with the `file://` scheme.

# Where Do I Start?

Use the `plugins/a11ychecker/samples/index.html` sample loaded from a local web server to test Accessibility Checker.

Please note that other samples will not work because of the RequireJS dependency, which is not a part of the standard CKEditor distribution.
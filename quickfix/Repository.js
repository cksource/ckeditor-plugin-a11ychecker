define( function() {
	'use strict';

	/**
	 * Base class for the Repository fixes.
	 *
	 * This class is responsible for fetching QuickFix classes.
	 *
	 * It supports callbacks queueing in case when multiple requrests for the class
	 * occurs, and QuickFix is still yet not available.
	 *
	 * It is possible to implement loading of your custom QuickFixes, see
	 * {@link #requested}.
	 *
	 * The reason that class is needed is that we want to load QuickFixes on demand,
	 * rather than load all of them at once.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix
	 * @constructor
	 * @param {String} basePath A path to the directory where QuickFix classes are
	 * stored.
	 */
	function Repository( basePath ) {
		this.basePath = basePath || '';

		/**
		 * Variable with a mapping of all loaded types.
		 *
		 * @private
		 */
		this._loadedTypes = {};

		/**
		 * It will contain QuickFix class names as a keys, and we expect following values:
		 *
		 * * Function - a loaded type/class for QuickFix
		 * * `false` - temp variable indicating that given class was already requested for loading, but was
		 * not registered yet.
		 *
		 * @private
		 */
		this._waitingCallbacks = {};
	}

	Repository.prototype = {};
	Repository.prototype.constructor = Repository;

	var waitingCallbacks = {};

	/**
	 * Returns the QuickFix class with given name. When type is loaded `callback` will
	 * be called.
	 *
	 *		quickFixes.get( 'ImgAlt', function( ImgAlt ) {
	 *			var quickFix = new ImgAlt( myIssue );
	 *			quickFix.fix();
	 *		} );
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix.Repository
	 * @param {Object} options
	 * @param {String} options.name
	 * @param {Function} options.callback A function to be called when given type is registered.
	 * It gets only one parameter which is a construct function for given QuickFix.
	 * @returns {Function}
	 */
	Repository.prototype.get = function( options ) {
		var name = options.name,
			callback = options.callback,
			evt,
			requestEvent;

		if ( this._loadedTypes[ name ] ) {
			// If type is already loaded return it immediately.
			callback( this._loadedTypes[ name ] );
			return ;
		}

		// We need to store callback to queue before firing requested event, in case
		// if developer will return type synchronously.
		if ( !waitingCallbacks[ name ] ) {
			waitingCallbacks[ name ] = [];
		}

		waitingCallbacks[ name ].push( callback );

		if ( this._loadedTypes[ name ] !== false ) {
			// Firing the requested event.
			// Having a false value in types mapping it means that it was already
			// requested to be fetched, but is not yet ready.
			// So there is no point in firing another query.
			// Adding a callback to queue is enough, so it will be called as the
			// type is registered.

			// If type is not yet loaded we need to fire an event (where one can
			// override loading method).
			evt = {
				name: name
			};

			this._loadedTypes[ name ] = false;

			requestEvent = this.fire( 'requested', evt );

			if ( requestEvent !== false ) {
				this.requestQuickFix( options );
			}
		}
	};

	/**
	 * The default way of downloading JavaScript files. This will be used
	 * if `requested` event was not canceled.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix.Repository
	 * @param {Object} options Same as in {@link #get}
	 */
	Repository.prototype.requestQuickFix = function( options ) {
		CKEDITOR.scriptLoader.load( this.basePath + options.name + '.js' );
	};

	/**
	 * Registers a class of given QuickFix.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix.Repository
	 * @param {String} name QuickFix name.
	 * @param {Function} cls QuickFix type.
	 */
	Repository.prototype.add = function( name, cls ) {
		var callbackQueue = waitingCallbacks[ name ] || [],
			callbacksCount = callbackQueue.length,
			i;

		this._loadedTypes[ name ] = cls;

		// Call pending callbacks.
		for ( i = 0; i < callbacksCount; i++ ) {
			callbackQueue[ i ]( cls );
		}

		// And we can unset the callbacks array.
		delete waitingCallbacks[ name ];
	};

	/**
	 * An internal function, to expose some internals to tests.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix.Repository
	 * @private
	 * @param {mixed} value
	 */
	Repository.prototype.setLoadedTypes = function( value ) {
		this._loadedTypes = value;
	};

	/**
	 * An internal function, to expose some internals to tests.
	 *
	 * Returns loaded type mapping.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix.Repository
	 * @private
	 * @returns {Object}
	 */
	Repository.prototype.getLoadedTypes = function() {
		return this._loadedTypes;
	};

	/**
	 * An internal function, to expose some internals to tests.
	 *
	 * Returns pending callbacks mapping.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix.Repository
	 * @private
	 * @returns {Object}
	 */
	Repository.prototype.getWaitingCallbacks = function() {
		return waitingCallbacks;
	};

	CKEDITOR.event.implementOn( Repository.prototype );

	/**
	 * Fired when Repository is asked to return a type, which has not been yet cached.
	 *
	 * This event might be canceled, so developer can implemnt custom QuickFix loading.
	 * It is important then to call {@link #register} method when the type is loaded,
	 * otherwise pending callback won't be called.
	 *
	 * @member CKEDITOR.plugins.a11ychecker.quickFix.Repository
	 * @event requested
	 * @param {Object} data
	 * @param {String} data.name Name of requested type.
	 */

	return Repository;
} );
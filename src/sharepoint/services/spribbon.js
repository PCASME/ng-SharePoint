/**
 * @ngdoc object
 * @name ngSharePoint.SPRibbon
 *
 * @description
 * This factory provides functionality to manage ribbon (tabs, groups, buttons).
 *
 * *Documentation is pending*
 */


;(function () {

    'use strict';

    angular
        .module('ngSharePoint')
        .factory('SPRibbon', SPRibbon);


    SPRibbon.$inject = ['$q', '$timeout'];


    /* @ngInject */
    function SPRibbon($q, $timeout) {

        var pageManager, ribbon, commandDispatcher;
        var ribbonDeferred = $q.defer();
        var toolbarSequence = 1;
        var buttonSequence = 1;
        var ribbonReady = false;


        var spRibbonService = {

            instance: null,
            pageManager: null,
            commandDispatcher: null,
            getInstance: getInstance,
            ready: ready,
            refresh: refresh,
            addTab: addTab,
            getTab: getTab,
            getEditTab: getEditTab,
            getDefaultTab: getDefaultTab,
            addGroupToTab: addGroupToTab,
            addLayoutToGroup: addLayoutToGroup,
            addSectionToLayout: addSectionToLayout,
            addButtonToSection: addButtonToSection,
            showEditingTools: showEditingTools,
            executeCommand: executeCommand,
            registerComponentCommands: registerComponentCommands,
            unregisterComponentCommands: unregisterComponentCommands,
            getStructure: getStructure,
            createToolbar: createToolbar,
            addButtonToToolbar: addButtonToToolbar,
            registerCommand: registerCommand,
            removeCommand: removeCommand

        };


        return spRibbonService;



        ///////////////////////////////////////////////////////////////////////////////



        function onRibbonInited() {

            ribbon = pageManager.get_ribbon();
            commandDispatcher = pageManager.get_commandDispatcher();

            spRibbonService.instance = ribbon;
            spRibbonService.pageManager = pageManager;
            spRibbonService.commandDispatcher = commandDispatcher;

            ribbonReady = true;
            ribbonDeferred.resolve();

        } // onRibbonInited



        function ready() {

            if (ribbonReady === true) {

                ribbonDeferred.resolve();
                return ribbonDeferred.promise;

            }
            
            // Initialize ribbon
            SP.SOD.executeOrDelayUntilScriptLoaded(function () {

                pageManager = SP.Ribbon.PageManager.get_instance();

                // Adds a new event handler for the page manager 'RibbonInited' event.
                pageManager.add_ribbonInited(onRibbonInited);

                // Try to get the ribbon
                try {

                    ribbon = pageManager.get_ribbon();

                }
                catch (e) { }


                if (!ribbon) {

                    if (typeof (_ribbonStartInit) == "function") {

                        _ribbonStartInit(_ribbon.initialTabId, false, null);

                    }

                } else {

                    onRibbonInited();

                }

            }, "sp.ribbon.js");


            return ribbonDeferred.promise;

        } // ready



        function getInstance() {

            return ribbon;

        }



        function refresh() {

            ready().then(function () {

                ribbon.refresh();

            });

        } // refresh



        function addTab(id, title, description, commandId, hidden, contextualGroupId, cssClass) {

            var tab = new CUI.Tab(ribbon, id, title, description, commandId, hidden || false, contextualGroupId || '', cssClass || null);
            ribbon.addChild(tab);
            ribbon.refresh();

            return tab;

        } // addTab



        function getTab(id) {

            // Gets tab by id
            var tab = ribbon.getChild(id);

            if (tab === null) {

                // Gets tab by title
                tab = ribbon.getChildByTitle(id);

            }

            return tab;

        } // getTab



        function getEditTab() {

            var editTab = ribbon.getChild('Ribbon.ListForm.Edit');

            if (editTab === null) {
                // Try with Document library edit tab
                editTab = ribbon.getChild('Ribbon.DocLibListForm.Edit');
            }


            if (editTab === null) {
                // Try with Posts list edit tab
                editTab = ribbon.getChild('Ribbon.PostListForm.Edit');
            }

            return editTab;

        } // getEditTab



        function getDefaultTab() {

            return ribbon.getChild(ribbon.get_selectedTabId());

        } // getDefaultTab



        function addGroupToTab(tabId, id, title, description, commandId) {

            var tab = ribbon.getChild(tabId);
            var group, layout, section;

            if (tab !== null) {

                group = new CUI.Group(ribbon, id, title, description, commandId, null);
                tab.addChild(group);

                layout = addLayoutToGroup(group);
                section = addSectionToLayout(layout);
                ribbon.refresh();

            }

            return {
                group: group,
                layout: layout,
                section: section
            };

        } // addGroupToTab



        function addLayoutToGroup(group) {

            var layoutId = group.get_id() + '.Layout';
            var layout = new CUI.Layout(ribbon, layoutId, layoutId);
            group.addChild(layout);
            //group.selectLayout(layoutId);

            return layout;

        } // addLayoutToGroup



        function addSectionToLayout(layout) {

            var sectionId = layout.get_id() + '.Section';
            var section = new CUI.Section(ribbon, sectionId, 2, 'Top'); //-> Type = 2 = One row
            /*
                The 'Type' argument in the CUI.Section constructor can be one of the following values:

                    1: The section will be a vertical separator and can't add other elements inside.
                    2: The section will have one row (1)
                    3: The section will have two rows (1 and 2)
                    4: The section will have three rows (1, 2 and 3)
            */
            layout.addChild(section);

            return section;

        } // addSectionToLayout



        function createButtonProperties(id, label, tooltip, description, btnImage) {

            var controlProperties = new CUI.ControlProperties();

            /*
            https://msdn.microsoft.com/en-us/library/office/ff458366.aspx

            <Button
                 Alt="Text"
                 Command="Text"
                 CommandType="General | OptionSelect | IgnoredByMenu"
                 CommandValueId="Text"
                 Description="Text"
                 Id="Text"
                 Image32by32="Url"
                 Image32by32Class="CSS Class Selector"
                 Image32by32Left="Negative Integer"
                 Image32by32Top="Negative Integer"
                 Image16by16="Url"
                 Image16by16Class="CSS Class Selector"
                 Image16by16Left="Negative Integer"
                 Image16by16Top="Negative Integer"
                 LabelCss="Text"
                 LabelText="Text"
                 MenuItemId="Text"
                 Sequence="Integer"
                 TemplateAlias="Text"
                 ToolTipImage32by32="Url"
                 ToolTipImage32by32Class="Text"
                 ToolTipImage32by32Left="Negative Integer"
                 ToolTipImage32by32Top="Negative Integer"
                 ToolTipTitle="Text"
                 ToolTipDescription="Text"
                 ToolTipHelpKeyWord="Text"
                 ToolTipShortcutKey="Text"
            />
            */            

            controlProperties.Command = id;// + '.Command';
            controlProperties.Id = id + '.ControlProperties';
            controlProperties.TemplateAlias = 'o1';
            /*
                Property: TemplateAlias
                The TemplateAlias property is used to specify which template alias to use from 
                the Group Template Layout. That is how the control is positioned, which section 
                or row. This property must be a string value corresponding to one of the aliases 
                defined in the group template layout.

                See 'RibbonTemplates' at the end of the file 'CMDUI.XML' (<15_deep>\TEMPLATE\GLOBAL\CMDUI.XML).
                Also see these recomendations: http://www.andrewconnell.com/blog/Always-Create-Your-Own-Group-Templates-with-SharePoint-Ribbon-Customizations
            */

            // Sets the default values for the 32x32 image properties.
            var imageProperties = {
                Image32by32: (typeof btnImage == 'string' ? btnImage : void 0) || '/_layouts/15/images/placeholder32x32.png'
            };

            if (typeof btnImage == 'object') {

                angular.extend(imageProperties,  btnImage);

            }



            controlProperties.Image32by32 = imageProperties.Image32by32;
            controlProperties.Image32by32Class = imageProperties.Image32by32Class;
            controlProperties.Image32by32Left = imageProperties.Image32by32Left;
            controlProperties.Image32by32Top = imageProperties.Image32by32Top;

            controlProperties.Image16by16 = imageProperties.Image16by16;
            controlProperties.Image16by16Class = imageProperties.Image16by16Class;
            controlProperties.Image16by16Left = imageProperties.Image16by16Left;
            controlProperties.Image16by16Top = imageProperties.Image16by16Top;

            controlProperties.ToolTipTitle = tooltip || label;
            controlProperties.ToolTipDescription = description || tooltip || '';
            controlProperties.LabelText = label;

            return controlProperties;

        } // createButtonProperties



        function addButtonToSection(section, id, label, tooltip, description, btnImage) {

            var button = new CUI.Controls.Button(ribbon, id, createButtonProperties(id, label, tooltip, description, btnImage));
            var controlComponent = button.createComponentForDisplayMode('Large'); //-> 'Large', 'Medium', 'Small', 'Menu|Menu16', 'Menu32', ''
            var row = section.getRow(1); // Assumes section of type 2 (one row). It could also be type 3 or 4 and in this case always use the row 1.
            row.addChild(controlComponent);

        } // addButtonToSection



        function showEditingTools() {

            var commandId = 'CommandContextChanged';
            var properties = new CUI.CommandContextSwitchCommandProperties();

            properties.ChangedByUser = false;
            properties.NewContextCommand = 'CPEditTab';
            properties.NewContextId = 'Ribbon.EditingTools.CPEditTab';
            properties.OldContextCommand = 'Ribbon.ListForm.Edit';
            properties.OldContextId = 'Ribbon.ListForm.Edit';

            return commandDispatcher.executeCommand(commandId, properties);

        } // showEditingTools



        function executeCommand(commandId, properties) {

            /*
                If you need to know what is the name (commandId) of your desired button, please find here:

                    https://msdn.microsoft.com/en-us/library/office/ee537543(v=office.14).aspx or https://msdn.microsoft.com/en-us/library/office/bb802730(v=office.15).aspx

                Or in this path directory in front-end server: 

                    %ProgramFiles%\Common Files\Microsoft Shared\web server extensions\15\TEMPLATE\GLOBAL\XML\CMDUI.xml
                    
            */

            try {

                commandDispatcher.executeCommand(commandId, properties || null);

            } catch (e) {

                console.error('SPRibbon.executeCommand failed!');
                console.error(e);
                
            }

        } // executeCommand



        function _validateCommands(commands) {

            if (!angular.isArray(commands)) {

                if (angular.isString(commands)) {

                    commands = [commands];

                } else {

                    // No valid commands specified
                    return false;

                }
            }

            return commands;

        } // _validateCommands



        function registerComponentCommands(componentId, commands) {

            var cmds = _validateCommands(commands);
            var component = pageManager.getPageComponentById(componentId);

            if (component && cmds) {

                commandDispatcher.registerMultipleCommandHandler(component, cmds);
                ribbon.refresh();
                return true;

            }

            return false;

        } // registerComponentCommands



        function unregisterComponentCommands(componentId, commands) {

            var cmds = _validateCommands(commands);
            var component = pageManager.getPageComponentById(componentId);

            if (component && cmds) {

                commandDispatcher.unregisterMultipleCommandHandler(component, cmds);
                ribbon.refresh();
                return true;

            }

            return false;

        } // unregisterComponentCommands



        function _getRibbonStructure(fromNode) {

            var structure = {};
            var items = fromNode.$6_0;

            if (items) {

                var enumerator = items.getEnumerator();

                while (enumerator.moveNext()) {

                    var item = enumerator.get_current();

                    // TODO: Si el item es un 'CUI_Tab', acceder al tab para inicializarlo antes de obtener su estructura.
                    //       De lo contrario estará vacío si no se ha accedido anteriormente :(

                    structure[item.get_id()] = item;
                    angular.extend(structure[item.get_id()], _getRibbonStructure(item));

                }

            }

            return structure;

        } // _getRibbonStructure



        function getStructure() {

            // Gets the current selected tab id
            var selectedTabId = ribbon.get_selectedTabId();

            // Gets the ribbon structure
            var ribbonStructure = _getRibbonStructure(ribbon);

            // Restore selected tab
            ribbon.selectTabById(selectedTabId);

            return ribbonStructure;

        } // getStructure



        function createToolbar(name, targetTab) {

            var groupName = name || 'Toolbar ' + _getNextToolbarSequence();
            var groupId = 'Ribbon.ngSharePoint.' + groupName.replace(/ /g, '-');
            var groupCommandId = groupId + '.Command';
            var tab, toolbar;


            // Checks for 'targetTab'
            if (targetTab) {

                tab = getTab(targetTab);

                // If specified tab do not exists, creates a new one.
                if (tab === null) {

                    // Creates a new tab
                    var tabId = 'Ribbon.ngSharePoint.' + targetTab.replace(/ /g, '-');
                    tab = addTab(tabId, targetTab, '', tabId + '.Command');
                    registerCommand(tabId + '.Command', angular.noop, true);

                }

            } else {

                // Gets the default selected tab (View|Edit).
                tab = getDefaultTab();

            }


            // Adds the toolbar as a new group in the tab.
            toolbar = addGroupToTab(tab.get_id(), groupId, groupName, groupCommandId);
            registerCommand(groupCommandId, angular.noop, true);

            return toolbar;

        } // createToolbar



        function addButtonToToolbar(toolbar, label, handlerFn, tooltip, description, btnImage, canHandle) {

            var buttonId = toolbar.group.get_id() + '.Button-' + _getNextButtonSequence();

            addButtonToSection(toolbar.section, buttonId, label, tooltip, description, btnImage);
            toolbar.group.selectLayout(toolbar.layout.get_id());
            registerCommand(buttonId, handlerFn, canHandle);

        } // addButtonToToolbar



        function _getNextToolbarSequence() {

            return toolbarSequence++;

        } // _getNextToolbarSequence



        function _getNextButtonSequence() {

            return buttonSequence++;

        } // _getNextButtonSequence



        function registerCommand(commandId, handlerFn, canHandle) {

            var component = pageManager.getPageComponentById('ngSharePointPageComponent');

            if (!component) {

                component = registerPageComponent();

            }

            // Adds the command to the 'ngSharePointPageComponent' component.
            if (component.addCommand(commandId, handlerFn, canHandle)) {

                // Register the command in the CommandDispatcher of the CUI.Page.PageComponent
                registerComponentCommands(component.getId(), commandId);

            }

        } // registerCommand



        function removeCommand(componentId, commands) {

            //var cmds = [].concat(commands).filter(Boolean);
            var cmds = _validateCommands(commands);
            var component = pageManager.getPageComponentById(componentId);

            if (component && cmds) {

                cmds.forEach(function (commandId) {

                    if (Array.contains(component.getCommands(), commandId)) {

                        // Hard hack to remove the command from the component.
                        delete component._controlData[commandId];
                        ribbon.refresh();

                    }

                });

                return true;

            }

            return false;

        } // removeCommand



        function registerPageComponent() {

            /**
             * See the page 'Developing Page Components for the Server Ribbon'.
             * https://msdn.microsoft.com/en-us/library/office/ff407303(v=office.14).aspx
             */


            // Register the type 'ngSharePointPageComponent'.
            Type.registerNamespace('ngSharePointPageComponent');


            // Initialize the 'ngSharePointPageComponent' members
            ngSharePointPageComponent = function () {

                ngSharePointPageComponent.initializeBase(this);

            };


            ngSharePointPageComponent.initializePageComponent = function () {

                var instance = ngSharePointPageComponent.get_instance();

                pageManager.addPageComponent(instance);

                return instance;

            };


            ngSharePointPageComponent.get_instance = function () {

                if (!angular.isDefined(ngSharePointPageComponent.instance)) {

                    ngSharePointPageComponent.instance = new ngSharePointPageComponent();

                }

                return ngSharePointPageComponent.instance;

            };


            ngSharePointPageComponent.prototype = {

                // Create an array of handled commands with handler methods
                init: function () {

                    /**
                     * The SP.Ribbon.PageState.PageStateHandler.init() Method initializes the page component. 
                     * You can use this method to initialize any variables for your page component. This includes initializing the list of 
                     * commands that your page component can handle and also registering the array of methods that are used to handle commands.
                     */

                    this._commands = [];
                    this._handledCommands = {};

                },


                getGlobalCommands: function () {

                    /**
                     * The SP.Ribbon.PageState.PageStateHandler.getGlobalCommands() Method returns a string array with the names of the global commands. 
                     * The page component responds to these commands when it is on the page.
                     */

                    return this._commands;

                },


                getFocusedCommands: function () {

                    /**
                     * The SP.Ribbon.PageState.PageStateHandler.getFocusedCommands() Method returns a string array with the names of the focused commands. 
                     * The page component only responds to these commands if it has the focus.
                     */

                    return [];

                },


                handleCommand: function (commandId, properties, sequence) {

                    /**
                     * The SP.Ribbon.PageState.PageStateHandler.handleCommand(commandId, properties, sequence) Method is used to handle a command that is passed to the page component. 
                     * You can call other JavaScript functions or write code in the SP.Ribbon.PageState.PageStateHandler.handleCommand(commandId, properties, sequence) Method.
                     */

                    return this._handledCommands[commandId].handle(commandId, properties, sequence);

                },


                canHandleCommand: function (commandId) {

                    /**
                     * The SP.Ribbon.PageState.PageStateHandler.canHandleCommand(commandId) Method returns a Boolean that indicates whether the page 
                     * component can handle the command that was passed to it.
                     */

                    var canHandle = this._handledCommands[commandId].enabled;

                    if (angular.isFunction(canHandle)) {

                        return canHandle();

                    }

                    return !!canHandle;

                },


                isFocusable: function () {

                    /**
                     * The SP.Ribbon.PageState.PageStateHandler.isFocusable() Method returns a Boolean that indicates whether the page component can receive the focus. 
                     * If this method returns false, the page manager will not register the page component's focused commands.
                     */
                    return false;

                },


                receiveFocus: function () {

                    /**
                     * The SP.Ribbon.PageState.PageStateHandler.receiveFocus() Method is used when the page component receives focus.
                     * (Optional Page Component Method)
                     */
                    return true;

                },


                yieldFocus: function () {

                    /**
                     * The SP.Ribbon.PageState.PageStateHandler.yieldFocus() Method is called when the page component loses focus.
                     * (Optional Page Component Method)
                     */
                    return false;

                },


                getId: function () {

                    return 'ngSharePointPageComponent';

                },


                addCommand: function (commandId, handlerFn, canHandle) {

                    if (!CUI.ScriptUtility.isNullOrUndefined(commandId) && !CUI.ScriptUtility.isNullOrUndefined(handlerFn) && !Array.contains(this._commands, commandId)) {

                        this._handledCommands[commandId] = {

                            handle: handlerFn,
                            enabled: canHandle

                        };

                        this._commands.push(commandId);

                        return true;

                    }

                    return false;

                }

            };



            // NOTE: The 'pageManager.$2o_1' property is an object that contains all the components 
            //       by name and we could try to get the correct component id (WebPartWPQ?) from it but 
            //       we can't ensure that this property ($2o_1) always will have this name.
            //
            var defaultPageComponentId = 'WebPartWPQ2';
            var defaultPageComponentIdFoundation = 'WebPartWPQ1';

            /* 
                NOTE2: The page object '_spWebPartComponents' have all the components loaded in a web parts page (ListViewWebPart/ListFormWebPart).
                       For non web part page this object is empty (have no properties/components).
                       Use the next instruction to get the first one:
            
                            var pageComponentId = typeof _spWebPartComponents !== 'undefined' && (_spWebPartComponents[Object.keys(_spWebPartComponents)[0]] || { pageComponentId: 'WebPartWPQ2' }).pageComponentId;
            
                       Or the verbose solution:
            
                            // Gets the first property name from the object '_spWebPartComponents'.
                            var firstObjectProperty = typeof _spWebPartComponents !== 'undefined' && Object.keys(_spWebPartComponents)[0];
                            
                            // Gets the value of the first property from the object '_spWebPartComponents' (the first component object).
                            var component = _spWebPartComponents[firstObjectProperty];

                            // Gets the 'pageComponentId' property from the component object.
                            // If the property 'pageComponentId' doesn't exists in the object,
                            // assumes the standard component id 'WebPartWPQ2'.
                            var pageComponentId = component && component.pageComponentId || 'WebPartWPQ2';
            */


            // Unregister the default 'save', 'cancel' and 'attach file' commands
            unregisterComponentCommands('WebPartWPQ2', 'Ribbon.ListForm.Edit.Commit.Publish');
            unregisterComponentCommands('WebPartWPQ2', 'Ribbon.ListForm.Edit.Commit.Cancel');
            unregisterComponentCommands('WebPartWPQ2', 'Ribbon.ListForm.Edit.Actions.AttachFile');

            // Unregister the commands for SharePoint 2013 FOUNDATION !?
            unregisterComponentCommands('WebPartWPQ1', 'Ribbon.ListForm.Edit.Commit.Publish');
            unregisterComponentCommands('WebPartWPQ1', 'Ribbon.ListForm.Edit.Commit.Cancel');
            unregisterComponentCommands('WebPartWPQ1', 'Ribbon.ListForm.Edit.Actions.AttachFile');


            // Register classes and initialize page component
            ngSharePointPageComponent.registerClass('ngSharePointPageComponent', CUI.Page.PageComponent);


            // Returns the component instance
            return ngSharePointPageComponent.initializePageComponent();

        } // registerPageComponent

    } // SPRibbon factory

})();

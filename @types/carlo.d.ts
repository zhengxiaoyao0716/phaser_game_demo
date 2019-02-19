/**
 * Only declared what I need.
 * See [carlo/API](https://github.com/GoogleChromeLabs/carlo/blob/master/API.md).
 */
declare module "carlo" {
    /**
     * Launches the browser.
     */
    function launch(options?: Object): Promise<App>;
    export class App {
        /**
         * Emitted when the last window closes..
         * @param event .
         * @param listener .
         */
        on(event: "exit", listener: () => void): this

        /**
         * Emitted when the new window opens. This can happen in the following situations:
         * * App.createWindow was called.
         * * carlo.launch was called from the same or another instance of the Node app.
         * * window.open was called from within the web page.
         * @param event .
         * @param listener .
         */
        on(event: "window", listener: (window: Window) => void): this

        /**
         * Makes the content of the given folder available to the Chrome web app.
         * @param folder Folder with web content to make available to Chrome.
         * @param prefix Prefix of the URL path to serve from the given folder.
         */
        public serveFolder(folder: string, prefix?: string): void

        /**
         * The method adds a function called name on the pages' window object. When called,
         * the function executes carloFunction in Node.js and returns a Promise which resolves to the return value of carloFunction.
         * @param name Name of the function on the window object.
         * @param carloFunction Callback function which will be called in Carlo's context.
         */
        public exposeFunction(name: string, carloFunction: Function): Promise<void>

        /**
         * Shortcut to the main window's Window.load(uri[, ...params]).
         */
        public load(url: string, ...params: Array<any>): Promise<unknown>
    }
    export class Window {
        /**
         * Navigates the corresponding web page to the given uri, makes given params available in the web page via carlo.loadParams().
         * @param url Path to the resource relative to the folder passed into serveFolder().
         * @param params Optional parameters to pass to the web application. Parameters can be primitive types, <Array>, <Object> or <rpc> handles.
         */
        public load(url: string, ...params: Array<any>): Promise<unknown>
    }
}
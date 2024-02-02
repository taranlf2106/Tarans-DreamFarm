import Chalk from "chalk";
import { HTTPMethods } from "./httpConstants.mjs"


let COLORS = {}; 
COLORS[HTTPMethods.POST] = Chalk.yellow;
COLORS[HTTPMethods.PATCH] = Chalk.yellow;
COLORS[HTTPMethods.PUT] = Chalk.yellow;
COLORS[HTTPMethods.GET] = Chalk.green;
COLORS[HTTPMethods.DELETE] = Chalk.red;
COLORS.Default = Chalk.gray;


const colorize = (method) => {
    if (method in COLORS) {
        return COLORS[method](method);
    }
    return COLORS.Default(method);
};




class SuperLogger {

    static LOGGING_LEVELS = {
        ALL: 0,         
        VERBOSE: 5,     
        NORMAL: 10,     
        IMPORTANT: 100, 
        CRTICAL: 999    
    };

    #globalThreshold = SuperLogger.LOGGING_LEVELS.ALL;

    #loggers;

    static instance = null;

    constructor() {
       
        if (SuperLogger.instance == null) {
            SuperLogger.instance = this;
            this.#loggers = [];
            this.#globalThreshold = SuperLogger.LOGGING_LEVELS.NORMAL;
        }
        return SuperLogger.instance;
    }
    


    createAutoHTTPRequestLogger() {
        return this.createLimitedHTTPRequestLogger({ threshold: SuperLogger.LOGGING_LEVELS.NORMAL });
    }

    createLimitedHTTPRequestLogger(options) {

        const threshold = options.threshold || SuperLogger.LOGGING_LEVELS.NORMAL;

      
        return (req, res, next) => {

            
            if (this.#globalThreshold > threshold) {
                return;
            }

           
            this.#LogHTTPRequest(req, res, next);
        }

    }

    #LogHTTPRequest(req, res, next) {
   
        let type = req.method;
        const path = req.originalUrl;
        const when = new Date().toLocaleTimeString();

    
        type = colorize(type);
        console.log(when, type, path);

        next();
    }

}


export default SuperLogger
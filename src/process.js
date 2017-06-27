/**
 * Created by Ricardo Morais on 17/06/2017.
 */

import Interpreter from "./interpreter";
import debugStart from "debug";
import dush from "dush";
let debug = debugStart("interpreter");
debug("Initializing the interpreter process");

let context = { interpreter: null };
const emitter = dush();

process.on('message', function(message) {
    debug("Message received");
    emitter.emit(message.action, message);
});

emitter.on("init", (message) => {
    if(context.interpreter) {
        process.send({
            action: "response",
            error: "Interpreter was already initialized"
        });
        return;
    }
    debug("Creating the interpreter");

    try {
        context.interpreter = new Interpreter(message.documentString,
            message.snapshot,
            message.actionDispatcherURL);
        debug("Created the interpreter");

        process.send({
            action: "response",
            message: "successful"
        });

    } catch (err) {
        process.send({
            action: "response",
            error: err
        });
    }
});

emitter.on("start", (message) => {
    if(!context.interpreter){
        process.send({
            action: "response",
            error: "Interpreter was not initialized. Please use the action init"
        });
        return;
    }
    context.interpreter.start().then(()=>{
        process.send({
            action: "response",
            message: "successful"
        });
    });
});

emitter.on("event", (message) => {
    if(!context.interpreter){
        process.send({
            action: "response",
            error: "Interpreter is was not initialized. Please use the action init"
        });
        return;
    }

    if(!context.interpreter.hasStarted) {
        process.send({
            action: "response",
            message: "successful"
        });
        return;
    }

    context.interpreter.sendEvent(message.data);

    process.send({
        action: "response",
        message: "successful"
    });
});


"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();

var ChangeType;

(function (ChangeType) {
    ChangeType[ChangeType["CREATE"] = 0] = "CREATE";
    ChangeType[ChangeType["DELETE"] = 1] = "DELETE";
    ChangeType[ChangeType["UPDATE"] = 2] = "UPDATE";
})(ChangeType || (ChangeType = {}));

admin.initializeApp();

exports.fsentity = functions.handler.firestore.document.onWrite(async (change) => {
    const { inputFieldName, outputFieldName } = config_1.default;

    if (inputFieldName == outputFieldName) {
        console.log("Entity analysis: input field cannot be the same as output field. Please reconfigure your extension.");
        return;
    }
    
    const changeType = getChangeType(change);
    try {
        switch (changeType) {
            case ChangeType.CREATE:
                await handleCreateDocument(change.after);
                break;
            case ChangeType.DELETE:
                handleDeleteDocument();
                break;
            case ChangeType.UPDATE:
                await handleUpdateDocument(change.before, change.after);
                break;
        }
    }
    catch (err) {
        console.log("Entity extension error: " + err);
    }
});

const extractInput = (snapshot) => {
    return snapshot.get(config_1.default.inputFieldName);
};
const getChangeType = (change) => {
    if (!change.after.exists) {
        return ChangeType.DELETE;
    }
    if (!change.before.exists) {
        return ChangeType.CREATE;
    }
    return ChangeType.UPDATE;
};

const handleCreateDocument = async (snapshot) => {
    const input = extractInput(snapshot);
    if (input) {
        await findEntities(snapshot);
    }
};

const handleDeleteDocument = () => {};

const handleUpdateDocument = async (before, after) => {
    const inputAfter = extractInput(after);
    const inputBefore = extractInput(before);
    const inputHasChanged = inputAfter !== inputBefore;
    if (!inputHasChanged &&
        inputAfter !== undefined &&
        inputBefore !== undefined) {
            return;
        }
    if (inputAfter) {
        await findEntities(after);
    }
    else if (inputBefore) {
        await updateEntities(after, admin.firestore.FieldValue.delete());
    }
};

const findEntities = async (snapshot) => {
    const input = extractInput(snapshot);
    const result = await getEntities(input);
    try {
        await updateEntities(snapshot, result);
    }
    catch (err) {
        throw err;
    }
};

const getEntities = async (input_value) => {
    try {
        const document = {
            content: input_value,
            type: 'PLAIN_TEXT',
        };
        const [result] = await client.analyzeEntities({document});
        return result.entities;
    }
    catch (err) {
        throw err;
    }
};

//TODO change to array writing
const updateEntities = async (snapshot, entities) => {
    snapshot.ref.set({entities}, {merge: true});
    await admin.firestore().runTransaction((transaction) => {
        transaction.update(snapshot.ref, config_1.default.outputFieldName, entities);
        return Promise.resolve();
    });
};
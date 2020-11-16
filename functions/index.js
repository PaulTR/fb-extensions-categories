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

exports.fscategories = functions.handler.firestore.document.onWrite(async (change) => {
    const { inputFieldName, outputFieldName } = config_1.default;

    if (inputFieldName == outputFieldName) {
        console.log("Category analysis: input field cannot be the same as output field. Please reconfigure your extension.");
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
        console.log("Category extension error: " + err);
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
        await findCategories(snapshot);
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
        await findCategories(after);
    }
    else if (inputBefore) {
        await updateCategories(after, admin.firestore.FieldValue.delete());
    }
};

const findCategories = async (snapshot) => {
    const input = extractInput(snapshot);
    const result = await getCategories(input);
    try {
        await updateCategories(snapshot, result);
    }
    catch (err) {
        throw err;
    }
};

const getCategories = async (input_value) => {
    try {
        const document = {
            content: input_value,
            type: 'PLAIN_TEXT',
        };
        const [result] = await client.classifyText({document});
        return result.categories;
    }
    catch (err) {
        throw err;
    }
};

//TODO change to array writing
const updateCategories = async (snapshot, tmp) => {
    await admin.firestore().runTransaction((transaction) => {
        transaction.update(snapshot.ref, config_1.default.outputFieldName, tmp);
        return Promise.resolve();
    });
};
### See it in action

You can test out this extension right away!

1.  Go to your [Cloud Firestore dashboard](https://console.firebase.google.com/project/${param:PROJECT_ID}/firestore/data) in the Firebase console.

1.  If you do not already have one, create a new collection.

1.  Create a document with a field named `${param:INPUT_FIELD_NAME}`, then add a phrase that you want to analyze.

1.  In a few seconds, you'll see a new field called `${param:OUTPUT_FIELD_NAME}` pop up in the same document you just created. It will contain the entity objects for your input phrase. 

### Using the extension

Whenever you write a string to the field `${param:INPUT_FIELD_NAME}` in `${param:COLLECTION_PATH}`, this extension does the following:

- Processes the text using Google Cloud's Natural Language Processing API and extracts the entities from that text.
- Adds the entities of the string to a separate specified field in the same document.

If the `${param:INPUT_FIELD_NAME}` field of the document is updated, then the entities will be automatically updated, as well.

### Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.
